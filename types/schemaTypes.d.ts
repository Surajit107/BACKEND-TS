import { Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
    _id: string | ObjectId;
    fullName: string;
    username: string;
    email: string;
    watchHistory: Array<ObjectId>;
    password: string;
    avatar: string;
    coverImage?: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface IVideoSchema extends Document {
    _id: ObjectId;
    videoFile: string;
    thumbnail: string;
    title: string;
    description: string;
    duration: number;
    views: number;
    viewers: Array<ObjectId>;
    isPublished: boolean;
    owner: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface ISubscriptionSchema extends Document {
    _id: ObjectId;
    subscriber: ObjectId;
    channel: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface ICommentSchema extends Document {
    _id: ObjectId;
    content: string;
    video: ObjectId;
    owner: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface ILikeSchema extends Document {
    _id: ObjectId;
    video: ObjectId;
    comment: ObjectId;
    tweet: ObjectId;
    likedBy: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface IPlaylistSchema extends Document {
    _id: ObjectId;
    name: string;
    description: string;
    videos: Array<ObjectId>;
    owner: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};
export interface ITweetSchema extends Document {
    _id: ObjectId;
    owner: ObjectId;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
};