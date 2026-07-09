const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.CHATBOT_JWT_SECRET;
const COOKIE_NAME = "chatbot_token";

const getOrCreateUserId = (req) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (err) {
      return null;
    }
  }

  return null;
};

const issueUserToken = (res) => {
  const userId = uuidv4();
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return userId;
};

const resolveUserId = (req, res) => {
  let userId = getOrCreateUserId(req);
  if (!userId) {
    userId = issueUserToken(res);
  }
  return userId;
};

module.exports = { getOrCreateUserId, issueUserToken, resolveUserId };