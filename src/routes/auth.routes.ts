import express, { Router } from "express";
import ModelAuth from "../middlewares/auth/modelAuth";
import ValidateUser from "../models/validator/user.validate";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
} from "../controllers/auth/auth.controller";
import { upload } from "../middlewares/multer.middleware";
import { VerifyJWTToken } from "../middlewares/auth/authUser";

const router: Router = express.Router();

// Sign-Up
router.route('/signup').post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    [ModelAuth(ValidateUser)],
    registerUser
);
// Sign-in
router.route('/signin').post(
    loginUser
);


/***************************** secured routes *****************************/
// Logout
router.route('/logout').post(
    [VerifyJWTToken],
    logoutUser
);
// Refresh Token
router.route('/refresh-token').post(
    refreshAccessToken
)

export default router;