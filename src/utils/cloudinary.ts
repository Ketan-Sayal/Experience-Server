import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";
import fs from "fs";

cloudinary.config({
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinarySecret,
    cloud_name: config.cloudinaryCloudName,
    secure:true,
});

////////////////////////////
// Uploads an image file //
//////////////////////////
export const upload = async (imagePath:string) => {
    
    if(!imagePath) return null;
    
    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, {
        resource_type:"auto"
      });
      //console.log(result);
      fs.unlinkSync(imagePath);
      return {publicId: result.public_id, url:result.secure_url};
    } catch (error) {
      console.error(error);
      fs.unlinkSync(imagePath);
      return null;
    }
};

export const destroy = async(publicId:string)=>{
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    if(res?.result==="ok"){
      return true;
    }else{
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}