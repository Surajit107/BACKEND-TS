import mongoose, { Schema, Model } from 'mongoose';
import { ITweetSchema } from '../../types/schemaTypes';

const TweetSchema: Schema<ITweetSchema> = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const TweetModel: Model<ITweetSchema> = mongoose.model<ITweetSchema>('Tweet', TweetSchema);
export default TweetModel;