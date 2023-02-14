const app = require("./src/app");

// load environment variables from .env only while development
if (app.get("env") === "development") {
    require("dotenv").config();
}

const { PORT } = process.env;

app.listen(PORT || 3000, () => {
    console.log(`Server running on port ${PORT}`);
});
