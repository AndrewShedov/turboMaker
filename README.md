[![Discord](https://img.shields.io/discord/1006372235172384849?style=for-the-badge&logo=5865F2&logoColor=black&labelColor=black&color=%23f3f3f3
)](https://discord.gg/ENB7RbxVZE)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&logo=5865F2&logoColor=black&labelColor=black&color=%23f3f3f3)](https://github.com/AndrewShedov/mongoCollector/blob/main/LICENSE)

# turboMaker

Super-fast **multi-threaded** document generator for MongoDB, operating through CLI.<br>
It allows you to generate **millions of documents** at **maximum speed**, utilizing **all CPU cores**. <br>

###  Ideal for

- Preparing large test databases
- Generating fake data
- Stress testing MongoDB
- Performance benchmarking

### Features

1. **Multi-threading** - each thread inserts documents in parallel. The generation speed of **1,000,000 documents** with an average content size is **130,000 documents/sec** (when using an i5-12600K processor or equivalent). When generating more than 10,000,000 documents, the speed may decrease periodically.
2. Select the number of threads to generate, to regulate the load on the processor, or use all threads with the function - <code>max</code>.
3. Document distribution across threads considering the remainder.
4. Generation with custom data schemas through the <code>generatingData</code> function.
5. Precise <code>createdAt</code>/<code>updatedAt</code> handling with <code>timeStepMs</code>.
6. <code>Batch</code> inserts for enhanced performance.
7. Integration with [superMaker](https://www.npmjs.com/package/super-maker) for generating <code>texts</code>, <code>avatars</code>, <code>dates</code>, <code>emails</code>, <code>arrays</code>, <code>booleans</code>, etc.
8. Progress bar in the console with percentage, speed, and statistics, along with other informative logs:

<img src="https://raw.githubusercontent.com/AndrewShedov/turboMaker/refs/heads/main/assets/screenshot_1.png" width="640" />

The screenshot shows the generation of documents filled with [superMaker](https://www.npmjs.com/package/super-maker), with this [content](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/posts/turbo-maker.config.js).

### Installation & Usage

1. Install the package:

```bash
npm i turbo-maker
```

2. Add a script in your **package.json**:

```json
"scripts": {
  "turboMaker": "turbo-maker"
}
```
3. In the root of the project, create a file - [turbo-maker.config.js](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/posts/turbo-maker.config.js).

[Examples](https://github.com/AndrewShedov/turboMaker/tree/main/config%20examples) of various configurations.

4. Run from the project root:

```js
npm run turboMaker
```

### Explanation of the file structure - turbo-maker.config.js.

### Config options

Required fields must be specified:

```js
uri: 'mongodb://127.0.0.1:27017',
db: 'crystalTest',
collection: 'posts',
numberThreads: 'max',
numberDocuments: 1_000_000,
batchSize: 10_000,
timeStepMs: 20
```

**numberThreads**: accepts either a <code>string</code> or a <code>number</code> and sets the number of CPU threads used.
- for value <code>'max'</code>, all threads are used.
- if the <code>number</code> exceeds the actual thread count, all threads are used.

**numberDocuments**: accepts a <code>number</code>, specifying how many documents to generate.

**batchSize**: accepts a <code>number</code> of documents per batch inserted into the database.

- the larger the batchSize, the fewer requests MongoDB makes, leading to faster insertions.
- however, a very large batchSize can increase memory consumption.
- the optimal value depends on your computer performance and the number of documents being inserted.

**timeStepMs**: accepts a <code>number</code> and sets the time interval between <code>createdAt</code> timestamps (and <code>updatedAt</code> is the same as <code>createdAt</code>).

- With a value of <code>0</code>, a large number of documents will have the same <code>createdAt</code> due to the high generation speed, especially in multi-threaded mode. To fine-tune the <code>timeStepMs</code>, use [mongoChecker](https://www.npmjs.com/package/mongo-checker) to check for duplicate <code>createdAt</code> fields in the generated documents.

### function generatingData

To generate data for documents, you need to define a <code>generatingData</code> function.
It can be fully customized, so with an empty function like:

```js
export async function generatingData() {}
```

and <code>numberDocuments: 1_000_000</code>, 1,000,000 empty documents will be generated, such as:

```js
_id: ObjectId('68b2ab141b126e5d6f783d67')
document: null
```

The names:

```js
export async function generatingData({
    createdAt,
    updatedAt
})
```

are required, but you can override them inside <code>return</code>

```js
return {
    createdCustom: createdAt,
    updatedCustom: updatedAt
};
```

For data generation, it's recommended to use [superMaker](https://www.npmjs.com/package/super-maker).

A mini [example](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/posts/mini/turbo-maker.config.js) of data generation with superMaker:

```js
import { superMaker } from 'super-maker';

export const config = {
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystalTest',
    collection: 'posts',
    numberThreads: 'max',
    numberDocuments: 10_000,
    batchSize: 100,
    timeStepMs: 20
};

export async function generatingData({
    createdAt,
    updatedAt
}) {

    const {
        title,
        text,
    } = superMaker.lorem.fullText.generate({

        titleOptions: {
            sentenceMin: 0,
            sentenceMax: 1,
            wordMin: 4,
            wordMax: 7
        },

        textOptions: {
            sentenceMin: 1,
            sentenceMax: 12,
            wordMin: 4,
            wordMax: 10
        }
    });

    return {

        title,
        text,
         
        mainImage: superMaker.take.value({
            key: 'images.avatar'
        }),

        createdAt,
        updatedAt
    };
}
```


The video shows a simulation of [CRYSTAL v2.0](https://shedov.top/about-the-crystal-project/) in operation, using fake data generated with turboMaker and superMaker: <br>

<p align="center">
<a href="https://youtu.be/5V4otU4KZaA?t=2">
  <img src="https://raw.githubusercontent.com/AndrewShedov/turboMaker/refs/heads/main/assets/screenshot_2.png" style="width: 100%; max-width: 100%;" alt="CRYSTAL v1.0 features"/>
</a>
</p>

[SHEDOV.TOP](https://shedov.top/) | [CRYSTAL](https://crysty.ru/AndrewShedov) | [Discord](https://discord.gg/ENB7RbxVZE) | [Telegram](https://t.me/ShedovChannel) | [X](https://x.com/AndrewShedov) | [VK](https://vk.com/shedovclub) | [VK Video](https://vkvideo.ru/@shedovclub) | [YouTube](https://www.youtube.com/@AndrewShedov)
