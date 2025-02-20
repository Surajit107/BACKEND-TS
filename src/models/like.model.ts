import mongoose, { Schema, Model } from 'mongoose';
import { ILikeSchema } from '../../types/schemaTypes';

const LikeSchema: Schema<ILikeSchema> = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });


const LikeModel: Model<ILikeSchema> = mongoose.model<ILikeSchema>('Like', LikeSchema);
export default LikeModel;