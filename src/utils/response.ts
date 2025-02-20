import { Response } from 'express';
import { ApiResponse } from './ApiResponse';
import { ApiError } from './ApiError';

export const sendSuccessResponse = <T>(
    res: Response,
    statusCode: number,
    data: T,
    message: string = "Success",
) => {
    const response = new ApiResponse(statusCode, data, message);
    return res.status(response.statusCode).json(response);
};

export const sendErrorResponse = (
    res: Response,
    error: ApiError
) => {
    return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        success: error.success,
        message: error.message,
        errors: error.errors
    });
};