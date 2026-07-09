require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnection = require("./src/config/dbConnection");
const userRoutes = require("./src/routes/user");
const contactRoutes = require("./src/routes/contact");
const chatbotRoutes = require("./src/routes/chatbot");

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
    "https://api.buttnetworks.com",
    "https://buttnetworks.com",
    "http://localhost:3000",
    "https://admin-dashboard.buttnetworks.com"
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 204
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

dbConnection()
.then(()=>{console.log("✅✅ MongoDB Connected")})
.catch((err)=>{console.log(err)});

app.get('/', (req,res)=>{
    res.end("Server Running Successfully");
});

app.use("/api/user", userRoutes);
app.use("/api", contactRoutes);
app.use ("/api", chatbotRoutes);


app.listen(PORT, (err)=>{
  if(err){
    console.log("❌❌ Server Disconnected");
  } else{
    console.log(`✅✅ Server Connected at ${PORT}`);
  }
});