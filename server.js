require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnection = require("./src/config/dbConnection");
const userRoutes = require("./src/routes/user");
const contactRoutes = require("./src/routes/contact");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["https://buttnetworks.com", "http://localhost:3000",],
    credentials: true
}));

dbConnection()
.then(()=>{console.log("✅✅ MongoDB Connected")})
.catch((err)=>{console.log(err)});

app.get('/', (req,res)=>{
    res.end("Server Running Successfully");
});

app.use("/api/user", userRoutes);
app.use("/api", contactRoutes);

app.listen(PORT, (err)=>{
  if(err){
    console.log("❌❌ Server Disconnected");
  } else{
    console.log(`✅✅ Server Connected at ${PORT}`);
  }
});