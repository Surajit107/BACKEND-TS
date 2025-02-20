import mongoose, { isValidObjectId } from "mongoose";
import SubscriptionModel from "../models/subscription.model";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomRequest } from "../../types/commonType";
import { Response } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { ApiError } from "../utils/ApiError";


// toggleSubscription controller
export const toggleSubscription = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { channelId } = req.params;
    if (!channelId) {
        return sendErrorResponse(res, new ApiError(400, "Channel ID is required."));
    };

    const userId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        return sendErrorResponse(res, new ApiError(400, "Invalid channel ID"));
    }

    // Check if the subscription already exists
    const existingSubscription = await SubscriptionModel.findOne({ subscriber: userId, channel: channelId });

    if (existingSubscription) {
        await SubscriptionModel.deleteOne({ _id: existingSubscription._id });
        return sendSuccessResponse(res, 200, {}, "Unsubscribed successfully");
    } else {
        await SubscriptionModel.create({ subscriber: userId, channel: channelId });
        return sendSuccessResponse(res, 200, {}, "Subscribed successfully");
    }
});

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { channelId } = req.params;
    if (!channelId) {
        return sendErrorResponse(res, new ApiError(400, "Channel ID is required."));
    };

    if (!isValidObjectId(channelId)) {
        return sendErrorResponse(res, new ApiError(400, "Invalid channel ID"));
    };

    const subscribers = await SubscriptionModel.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberDetails'
            }
        },
        {
            $unwind: '$subscriberDetails'
        },
        {
            $project: {
                _id: 0,
                fullName: '$subscriberDetails.fullName',
                email: '$subscriberDetails.email'
            }
        }
    ]);

    return sendSuccessResponse(res, 200, subscribers, "Subscribers fetched successfully");
});

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { subscriberId } = req.params;
    if (!subscriberId) {
        return sendErrorResponse(res, new ApiError(400, "Subscriber ID is required."));
    };

    if (!isValidObjectId(subscriberId)) {
        return sendErrorResponse(res, new ApiError(400, "Invalid subscriber ID"));
    };

    const result = await SubscriptionModel.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channelDetails'
            }
        },
        {
            $unwind: '$channelDetails'
        },
        {
            $project: {
                _id: 0,
                fullName: '$channelDetails.fullName',
                email: '$channelDetails.email',
                avatar: '$channelDetails.avatar',
                coverImage: '$channelDetails.coverImage',
            }
        }
    ]);

    return sendSuccessResponse(res, 200, result, "Subscribed channels fetched successfully");
});