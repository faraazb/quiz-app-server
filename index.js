const mongoose = require("mongoose");
const app = require("./src/app");

// load environment variables from .env only while development
if (app.get("env") === "development") {
    require("dotenv").config();
}

const { PORT = 5000, MONGODB_URI } = process.env;

mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to database`, MONGODB_URI);
}

app.listen(PORT, (err) => {
    if (err) {
        console.log(`Error while listening on ${PORT}`, err);
    }
    console.log(`Server running on port ${PORT}`);
});
