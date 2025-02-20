import { Response } from "express";
import { ObjectId } from "mongoose";
import { ApiError } from "./ApiError";
import UserModel from "../models/user.model";

export const generateAccessAndRefreshToken = async (res: Response, userId: string | ObjectId): Promise<{ accessToken: string | undefined; refreshToken: string | undefined }> => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefreshToken();

        if (!user) {
            throw new ApiError(404, "User not found");
        };
        user.refreshToken = refreshToken;
        await user?.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    };
};