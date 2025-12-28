import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());

import adminRouter from ".//routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import experienceRouter from "./routes/experience.route.js";

app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/experiences", experienceRouter);

export {app};