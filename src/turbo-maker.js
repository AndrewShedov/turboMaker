import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export function runTurboMaker({
  numberThreads,
  numberDocuments,
  batchSize,
  timeStepMs,
  uri,
  db,
  collection,
  generatingDataPath
}) {

  // PC info
  const CPU = os.cpus();
  const maxThreads = CPU.length;
  const cpuModel = CPU[0].model;
  const totalMemory = os.totalmem();
  // /PC info

  // calculate threads
  const threads = ((numberThreads > maxThreads) || (numberThreads <= 0) || (typeof numberThreads === 'string')) ? maxThreads : numberThreads;
  // calculate threads

  // shared buffer
  const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
  const sharedArray = new Int32Array(sharedBuffer);
  // /shared buffer

  const start = performance.now();

  // start information
  console.log(`🖥️ CPU: ${cpuModel} | ${maxThreads} threads`);
  console.log(`   RAM: ${(totalMemory / (1024 ** 3)).toFixed(1)} GB`);
  console.log(`\n🚀 Start | ${threads} threads | ${numberDocuments.toLocaleString("en-US")} documents | ${batchSize.toLocaleString("en-US")} batch | ${timeStepMs.toLocaleString("en-US")} timeStepMs\n`);
  console.log(`🌐 URI:             ${uri}`);
  console.log(`🗄️ Database:        ${db}`);
  console.log(`📂 Collection:      ${collection}\n`);
  console.log('\n');
  // /start information

  // metrics
  let prevCpuUsage = process.cpuUsage();

  function getCpuUsage() {
    const usage = process.cpuUsage(prevCpuUsage);
    prevCpuUsage = process.cpuUsage();
    const total = usage.user + usage.system;
    const percent = (total / (1e6 * CPU.length)) * 100;
    return percent.toFixed(1);
  }

  function getMemoryUsage() {
    const used = process.memoryUsage().rss;
    const percent = (used / totalMemory) * 100;
    return percent.toFixed(1);
  }
  // /metrics

  const clearLines = (n = 2) => {
    for (let i = 0; i < n; i++) {
      process.stdout.write('\x1b[1A');
      process.stdout.write('\x1b[2K');
    }
  };

  // progress bar
  const showProgress = () => {
    const generated = Math.min(Atomics.load(sharedArray, 0), numberDocuments);
    const progress = generated / numberDocuments;
    const barLength = 40;
    const filledLength = Math.min(barLength, Math.round(barLength * progress));
    const bar = '\x1b[32m' + '█'.repeat(filledLength) + '\x1b[0m' + '-'.repeat(barLength - filledLength);
    const percent = (progress * 100).toFixed(1).padStart(5, ' ');

    const cpu = getCpuUsage().padStart(5, ' ');
    const ram = getMemoryUsage().padStart(5, ' ');

    clearLines(2);
    console.log(`🎁 ${bar} ${percent}% | ${generated.toLocaleString("en-US")} / ${numberDocuments.toLocaleString("en-US")}`);
    console.log(`           CPU: ${cpu}% | RAM: ${ram}%`);
  };
  // /progress bar

  const interval = setInterval(showProgress, 1000);
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

    worker.postMessage({
      from,
      to,
      sharedBuffer,
      batchSize,
      timeStepMs,
      uri,
      db,
      collection,
      generatingDataPath
    });

    worker.on('message', (msg) => {
      if (msg === 'done') {
        finished++;
        if (finished === threads) {
          clearInterval(interval);
          clearLines(2); // remove the indicator and metrics
          const generated = Math.min(Atomics.load(sharedArray, 0), numberDocuments);
          const progress = generated / numberDocuments;
          const barLength = 40;
          const filledLength = Math.min(barLength, Math.round(barLength * progress));
          const bar = '\x1b[32m' + '█'.repeat(filledLength) + '\x1b[0m' + '-'.repeat(barLength - filledLength);
          const percent = (progress * 100).toFixed(1).padStart(5, ' ');

          console.log(`🎁 ${bar} ${percent}% | ${generated.toLocaleString("en-US")} / ${numberDocuments.toLocaleString("en-US")}\n`);

          const end = performance.now();
          const durationMs = end - start;

          const minutes = Math.floor(durationMs / 60000);
          const seconds = Math.floor((durationMs % 60000) / 1000);
          const milliseconds = Math.floor(durationMs % 1000);

          let formattedDuration = '';
          if (minutes > 0) formattedDuration += `${minutes} min `;
          if (seconds > 0) formattedDuration += `${seconds} sec `;
          formattedDuration += `${milliseconds} ms`;

          const durationSec = durationMs / 1000;
          const speed = (numberDocuments / durationSec).toLocaleString("en-US", { maximumFractionDigits: 0 });
          const perDocument = (durationMs / numberDocuments).toFixed(5);

          console.log(`✅ Successfully created: ${numberDocuments.toLocaleString("en-US")} documents.`);
          console.log(`⏱️ Creation time: ${formattedDuration}`);
          console.log(`⚡ Speed: ${speed} documents/sec.`);
          console.log(`📊 Average time per document: ${perDocument} ms`);

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
