import {v2 as cloudinary} from "cloudinary";
import fs from 'fs'
import { UploadApiResponse } from "cloudinary";


cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:process.env.CLOUDINARY_API_KEY!,
  api_secret:process.env.CLOUDINARY_API_SECRET!
})

 const uploadOnCloudinary = async(localFilePath:string): Promise<UploadApiResponse | null>=>{
  try {

    if(!localFilePath) {console.log("no file found");
     return null;}
    const res= await cloudinary.uploader.upload(localFilePath,{
      resource_type:"image"
    })
    console.log("File is uploaded successfully ",res.url)
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log(error);
    return null;
  }
}

export {uploadOnCloudinary};