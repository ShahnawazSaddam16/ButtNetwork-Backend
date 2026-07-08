require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const normalizeIP = (ip) => {
    if (!ip) return null;
    const firstIp = ip.split(",")[0].trim();
    if (firstIp.startsWith("::ffff:")) {
        return firstIp.replace("::ffff:", "");
    }
    return firstIp;
};

const getUserIP = (req) => {
    const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress;
    return normalizeIP(rawIp);
};

const generateToken = (userId) => {
    return jwt.sign(
        { userId, timestamp: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '30d' }
    );
};

const userDetails = async (req, res) => {
    try {
        const userCookie = req.cookies?.authToken;

        if (userCookie) {
            try {
                const decoded = jwt.verify(userCookie, process.env.JWT_SECRET);
                const user = await User.findByIdAndUpdate(
                    decoded.userId,
                    { $inc: { visitCount: 1 }, lastVisit: new Date() },
                    { new: true }
                );

                if (user) {
                    const newToken = generateToken(user._id);
                    res.cookie('authToken', newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Strict',
                        maxAge: 30 * 24 * 60 * 60 * 1000
                    });

                    return res.status(200).json({
                        message: "Returning user",
                        isNewUser: false,
                        data: user
                    });
                }
            } catch (err) {
                console.log("Token verification failed:", err.message);
            }
        }

        const ipAddress = getUserIP(req);
        const userAgent = req.headers['user-agent'];

        let existingUser = await User.findOne({ ipAddress });

        if (existingUser) {
            existingUser.visitCount = (existingUser.visitCount || 0) + 1;
            existingUser.lastVisit = new Date();
            await existingUser.save();

            const token = generateToken(existingUser._id);
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                message: "User data already exists",
                isNewUser: false,
                data: existingUser
            });
        }

        const newUser = new User({
            ipAddress,
            userAgent,
            timestamp: new Date(),
            lastVisit: new Date(),
            visitCount: 1
        });

        await newUser.save();

        const token = generateToken(newUser._id);
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "New user data stored successfully",
            isNewUser: true,
            data: newUser
        });

    } catch (error) {
        console.error("Error in userDetails:", error);
        res.status(500).json({
            message: "Error processing user details",
            error: error.message
        });
    }
};


const FetchDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const allUsers = await User.find()
            .sort({ lastVisit: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments();

        res.status(200).json({
            message: "All user data fetched successfully",
            totalUsers,
            page,
            totalPages: Math.ceil(totalUsers / limit),
            data: allUsers
        });

    } catch (error) {
        console.error("Error in FetchDetails:", error);
        res.status(500).json({
            message: "Error fetching all user details",
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({
            message: "Error deleting user",
            error: error.message
        });
    }
};

module.exports = { userDetails, FetchDetails, deleteUser };