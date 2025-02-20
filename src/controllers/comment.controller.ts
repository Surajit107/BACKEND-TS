import { Response } from "express";;
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomRequest } from "../../types/commonType";
import { ApiError } from "../utils/ApiError";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import CommentModel from "../models/comment.model";
import { GetVideoCommentsResponse, PaginationQuery } from "../../types/requests_responseType";
import { ICommentSchema } from "../../types/schemaTypes";


// getVideoComments controller
export const getVideoComments = asyncHandler(async (req: CustomRequest, res: Response<GetVideoCommentsResponse>) => {
    const { videoId } = req.params;
    const { page = '1', limit = '10' }: PaginationQuery = req.query;

    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };

    // Ensure numeric values for page and limit
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const results = await CommentModel.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            fullName: 1,
                            email: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$owner"
            }
        },
        { $sort: { createdAt: -1 } },
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
    }, "Commnet retrieved successfully.");
});

// addComment controller
export const addComment = asyncHandler(async (req: CustomRequest, res: Response<ICommentSchema>) => {
    const { videoId } = req.params;
    const { content }: { content: string } = req.body;

    if (!videoId) {
        return sendErrorResponse(res, new ApiError(400, "Video ID is required."));
    };

    const newCommnet = await CommentModel.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });

    if (!newCommnet) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while adding the comment."));
    };

    return sendSuccessResponse(res, 201, newCommnet, "Comment added Successfully");
});

// updateComment controller
export const updateComment = asyncHandler(async (req: CustomRequest, res: Response<ICommentSchema>) => {
    const { commentId } = req.params;
    const { content }: { content: string } = req.body;

    if (!commentId) {
        return sendErrorResponse(res, new ApiError(400, "Comment ID is required."));
    };

    const updatedCommnet = await CommentModel.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        }, { new: true }
    );

    if (!updatedCommnet) {
        return sendErrorResponse(res, new ApiError(404, "Comment not found for updating."));
    };

    return sendSuccessResponse(res, 200, updatedCommnet, "Comment updated Successfully");
});

// deleteComment controller
export const deleteComment = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { commentId } = req.params;
    if (!commentId) {
        return sendErrorResponse(res, new ApiError(400, "Comment ID is required."));
    };

    // Remove the comment from the database
    const deletedCommnet = await CommentModel.findByIdAndDelete(commentId);

    if (!deletedCommnet) {
        return sendErrorResponse(res, new ApiError(404, "Comment not found for deleting."));
    };

    return sendSuccessResponse(res, 200, {}, "Comment deleted successfully");
});