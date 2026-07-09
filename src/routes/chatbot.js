const express = require("express");
const router = express.Router();
const limiter = require("../utils/limiter");
const {Chatbot} = require("../controllers/chatbot");

router.post("/chatbot", limiter, Chatbot);

module.exports = router;