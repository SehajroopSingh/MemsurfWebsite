#!/usr/bin/env node

import { spawn } from "node:child_process";

const children = [];
let shuttingDown = false;

function spawnChild(label, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const processChild of children) {
      if (processChild !== child && !processChild.killed) {
        processChild.kill("SIGTERM");
      }
    }
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code || 0);
    }
  });
  child.on("error", (error) => {
    console.error(`${label} failed to start: ${error.message}`);
    process.exit(1);
  });
  return child;
}

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
  setTimeout(() => process.exit(0), 250).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

spawnChild("renderer lab server", process.execPath, ["scripts/renderer-lab-server.mjs"]);
spawnChild("next dev", process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev"]);
