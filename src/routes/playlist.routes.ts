import express, { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller"
import { VerifyJWTToken } from "../middlewares/auth/authUser";
import ModelAuth from '../middlewares/auth/modelAuth';
import validatePlaylist from '../models/validator/playlist.validate';


const router: Router = express.Router();
router.use(VerifyJWTToken); // Apply verifyJWT middleware to all routes in this file

router.route("/").post([ModelAuth(validatePlaylist)], createPlaylist);

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch([ModelAuth(validatePlaylist)], updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;