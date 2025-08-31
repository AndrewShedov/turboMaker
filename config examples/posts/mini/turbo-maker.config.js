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
            sentenceMax: 2,
            wordMin: 5,
            wordMax: 12
        },

        textOptions: {
            sentenceMin: 1,
            sentenceMax: 4,
            wordMin: 5,
            wordMax: 9
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
