import mongoose, { Schema, Model } from 'mongoose';
import { ICommentSchema } from '../../types/schemaTypes';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const CommentSchema: Schema<ICommentSchema> = new Schema({
    content: {
        type: String,
        required: true,
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });


// Add the pagination plugin
CommentSchema.plugin(mongooseAggregatePaginate);

const CommentModel: Model<ICommentSchema> = mongoose.model<ICommentSchema>('Comment', CommentSchema);
export default CommentModel;