import mongoose, { Schema, Model, Document, CallbackError } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../../types/schemaTypes";

const UserSchema: Schema<IUser> = new Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        index: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: [true, "Email Address is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Videos",
        },
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: String,
        default: "",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Pre - save hook for hashing password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcryptjs.hash(this.password, 10);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to check password
UserSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcryptjs.compare(password, this.password)
};

// Method to generate access token
UserSchema.methods.generateAccessToken = function (): string {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
};

// Method to generate refresh token
UserSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
};


const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
