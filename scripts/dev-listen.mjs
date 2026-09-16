#!/usr/bin/env node
/**
 * Stop whatever is listening on :8080 when it looks like `npm run dev` / `vite dev`.
 * Never touches :8081 (built-output QA preview).
 */
import { readFileSync, readdirSync, readlinkSync } from "node:fs";
import { parseListenerInodes, parsePid, parsePgid, terminatePids } from "./preview.mjs";

const DEV_PORT = 8080;
const GRACE_MS = 3000;
const POLL_MS = 100;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function looksLikeDevProcess(cmdline) {
  const argv = String(cmdline ?? "")
    .split("\0")
    .filter(Boolean)
    .join(" ");
  if (/\bpreview[\w-]*\.mjs\b/.test(argv)) return false;
  if (/\bvite\b\s+preview\b/.test(argv)) return false;
  return /\brun\s+dev(?:\s|$)/.test(argv) || /\bvite\b\s+dev\b/.test(argv);
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err?.code === "EPERM";
  }
}

function pgidOf(pid) {
  try {
    return parsePgid(readFileSync(`/proc/${pid}/stat`, "utf8"));
  } catch {
    return null;
  }
}

function killPid(pid, signal) {
  if (pgidOf(pid) === pid) {
    try {
      process.kill(-pid, signal);
      return;
    } catch {
      // group already gone
    }
  }
  try {
    process.kill(pid, signal);
  } catch {
    // already exited
  }
}

function cmdlineOf(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, "utf8");
  } catch {
    return "";
  }
}

function pidsForSocketInodes(inodes) {
  const targets = new Set([...inodes].map((inode) => `socket:[${inode}]`));
  const pids = [];
  for (const entry of readdirSync("/proc")) {
    const pid = parsePid(entry);
    if (pid === null || pid === process.pid) continue;
    let fds;
    try {
      fds = readdirSync(`/proc/${pid}/fd`);
    } catch {
      continue;
    }
    for (const fd of fds) {
      try {
        if (targets.has(readlinkSync(`/proc/${pid}/fd/${fd}`))) {
          pids.push(pid);
          break;
        }
      } catch {
        // fd closed
      }
    }
  }
  return pids;
}

export function portOwners(port = DEV_PORT) {
  const inodes = new Set();
  for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    let dump;
    try {
      dump = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const inode of parseListenerInodes(dump, port)) inodes.add(inode);
  }
  const pids = inodes.size > 0 ? pidsForSocketInodes(inodes) : [];
  return { pids, unattributed: inodes.size > 0 && pids.length === 0 };
}

export async function stopDev8080() {
  const { pids } = portOwners(DEV_PORT);
  const owners = pids.filter((pid) => looksLikeDevProcess(cmdlineOf(pid)));
  const { stubborn } = await terminatePids(owners, { kill: killPid, isAlive, sleep, graceMs: GRACE_MS, pollMs: POLL_MS });
  const after = portOwners(DEV_PORT);
  if (stubborn.length || after.unattributed) {
    throw new Error(`could not free :${DEV_PORT} (stubborn=${stubborn.join(",") || "none"})`);
  }
  return owners;
}
