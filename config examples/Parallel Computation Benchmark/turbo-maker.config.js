/*
-----
Parallel Computation Benchmark
-----
Testing the performance of Node.js in multi-threaded computation tasks, evaluating language efficiency, thread utilization, CPU capabilities, and I/O operations with MongoDB.

Adjust the value - 'generateLongString(500)', to regulate the load.
-----
*/

export const config = {
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystal',
    collection: 'posts',
    numberThreads: 'max',
    numberDocuments: 1_000_000,
    batchSize: 10_000,
    timeStepMs: 20
};

export function generateLongString(length) {
    const chars = new Array(length); // Pre-allocate an array for characters
    for (let i = 0; i < length; i++) {
        const charCode = Math.floor(Math.random() * (91 - 65) + 65); // A-Z
        chars[i] = String.fromCharCode(charCode);
        // Load emulation: 1,000 iterations
        for (let j = 0; j < 1000; j++) {
            Math.random();
        }
    }

    return chars.join('');
}

export async function generatingData() {

    return {
        complexString: generateLongString(500),
    };
}
