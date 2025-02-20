import { Request, Response, NextFunction } from 'express';
import { AsyncHandler, RequestHandler } from '../../types/commonType';

// const asyncHandler = (requestHandler: RequestHandler) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//     };
// };

const asyncHandler = (fn: AsyncHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await fn(req, res, next);
    } catch (err: any) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message,
        });
    };
};

export { asyncHandler };