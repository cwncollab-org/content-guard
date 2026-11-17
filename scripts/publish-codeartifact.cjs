#!/usr/bin/env node

/**
 * Publish this package to AWS CodeArtifact.
 *
 * Two pitfalls this script works around:
 *
 * 1. `aws codeartifact login --tool npm` writes `//host/:always-auth=true`, which
 *    npm 11 rejects ("`always-auth` is not a valid npm option"), so the login step
 *    failed before publishing. We fetch a short-lived token with
 *    `get-authorization-token` instead and never mutate the user's ~/.npmrc.
 *
 * 2. A scope-level registry (`@scope:registry=...`) in any .npmrc beats
 *    `--registry` for scoped packages. A stale npm.pkg.github.com mapping
 *    silently redirected publishing away from CodeArtifact, so the scope is
 *    overridden explicitly on the command line (highest config precedence).
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.join(repoRoot, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function parseCodeArtifactRegistry(registry) {
  try {
    const url = new URL(ensureTrailingSlash(registry));
    const hostMatch = url.hostname.match(
      /^(?<domain>.+)-(?<owner>\d{12})\.d\.codeartifact\.(?<region>[^.]+)\.amazonaws\.com$/,
    );
    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (!hostMatch || pathSegments[0] !== "npm" || !pathSegments[1]) {
      return null;
    }

    return {
      domain: hostMatch.groups.domain,
      domainOwner: hostMatch.groups.owner,
      region: hostMatch.groups.region,
      repository: pathSegments[1],
    };
  } catch {
    return null;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    fail(`Failed to run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runNpm(args) {
  run("npm", args, process.platform === "win32" ? { shell: true } : undefined);
}

function verifyAwsCliV2() {
  const result = spawnSync("aws", ["--version"], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
  });

  if (result.error) {
    fail("AWS CLI v2 is required, but `aws` is not available in PATH.");
  }

  if (result.status !== 0) {
    fail(
      "AWS CLI v2 is required, but `aws --version` did not complete successfully.",
    );
  }

  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const majorVersion = Number(output.match(/aws-cli\/(\d+)\./)?.[1] || 0);

  if (majorVersion < 2) {
    fail(`AWS CLI v2 is required. Found: ${output}`);
  }
}

const defaultRegistry =
  packageJson.publishConfig?.registry ||
  "https://cwncollab-619005574504.d.codeartifact.ap-southeast-1.amazonaws.com/npm/cwncollab/";
const parsedRegistry = parseCodeArtifactRegistry(defaultRegistry);

if (!parsedRegistry) {
  fail(
    "package.json publishConfig.registry is not a valid AWS CodeArtifact npm endpoint. Set CODEARTIFACT_REGISTRY or fix publishConfig.registry.",
  );
}

const AWS_REGION = process.env.AWS_REGION || parsedRegistry.region;
const CODEARTIFACT_DOMAIN =
  process.env.CODEARTIFACT_DOMAIN || parsedRegistry.domain;
const CODEARTIFACT_DOMAIN_OWNER =
  process.env.CODEARTIFACT_DOMAIN_OWNER || parsedRegistry.domainOwner;
const CODEARTIFACT_REPOSITORY =
  process.env.CODEARTIFACT_REPOSITORY || parsedRegistry.repository;
const CODEARTIFACT_REGISTRY = ensureTrailingSlash(
  process.env.CODEARTIFACT_REGISTRY ||
    `https://${CODEARTIFACT_DOMAIN}-${CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${CODEARTIFACT_REPOSITORY}/`,
);

// `@cwncollab-org/content-guard` -> scope `cwncollab-org` (the CodeArtifact
// namespace) and package `content-guard` (the CodeArtifact package name).
const PACKAGE_SCOPE = packageJson.name.startsWith("@")
  ? packageJson.name.slice(1).split("/")[0]
  : null;
const PACKAGE_BASENAME = packageJson.name.split("/").pop();

const CODEARTIFACT_URL = new URL(CODEARTIFACT_REGISTRY);
// npm keys registry credentials by URI, so the token must be scoped to
// `//host/path/` exactly as it appears in the registry URL.
const AUTH_CONFIG_KEY = `//${CODEARTIFACT_URL.host}${CODEARTIFACT_URL.pathname}:_authToken`;
const LOCKFILE_PATH = path.join(repoRoot, "package-lock.json");

function capture(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
  });

  if (result.error) {
    fail(`Failed to run ${command}: ${result.error.message}`);
  }

  return result;
}

function getAuthorizationToken() {
  const result = capture("aws", [
    "codeartifact",
    "get-authorization-token",
    "--domain",
    CODEARTIFACT_DOMAIN,
    "--domain-owner",
    CODEARTIFACT_DOMAIN_OWNER,
    "--region",
    AWS_REGION,
    "--query",
    "authorizationToken",
    "--output",
    "text",
  ]);

  if (result.status !== 0) {
    fail(
      `Unable to get a CodeArtifact authorization token:\n${(result.stderr || result.stdout || "").trim()}`,
    );
  }

  const token = (result.stdout || "").trim();

  if (!token) {
    fail("CodeArtifact returned an empty authorization token.");
  }

  return token;
}

function warnIfLockfileVersionDrifted() {
  if (!fs.existsSync(LOCKFILE_PATH)) {
    return;
  }

  const lockfile = JSON.parse(fs.readFileSync(LOCKFILE_PATH, "utf8"));
  const lockedVersion = lockfile.packages?.[""]?.version || lockfile.version;

  if (lockedVersion && lockedVersion !== packageJson.version) {
    console.warn(
      `warning: package-lock.json is at ${lockedVersion} but package.json is at ${packageJson.version}. ` +
        'Run "npm install --package-lock-only" so they match.',
    );
  }
}

// The token goes into a throwaway user config (mode 0600) rather than argv so it
// never shows up in `ps` output or shell history.
function publishWithToken(token) {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "content-guard-publish-"),
  );
  const tempNpmrc = path.join(tempDir, ".npmrc");
  fs.writeFileSync(tempNpmrc, `${AUTH_CONFIG_KEY}=${token}\n`, { mode: 0o600 });

  try {
    const args = [
      "publish",
      `--userconfig=${tempNpmrc}`,
      `--registry=${CODEARTIFACT_REGISTRY}`,
    ];

    if (PACKAGE_SCOPE) {
      args.push(`--@${PACKAGE_SCOPE}:registry=${CODEARTIFACT_REGISTRY}`);
    }

    // Extra arguments are forwarded, e.g. `npm run publish:aws -- --dry-run --tag next`.
    runNpm([...args, ...process.argv.slice(2)]);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function printPublishedVersions() {
  if (!PACKAGE_SCOPE) {
    return;
  }

  const result = capture("aws", [
    "codeartifact",
    "list-package-versions",
    "--domain",
    CODEARTIFACT_DOMAIN,
    "--domain-owner",
    CODEARTIFACT_DOMAIN_OWNER,
    "--region",
    AWS_REGION,
    "--repository",
    CODEARTIFACT_REPOSITORY,
    "--format",
    "npm",
    "--namespace",
    PACKAGE_SCOPE,
    "--package",
    PACKAGE_BASENAME,
    "--query",
    "versions[].[version,status]",
    "--output",
    "text",
  ]);

  if (result.status !== 0) {
    return;
  }

  console.log(
    `\nVersions of ${packageJson.name} in ${CODEARTIFACT_DOMAIN}/${CODEARTIFACT_REPOSITORY}:`,
  );
  console.log((result.stdout || "").trim() || "(none)");
}

function main() {
  verifyAwsCliV2();
  warnIfLockfileVersionDrifted();
  publishWithToken(getAuthorizationToken());
  printPublishedVersions();
}

main();
