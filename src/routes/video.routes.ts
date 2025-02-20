import express, { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller";
import { VerifyJWTToken } from "../middlewares/auth/authUser";
import { upload } from "../middlewares/multer.middleware";
import ModelAuth from "../middlewares/auth/modelAuth";
import ValidateVideo from "../models/validator/video.validate";

const router: Router = express.Router();
router.use(VerifyJWTToken); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        [ModelAuth(ValidateVideo)],
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), [ModelAuth(ValidateVideo)], updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;