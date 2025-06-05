#!/usr/bin/env node
import { runTurboMaker } from './turboMaker.js';
import { validateConfig } from './validation/validateConfig.js';
import path from 'path';
import { pathToFileURL } from 'url';
import process from 'process';

const userConfigPath = path.resolve(process.cwd(), './turbo-maker.config.js');
const userConfigURL = pathToFileURL(userConfigPath);
const generatingDataPath = userConfigURL.href;

let config;

try {
  ({ config } = await import(userConfigURL.href));
} catch (error) {
  console.error("❌ Failed to load config - turbo-maker.config.js");
  console.error(error.message);
  process.exit(1);
}

try {
  validateConfig(config);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

console.log("📁 Path to generatingData:", generatingDataPath);
console.log("💡 turbo-maker index.js is running");

runTurboMaker({
  numberThreads: config.numberThreads,
  numberDocuments: config.numberDocuments,
  batchSize: config.batchSize,
  address: config.address,
  db: config.db,
  collection: config.collection,
  generatingDataPath: generatingDataPath
});

export { runTurboMaker };
