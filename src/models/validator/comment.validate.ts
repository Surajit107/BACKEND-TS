import Joi from 'joi';
import { ICommentSchema } from '../../../types/schemaTypes';

const validateComment = (commentModel: ICommentSchema) => {
    const CommentSchema = Joi.object({
        content: Joi.string().min(1).max(1000).required().trim().messages({
            "string.empty": "Content is required",
            "string.min": "Content should be at least 1 character long",
            "string.max": "Content should be at most 1000 characters long"
        }),
    });

    return CommentSchema.validate(commentModel, { abortEarly: false });
};

export default validateComment;
