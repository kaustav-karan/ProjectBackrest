// generate .env file from .env.example file

const fs = require("fs");

const generateDotenv = () => {
    const envExample = fs.readFileSync(".env.example", "utf8");
    fs.writeFileSync(".env", envExample);
}
    
generateDotenv();

