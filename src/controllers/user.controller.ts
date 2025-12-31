import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { UserSigninSchema, UserSignupSchema } from "../utils/validation.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import bcrypt from "bcrypt";
import { Experience } from "../models/experience.model.js";

const signup = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const {username, email, password} = req.body;
    const {success} = UserSignupSchema.safeParse({username, email, password});

    if(!success){
        throw new ApiError(403, "Invalid creds");
    }
    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new ApiError(405, "User already exists");
    }
    
    const newUser = await User.create({
        username,
        email, 
        password
    });
    const sendUser = await User.findById(newUser._id).select("-password");
    const token = jwt.sign(sendUser?._id.toString() || '', config.jwtTokenSecret);

    return res.status(200).cookie("Authorization_token", token).json(new ApiResponse(200, {
        user:sendUser,
        token
    }, "User created successfully"));
});

const signin = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const {email, password} = req.body;
    const {success} = UserSigninSchema.safeParse({email, password});
    
    if(!success){
        throw new ApiError(403, "Invalid creds");
    }

    const existingUser = await User.findOne({
        email
    });
    if(!existingUser){
        throw new ApiError(409, "User doesn't exists"); 
    }
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if(!isPasswordCorrect){
        throw new ApiError(402, "User password is incorrect"); 
    }
    const sendUser = await User.findById(existingUser._id).select("-password");
    const token = jwt.sign(sendUser?._id.toString() || '', config.jwtTokenSecret);

    return res.status(200).cookie("Authorization_token", token).json(new ApiResponse(200, {user:sendUser, token}, "User logged in successfully"))
});

const getUserData = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    
    if(!user) throw new ApiError(404, " User not found");
    return res.status(200).json(
        new ApiResponse(200, {user}, "User sent successfully")
    );
});

const getUserPurchases = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const userId = req.userId;
    const userPurchases = await Experience.find({
        "alreadyBooked.user": userId,
    });
    return res.status(200).json(new ApiResponse(200, {experiences:userPurchases}, "User purchased experiences sent successfully"));
});

export {
    signup,
    signin,
    getUserData,
    getUserPurchases
}
