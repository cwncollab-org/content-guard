#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure the scripts directory exists
if (!fs.existsSync("scripts")) {
  fs.mkdirSync("scripts");
}

// Build the library
console.log("Building library...");
try {
  execSync("npm run build:lib", { stdio: "inherit" });
  console.log("Library built successfully!");
} catch (error) {
  console.error("Error building library:", error);
  process.exit(1);
}

// Create a simple entry point for CommonJS
console.log("Creating CommonJS entry point...");
const cjsEntry = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const index_1 = require("./index");
exports.ContentGuard = index_1.ContentGuard;
exports.ContentGuardProvider = index_1.ContentGuardProvider;
exports.useContentGuard = index_1.useContentGuard;
`;

fs.writeFileSync(path.join("dist", "index.js"), cjsEntry);
console.log("CommonJS entry point created!");

console.log("Build completed successfully!");
