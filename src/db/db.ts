import mongoose from "mongoose";
import { DB_NAME } from "../constants";
import { DBInfo } from "../../types/commonType";

const connectDB = async (): Promise<void> => {
    try {
        const conectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // Get the current date and time
        const currentDate = new Date().toLocaleString();
        const dbInfo: DBInfo = {
            STATUS: "Connected🌐",
            HOST: conectionInstance.connection.host,
            DATE_TIME: currentDate
        };
        console.log("\n🛢  MongoDB Connection Established");
        console.table(dbInfo);
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
};

export default connectDB;
