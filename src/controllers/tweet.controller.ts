import TweetModel from "../models/tweet.model";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomRequest } from "../../types/commonType";
import { Response } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { ApiError } from "../utils/ApiError";


// createTweet controller
export const createTweet = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { content } = req.body;

    const newTweet = await TweetModel.create({
        owner: req.user?._id,
        content,
    });

    if (!newTweet) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while creating the tweet."));
    };

    return sendSuccessResponse(res, 201, newTweet, "Tweet created successfully");
});

// getUserTweets controller
export const getUserTweets = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
        return sendErrorResponse(res, new ApiError(400, "Channel ID is required."));
    };
    const allTweets = await TweetModel.find({ owner: userId });
    return sendSuccessResponse(res, 200, allTweets, "Tweets feteched successfully");
});

// updateTweet controller
export const updateTweet = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        return sendErrorResponse(res, new ApiError(400, "Tweet ID is required."));
    };

    const updatedTweet = await TweetModel.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        }, { new: true }
    );

    if (!updatedTweet) {
        return sendErrorResponse(res, new ApiError(404, "Tweet not found updating."));
    };

    return sendSuccessResponse(res, 200, {}, "Tweet updated successfully");
});

// deleteTweet controller
export const deleteTweet = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        return sendErrorResponse(res, new ApiError(400, "Tweet ID is required."));
    };

    // Remove the comment from the database
    const deletedTweet = await TweetModel.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        return sendErrorResponse(res, new ApiError(404, "Tweet not found deleting."));
    };

    return sendSuccessResponse(res, 200, {}, "Tweet deleted successfully");
});