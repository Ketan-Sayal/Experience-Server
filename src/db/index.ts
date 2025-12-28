import mongoose from "mongoose";
import { config } from "../config/index.js";
import { DB_NAME } from "../constants.js";

const DB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${config.mongodbUri}/${DB_NAME}`);
        const host = connectionInstance.connection.host;
        console.log(`\nMongodb connected!!!\nConnection host: ${host}\n`);
    } catch (error) {
        console.log(`Mongodb error : \n${error}`);
        process.exit(1);
    }
}

export {DB};