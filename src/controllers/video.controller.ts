import mongoose, { ObjectId } from "mongoose";
import VideoModel from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { CustomRequest } from "../../types/commonType";
import { Response } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import UserModel from "../models/user.model";


// getAllVideos controller
export const getAllVideos = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    // Ensure numeric values for page and limit
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Validate sortType
    const validSortTypes = ["asc", "desc"];
    const sortDirection = validSortTypes.includes(sortType as string) ? sortType : "desc";

    // Validate sortBy
    const validSortFields = ["title", "description", "duration", "createdAt", "updatedAt", "views"];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : "createdAt";

    // Convert userId to mongoose ObjectId
    const userObjectId = userId ? new mongoose.Types.ObjectId(userId as string) : undefined;

    // Execute the aggregation pipeline
    const results = await VideoModel.aggregate([
        {
            $match: {
                ...(query && {
                    $or: [
                        { title: { $regex: query as string, $options: "i" } },
                        { description: { $regex: query as string, $options: "i" } }
                    ]
                }),
                ...(userObjectId && { owner: userObjectId }),
            }
        },
        {
            $sort: {
                [sortField]: sortDirection === "asc" ? 1 : -1,
            }
        },
        { $skip: skip },
        { $limit: limitNumber },
        {
            $facet: {
                metadata: [{ $count: "totalVideos" }],
                data: [{ $skip: 0 }, { $limit: limitNumber }]
            }
        }
    ]);

    // Extract results
    const totalVideos = results[0]?.metadata[0]?.totalVideos || 0;
    const videos = results[0]?.data || [];

    // Calculate total pages
    const totalPages = Math.ceil(totalVideos / limitNumber);

    // Return the videos along with pagination details
    return sendSuccessResponse(res, 200, {
        videos,
        pagination: {
            totalVideos,
            totalPages,
            currentPage: pageNumber,
            limit: limitNumber,
        }
    }, "Videos retrieved successfully.");
});

// publishAVideo controller
export const publishAVideo = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { title, description } = req.body;

    // Ensure `req.files` is defined and has the expected structure
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

    if (!files) {
        return sendErrorResponse(res, new ApiError(400, "No files were uploaded"));
    };

    const videoFile = files.videoFile ? files.videoFile[0] : undefined;
    const thumbnail = files.thumbnail ? files.thumbnail[0] : undefined;

    if (!videoFile) {
        return sendErrorResponse(res, new ApiError(400, "Video file is required"));
    };
    if (!thumbnail) {
        return sendErrorResponse(res, new ApiError(400, "Thumbnail is required"));
    };

    // Upload files to Cloudinary
    const videoFilePath = await uploadOnCloudinary(videoFile.path);
    const thumbnailFilePath = await uploadOnCloudinary(thumbnail.path);

    if (!videoFilePath) {
        return sendErrorResponse(res, new ApiError(400, "Error uploading video file"));
    };
    if (!thumbnailFilePath) {
        return sendErrorResponse(res, new ApiError(400, "Error uploading thumbnail file"));
    };

    // Create new video
    const newVideo = await VideoModel.create({
        videoFile: videoFilePath.url,
        thumbnail: thumbnailFilePath.url,
        title,
        description,
        duration: videoFilePath.duration,
        owner: req.user?._id,
    });

    if (!newVideo) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while publishing the video"));
    };
    return sendSuccessResponse(res, 201, {}, "Video published Successfully");
});

// getVideoById controller
export const getVideoById = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { videoId } = req.params;
    // Convert videoId string to ObjectId
    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };

    const video = await VideoModel.findById(videoId);
    if (!video) {
        return sendErrorResponse(res, new ApiError(404, "Video not found"));
    };

    // Assuming `req.user._id` contains the authenticated user's ID
    const userId = req.user?._id;

    if (userId) {
        const user = await UserModel.findById(userId);

        if (!user) {
            return sendErrorResponse(res, new ApiError(404, "User not found"));
        };

        const videoObjectId = new mongoose.Types.ObjectId(videoId) as unknown as mongoose.Schema.Types.ObjectId;
        // Check if the video is already in the watch history
        const alreadyWatched = user.watchHistory.some(
            (watchedVideoId) => watchedVideoId.toString() === videoObjectId.toString()
        );

        if (!alreadyWatched) {
            user.watchHistory.push(videoObjectId);
            await user.save();
        };

        // Check if the user has already viewed this video
        const alreadyViewed = video.viewers.some(
            (viewerId) => viewerId.toString() === userId.toString()
        );

        if (!alreadyViewed) {
            // Increment the views count and add the user to the viewers array
            video.views += 1;
            video.viewers.push(userId as ObjectId);
            await video.save();
        };
    }

    return sendSuccessResponse(res, 200, video, "Video fetched successfully");
});

// updateVideo controller
export const updateVideo = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };
    const { title, description } = req.body;
    const thumbnail = req.file;

    if (!thumbnail) {
        return sendErrorResponse(res, new ApiError(400, "No file were uploaded"));
    };
    if (!thumbnail) {
        return sendErrorResponse(res, new ApiError(400, "Thumbnail is required"));
    };

    const thumbnailFilePath = await uploadOnCloudinary(thumbnail.path);
    if (!thumbnailFilePath) {
        return sendErrorResponse(res, new ApiError(400, "Error uploading thumbnail file"));
    };

    // Create new video
    const updatedVideo = await VideoModel.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnailFilePath.url,
                title,
                description,
            }
        }, { new: true });

    if (!updatedVideo) {
        return sendErrorResponse(res, new ApiError(404, "Video not found updating."));
    };
    return sendSuccessResponse(res, 200, updatedVideo, "Video updated Successfully");
});

// deleteVideo controller
export const deleteVideo = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };

    const video = await VideoModel.findById(videoId);
    if (!video) {
        return sendErrorResponse(res, new ApiError(404, "Video not found"));
    };
    // Delete the video file from Cloudinary
    if (video.videoFile) {
        await deleteFromCloudinary(video.videoFile, "video");
    };
    // Delete the thumbnail file from Cloudinary
    if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail, "image");
    };

    // Remove the video document from the database
    const deletedVideo = await VideoModel.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        return sendErrorResponse(res, new ApiError(404, "Video not found deleting."));
    };

    return sendSuccessResponse(res, 200, {}, "Video deleted successfully");
});

// togglePublishStatus controller
export const togglePublishStatus = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };
    // Find the video by ID
    const video = await VideoModel.findById(videoId);

    if (!video) {
        return sendErrorResponse(res, new ApiError(404, "Video not found."));
    };
    // Toggle the publish status
    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save();

    return sendSuccessResponse(res, 200, updatedVideo, "Video publish status updated successfully.");
});