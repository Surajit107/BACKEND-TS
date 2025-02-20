import { Response } from 'express';
import UserModel from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from '../utils/ApiError';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import { CustomRequest } from '../../types/commonType';
import { uploadOnCloudinary } from '../utils/cloudinary';
import mongoose from 'mongoose';


// changeCurrentPassword controller
export const changeCurrentPassword = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user?._id);

    if (!user) {
        return sendErrorResponse(res, new ApiError(404, "User not found"));
    };

    const isPasswordCorrect = await user?.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        return sendErrorResponse(res, new ApiError(400, "Invalid old password"));
    };

    user.password = newPassword;
    await user?.save({ validateBeforeSave: false });

    return sendSuccessResponse(res, 200, {}, "Password changed successfully");
});

// getCurrentUser controller
export const getCurrentUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    return sendSuccessResponse(res, 200, { user: req.user }, "Current user fetched successfully");
});

// updateAccountDetails controller
export const updateAccountDetails = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        return sendErrorResponse(res, new ApiError(400, "All fields are required"));
    };

    const user = await UserModel.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password");

    return sendSuccessResponse(res, 200, user, "Account details successfully");
});

// updateUserAvatar controller
export const updateUserAvatar = asyncHandler(async (req: CustomRequest, res: Response) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        return sendErrorResponse(res, new ApiError(400, "Avatar file is missing"));
    };

    const newAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!newAvatar?.url) {
        return sendErrorResponse(res, new ApiError(400, "Error while uploading on avatar"));
    };

    const user = await UserModel.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: newAvatar.url,
            }
        },
        { new: true }
    ).select("-password");

    return sendSuccessResponse(res, 200, user, "Avatar image updated successfully");
});

// updateUserCoverImage controller
export const updateUserCoverImage = asyncHandler(async (req: CustomRequest, res: Response) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        return sendErrorResponse(res, new ApiError(400, "Cover image file is missing"));
    };

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!newCoverImage?.url) {
        return sendErrorResponse(res, new ApiError(400, "Error while uploading on cover image"));
    };

    const user = await UserModel.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: newCoverImage.url,
            }
        },
        { new: true }
    ).select("-password");

    return sendSuccessResponse(res, 200, user, "Cover image updated successfully");
});

// getUserChannelProfile controller
export const getUserChannelProfile = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { username } = req.params;

    if (!username?.trim()) {
        return sendErrorResponse(res, new ApiError(400, "Username is missing"));
    };

    const channel = await UserModel.aggregate([
        {
            $match: { username: username?.toLowerCase() }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelsSubscribedCount: { $size: "$subscribed" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                },
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ]);

    if (!channel?.length) {
        return sendErrorResponse(res, new ApiError(404, "Channel does not exists"));
    };
    // console.log(channel[0]);
    return sendSuccessResponse(res, 200, channel[0], "User channel fetched successfully");
});

// getWatchHistory controller
export const getWatchHistory = asyncHandler(async (req: CustomRequest, res: Response) => {
    const user = await UserModel.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user?._id as string) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields: { owner: { $first: "$owner" } }
                    }
                ]
            }
        }
    ]);

    // console.log(user[0].watchHistory);
    return sendSuccessResponse(res, 200, user[0].watchHistory, "Watch history fetched successfully");
});