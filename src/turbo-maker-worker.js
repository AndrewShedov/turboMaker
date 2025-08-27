import { parentPort, threadId } from 'worker_threads';
import { MongoClient } from 'mongodb';

let sharedBuffer,
  batchSize,
  timeStepMs,
  uri,
  db,
  collection,
  generatingData,
  chunkSize,
  numberDocuments;

parentPort.on('message', async (data) => {
  ({
    sharedBuffer,
    batchSize,
    timeStepMs,
    uri,
    db,
    collection,
    generatingData,
    chunkSize,
    numberDocuments,
  } = data);

  try {
    const sharedArray = new Int32Array(sharedBuffer);
    const client = new MongoClient(uri);
    await client.connect();
    const dbName = client.db(db);
    const collectionName = dbName.collection(collection);

    const baseTimestamp = Date.now();

    while (true) {
      // Atomically fetch the next chunk
      const from = Atomics.add(sharedArray, 1, chunkSize);
      if (from >= numberDocuments) break; // No more work

      const to = Math.min(from + chunkSize, numberDocuments);
      const documentsToInsert = [];

      for (let i = from; i < to; i++) {
        const createdAt = new Date(baseTimestamp + i * timeStepMs);
        const updatedAt = createdAt;
        const document = await generatingData({ createdAt, updatedAt });
        documentsToInsert.push(document);

        if (documentsToInsert.length >= batchSize) {
          await collectionName.insertMany(documentsToInsert, { ordered: false });
          Atomics.add(sharedArray, 0, documentsToInsert.length);
          documentsToInsert.length = 0;

          // Small delay to reduce contention (adjustable)
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }

      if (documentsToInsert.length > 0) {
        await collectionName.insertMany(documentsToInsert, { ordered: false });
        Atomics.add(sharedArray, 0, documentsToInsert.length);
      }
    }

    await client.close();
    parentPort.postMessage('done');
  } catch (error) {
    console.error(`❌ Error in worker #${threadId}:`, error);
    parentPort.postMessage('error');
  }
});