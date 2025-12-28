import * as dotenv from "dotenv";

dotenv.config();

interface Config{
    mongodbUri: string;
    port: number;
    jwtTokenSecret: string;
    cloudinaryApiKey:string;
    cloudinaryCloudName:string;
    cloudinarySecret:string;
    jwtAdminTokenSecret:string;
    razorPayApiKeyId:string;
    razorPayApiSecret:string

}

export const config:Config = {
    mongodbUri: new String(process.env.MONGODB_URI).toString(),
    port: parseInt(new String(process.env.PORT).toString()),
    jwtTokenSecret: new String(process.env.JWT_SECRET).toString(),
    cloudinaryApiKey: new String(process.env.CLOUDINARY_API_KEY).toString(),
    cloudinaryCloudName: new String(process.env.CLOUDINARY_CLOUD_NAME).toString(),
    cloudinarySecret: new String(process.env.CLOUDINARY_SECRET).toString(),
    jwtAdminTokenSecret:new String(process.env.JWT_ADMIN_SECRET).toString(),
    razorPayApiKeyId: new String(process.env.RAZORPAY_KEY_ID).toString(),
    razorPayApiSecret : new String(process.env.RAZORPAY_SECRET).toString()
}