import { Request, Response, NextFunction } from 'express';
import { IUser } from './schemaTypes';

export type DBInfo = {
    STATUS: string,
    HOST: string,
    DATE_TIME: string,
};
export type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export interface CustomRequest extends Request {
    user?: IUser;
};