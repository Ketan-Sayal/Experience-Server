import mongoose from "mongoose";

const bookingsSchema = new mongoose.Schema({
    date: Date,
    timings:[{
        type:String,
        default:[]
    }]
});

const bookedSchema = new mongoose.Schema({
    date: Date,
    timings:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

const OfferCodeSchema = new mongoose.Schema({
    code:String,
    offerPercent:Number
});

const experienceSchema = new mongoose.Schema({
    adminId:{
       type: mongoose.Schema.Types.ObjectId,
       ref:'Admin' 
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    price:Number,
    bookingsData:{
        type:[bookingsSchema],// these sub-schema as type array is not passed  as a type
        default:[]
    },
    offerCodesData:{
        type:[OfferCodeSchema],
        default:[],
    },
    alreadyBooked:{
        type:[bookedSchema],
        default:[]
    }, 
    pic:{
        type:String,
        required:true
    },
    imageId:String,
});

const Experience = mongoose.model("Experience", experienceSchema);

export {Experience};