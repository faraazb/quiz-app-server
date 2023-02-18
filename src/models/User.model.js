const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema(
    {
        username: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", schema);

module.exports = User;
