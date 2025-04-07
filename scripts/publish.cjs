#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure the scripts directory exists
if (!fs.existsSync("scripts")) {
  fs.mkdirSync("scripts");
}

// Build the package
console.log("Building package...");
try {
  execSync("npm run build:package", { stdio: "inherit" });
  console.log("Package built successfully!");
} catch (error) {
  console.error("Error building package:", error);
  process.exit(1);
}

// Check if version is provided
const version = process.argv[2];
if (!version) {
  console.error(
    "Please provide a version to publish (e.g., npm run publish 1.0.0)"
  );
  process.exit(1);
}

// Update version in package.json
console.log(`Updating version to ${version}...`);
try {
  execSync(`npm version ${version} --no-git-tag-version`, { stdio: "inherit" });
  console.log("Version updated successfully!");
} catch (error) {
  console.error("Error updating version:", error);
  process.exit(1);
}

// Publish the package
console.log("Publishing package...");
try {
  execSync("npm publish --access public", { stdio: "inherit" });
  console.log("Package published successfully!");
} catch (error) {
  console.error("Error publishing package:", error);
  process.exit(1);
}

console.log("All done!");
