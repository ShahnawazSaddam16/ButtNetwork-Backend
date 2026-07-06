const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    city: String,
    region: String,
    country: String,
    latitude: Number,
    longitude: Number
}, { _id: false });

const userSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: [true, "IP address is required"],
        unique: true,
        trim: true
    },
    location: locationSchema,
    userAgent: {
        type: String,
        required: [true, "User agent is required"]
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    lastVisit: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false });

userSchema.index({ ipAddress: 1 });
userSchema.index({ timestamp: 1 });

module.exports = mongoose.model("User", userSchema);
