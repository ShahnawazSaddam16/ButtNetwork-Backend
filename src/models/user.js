const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: [true, "IP address is required"],
        unique: true,
        trim: true
    },
    userAgent: {
        type: String,
        required: [true, "User agent is required"]
    },
    visitCount: {
        type: Number,
        default: 1
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

userSchema.index({ timestamp: 1 });

module.exports = mongoose.model("User", userSchema);