import mongoose, { Schema, Model } from 'mongoose';
import { IPlaylistSchema } from '../../types/schemaTypes';

const PlaylistSchema: Schema<IPlaylistSchema> = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });


const PlaylistModel: Model<IPlaylistSchema> = mongoose.model<IPlaylistSchema>('Playlist', PlaylistSchema);
export default PlaylistModel;