import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import os from 'os';
import { fileURLToPath } from 'url';
import {
  dirname,
  resolve
} from 'path';

export function runTurboMaker({
  numberThreads,
  numberDocuments,
  batchSize,
  address,
  db,
  collection,
  generatingDataPath
}) {

  // CPU info
  const CPU = os.cpus();
  const maxThreads = CPU.length;
  const cpuModel = CPU[0].model;
  // /CPU info

  // Calculate the number of threads to generate
  const threads = (numberThreads > maxThreads) || (numberThreads <= 0) ? maxThreads : numberThreads;
  // /Calculate the number of threads to generate

  const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
  const sharedArray = new Int32Array(sharedBuffer);
  const start = performance.now();

  console.log(`🖥️ CPU: ${cpuModel} | ${maxThreads} threads \n`);
  console.log(`🚀 Start with ${threads} threads and ${batchSize} batch.\n`);

  const showProgress = () => {
    const generated = Math.min(Atomics.load(sharedArray, 0), numberDocuments);
    const progress = generated / numberDocuments;
    const barLength = 40;
    const filledLength = Math.min(barLength, Math.round(barLength * progress));
    const color = '\x1b[32m';
    const reset = '\x1b[0m';
    const bar = color + '█'.repeat(filledLength) + reset + '-'.repeat(barLength - filledLength);
    const percent = (progress * 100).toFixed(1).padStart(5, ' ');
    process.stdout.write(`\r🎁 ${bar} ${percent}% |${generated}|${numberDocuments}`);
  };

  const interval = setInterval(showProgress, 100);
  let finished = 0;

  const documentsPerThread = Math.floor(numberDocuments / threads);
  const remainder = numberDocuments % threads;
  let current = 0;

  for (let i = 0; i < threads; i++) {
    const extra = i < remainder ? 1 : 0;
    const from = current;
    const to = from + documentsPerThread + extra;
    current = to;

    const worker = new Worker(resolve(dirname(fileURLToPath(import.meta.url)), 'turbo-maker-worker.js'));

    worker.postMessage({ from, to, sharedBuffer, batchSize, address, db, collection, generatingDataPath });
    worker.on('message', (msg) => {
      if (msg === 'done') {
        finished++;
        if (finished === threads) {
          clearInterval(interval);
          showProgress();
          const end = performance.now();
          const durationSec = (end - start) / 1000;
          const speed = (numberDocuments / durationSec).toFixed(2);
          const perDocument = ((end - start) / numberDocuments).toFixed(5);
          // process.stdout.write('\n');
          console.log(`\n`);
          console.log(`✅ Successfully created: ${numberDocuments} documents.`);
          console.log(`⏱️ Creation time: ${(durationSec / 60).toFixed(6)} min.`);
          console.log(`⚡ Speed: ${speed} documents/sec.`);
          console.log(`📊 Average time to create one document: ${perDocument} ms.`);
          setTimeout(() => {
            console.log("👋 Completion of work...");
            process.exit(0);
          }, 500);
        }
      }
    });
    worker.on('error', (error) => console.error(`❌ Worker error:`, error));
  }
}