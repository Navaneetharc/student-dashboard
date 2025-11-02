import express from "express";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

import studentRoutes from "./routes/student.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());


app.use(express.static(path.join(__dirname, "../public")));


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "yourStrongSecretKey",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl:
            process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student-management",
            collectionName: "session",
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            httpOnly: true,
            sameSite: "lax",
        },
    })
);

app.use((req,res,next)=>{
    res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma","no-cache");
    res.setHeader("Expires", "0");
    next();
})


app.get("/",(req,res)=>{
    console.log("Root route hit");
    res.redirect("/signin");
});

app.use("/",studentRoutes);
app.use("/admin",adminRoutes);


export default app;