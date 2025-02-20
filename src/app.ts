import express, { NextFunction, Request, Response } from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { EXPRESS_CONFIG_LIMIT } from "./constants";


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());


// routes
import healthcheckRouter from "./routes/healthcheck.routes"
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import commentRouter from './routes/comment.routes';
import tweetRouter from "./routes/tweet.routes"
import subscriptionRouter from "./routes/subscription.routes"
import videoRouter from "./routes/video.routes"
import likeRouter from "./routes/like.routes"
import playlistRouter from "./routes/playlist.routes"
import dashboardRouter from "./routes/dashboard.routes"

// routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);


app.get('/ping', (req: Request, res: Response) => {
    res.send("Hi!...I am server, Happy to see you boss...");
});
// Internal server error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(500).json({
        status: 500,
        message: "Server Error",
        error: err.message
    });
});
// Page not found middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        status: 404,
        message: "Endpoint Not Found"
    });
});


export { app };