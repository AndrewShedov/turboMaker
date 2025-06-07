import { MongoClient, ObjectId } from 'mongodb';
import { parentPort, threadId } from 'worker_threads';
import { miniMaker } from '../mini-maker/mini-maker.js';
// import { miniMaker } from 'mini-maker';
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB = 'crystal';
const DB_COLLECTION = 'posts';

let from, to, batchSize, sharedBuffer;

parentPort.on('message', async (data) => {
  ({ from, to, batchSize, sharedBuffer } = data);
  const sharedArray = new Int32Array(sharedBuffer);

  // single point of reference
  const baseTimestamp = Date.now();
  // /single point of reference

  const generatingData = () => {

    // strictly global index
    const globalIndex = Atomics.add(sharedArray, 1, 1);
    // /strictly global index 

    const createdAt = new Date(baseTimestamp + globalIndex * 10000);
    const updatedAt = new Date(createdAt.getTime() + miniMaker.number.int({ min: 1000, max: 60000 }));
    const { title, text, hashtagsFromFullText } = miniMaker.lorem.fullText.generate({
      titleOptions: { min: 0, max: 3, wordMin: 5, wordMax: 12, hashtagMin: 2, hashtagMax: 2 },
      textOptions: { min: 1, max: 8, wordMin: 5, wordMax: 12, hashtagMin: 1, hashtagMax: 5 }
    });
    const user = miniMaker.take.valueOne({ key: 'users', fromEnd: true })
    return {

      // user
      // customId: randomBytes(16).toString("hex"),
      // email: miniMaker.emailRandom(),
      // name: miniMaker.take.valueOne({ key: 'fullName', fromEnd: true }),
      // aboutMe: miniMaker.lorem.sentences({ min: 3, max: 6, wordMin: 5, wordMax: 3, hashtagMin: 1, hashtagMax: 2 }),
      // avatarUrl: miniMaker.take.valueOne({ key: 'images.avatar' }),
      // bannerUrl: miniMaker.take.valueOne({ key: 'images.banner' }),
      // creator: false,
      // createdAt,
      // updatedAt,
      // /user

      // post
      title,
      text,
      hashtags: hashtagsFromFullText,
      // sentence: miniMaker.lorem.sentences({ min: 3, max: 6, wordMin: 5, wordMax: 12, hashtagMin: 20, hashtagMax: 20 }),
      user: new ObjectId(user),
      imageUrl: miniMaker.take.valueOne({ key: 'images.avatar' }),
      liked: miniMaker.take.value({ key: 'users', duplicate: false, min: 3, max: 10, reverse: true }),
      createdAt,
      updatedAt,
      // /post

    };
  };

  const documentGeneration = async () => {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      const db = client.db(DB);
      const collection = db.collection(DB_COLLECTION);
      const documentsToInsert = [];
      for (let i = from; i < to; i++) {
        documentsToInsert.push(generatingData(i));
        if (documentsToInsert.length >= batchSize) {
          await collection.insertMany(documentsToInsert, { ordered: false });
          Atomics.add(sharedArray, 0, documentsToInsert.length);
          documentsToInsert.length = 0;
        }
      }
      if (documentsToInsert.length > 0) {
        await collection.insertMany(documentsToInsert, { ordered: false });
        Atomics.add(sharedArray, 0, documentsToInsert.length);
      }
      parentPort.postMessage('done');
    } catch (error) {
      console.error(`❌ Error in worker #${threadId}:`, error);
      parentPort.postMessage('error');
    } finally {
      await client.close();
    }
  };
  documentGeneration();
});
