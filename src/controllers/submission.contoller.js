const { Submission } = require("../models");
async function getSubmissionById(id)    {
    return await Submission.findById({_id: id})
        .select(["-__v", "-createdAt", "-updatedAt"]);
}
module.exports = {
    getSubmissionById,
}