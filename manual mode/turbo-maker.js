import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// settings
const numberThreads = 16;
const numberDocuments = 100;
const batchSize = 10000;
// /settings

// CPU info
const CPU = os.cpus();
const cpuModel = CPU[0].model;
const maxThreads = CPU.length;
// /CPU info

// shared buffer
const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
const sharedArray = new Int32Array(sharedBuffer);
// /shared buffer

const start = performance.now();

console.log("\n");
console.log(`🖥️ CPU: ${cpuModel} |${maxThreads} threads| \n`);
console.log(`🚀 Start with ${numberThreads} threads and ${batchSize} batch. \n`);

// progress bar
const showProgress = () => {
  const generated = Math.min(Atomics.load(sharedArray, 0), numberDocuments);
  const progress = generated / numberDocuments;
  const barLength = 40;
  const filledLength = Math.min(barLength, Math.round(barLength * progress));
  const reset = '\x1b[0m';
  const color = '\x1b[32m';
  const bar = color + '█'.repeat(filledLength) + reset + '-'.repeat(barLength - filledLength);
  const percent = (progress * 100).toFixed(1).padStart(5, ' ');
  process.stdout.write(`\r🎁 ${bar} ${percent}% |${generated}|${numberDocuments}`);
};
// /progress bar

const interval = setInterval(showProgress, 100);

let finished = 0;
const documentsPerThread = Math.floor(numberDocuments / numberThreads);
const remainder = numberDocuments % numberThreads;
let current = 0;

for (let i = 0; i < numberThreads; i++) {
  const extra = i < remainder ? 1 : 0;
  const from = current;
  const to = from + documentsPerThread + extra;
  current = to;
  const worker = new Worker(resolve(dirname(fileURLToPath(import.meta.url)), 'turbo-maker-worker.js'));
  worker.postMessage({ from, to, batchSize, sharedBuffer });
  worker.on('message', (msg) => {
    if (msg === 'done') {
      finished++;
      if (finished === numberThreads) {
        clearInterval(interval);
        showProgress();
        const end = performance.now();
        const durationSec = (end - start) / 1000;
        const speed = (numberDocuments / durationSec).toFixed(2);
        const perDocument = ((end - start) / numberDocuments).toFixed(5);
        process.stdout.write('\n');
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
