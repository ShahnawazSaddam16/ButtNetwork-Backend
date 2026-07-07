const express = require("express");
const router = express.Router();
const limiter = require("../utils/limiter");
const {CreateContact, FetchContact} = require("../controllers/contact");

router.post("/create-contact", limiter, CreateContact);
router.get("/all-contacts", limiter, FetchContact);

module.exports = router;