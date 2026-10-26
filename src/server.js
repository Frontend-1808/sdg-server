import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET is missing or too short. Check server/.env");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

await connectDB();
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
