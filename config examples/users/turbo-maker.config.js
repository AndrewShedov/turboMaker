import { superMaker } from 'super-maker';

export const config = {
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystalTest',
    collection: 'users',
    numberThreads: 'max',
    numberDocuments: 200,
    batchSize: 10,
    timeStepMs: 20
};

export async function generatingData({
    createdAt,
    updatedAt
}) {

    return {

        customId: superMaker.randomCrypto(12),

        name: `${superMaker.take.value({
            key: 'fullNames.name'
        })} ${superMaker.take.value({
            key: 'fullNames.surname'
        })}`,

        aboutMe: superMaker.lorem.sentences({
            sentenceMin: 3,
            sentenceMax: 6,
            wordMin: 5,
            wordMax: 3,
            hashtagMin: 1,
            hashtagMax: 2
        }),

        avatar: superMaker.take.value({
            key: 'images.avatar'
        }),

        banner: superMaker.take.value({
            key: 'images.banner'
        }),

        email: superMaker.randomEmailCrypto(10),
        creator: false,
        status: {
            isOnline: superMaker.randomBoolean(),
            lastSeen: superMaker.randomDate({
                min: { year: 2023 },
                max: {
                    year: 2025,
                    month: 8,
                    day: 21
                }
            })
        },
        createdAt,
        updatedAt,
    };
}