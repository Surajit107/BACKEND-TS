import express, { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { VerifyJWTToken } from "../middlewares/auth/authUser";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller";

const router: Router = express.Router();
router.use(VerifyJWTToken); // Apply VerifyJWTToken middleware to all routes in this file


/***************************** secured routes *****************************/
// Change password
router.route('/change-password').post(
    changeCurrentPassword
);
// Current user
router.route('/current-user').get(
    getCurrentUser
);
// Update account
router.route('/update-account').patch(
    updateAccountDetails
);
// Update avatar
router.route('/update-avatar').patch(
    [upload.single("avatar")],
    updateUserAvatar
);
// Update cover image
router.route('/update-cover-image').patch(
    [upload.single("coverImage")],
    updateUserCoverImage
);
// Channel profile
router.route('/channel-profile/:username').get(
    getUserChannelProfile
);
// Watch history
router.route('/watch-history').get(
    getWatchHistory
);

export default router;