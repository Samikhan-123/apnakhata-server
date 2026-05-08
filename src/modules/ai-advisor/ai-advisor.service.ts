import { GoogleGenerativeAI } from "@google/generative-ai";
import ledgerEntryService from "../ledger-entry/ledger-entry.service.js";
import budgetService from "../budget/budget.service.js";
import authRepository from "../auth/auth.repository.js";
import { AppError } from "../../middlewares/error.middleware.js";

class AIAdvisorService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Helper to call API with exponential backoff and jitter
   */
  private async callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.message?.includes("503") ||
        error.message?.includes("429") ||
        error.message?.includes("high demand");

      if (retries > 0 && isRetryable) {
        // Exponential backoff: delay * 2
        // Jitter: random between 0 and 500ms
        const jitter = Math.random() * 500;
        const nextDelay = delay * 2 + jitter;

        // console.warn(`⚠️ [GEMINI-RETRY]: High demand/Rate limit. Retrying in ${Math.round(nextDelay)}ms... (${retries} attempts left)`);

        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return this.callWithRetry(fn, retries - 1, nextDelay);
      }
      throw error;
    }
  }

  /**
   * Generates financial insights or answers user queries using Gemini AI
   */
  async getFinancialInsights(userId: string, userQuery?: string, currencyCode: string = "PKR") {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = prevDate.getMonth() + 1;
      const prevYear = prevDate.getFullYear();

      const startOfYear = new Date(currentYear, 0, 1).toISOString();
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

      const [stats, prevStats, yearlyStats, budgets, user] = await Promise.all([
        ledgerEntryService.getDashboardStats(userId),
        ledgerEntryService.getDashboardStats(userId, {
          startDate: new Date(prevYear, prevMonth - 1, 1).toISOString(),
          endDate: new Date(prevYear, prevMonth, 0).toISOString(),
        }),
        ledgerEntryService.getDashboardStats(userId, {
          startDate: startOfYear,
          endDate: endOfYear,
        }),
        budgetService.getBudgetsWithProgress(userId, currentMonth, currentYear),
        authRepository.findById(userId),
      ]);

      const activeCurrency = user?.baseCurrency || "USD";

      const context = {
        currency: activeCurrency,
        currentMonth: {
          name: now.toLocaleString("default", { month: "long" }),
          income: stats.overview.totalIncome,
          expense: stats.overview.totalExpense,
          net: stats.overview.remainingBalance,
        },
        previousMonth: {
          name: prevDate.toLocaleString("default", { month: "long" }),
          income: prevStats.overview.totalIncome,
          expense: prevStats.overview.totalExpense,
          net: prevStats.overview.remainingBalance,
        },
        yearlySummary: {
          year: currentYear,
          totalIncome: yearlyStats.overview.totalIncome,
          totalExpense: yearlyStats.overview.totalExpense,
          netBalance: yearlyStats.overview.remainingBalance,
        },
        globalBalance: stats.overview.balance,
        topCategories: stats.categoryBreakdown.slice(0, 5).map((c: any) => ({
          name: c.name,
          amount: c.value,
        })),
        budgets: budgets.map((b: any) => ({
          category: b.category.name,
          limit: Number(b.limit),
          spent: b.spent,
          status: b.isOverBudget ? "Exceeded" : "On Track",
        })),
        recentEntries: stats.recentEntries.slice(0, 30).map((e: any) => ({
          description: e.description,
          amount: e.amount,
          type: e.type,
          date: e.date,
          category: e.category?.name,
        })),
      };

      const systemPrompt = `
        You are "Apna Khata AI Assistant", a world-class, elite personal finance expert.
        
        CURRENCY CONTEXT:
        The user's base currency is ${activeCurrency}. ALWAYS mention amounts with this exact currency symbol/code (e.g., "${activeCurrency} 1,000").
        
        DYNAMIC RESPONSE RULES:
        You must adapt your response structure based on whether the user asked a specific question or not.

        SCENARIO A: NO SPECIFIC QUESTION (Dashboard Overview)
        If the user did NOT ask a question, provide a general financial health check:
        - "answer": null
        - "summary": A punchy 1-sentence executive summary of their overall financial health this month.
        - "insights": 3 short, data-driven observations or warnings (e.g., "Food expenses jumped 20%").

        SCENARIO B: USER ASKED A QUESTION
        If the user asked a specific question, strictly focus your entire response on answering it:
        - "answer": A detailed, professional, and empathetic answer to their specific question based on their data.
        - "summary": A 1-sentence "TL;DR" of your answer.
        - "insights": 3 actionable, specific steps the user can take IMMEDIATELY to implement your advice. Do not provide generic observations here.

        DATA RULES:
        - Do NOT guess, hallucinate, or make up numbers. If the user asks for historical data or information NOT present in the provided DATA CONTEXT, politely apologize in their language, explaining that you only have access to their recent transactions and current yearly summary to give insights and advice. For older history, check the Reports page or Digital ledger history.
        - Maintain a "Sapphire" elite SaaS tone: encouraging, precise, and highly professional.

        LANGUAGE RULE:
        Always respond in the EXACT same language the user used in their question (e.g., if they ask in Roman Urdu, reply in Roman Urdu).
        CRITICAL: Do NOT translate the JSON keys ("insights", "summary", "answer"). They MUST remain exactly as written in English. Only translate the content values.
        
        DATA CONTEXT:
        ${JSON.stringify(context, null, 2)}
      `;

      const finalPrompt = userQuery
        ? `${systemPrompt}\n\nUSER QUESTION: "${userQuery}"`
        : systemPrompt;

      // WRAP API CALL IN RETRY LOGIC
      const text = await this.callWithRetry(async () => {
        const model = this.genAI.getGenerativeModel(
          { model: "gemini-flash-latest" },

        );
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        return response.text();
      });

      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        throw new AppError(
          `AI Advisor Error: ${error.message || "Please check your API key or try again later."}`,
          500
        );
      } else {
        throw new AppError("AI Advisor is temporarily unavailable. Please try again later.", 500);
      }
    }
  }
}


export default new AIAdvisorService();
