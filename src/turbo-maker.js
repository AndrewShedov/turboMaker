import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { MongoClient } from 'mongodb';

export async function runTurboMaker({
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

  // Calculate threads
  const threads = Math.min(
    Math.max(1, Number(numberThreads) || maxThreads),
    maxThreads
  );

  // Shared buffer for progress and task allocation
  const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
  const sharedArray = new Int32Array(sharedBuffer);
  Atomics.store(sharedArray, 0, 0); // Generated documents
  Atomics.store(sharedArray, 1, 0); // Current document index for task allocation

  const start = performance.now();

  // Start information
  console.log(`🖥️ CPU: ${cpuModel} | ${maxThreads} threads`);
  console.log(`   RAM: ${(totalMemory / (1024 ** 3)).toFixed(1)} GB`);
  console.log(`\n🚀 Start | ${threads} threads | ${numberDocuments.toLocaleString("en-US")} documents | ${batchSize.toLocaleString("en-US")} batch | ${timeStepMs.toLocaleString("en-US")} timeStepMs\n`);
  console.log(`🌐 URI:             ${uri}`);
  console.log(`🗄️ Database:        ${db}`);
  console.log(`📂 Collection:      ${collection}\n`);

  // Metrics
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

  const clearLines = (n = 2) => {
    for (let i = 0; i < n; i++) {
      process.stdout.write('\x1b[1A');
      process.stdout.write('\x1b[2K');
    }
  };

  // Progress bar
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

  const interval = setInterval(showProgress, 1000);
  let finished = 0;

  // Preload generatingData function
  const { generatingData } = await import(generatingDataPath);

  // Create a single MongoDB client
  const client = new MongoClient(uri, {
    maxPoolSize: threads, // Limit connection pool size
  });
  await client.connect();
  const dbName = client.db(db);
  const collectionName = dbName.collection(collection);

  // Dynamic task allocation
  const chunkSize = Math.max(10000, Math.floor(numberDocuments / (threads * 10))); // Dynamic chunk size

  const workers = [];
  for (let i = 0; i < threads; i++) {
    const worker = new Worker(resolve(dirname(fileURLToPath(import.meta.url)), 'turbo-maker-worker.js'));

    worker.postMessage({
      sharedBuffer,
      batchSize,
      timeStepMs,
      uri,
      db,
      collection,
      generatingData, // Pass function directly
      chunkSize,
      numberDocuments,
    });

    worker.on('message', (msg) => {
      if (msg === 'done') {
        finished++;
        if (finished === threads) {
          clearInterval(interval);
          clearLines(2);
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
          const speed = (numberDocuments / durationSec).toLocaleString("en-US", { maximumFractionDigits: 2 });
          const perDocument = (durationMs / numberDocuments).toFixed(5);

          console.log(`✅ Successfully created: ${numberDocuments.toLocaleString("en-US")} documents.`);
          console.log(`⏱️ Creation time: ${formattedDuration}`);
          console.log(`⚡ Speed: ${speed} documents/sec.`);
          console.log(`📊 Average time per document: ${perDocument} ms`);

          client.close();
          setTimeout(() => {
            console.log("👋 Completion of work...");
            process.exit(0);
          }, 500);
        }
      }
    });

    worker.on('error', (error) => console.error(`❌ Worker error:`, error));
    workers.push(worker);
  }
}