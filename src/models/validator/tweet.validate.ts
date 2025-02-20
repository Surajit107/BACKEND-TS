import Joi from 'joi';
import { ITweetSchema } from '../../../types/schemaTypes';

const validateTweet = (tweetModel: ITweetSchema) => {
    const TweetSchema = Joi.object({
        content: Joi.string().min(1).max(280).required().trim().messages({
            "string.empty": "Content is required",
            "string.min": "Content should be at least 1 character long",
            "string.max": "Content should be at most 280 characters long"
        }),
    });

    return TweetSchema.validate(tweetModel, { abortEarly: false });
};

export default validateTweet;