import PlaylistModel from "../models/playlist.model";
import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { CustomRequest } from "../../types/commonType";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { ApiError } from "../utils/ApiError";


// createPlaylist controller
export const createPlaylist = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { name, description } = req.body;
    const newPlaylist = await PlaylistModel.create({
        name,
        description,
        owner: req.user?._id
    });

    if (!newPlaylist) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while creating the playlist."));
    };

    return sendSuccessResponse(res, 201, {}, "Playlist created Successfully");
});

// getUserPlaylists controller
export const getUserPlaylists = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return sendErrorResponse(res, new ApiError(400, "User ID is required."));
    };

    const userPlaylists = await PlaylistModel.find({ owner: userId }).populate('videos');
    return sendSuccessResponse(res, 200, userPlaylists, "User playlists fetched successfully");
});

// getPlaylistById controller
export const getPlaylistById = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        return sendErrorResponse(res, new ApiError(400, "Playlist ID is required."));
    };

    const playlist = await PlaylistModel.findById(playlistId).populate('videos');
    return sendSuccessResponse(res, 200, playlist, "Playlist fetched successfully");
});

// addVideoToPlaylist controller
export const addVideoToPlaylist = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { playlistId, videoId } = req.params;

    if (!(playlistId && videoId)) {
        return sendErrorResponse(res, new ApiError(400, "Both playlist ID and video ID are required."));
    };

    const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        }, { new: true }
    );

    if (!updatedPlaylist) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while updating the playlist."));
    };

    return sendSuccessResponse(res, 200, {}, "Video added to the playlist successfully");
});

// removeVideoFromPlaylist controller
export const removeVideoFromPlaylist = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { playlistId, videoId } = req.params;

    if (!(playlistId && videoId)) {
        return sendErrorResponse(res, new ApiError(400, "Both playlist ID and video ID are required."));
    };

    const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        return sendErrorResponse(res, new ApiError(404, "Video is not found from the playlist."));
    };

    return sendSuccessResponse(res, 200, updatedPlaylist, "Video removed from the playlist successfully");
});

// deletePlaylist controller
export const deletePlaylist = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        return sendErrorResponse(res, new ApiError(400, "Playlist ID is required."));
    };

    const deletedPlaylist = await PlaylistModel.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        return sendErrorResponse(res, new ApiError(404, "Playlist not found."));
    };

    return sendSuccessResponse(res, 200, {}, "Playlist deleted successfully");
});

// updatePlaylist controller
export const updatePlaylist = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        return sendErrorResponse(res, new ApiError(400, "Playlist ID is required."));
    };

    const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description }
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        return sendErrorResponse(res, new ApiError(404, "Playlist not found for updating."));
    };

    return sendSuccessResponse(res, 200, updatedPlaylist, "Playlist updated successfully");
});