import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the public directory
const publicDir = path.join(__dirname, "../../public");

const generateRobotsTxt = () => {
  // Check if the public directory exists
  if (!fs.existsSync(publicDir)) {
    console.log("Public directory does not exist. Skipping robots.txt generation.");
    return;
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  const robotsContent = isDevelopment
    ? `User-agent: *
Disallow: /`
    : `User-agent: *
Disallow:`;

  const filePath = path.join(publicDir, "robots.txt");
  fs.writeFileSync(filePath, robotsContent, "utf8");
  console.log(`robots.txt generated for ${isDevelopment ? "development" : "production"}`);
};

generateRobotsTxt();
