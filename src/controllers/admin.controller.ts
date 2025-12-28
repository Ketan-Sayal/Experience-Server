import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserSigninSchema, UserSignupSchema } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { config } from "../config/index.js";

const signup = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const {Adminname, email, password} = req.body;
    const {success} = UserSignupSchema.safeParse({Adminname, email, password});

    if(!success){
        throw new ApiError(403, "Invalid creds");
    }
    const existingAdmin = await Admin.findOne({email});
    if(existingAdmin){
        throw new ApiError(405, "Admin already exists");
    }
    
    const newAdmin = await Admin.create({
        Adminname,
        email, 
        password
    });
    const sendAdmin = await Admin.findById(newAdmin._id).select("-password");
    const token = jwt.sign(sendAdmin?._id.toString() || '', config.jwtAdminTokenSecret);

    return res.status(200).cookie("Authorization_Admin_token", token).json(new ApiResponse(200, {
        Admin:sendAdmin,
        token
    }, "Admin created successfully"));
});

const signin = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const {email, password} = req.body;
    const {success} = UserSigninSchema.safeParse({email, password});
    
    if(!success){
        throw new ApiError(403, "Invalid creds");
    }

    const existingAdmin = await Admin.findOne({
        email,
        password
    });
    if(!existingAdmin){
        throw new ApiError(409, "Admin doesn't exists"); 
    }
    
    const sendAdmin = await Admin.findById(existingAdmin._id).select("-password");
    const token = jwt.sign(sendAdmin?._id.toString() || '', config.jwtAdminTokenSecret);

    return res.status(200).cookie("Authorization_token", token).json(new ApiResponse(200, {Admin:sendAdmin, token}, "Admin logged in successfully"))
});

const getAdmin = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const adminId = req.userId;
    const admin = await Admin.findById(adminId).select("-password");
    
    if(!admin) throw new ApiError(404, "Amin not found");

    return res.status(200).json(new ApiResponse(200, {admin}, "Admin sent successfully"));
})

export {
    signup,
    signin,
    getAdmin
}
