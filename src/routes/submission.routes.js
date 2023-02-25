const express = require("express");
const { sendResponse } = require("../helpers/response");
const router = express.Router();

// const { Submission } = require("../models");
const { submissionController } = require("../controllers");
router.get("/:id", async (req, res, next) => {
    try {
        const {
            params: { id }
        } = req;
        const submission = await submissionController.getSubmissionById(id);
        if (Object.keys(submission).length !== 0) {
            sendResponse(req, res, { data: submission });
            return;
        }
        return res.status(404).json({
            message: "Submission not found",
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
module.exports = router;