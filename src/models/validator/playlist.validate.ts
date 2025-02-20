import Joi from 'joi';
import { IPlaylistSchema } from '../../../types/schemaTypes';

const validatePlaylist = (playlistModel: IPlaylistSchema) => {
    const PlaylistSchema = Joi.object({
        name: Joi.string().min(1).max(100).required().trim().messages({
            "string.empty": "Playlist name is required",
            "string.min": "Playlist name should be at least 1 character long",
            "string.max": "Playlist name should be at most 100 characters long"
        }),
        description: Joi.string().min(10).max(500).required().trim().messages({
            "string.empty": "Description is required",
            "string.min": "Description should be at least 10 characters long",
            "string.max": "Description should be at most 500 characters long"
        }),
    });

    return PlaylistSchema.validate(playlistModel, { abortEarly: false });
};

export default validatePlaylist;