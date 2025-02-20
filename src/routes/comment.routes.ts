import express, { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller";
import { VerifyJWTToken } from "../middlewares/auth/authUser";
import ModelAuth from "../middlewares/auth/modelAuth";
import validateComment from '../models/validator/comment.validate';

const router: Router = express.Router();
router.use(VerifyJWTToken); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post([ModelAuth(validateComment)], addComment);
router.route("/c/:commentId").delete(deleteComment).patch([ModelAuth(validateComment)], updateComment);

export default router