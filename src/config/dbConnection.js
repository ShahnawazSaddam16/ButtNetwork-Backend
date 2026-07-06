require("dotenv").config();
const mongoose = require("mongoose");

const dbConnection = async()=>{
    await mongoose.connect(process.env.MONGO_URI,{});
}

module.exports = dbConnection;