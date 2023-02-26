const { Question, Option } = require("../models");

async function list(id) {
    return await Question.find({ quiz: id }).select("id");
}

async function getQuestionById(questionId) {
    return await Question.find({ _id: questionId })
        .populate({
            path: "options",
            select: ["_id", "text"],
        })
        .select(["-__v", "-createdAt", "-updatedAt"]);
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
    return { questions, totalPoints };
}

//This function updates question if exists else adds new one
async function updateMany(quiz, questionsData) {
    let totalPoints = 0;
    let questions = await Promise.all(
        questionsData.map(async ({ _id, text, points, options, type }) => {
            let question;
            let isUpdate = false;
            //check if question exists
            if (_id && _id.length === 24) {
                question = await Question.findById(_id);
            }
            //If question exists
            if (question) {
                await question.update({ text, points, type });
            } else {
                //if question not exists create new

                question = new Question({
                    text,
                    points: points || quiz.settings.defaultPoints,
                    quiz,
                    type,
                });
            }
            //Update total points
            totalPoints += question.points;
            //remove old options
            await Option.deleteMany({ question: question._id });
            //If question updated no need of saving it
            if (isUpdate)
                return await Option.insertMany(
                    options.map((option) => ({ ...option, question: question }))
                );
            //Else save options and assign it to question
            const opts = await Option.insertMany(
                options.map((option) => ({ ...option, question: question }))
            );
            question.options = opts;
            // then return the question saving promise for Promise.all()
            return question.save();
        })
    );
    return { questions, totalPoints };
}

module.exports = {
    list,
    getQuestionById,
    createMany,
    updateMany,
};
