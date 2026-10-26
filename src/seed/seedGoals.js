import "dotenv/config";
import mongoose from "mongoose";
import Goal from "../models/Goal.js";

const g = (number, title, color, iconName, template = "simple") => ({
  number,
  slug: `sdg-${number}`,
  title: { en: title },
  color,
  iconName,
  template,
});

const data = [
  g(1, "No Poverty", "#E5243B", "Coins", "services"),
  g(2, "Zero Hunger", "#DDA63A", "Wheat"),
  g(3, "Good Health and Well-being", "#4C9F38", "HeartPulse"),
  g(4, "Quality Education", "#C5192D", "GraduationCap", "services"),
  g(5, "Gender Equality", "#FF3A21", "Users", "services"),
  g(6, "Clean Water and Sanitation", "#26BDE2", "Droplets"),
  g(7, "Affordable and Clean Energy", "#FCC30B", "Zap", "services"),
  g(8, "Decent Work and Economic Growth", "#A21942", "Briefcase"),
  g(9, "Industry, Innovation and Infrastructure", "#FD6925", "Factory"),
  g(10, "Reduced Inequalities", "#DD1367", "Scale"),
  g(
    11,
    "Sustainable Cities and Communities",
    "#FD9D24",
    "Building2",
    "services",
  ),
  g(12, "Responsible Consumption and Production", "#BF8B2E", "Recycle"),
  g(13, "Climate Action", "#3F7E44", "CloudSun"),
  g(14, "Life Below Water", "#0A97D9", "Fish"),
  g(15, "Life on Land", "#56C02B", "TreePine"),
  g(16, "Peace, Justice and Strong Institutions", "#00689D", "Landmark"),
  g(17, "Partnerships for the Goals", "#19486A", "Handshake", "services"),
  g(18, "Goal 18", "#334155", "Star", "services"),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Goal.deleteMany({});
  await Goal.insertMany(data);
  console.log(`Seeded ${data.length} goals`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
