import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";

export const isLoggedIn = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const token = req.cookies["Authorization_token"] || req.headers?.authorization;
        if(!token){
            return res.status(409).json(new ApiError(409, "User must logged in"));
        }
        const decoded = jwt.verify(token, config.jwtTokenSecret);
        if(!decoded){
            return res.status(409).json(new ApiError(409, "User must logged in"));
        }
        const user = await User.findById(decoded);
        if(!user){
           return res.status(409).json(new ApiError(409, "User must logged in"));
        }
        req.userId = user._id;
        next();
    } catch (error) {
        return res.status(500).json(new ApiResponse(409, {error:"Something went wrong"}, "Something went wrong"));
    }
}

export const adminMiddleware = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const token = req.cookies["Authorization_Admin_token"] || req.headers?.authorization;
        if(!token){
            return res.status(409).json(new ApiError(409, "User must logged in"));
        }
        const decoded = jwt.verify(token, config.jwtAdminTokenSecret);
        if(!decoded){
            return res.status(409).json(new ApiError(409, "User must logged in"));
        }
        const admin = await Admin.findById(decoded);
        if(!admin){
            return res.status(409).json(new ApiError(409, "User must logged in"));
        }
        req.userId = admin._id;
        //console.log(req.userId);
        
        next();
    } catch (error) {
        return res.status(500).json(new ApiResponse(409, {error:"Something went wrong"}, "Something went wrong"));
    }
}