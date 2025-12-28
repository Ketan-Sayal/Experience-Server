import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";


const adminSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
});

const Admin = mongoose.model("Admin", adminSchema);

export {Admin};