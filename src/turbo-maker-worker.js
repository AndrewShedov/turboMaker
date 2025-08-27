import {
  parentPort,
  threadId
} from 'worker_threads';

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
  generatingData;

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
    generatingDataPath
  } = data);

  try {
    const { generatingData: genFunc } = await import(generatingDataPath);
    generatingData = genFunc;

    const { MongoClient } = await import('mongodb');

    const sharedArray = new Int32Array(sharedBuffer);

    const client = new MongoClient(uri);
    await client.connect();
    const dbName = client.db(db);
    const collectionName = dbName.collection(collection);

    const documentsToInsert = [];

    // single point of reference
    const baseTimestamp = Date.now();
    // /single point of reference

    for (let i = from; i < to; i++) {

      // create date
      const createdAt = new Date(baseTimestamp + i * timeStepMs);
      const updatedAt = createdAt;
      // /create date

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
