const { sendResponse } = require("../helpers/response");
const { Submission } = require("../models");
async function getSubmissionById(id) {
    return await Submission.findById({ _id: id }).select([
        "-__v",
        "-createdAt",
        "-updatedAt",
    ]);
}
async function create() {
    return "test";
}
module.exports = {
    getSubmissionById,
    create,
};
