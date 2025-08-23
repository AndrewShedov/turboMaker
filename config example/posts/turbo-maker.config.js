import { superMaker } from 'super-maker';
import { ObjectId } from 'mongodb';

export const config = {
    numberThreads: 'max',
    numberDocuments: 10000,
    batchSize: 1000,
    timeStepMs: 30,
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystal',
    collection: 'posts'
};

export async function generatingData({ createdAt, updatedAt }) {

    const user = superMaker.take.value({
        key: 'users',
        fromEnd: true
    });

    const {
        title,
        text,
        hashtagsFromFullText
    } = superMaker.lorem.fullText.generate({

        titleOptions: {
            sentenceMin: 0,
            sentenceMax: 3,
            wordMin: 5,
            wordMax: 12,
            hashtagMin: 2,
            hashtagMax: 2
        },

        textOptions: {
            sentenceMin: 1,
            sentenceMax: 8,
            wordMin: 5,
            wordMax: 12,
            hashtagMin: 1,
            hashtagMax: 5
        }
    });

    return {

        title,
        text,
        hashtags: hashtagsFromFullText,
        user: new ObjectId(user),
        mainImageUri: superMaker.take.value({
            key: 'images.banner'
        }),
        viewsCount: 1,
        liked: superMaker.take.values({
            key: 'users',
            duplicate: false,
            min: 3,
            max: 10,
            reverse: true
        }),

        createdAt,
        updatedAt

        // user

        // customId: randomBytes(16).toString("hex"),
        // email: superMaker.emailRandom(5),

        // name: superMaker.take.value({
        //     key: 'fullName',
        //     fromEnd: true
        // }),

        // aboutMe: superMaker.lorem.sentences({
        //     sentenceMin: 3,
        //     sentenceMax: 6,
        //     wordMin: 5,
        //     wordMax: 3,
        //     hashtagMin: 1,
        //     hashtagMax: 2
        // }),

        // avatarUrl: superMaker.take.value({
        //     key: 'images.avatar'
        // }),

        // bannerUrl: superMaker.take.value({
        //     key: 'images.banner'
        // }),

        // creator: false,
        // createdAt,
        // updatedAt,

        // /user
    };

}
