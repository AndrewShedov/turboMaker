import { superMaker } from 'super-maker';
import { ObjectId } from 'mongodb';

export const config = {
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystalTest',
    collection: 'posts',
    numberThreads: 'max',
    numberDocuments: 1_000_000,
    batchSize: 10_000,
    timeStepMs: 20
};

export async function generatingData({
    createdAt,
    updatedAt
}) {

    const user = superMaker.take.value({
        key: 'users'
    });

    const {
        title,
        text,
        hashtagsFromFullText
    } = superMaker.lorem.fullText.generate({

        titleOptions: {
            sentenceMin: 0,
            sentenceMax: 1,
            wordMin: 4,
            wordMax: 7,
            hashtagMin: 0,
            hashtagMax: 1
        },

        textOptions: {
            sentenceMin: 1,
            sentenceMax: 12,
            wordMin: 4,
            wordMax: 10,
            hashtagMin: 0,
            hashtagMax: 2
        }
    });

    return {

        title,
        text,
        hashtags: hashtagsFromFullText,

        views: superMaker.randomNumber({
            min: 120,
            max: 3125
        }),

        mainImage: superMaker.take.value({
            key: 'images.avatar'
        }),

        liked: superMaker.take.values({
            key: 'users',
            min: 3,
            max: 25
        }),

        user: new ObjectId(user),
        createdAt,
        updatedAt
    };
}