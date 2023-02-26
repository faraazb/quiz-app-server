const path = require("path");
const mongoose = require("mongoose");
const {
    Quiz,
    Question,
    Option,
    User,
    Submission,
    Report,
} = require("../quiz-app-server/src/models");
const quizzes = require("./quizzes.json");

mongoose.set("strictQuery", false);

let usernames = [
    "harshitha", "kashmeera", "faraaz", "vaibhav", "TriviaBuff", "QuizGenius", 
    "sheldon_cooper", "DwightKSchrute", "KnowItAll", "Dwight_42", "Penny_64",
    "Walter_09", "Monica_31", "HistoryBuff", "PuzzlePundit", "TechSavvy",
    "ScienceNerd", "QuizWizard", "QuizChampion", "QuizGenius", "KnowledgeNinja",
    "big_brainzz", "pro_quiz_81", "number_one", "dom_toretti", "michael_super_scott"
]
let altUsernames = []
const subLo = 8;
const subHi = usernames.length;

require("dotenv").config();

const { MONGODB_URI } = process.env;

function getNRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomUsername() {
    let id = randomInt(0, usernames.length - 1);
    altUsernames.push(usernames[id]);
    let names = usernames.splice(id, 1);
    // once usernames list is empty, refill it
    if (usernames.length === 0) {
        usernames = altUsernames;
        altUsernames = [];
    }
    return names[0];
}

function chooseOptions(options, count = 1) {
    if (count === options.length) {
        return options;
    }
    return getNRandom(options, count);
}

function logQuiz(quiz, scores) {
    console.log(`Title: ${quiz.title}`);
    console.log(`Description: ${quiz.description}`);
    console.log(`No. of questions: ${quiz.questions.length}`);
    console.log(`No. of submissions: ${quiz.submissions.length}`);
    console.log(`Scores: ${scores}`);
    console.log(`Stats - Highest: ${quiz.report.statistics.highestScore} Average: ${quiz.report.statistics.averageScore}`);
    console.log("------ ------- -------")
}


// main
async function populate() {
    console.log("---- Populating the database ----");
    // iterate over all quizzes in the JSON file
    for (const q of quizzes) {
        // create a quiz instance
        const quiz = new Quiz({ title: q.title, description: q.description, settings: { defaultPoints: q.defaultPoints }, totalPoints: q.totalPoints });
        // create a random number of submissions and its user
        const submissions = [];
        let subCount = randomInt(subLo, subHi);
        for (let i = 0; i < subCount; i++) {
            let user = await new User({ username: getRandomUsername() }).save();
            submissions.push(new Submission({ quiz: quiz, user: user }));
        }
        // const submissions = new Array(randomInt(subLo, subHi)).map(async () => {
        //     let user = await new User({ username: getRandomUsername() }).save();
        //     return new Submission({ quiz: quiz, user: user });
        // });
        // SAVE all options of a question and then the question
        const questions = await Promise.all(
            q.questions.map(async ({ text, points, options, type }) => {
                const question = new Question({
                    text,
                    points: points || quiz.settings.defaultPoints,
                    quiz: quiz,
                    type: type
                });
                // first insert all options
                const opts = await Option.insertMany(
                    options.map((option) => ({ ...option, question: question }))
                );
                question.options = opts;
                // submissions
                let answers = opts.filter((opt) => opt.isCorrect);
                submissions.forEach((submission) => {
                    let markedOpts = type === "single_ans" ? chooseOptions(opts) : chooseOptions(opts, randomInt(0, opts.length));
                    submission.selectedOptions.push({ question: question, options: markedOpts });
                    // check if ALL right options are marked and increase submission score
                    if (answers.every((ans) => markedOpts.includes(ans))) {
                        submission.score = submission.score + question.points;
                        submission.correctlyAnsweredCount = (submission.correctlyAnsweredCount || 0) + 1;
                    }
                })
                // then return the question saving promise for Promise.all() 
                return question.save();
            })
        );
        // this is just me trying aggregation, a simple forEach is just better
        // for all our uses probably
        const quizId = mongoose.Types.ObjectId(quiz.id);
        const [aggregation] = await Question.aggregate([
            { $match: { quiz: quizId } },
            { $group: { _id: null, totalPoints: { $sum: "$points" } } }
        ]);
        quiz.totalPoints = aggregation.totalPoints;
        // calculate stats and save submissions
        let highestScore = 0;
        let sum = 0;
        let scores = [] // for logging to console
        for (const submission of submissions) {
            await submission.save();
            sum = sum + submission.score;
            scores.push(submission.score);
            if (submission.score > highestScore) {
                highestScore = submission.score;
            }
        };
        let averageScore = sum / submissions.length;
        // attach the saved questions to the quiz
        quiz.questions = questions;
        // attach submissions
        quiz.submissions = submissions;
        // attach a newly created and saved report instance to the quiz
        const report = await new Report({ statistics: { highestScore: highestScore, averageScore: averageScore } }).save();
        quiz.report = report;
        // finally, save the quiz instance
        await quiz.save();
        logQuiz(quiz, scores);
    };
    console.log("---- [Completed] Populating the database ----");
};


async function testPopulation() {
    console.log("Testing population");
    const quiz = await Quiz.findOne();
    await quiz.populate({
        path: "questions report submissions submissionsCount"
    });
    console.log(quiz);
    // await quiz.submissions.populate("selectedOptions")
    console.log(quiz.submissions[0].selectedOptions[0]);
}


async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to database`, MONGODB_URI);
    // await testPopulation();
    await populate();
    await mongoose.connection.close();
}

main().catch((err) => {
    console.log(err);
    mongoose.connection.close();
});