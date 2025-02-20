import { IVideoSchema } from "./schemaTypes";

interface ICredentials {
    username: string;
    email: string;
    password: string;
};
export interface ILoginCredentials extends ICredentials { };

export interface IRegisterCredentials extends ICredentials {
    fullName: string;
};

export interface PaginationQuery {
    page?: string;
    limit?: string;
};

export interface DashboardResp {
    totalViews: number;
    totalVideos: number;
    totalSubscribers: number;
    totalLikes: number;
};

export interface GetChannelVideosResponse {
    videos: Array<IVideoSchema>;
    totalVideos: number;
    page: number;
    totalPages: number;
};

export interface CommentDocument {
    _id: mongoose.Types.ObjectId;
    content: string;
    video: mongoose.Types.ObjectId;
    owner: {
        fullName: string;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
    __v: number;
};

export interface GetVideoCommentsResponse {
    videos: Array<CommentDocument>;
    pagination: {
        totalVideos: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
};

export interface HealthcheckResponse {
    host: Array<string>;
    message: string;
    status: boolean;
    time: Date;
};

export interface HealthcheckApiResponse {
    response: HealthcheckResponse;
}