import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Experience } from "../models/experience.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ExperienceSchema } from "../utils/validation.js";
import { destroy, upload } from "../utils/cloudinary.js";
import { Admin } from "../models/admin.model.js";
import Razorpay from "razorpay";
import { config } from "../config/index.js";
import crypto from "crypto";

interface ICode{
    code:string;
    offerPercent:number
}

const createExperience = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    // validate the given text feilds
    // if there is a pic upload it to the cloudinary if not return error
    // if everything went well return res
    const {title, description, price, place, bookingData, offerCode, date, offerPercent} = req.body;
    //console.log(req.body);
    
    
    const adminId = req.userId;
    const admin = await Admin.findById(adminId);
    if(!admin){
        throw new ApiError(404, "User not found");
    }
    if([title, description, price, place, bookingData, date].some((text)=>text==="")){
        
        throw new ApiError(403, "Invalid data");
    }
    const newDate = new Date(date);
    const bookings:string[] = bookingData.trim().split(" ").filter((dates:string)=>dates.length>0);
    const bookingsData = [{
        date:newDate,
        timings:bookings
    }];
    let offerCodes:ICode[] = [];
    if(offerCode && offerPercent){
        
        offerCodes = [{
            code:offerCode,
            offerPercent:parseInt(offerPercent),
        }];
    }
    
    const {success} = ExperienceSchema.safeParse({title, description, place, price:parseInt(price)});
    
    if(!success){
        throw new ApiError(403, "Invalid data");
    }

    if(parseInt(price)<0){
        throw new ApiError(403, "Invalid price");
    }
    
    const pic = req.file?.path; 
    
    if(!pic){
        throw new ApiError(403, "Invalid pic");
    }
    const data = await upload(pic);
    
    if(!data?.url){
        throw new ApiError(405, "Image upload failed");
    }
    
    const newExperience = await Experience.create({
        title,
        description,
        price:parseInt(price),
        place,
        pic: data.url,
        bookingsData:bookingsData,
        offerCodesData:offerCodes,
        adminId:admin._id,
        imageId: data.publicId,
    });
    return res.status(200).json(new ApiResponse(200, {newExperience}, "Experience created successfully"));
});

const getAllExperiences= asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const experiences = await Experience.find();
    return res.status(200).json(new ApiResponse(200, {experiences}, "All experiences are fetched"));
});

const getDetailsOfExperience = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const id = req.params.id;
    const experience = await Experience.findById(id);
    // console.log(experience);
    
    if(!experience){
        throw new ApiError(404, "Experience not found");
    }
    return res.status(200).json(new ApiResponse(200, {experience}, "Experience sent sucessfully"));
});

const creatBookings = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const userId = req.userId;
    let { experienceId, date, timings } = req.body;
    date = new Date(date);
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(409, "Invalid user");
    }
    const experience = await Experience.findById(experienceId);
    if(!experience){
        throw new ApiError(404, "Experience not found");
    }
    if(experience.alreadyBooked.some((booking)=>(new Date(booking.date || "")?.toISOString() === new Date(date).toISOString() && booking.timings===timings))){
        throw new ApiError(403, "Sorry already booked timing");
    }
    if(!experience.bookingsData.some((booking)=>(new Date(booking.date || "")?.toISOString() === new Date(date).toISOString() && booking.timings.indexOf(timings)!==-1))){
        throw new ApiError(403, "Sorry no date or timing found");
    }
    const alreadyBookedDateIndex = experience.alreadyBooked.findIndex((alreadyBooked)=>alreadyBooked.date?.toISOString()===date?.toISOString());
    
    experience.alreadyBooked.push({date:date, timings:timings, user:userId});
    
    const bookingIndex = experience.bookingsData.findIndex((booking)=>(booking.date?.toISOString() === date.toISOString()));
    experience.bookingsData[bookingIndex]?.timings.splice(experience.bookingsData[bookingIndex].timings.indexOf(timings), 1);

    experience.save();
    return res.status(200).json(new ApiResponse(200, {success:true}, "Booking done successfully"));
});

const validatePromo = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const {experienceId, offerCode} = req.body;
    const experience = await Experience.findById(experienceId);
    if(!experience){
        throw new ApiError(404, "Experience not found");
    }
    const offerCodeIndex = experience.offerCodesData.findIndex((offer)=>offer.code===offerCode);
    if(offerCodeIndex===-1){
        throw new ApiError(404, "Offer code not found");
    }
    const offerCodeDiscount = experience.offerCodesData[offerCodeIndex]?.offerPercent;
    experience.offerCodesData.splice(offerCodeIndex, 1);
    experience.save();
    return res.status(200).json(new ApiResponse(200, {percentDiscount:offerCodeDiscount, offerCode}, "Offer acepted successfully"));
});

const getExperienceByPages = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    let page = parseInt(req.query?.page?.toString() || "1");
    let limit = parseInt(req.query?.limit?.toString() || "10");
    const skip:number = (page-1)*limit;
    const experiencesData = await Experience.find().skip(skip).limit(limit);
    const totalExperiences =  await Experience.countDocuments();
    const hasMore = skip + experiencesData.length < totalExperiences;
    return res.status(200).json(
        new ApiResponse(200, {
            data:experiencesData,
            nextPage:hasMore?page+1:undefined,
            total:totalExperiences,
        }, "User experiences sent one by one")
    )

});

const handlePayment = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    let {amount, currency, receipt, notes, experienceId, date, timings} =req.body;
    const userId = req.userId;
    date = new Date(date);
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(409, "Invalid user");
    }
    const experience = await Experience.findById(experienceId);
    if(!experience){
        throw new ApiError(404, "Experience not found");
    }
    if(experience.alreadyBooked.some((booking)=>(new Date(booking.date || "")?.toISOString() === new Date(date).toISOString() && booking.timings===timings))){
        throw new ApiError(403, "Sorry already booked timing");
    }
    if(!experience.bookingsData.some((booking)=>(new Date(booking.date || "")?.toISOString() === new Date(date).toISOString() && booking.timings.indexOf(timings)!==-1))){
        throw new ApiError(403, "Sorry no date or timing found");
    }
    const actualAmount:number = parseInt(amount);
    const razorpay = new Razorpay({
        key_id:config.razorPayApiKeyId,
        key_secret:config.razorPayApiSecret
    });
    const options = {
        amount:actualAmount,
        currency,
        receipt,
        notes
    }
    const order = await razorpay.orders.create(options);
    if(!order) throw new ApiError(407, "Payment failed");
    return res.status(200).json(new ApiResponse(200, {order}, "Payment sucessful"));
});

const validatePayment = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body;
    const generated_signature = crypto.createHmac("sha256", config.razorPayApiSecret);
    generated_signature.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = generated_signature.digest("hex");
    if(digest!==razorpay_signature){
        throw new ApiError(407, "Payment is invalid");
    }
    return res.status(200).json(new ApiResponse(200, {success:true}, "Payment successful"));
});

const searchExperiences = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const searchVal = req.query?.search;
    if(!searchVal){
        throw new ApiError(403, "Seaach value is  required");
    }
    const experiences = await Experience.find({$or:[{title:{$regex:searchVal, $options:'i'}}, {description:{$regex:searchVal, $options:'i'}}]});
    return res.status(200).json(new ApiResponse(200, {experiences}, "Experiences having search value are sent"));
});

const deleteExperience = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const _id = req.params._id;
    const experience = await Experience.findById(_id);
    
    if(!experience) throw new ApiError(404, "Experience not found");

    if(experience.imageId){
        const isImageDeleted = await destroy(experience?.imageId || '');
        if(!isImageDeleted){
            throw new ApiError(405, "Something went wrong while deleting the image");
        }
    }
    await Experience.findByIdAndDelete(experience._id);
    return res.status(200).json(new ApiResponse(200, {success:true}, "Experience deleted successfully"));
});

const updateExperience = asyncHandler(async(req:Request, res:Response, _:NextFunction)=>{
    const { _id } = req.params;
    const {title, description, price, place, bookingData, offerCode, date, offerPercent} = req.body;
    
    const experience = await Experience.findById(_id);
    if(!experience){
        throw new ApiError(404, "Experience not found");
    }

    if(title){
        experience.title = title;
    }
    if(description){
        experience.description = description;
    }
    if(price>=0){
        experience.price = price;
    }
    if(place){
        experience.place = place;
    }
    if(date && bookingData){
        const newDate = new Date(date);
        const bookings:string[] = bookingData.trim().split(" ").filter((dates:string)=>dates.length>0);
        const bookingsData = {
            date:newDate,
            timings:bookings
        };
        experience.bookingsData.push(bookingsData);
        
    }
    if(offerCode && offerPercent){
        
        const offerCodes = {
            code:offerCode,
            offerPercent:parseInt(offerPercent),
        };
        experience.offerCodesData.push(offerCodes);
        
    }
    const pic = req.file?.path;
    if(pic && experience.imageId){
        const isDeleted = await destroy(experience.imageId || '');
        if(isDeleted){
            const data = await upload(pic);
            experience.pic = data?.url || experience.pic;
            experience.imageId = data?.publicId || experience.imageId || '';
        }
    }
    await experience.save();

    return res.status(200).json(new ApiResponse(200, {success:true}, "Experience updated successfully"));
});

export {
    createExperience,
    getAllExperiences,
    getDetailsOfExperience,
    creatBookings,
    validatePromo, 
    getExperienceByPages,
    handlePayment,
    validatePayment,
    searchExperiences, 
    deleteExperience,
    updateExperience,
}