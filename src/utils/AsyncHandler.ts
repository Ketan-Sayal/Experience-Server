import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError.js";

interface IError extends Error{
    statusCode:number;
    message:string
}

const asyncHandler = (fn:(req:Request, res:Response, next:NextFunction)=>Promise<void | Response>)=>{
    return async(req:Request, res:Response, next:NextFunction)=>{
        try {
            return await fn(req, res, next);
        } catch (err) {
            const error = err as IError;// treat err as IError for the variable error
            //console.log(err);
            return res.status(error.statusCode || 500).json(new ApiError(500, error.message ||"Something went wrong"));
        }
    }
}

export {asyncHandler};