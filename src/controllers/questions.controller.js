const { Question } = require("../models");

async function list(id)   {
    return await Question.find({quiz: id}).select("id");
}

async function getQuestionById(questionId)    {
    return await Question.find({_id: questionId}).populate({
        path: 'options',
        select: ["_id", "text"],
    }).select(["-__v", "-createdAt", "-updatedAt"]);
}
module.exports = {
    list,
    getQuestionById,
}