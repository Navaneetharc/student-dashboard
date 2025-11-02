import app from "./app";
import {connectDB} from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
    try{
        await connectDB();
        app.listen(PORT, ()=>{
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.log("Failed to start server:",err);
        process.exit(1);
    }
};

startServer();