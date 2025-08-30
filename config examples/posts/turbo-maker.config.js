import { superMaker } from 'super-maker';
import { ObjectId } from 'mongodb';

export const config = {
    numberThreads: 16,
    numberDocuments: 1_000_000,
    batchSize: 10_000,
    timeStepMs: 20,
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystalTest',
    collection: 'posts'
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
            sentenceMax: 2,
            wordMin: 5,
            wordMax: 12,
            hashtagMin: 2,
            hashtagMax: 2
        },

        textOptions: {
            sentenceMin: 1,
            sentenceMax: 4,
            wordMin: 5,
            wordMax: 9,
            hashtagMin: 1,
            hashtagMax: 3
        }
    });

    return {

        title,
        text,
        hashtags: hashtagsFromFullText,

        views: superMaker.randomNumber({
            min: 5,
            max: 1000
        }),

        mainImage: superMaker.take.value({
            key: 'images.avatar'
        }),

        liked: superMaker.take.values({
            key: 'users',
            duplicate: false,
            min: 3,
            max: 10,
            reverse: true
        }),

        user: new ObjectId(user),
        createdAt,
        updatedAt
    };
}
