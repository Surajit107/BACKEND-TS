import express, { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller"
import { VerifyJWTToken } from "../middlewares/auth/authUser";
import ModelAuth from '../middlewares/auth/modelAuth';
import validateTweet from '../models/validator/tweet.validate';

const router: Router = express.Router();
router.use(VerifyJWTToken); // Apply verifyJWT middleware to all routes in this file

router.route("/").post([ModelAuth(validateTweet)], createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch([ModelAuth(validateTweet)], updateTweet).delete(deleteTweet);

export default router