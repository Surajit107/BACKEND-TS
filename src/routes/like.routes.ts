import express, { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedComments,
    getLikedTweets,
    getVideoLikes,
} from "../controllers/like.controller";
import { VerifyJWTToken } from "../middlewares/auth/authUser";

const router: Router = express.Router();
router.use(VerifyJWTToken); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/v/:videoId").get(getVideoLikes);
router.route("/comments").get(getLikedComments);
router.route("/tweets").get(getLikedTweets);

export default router;