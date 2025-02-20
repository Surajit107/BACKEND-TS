import LikeModel from "../models/like.model";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomRequest } from "../../types/commonType";
import { Response } from "express";
import { ApiError } from "../utils/ApiError";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import VideoModel from "../models/video.model";
import CommentModel from "../models/comment.model";
import TweetModel from "../models/tweet.model";
import mongoose from "mongoose";


// toggleVideoLike controller
export const toggleVideoLike = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };

    const video = await VideoModel.findById(videoId);
    if (!video) {
        return sendErrorResponse(res, new ApiError(404, "Video not found."));
    };

    const existingLike = await LikeModel.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // Unlike the video
        await LikeModel.deleteOne({ _id: existingLike._id });
        return sendSuccessResponse(res, 200, {}, "Video unliked.");
    } else {
        // Like the video
        await LikeModel.create({ video: videoId, likedBy: userId });
        return sendSuccessResponse(res, 201, {}, "Video liked.");
    };
});

// toggleCommentLike controller
export const toggleCommentLike = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!commentId) {
        return sendErrorResponse(res, new ApiError(400, "Comment ID is required."));
    };

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
        return sendErrorResponse(res, new ApiError(404, "Comment not found."));
    }

    const existingLike = await LikeModel.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // Unlike the comment
        await LikeModel.deleteOne({ _id: existingLike._id });
        return sendSuccessResponse(res, 200, {}, "Comment unliked.");
    } else {
        // Like the comment
        await LikeModel.create({ comment: commentId, likedBy: userId });
        return sendSuccessResponse(res, 201, {}, "Comment liked.");
    };
});

// toggleTweetLike controller
export const toggleTweetLike = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!tweetId) {
        return sendErrorResponse(res, new ApiError(400, "Tweet ID is required."));
    };

    const tweet = await TweetModel.findById(tweetId);
    if (!tweet) {
        return sendErrorResponse(res, new ApiError(404, "Tweet not found."));
    }

    const existingLike = await LikeModel.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        // Unlike the tweet
        await LikeModel.deleteOne({ _id: existingLike._id });
        return sendSuccessResponse(res, 200, {}, "Tweet unliked.");
    } else {
        // Like the tweet
        await LikeModel.create({ tweet: tweetId, likedBy: userId });
        return sendSuccessResponse(res, 201, {}, "Tweet liked.");
    }
});

// getLikedVideos controller
export const getLikedVideos = asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;

    const likedVideos = await LikeModel.aggregate([
        { $match: { likedBy: userId } },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'videoDetails',
            }
        },
        { $unwind: '$videoDetails' },
        {
            $project: {
                _id: 1,
                video: 1,
                likedBy: 1,
                videoDetails: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    isPublished: 1,
                    owner: 1,
                },
            }
        },
    ]);

    return sendSuccessResponse(res, 200, likedVideos, "Liked videos retrieved successfully.");
});

// getVideoLikes controller
export const getVideoLikes = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    }

    // Ensure videoId is a valid ObjectId
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const video = await VideoModel.findById(videoObjectId);
    if (!video) {
        return sendErrorResponse(res, new ApiError(404, "Video not found."));
    }

    // Get the likes count for the specified video
    const videoLikesCount = await LikeModel.countDocuments({ video: videoObjectId });

    // Retrieve the video details and likes
    const videoLikes = await LikeModel.aggregate([
        { $match: { video: videoObjectId } },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'videoDetails',
            }
        },
        { $unwind: '$videoDetails' },
        {
            $project: {
                _id: 1,
                video: 1,
                likedBy: 1,
                videoDetails: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    isPublished: 1,
                    owner: 1,
                },
            }
        },
    ]);

    return sendSuccessResponse(res, 200, { videoLikes, videoLikesCount }, "Video likes retrieved successfully.");
});

// getLikedComments controller
export const getLikedComments = asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;

    const likedVideos = await LikeModel.aggregate([
        { $match: { likedBy: userId } },
        {
            $lookup: {
                from: 'comments',
                localField: 'comment',
                foreignField: '_id',
                as: 'commentDetails',
            }
        },
        { $unwind: '$commentDetails' },
        {
            $project: {
                _id: 1,
                comment: 1,
                likedBy: 1,
                commentDetails: {
                    _id: 1,
                    content: 1,
                    video: 1,
                    owner: 1,
                },
            }
        },
    ]);

    return sendSuccessResponse(res, 200, likedVideos, "Liked videos retrieved successfully.");
});

// getLikedTweets controller
export const getLikedTweets = asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?._id;

    const likedVideos = await LikeModel.aggregate([
        { $match: { likedBy: userId } },
        {
            $lookup: {
                from: 'tweets',
                localField: 'tweet',
                foreignField: '_id',
                as: 'tweetDetails',
            }
        },
        { $unwind: '$tweetDetails' },
        {
            $project: {
                _id: 1,
                tweet: 1,
                likedBy: 1,
                tweetDetails: {
                    _id: 1,
                    content: 1,
                    owner: 1,
                },
            }
        },
    ]);

    return sendSuccessResponse(res, 200, likedVideos, "Liked videos retrieved successfully.");
});