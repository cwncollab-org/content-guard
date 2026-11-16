#!/usr/bin/env node

const fs = require("node:fs");
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
    fail("AWS CLI v2 is required, but `aws --version` did not complete successfully.");
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
const CODEARTIFACT_DOMAIN = process.env.CODEARTIFACT_DOMAIN || parsedRegistry.domain;
const CODEARTIFACT_DOMAIN_OWNER =
  process.env.CODEARTIFACT_DOMAIN_OWNER || parsedRegistry.domainOwner;
const CODEARTIFACT_REPOSITORY =
  process.env.CODEARTIFACT_REPOSITORY || parsedRegistry.repository;
const DEFAULT_NPM_REGISTRY = ensureTrailingSlash(
  process.env.DEFAULT_NPM_REGISTRY || "https://registry.npmjs.org/",
);
const CODEARTIFACT_REGISTRY = ensureTrailingSlash(
  process.env.CODEARTIFACT_REGISTRY ||
    `https://${CODEARTIFACT_DOMAIN}-${CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${CODEARTIFACT_REPOSITORY}/`,
);

function main() {
  verifyAwsCliV2();

  run("aws", [
    "codeartifact",
    "login",
    "--tool",
    "npm",
    "--domain",
    CODEARTIFACT_DOMAIN,
    "--domain-owner",
    CODEARTIFACT_DOMAIN_OWNER,
    "--repository",
    CODEARTIFACT_REPOSITORY,
    "--region",
    AWS_REGION,
  ]);

  runNpm(["config", "set", "registry", DEFAULT_NPM_REGISTRY, "--location=user"]);
  runNpm(["publish", "--registry", CODEARTIFACT_REGISTRY, ...process.argv.slice(2)]);
}

main();
