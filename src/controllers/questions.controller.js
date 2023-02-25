const { Question, Option } = require("../models");

async function list(id)   {
    return await Question.find({quiz: id}).select("id");
}

async function getQuestionById(questionId)    {
    return await Question.find({_id: questionId}).populate({
        path: 'options',
        select: ["_id", "text"],
    }).select(["-__v", "-createdAt", "-updatedAt"]);
}

async function createMany(questsionsData) {
    let totalPoints = 0;
    const questions = await Promise.all(
        questsionsData.map(async ({ text, points, options, type }) => {
            const question = new Question({
                text,
                points: points || quiz.settings.defaultPoints,
                quiz,
                type,
            });
            totalPoints = totalPoints + question.points;
            // first insert all options
            const opts = await Option.insertMany(
                options.map((option) => ({ ...option, question: question }))
            );
            question.options = opts;
            // then return the question saving promise for Promise.all()
            return question.save();
        })
    );
    return {questions, totalPoints};
}

module.exports = {
    list,
    getQuestionById,
    createMany
}