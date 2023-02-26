const express = require("express");
const { sendResponse } = require("../helpers/response");
const { validate, isMongoId } = require("../helpers/validation");
const router = express.Router();

// const { Submission } = require("../models");
const { submissionController } = require("../controllers");
router.get("/:id", validate([isMongoId("id", "submission")]), async (req, res, next) => {
    try {
        const {
            params: { id }
        } = req;
        const submission = await submissionController.getSubmissionById(id);
        if (submission !== null && Object.keys(submission).length !== 0) {
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