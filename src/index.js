#!/usr/bin/env node
import { runTurboMaker } from './turbo-maker.js';
import { validate } from './validation/validate-config.js';
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
  validate(config);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

runTurboMaker({
  numberThreads: config.numberThreads,
  numberDocuments: config.numberDocuments,
  batchSize: config.batchSize,
  timeStepMs: config.timeStepMs,
  address: config.address,
  db: config.db,
  collection: config.collection,
  generatingDataPath: generatingDataPath
});

export { runTurboMaker };
