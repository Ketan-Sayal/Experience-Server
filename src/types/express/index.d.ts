import express from "express";
import type { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId: string | JwtPayload | mongoose.Types.ObjectId;
    }
  }
}