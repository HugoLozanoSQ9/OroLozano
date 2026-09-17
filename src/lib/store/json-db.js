import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const locks = new Map();

async function withLock(file, fn) {
  const prev = locks.get(file) ?? Promise.resolve();
  let release = () => {};
  const current = new Promise((r) => {
    release = r;
  });
  locks.set(file, prev.then(() => current));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(file) === current) locks.delete(file);
  }
}

export async function readJson(filename, fallback) {
  const file = path.join(DATA_DIR, filename);
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(file, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

export async function writeJson(filename, data) {
  const file = path.join(DATA_DIR, filename);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export async function updateJson(filename, fallback, mutator) {
  return withLock(filename, async () => {
    const current = await readJson(filename, fallback);
    const next = await mutator(current);
    await writeJson(filename, next);
    return next;
  });
}
