const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        question: {
            type: Schema.Types.ObjectId,
            ref: "Question",
        },
        text: {
            type: String,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true }
);

const Option = mongoose.model("Option", schema);

module.exports = Option;
