import mongoose, { Schema, Model } from 'mongoose';
import { IVideoSchema } from '../../types/schemaTypes';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const VideoSchema: Schema<IVideoSchema> = new Schema({
    videoFile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    viewers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });


// Add the pagination plugin
VideoSchema.plugin(mongooseAggregatePaginate);

const VideoModel: Model<IVideoSchema> = mongoose.model<IVideoSchema>('Video', VideoSchema);
export default VideoModel;