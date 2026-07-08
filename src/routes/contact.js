const express = require("express");
const router = express.Router();
const limiter = require("../utils/limiter");
const {CreateContact, FetchContact, deleteContact} = require("../controllers/contact");

router.post("/create-contact", limiter, CreateContact);
router.get("/all-contacts", FetchContact);
router.delete("/delete-contact/:id", deleteContact);

module.exports = router;