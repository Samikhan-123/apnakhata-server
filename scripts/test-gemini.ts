import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testQuotas() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTest = [
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-pro-latest"
  ];

  console.log("🔍 Testing models for available quota...\n");

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing [${modelName}]...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'hello'");
      const response = await result.response;
      console.log(`✅ SUCCESS! [${modelName}] is working and has quota. (Response: ${response.text().trim()})\n`);
    } catch (error: any) {
      console.error(`❌ ERROR with [${modelName}]:`, error.message, "\n");
    }
  }
}

testQuotas();


