const express = require("express");
const { sendResponse } = require("../helpers/response");
const { User } = require("../models");

const router = express.Router();

router.post("/", async (req, res, next) => {
    const { username } = req.body;
    try {
        const user = new User({ username });
        await user.save();
        sendResponse(req, res, {
            data: { _id: user.id, username: user.username },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
