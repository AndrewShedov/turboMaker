[![Members](https://img.shields.io/badge/dynamic/json?style=for-the-badge&label=&logo=discord&logoColor=white&labelColor=black&color=%23f3f3f3&query=$.approximate_member_count&url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FENB7RbxVZE%3Fwith_counts%3Dtrue)](https://discord.gg/ENB7RbxVZE)&nbsp;[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&logo=5865F2&logoColor=black&labelColor=black&color=%23f3f3f3)](https://github.com/AndrewShedov/turboMaker/blob/main/LICENSE)

# turboMaker

**Superfast**, **multithreaded** document generator for **MongoDB**, operating through **CLI**.<br>
Generates **millions of documents** at **maximum speed**, utilizing **all CPU threads**.<br>

###  Suitable for

- Creating big collections (exceeding **[500,000,000](#screenshot_3) documents**)
- Generating synthetic data
- Stress testing MongoDB
- Performance benchmarking

### Features

1. **Multithreading** — each thread inserts documents in parallel. The generation speed of **[1,000,000](#screenshot_1) documents** with an average content size is **7 seconds** (PC configuration: Intel i5-12600K, 80GB DDR4 RAM, Samsung 980 PRO 1TB SSD).
2. **Specify the number of threads** for data generation to adjust CPU load, **or set it to <code>max</code>** to utilize all available threads.
3. Document distribution across threads considering the remainder.
4. Generation with custom data schemas through the <code>generatingData</code> function.
5. Precise <code>createdAt</code>/<code>updatedAt</code> handling with <code>timeStepMs</code>.
6. <code>Batch</code> inserts for enhanced performance.
7. Integration with [superMaker](https://www.npmjs.com/package/super-maker) for generating random <code>text</code>, <code>hashtags</code>, <code>words</code>, <code>dates</code>, <code>emails</code>, <code>id</code>, <code>url</code>, <code>arrays</code>, <code>booleans</code>, etc.
8. Progress bar in the console with percentage, speed, and statistics, along with other informative logs:

----------------------------------------
<span id="screenshot_1"></span>

<img src="https://raw.githubusercontent.com/AndrewShedov/turboMaker/refs/heads/main/assets/gif.gif" width="590" /><br>
Generation of **1,000,000 documents** in **7 seconds**, filled with [superMaker](https://www.npmjs.com/package/super-maker), with the following [content](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/posts/turbo-maker.config.js).<br>
PC configuration: Intel i5-12600K, 80GB DDR4 RAM, Samsung 980 PRO 1TB SSD.

<span id="screenshot_3"></span>

----------------------------------------
 
<img src="https://raw.githubusercontent.com/AndrewShedov/turboMaker/refs/heads/main/assets/screenshot_3.png" width="640" /><br>
Generation of **500,000,000 documents** in **7 hr 10 min**, filled with [superMaker](https://www.npmjs.com/package/super-maker), with the following [content](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/posts/turbo-maker.config.js).<br>
When generating more than 10,000,000 documents, the speed may decrease periodically due to I/O and MongoDB-overhead.<br>
PC configuration: Intel i5-12600K, 80GB DDR4 RAM, Samsung 980 PRO 1TB SSD.

----------------------------------------

### Technologies used

- worker_threads
- SharedArrayBuffer → Int32Array → Atomics
- perf_hooks.performance
- os
- process

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
3. In the root of the project, create a file — [turbo-maker.config.js](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/posts/turbo-maker.config.js).<br>
You can start with a simple [lite](https://github.com/AndrewShedov/turboMaker/blob/main/config%20examples/lite/turbo-maker.config.js) version.<br>
[Examples](https://github.com/AndrewShedov/turboMaker/tree/main/config%20examples) of various configurations.

4. Run from the project root:

```js
npm run turboMaker
```

### Explanation of the file structure — turbo-maker.config.js

### Config options

Required fields:

```js
uri: 'mongodb://127.0.0.1:27017',
db: 'crystalTest',
collection: 'posts',
numberThreads: 'max',
numberDocuments: 1_000_000,
batchSize: 10_000,
timeStepMs: 20
```

**numberThreads**

Accepts either a <code>string</code> or a <code>number</code> and sets the number of CPU threads used.
- for value <code>'max'</code>, all threads are used.
- if the <code>number</code> exceeds the actual thread count, all threads are used.

**numberDocuments**

Accepts a <code>number</code>, specifying how many documents to generate.

**batchSize**

Accepts a <code>number</code> of documents per batch inserted into the database.

- the larger the batchSize, the fewer requests MongoDB makes, leading to faster insertions.
- however, a very large batchSize can increase memory consumption.
- the optimal value depends on your computer performance and the number of documents being inserted.

**timeStepMs**

Accepts a <code>number</code> and sets the time interval between <code>createdAt</code> timestamps (<code>updatedAt</code> repeats the value <code>createdAt</code>).

- With a value of <code>0</code>, a large number of documents will have the same <code>createdAt</code> due to the high generation speed, especially in multithreaded mode. To fine-tune the <code>timeStepMs</code>, use [mongoChecker](https://www.npmjs.com/package/mongo-checker) to check for duplicate <code>createdAt</code> fields in the generated documents.

### function generatingData

To generate data for documents, you need to define a <code>generatingData</code> function.
It can be fully customized.<br>
With an empty function:

```js
export async function generatingData() {}
```

and <code>numberDocuments: 1_000_000</code>, 1,000,000 empty documents will be generated, such as:

```js
_id: ObjectId('68b2ab141b126e5d6f783d67')
document: null
```

The destructured function parameters:

```js
export async function generatingData({
    createdAt,
    updatedAt
})
```

are not renamed, but you can override them inside the <code>return</code> statement:

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


Simulation of [CRYSTAL v2.0](https://shedov.top/about-the-crystal-project/) operation using synthetic data generated with turboMaker and superMaker:<br>

<p align="center">
<a href="https://youtu.be/5V4otU4KZaA?t=2">
  <img src="https://raw.githubusercontent.com/AndrewShedov/turboMaker/refs/heads/main/assets/screenshot_2.png" style="width: 100%; max-width: 100%;" alt="CRYSTAL v1.0 features"/>
</a>
</p>


### A [Rust version](https://crates.io/crates/turbo-maker) of the generator is currently being developed, which performs much faster (up to 7.87x | 687%) according to the results of hybrid (CPU | I/O) testing.
<br>

[![SHEDOV.TOP](https://img.shields.io/badge/SHEDOV.TOP-black?style=for-the-badge)](https://shedov.top/) 
[![CRYSTAL](https://img.shields.io/badge/CRYSTAL-black?style=for-the-badge)](https://crystal.you/AndrewShedov)
[![Discord](https://img.shields.io/badge/Discord-black?style=for-the-badge&logo=discord&color=black&logoColor=white)](https://discord.gg/ENB7RbxVZE)
[![Telegram](https://img.shields.io/badge/Telegram-black?style=for-the-badge&logo=telegram&color=black&logoColor=white)](https://t.me/ShedovTop)
[![X](https://img.shields.io/badge/%20-black?style=for-the-badge&logo=x&logoColor=white)](https://x.com/AndrewShedov)
[![VK](https://img.shields.io/badge/VK-black?style=for-the-badge&logo=vk)](https://vk.com/ShedovTop)
[![VK Video](https://img.shields.io/badge/VK%20Video-black?style=for-the-badge&logo=vk)](https://vkvideo.ru/@ShedovTop)
[![YouTube](https://img.shields.io/badge/YouTube-black?style=for-the-badge&logo=youtube)](https://www.youtube.com/@AndrewShedov)
