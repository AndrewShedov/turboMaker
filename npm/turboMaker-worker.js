import {
  parentPort,
  threadId
} from 'worker_threads';
// To work via npm link turbo-maker
// import path from 'path';
// import { pathToFileURL } from 'url';
// /To work via npm link turbo-maker

console.log("🧩 Worker file loaded.");
console.log("🧩 turboMaker-worker.js LOADED in:", process.cwd());

// To work via npm link turbo-maker
// const mongoPath = pathToFileURL(
//   path.resolve(process.cwd(), 'node_modules', 'mongodb/lib/index.js')
// ).href;
// /To work via npm link turbo-maker

let
  from,
  to,
  sharedBuffer,
  batchSize,
  address,
  db,
  collection,
  generatingDataPath,
  generatingData;

parentPort.on('message', async (data) => {
  ({
    from,
    to,
    sharedBuffer,
    batchSize,
    address,
    db,
    collection,
    generatingDataPath
  } = data);

  try {
    console.log(`🧩 Worker #${threadId}: importing from`, generatingDataPath);
    console.log(`🧩 batchSize #${batchSize}`);
    const { generatingData: genFunc } = await import(generatingDataPath);
    generatingData = genFunc;

    // To work via npm link turbo-maker
    // const { MongoClient } = await import(mongoPath);
    // /To work via npm link turbo-maker

    // To work via npm i turbo-maker
    const { MongoClient } = await import('mongodb');
    // To work via npm i turbo-maker

    const sharedArray = new Int32Array(sharedBuffer);
    const baseTimestamp = Date.now();

    const client = new MongoClient(address);
    await client.connect();

    const dbName = client.db(db);
    const collectionName = dbName.collection(collection);
    const documentsToInsert = [];

    for (let i = from; i < to; i++) {
      const globalIndex = Atomics.add(sharedArray, 1, 1);
      const createdAt = new Date(baseTimestamp + globalIndex * 10000);
      const updatedAt = new Date(createdAt.getTime() + 60000);

      const document = await generatingData({ createdAt, updatedAt });
      documentsToInsert.push(document);

      if (documentsToInsert.length >= batchSize) {
        await collectionName.insertMany(documentsToInsert, { ordered: false });
        Atomics.add(sharedArray, 0, documentsToInsert.length);
        documentsToInsert.length = 0;
      }
    }

    if (documentsToInsert.length > 0) {
      await collectionName.insertMany(documentsToInsert, { ordered: false });
      Atomics.add(sharedArray, 0, documentsToInsert.length);
    }

    parentPort.postMessage('done');
  } catch (error) {
    console.error(`❌ Error in worker #${threadId}:`, error);
    parentPort.postMessage('error');
  }
});
