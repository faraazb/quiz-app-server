const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
    quiz: {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
    },
    statistics: {
        averageScore: {
            type: Number,
            default: 0,
        },
        highestScore: {
            type: Number,
            default: 0,
        },
    },
});

const Report = mongoose.model("Report", schema);

module.exports = Report;
