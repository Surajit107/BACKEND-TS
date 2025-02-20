import { CustomRequest } from "../../types/commonType";
import { Response } from "express";
import mongoose from "mongoose";
import VideoModel from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { DashboardResp, PaginationQuery, GetChannelVideosResponse } from "../../types/requests_responseType";


// getChannelStats controller
export const getChannelStats = asyncHandler(async (req: CustomRequest, res: Response<DashboardResp>) => {
    const channelId = req.user?._id;

    if (!channelId) {
        return sendErrorResponse(res, new ApiError(400, "Channel ID is required."));
    };

    const stats = await VideoModel.aggregate([
        // Match videos by the given channel ID
        { $match: { owner: new mongoose.Types.ObjectId(channelId as string) } },

        // Group to calculate total views and total videos
        {
            $group: {
                _id: "$owner",
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                videoIds: { $addToSet: "$_id" }
            }
        },

        // Lookup subscriptions to get total subscribers
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriptions"
            }
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscriptions" }
            }
        },

        // Lookup likes for the videos
        {
            $lookup: {
                from: "likes",
                let: { videoIds: "$videoIds" },
                pipeline: [
                    { $match: { $expr: { $in: ["$video", "$$videoIds"] } } },
                    { $group: { _id: "$video", totalLikes: { $sum: 1 } } }
                ],
                as: "videoLikes"
            }
        },

        // Sum total likes
        {
            $addFields: {
                totalLikes: {
                    $sum: {
                        $map: {
                            input: "$videoLikes",
                            as: "like",
                            in: "$$like.totalLikes"
                        }
                    }
                }
            }
        },

        // Project the final result
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalVideos: 1,
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ]);

    const statsResult = stats[0] || {
        totalViews: 0,
        totalVideos: 0,
        totalLikes: 0,
        totalSubscribers: 0,
    };

    return sendSuccessResponse(res, 200, statsResult, "Channel stats fetched successfully");
});

// getChannelVideos controller
export const getChannelVideos = asyncHandler(async (req: CustomRequest, res: Response<GetChannelVideosResponse>) => {
    const { page = '1', limit = '10' }: PaginationQuery = req.query;
    const channelId = req.user?._id;

    if (!channelId) {
        return sendErrorResponse(res, new ApiError(400, "Channel ID is required."));
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
        return sendErrorResponse(res, new ApiError(400, "Invalid page number."));
    };
    if (isNaN(limitNum) || limitNum < 1) {
        return sendErrorResponse(res, new ApiError(400, "Invalid limit number."));
    };

    // Fetch all videos uploaded by the channel with pagination
    const videos = await VideoModel.find({ owner: channelId })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    // Count total number of videos for the channel
    const totalVideos = await VideoModel.countDocuments({ owner: channelId });

    return sendSuccessResponse(res, 200, {
        videos,
        totalVideos,
        page: pageNum,
        totalPages: Math.ceil(totalVideos / limitNum)
    }, "Channel videos fetched successfully");
});