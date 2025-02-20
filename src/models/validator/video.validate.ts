import Joi from 'joi';
import { IVideoSchema } from '../../../types/schemaTypes';

const validateVideo = (videoModel: IVideoSchema) => {
    const VideoSchema = Joi.object({
        title: Joi.string().min(3).max(100).required().trim().messages({
            "string.empty": "Title is required",
            "string.min": "Title should be at least 3 characters long",
            "string.max": "Title should be at most 100 characters long"
        }),
        description: Joi.string().min(10).max(500).required().trim().messages({
            "string.empty": "Description is required",
            "string.min": "Description should be at least 10 characters long",
            "string.max": "Description should be at most 500 characters long"
        }),
        isPublished: Joi.boolean().default(true),
    }).unknown(true);

    return VideoSchema.validate(videoModel, { abortEarly: false });
};

export default validateVideo;
