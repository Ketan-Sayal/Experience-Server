import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
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

userSchema.pre("save", function(next){
    if(this.isModified("password")){
        const hash = bcrypt.hashSync(this.password, 10);
        this.password = hash;
    }
    next();
});

const User = mongoose.model("User", userSchema);

export {User};