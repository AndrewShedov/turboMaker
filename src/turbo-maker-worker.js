import { parentPort, threadId } from 'worker_threads';

let
  from,
  to,
  sharedBuffer,
  batchSize,
  timeStepMs,
  uri,
  db,
  collection,
  generatingDataPath,
  generatingData,
  totalThreads;

parentPort.on('message', async (data) => {
  ({
    from,
    to,
    sharedBuffer,
    batchSize,
    timeStepMs,
    uri,
    db,
    collection,
    generatingDataPath,
    totalThreads
  } = data);

  try {
    const { generatingData: genFunc } = await import(generatingDataPath);
    generatingData = genFunc;

    const { MongoClient } = await import('mongodb');

    const sharedArray = new Int32Array(sharedBuffer);

    const client = new MongoClient(uri, { maxPoolSize: 20 });
    await client.connect();
    const dbName = client.db(db);
    const collectionName = dbName.collection(collection);

    const baseTimestamp = Date.now();

    let documentsToInsert = [];
    const pendingInserts = new Set();
    const MAX_PARALLEL_INSERTS = Math.max(2, totalThreads * 2);

    async function flush() {
      if (documentsToInsert.length === 0) return;

      const docs = documentsToInsert;
      documentsToInsert = [];

      const insertPromise = collectionName.insertMany(docs, { ordered: false })
        .then(() => {
          Atomics.add(sharedArray, 0, docs.length);
          pendingInserts.delete(insertPromise);
        })
        .catch((err) => {
          console.error(`❌ Error in worker #${threadId}:`, err.message);
          pendingInserts.delete(insertPromise);
        });

      pendingInserts.add(insertPromise);

      if (pendingInserts.size >= MAX_PARALLEL_INSERTS) {
        await Promise.race(pendingInserts);
      }
    }

    for (let i = from; i < to; i++) {
      const createdAt = new Date(baseTimestamp + i * timeStepMs);
      const updatedAt = createdAt;

      const document = await generatingData({ createdAt, updatedAt });
      documentsToInsert.push(document);

      if (documentsToInsert.length >= batchSize) {
        await flush();
      }
    }

    await flush();
    await Promise.all(pendingInserts);

    await client.close();
    parentPort.postMessage('done');
  } catch (error) {
    console.error(`❌ Error in worker #${threadId}:`, error);
    parentPort.postMessage('error');
  }
});
