require("dotenv").config();
const https = require("https");
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

const isPrivateIP = (ip) => {
    if (!ip) return true;
    return (
        ip === "::1" ||
        ip === "127.0.0.1" ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        ip.startsWith("172.16.") ||
        ip.startsWith("172.17.") ||
        ip.startsWith("172.18.") ||
        ip.startsWith("172.19.") ||
        ip.startsWith("172.20.") ||
        ip.startsWith("172.21.") ||
        ip.startsWith("172.22.") ||
        ip.startsWith("172.23.") ||
        ip.startsWith("172.24.") ||
        ip.startsWith("172.25.") ||
        ip.startsWith("172.26.") ||
        ip.startsWith("172.27.") ||
        ip.startsWith("172.28.") ||
        ip.startsWith("172.29.") ||
        ip.startsWith("172.30.") ||
        ip.startsWith("172.31.")
    );
};

const getLocationFromIP = async (ip) => {
    if (!ip) return null;
    const ipapiUrl = `${process.env.IP_LOCATION_API_URL || "https://ipapi.co"}/${ip}/json/`;
    const ipApiUrl = `https://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,message`;

    const fetchLocation = (url, parser) => {
        return new Promise((resolve) => {
            https.get(url, (response) => {
                let data = "";
                response.on("data", (chunk) => {
                    data += chunk;
                });
                response.on("end", () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parser(parsed));
                    } catch (err) {
                        resolve(null);
                    }
                });
            }).on("error", () => {
                resolve(null);
            });
        });
    };

    const ipapiResult = await fetchLocation(ipapiUrl, (parsed) => {
        if (parsed?.error) return null;
        return {
            city: parsed.city || null,
            region: parsed.region || null,
            country: parsed.country_name || null,
            latitude: parsed.latitude || null,
            longitude: parsed.longitude || null
        };
    });

    if (ipapiResult?.city) return ipapiResult;

    const ipApiResult = await fetchLocation(ipApiUrl, (parsed) => {
        if (parsed?.status !== "success") return null;
        return {
            city: parsed.city || null,
            region: parsed.regionName || null,
            country: parsed.country || null,
            latitude: parsed.lat || null,
            longitude: parsed.lon || null
        };
    });

    return ipApiResult || ipapiResult;
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
                    { lastVisit: new Date() },
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

        const location = isPrivateIP(ipAddress)
            ? null
            : await getLocationFromIP(ipAddress);

        const newUser = new User({
            ipAddress,
            location,
            userAgent,
            timestamp: new Date(),
            lastVisit: new Date()
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

module.exports = { userDetails };