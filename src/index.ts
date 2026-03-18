#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ── API BASE URLS ────────────────────────────────────────────
const CRYPTO_API = "https://crypto-enrichment-api-production.up.railway.app";
const FINANCE_API = "https://finance-data-api-production.up.railway.app";
const WEB_EXTRACT_API = "https://web-extract-api.up.railway.app";

// ── HELPER: Fetch with error handling ────────────────────────
async function apiFetch(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30000),
  });

  if (response.status === 402) {
    return {
      x402_payment_required: true,
      message: `This endpoint requires x402 USDC payment on Base. Visit ${url} with an x402-enabled client to use this tool with automatic payment.`,
      url,
      hint: "Use @x402/fetch or @x402/axios with a funded wallet to make paid requests automatically.",
    };
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function apiPost(url: string, body: object): Promise<any> {
  return apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── SERVER INITIALIZATION ────────────────────────────────────
const server = new McpServer({
  name: "x402-data-apis-mcp",
  version: "1.0.0",
});

// ══════════════════════════════════════════════════════════════
// CRYPTO DATA ENRICHMENT API — 4 tools
// ══════════════════════════════════════════════════════════════

server.registerTool(
  "crypto_get_price",
  {
    title: "Get Crypto Price",
    description: `Get real-time cryptocurrency price data including 24h change, volume, market cap, and 52-week range.
Costs $0.01 USDC per request via x402 on Base.
Supports 53 symbols: BTC, ETH, SOL, USDC, DOGE, AVAX, LINK, ADA, DOT, MATIC, UNI, AAVE, ATOM, NEAR, XRP, LTC, SHIB, ARB, OP, PEPE, BONK, SUI, SEI, TIA, JUP, WLD, TON, and more.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Crypto symbol (e.g., BTC, ETH, SOL, PEPE)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${CRYPTO_API}/api/v1/price/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "crypto_get_signal",
  {
    title: "Get Crypto Trading Signal",
    description: `Get enriched trading signal (BUY/HOLD/SELL) with confidence score, momentum indicators, and sentiment data.
Costs $0.05 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Crypto symbol (e.g., BTC, ETH, SOL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${CRYPTO_API}/api/v1/signal/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "crypto_deep_analysis",
  {
    title: "Get Crypto Deep Analysis",
    description: `Get full market analysis including on-chain metrics, whale movements, sentiment breakdown, and risk assessment.
Costs $0.10 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Crypto symbol (e.g., BTC, ETH, SOL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${CRYPTO_API}/api/v1/deep-analysis/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "crypto_ai_report",
  {
    title: "Get Crypto AI Report",
    description: `Get a Claude AI-written investment analysis report for any cryptocurrency. Includes price action, fundamentals, and outlook.
Costs $0.25 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Crypto symbol (e.g., BTC, ETH, SOL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${CRYPTO_API}/api/v1/llm-report/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ══════════════════════════════════════════════════════════════
// FINANCE DATA API — 8 tools
// ══════════════════════════════════════════════════════════════

server.registerTool(
  "finance_stock_price",
  {
    title: "Get Stock Price",
    description: `Get real-time stock price with day high/low, volume, 52-week range, and market state.
Costs $0.02 USDC per request via x402 on Base.
Supports all major US stocks, ETFs, and indices.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Stock ticker (e.g., AAPL, MSFT, GOOGL, TSLA, AMZN)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/stocks/price/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_stock_profile",
  {
    title: "Get Company Profile",
    description: `Get company profile including sector, industry, employees, market cap, P/E ratio, and business description.
Costs $0.03 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Stock ticker (e.g., AAPL, MSFT, GOOGL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/stocks/profile/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_stock_financials",
  {
    title: "Get Stock Financials",
    description: `Get financial statements: income statement, balance sheet, and cash flow data.
Costs $0.10 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Stock ticker (e.g., AAPL, MSFT, GOOGL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/stocks/financials/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_stock_news",
  {
    title: "Get Stock News",
    description: `Get latest 10 news articles for any stock including title, publisher, link, and thumbnail.
Costs $0.05 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Stock ticker (e.g., AAPL, MSFT, GOOGL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/stocks/news/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_forex_rate",
  {
    title: "Get Forex Rate",
    description: `Get foreign exchange rate between two currencies with 5-day history.
Costs $0.01 USDC per request via x402 on Base.
Format: FROM-TO (e.g., USD-EUR, GBP-JPY, EUR-INR)`,
    inputSchema: {
      pair: z.string().min(5).max(10).describe("Currency pair in FROM-TO format (e.g., USD-EUR, GBP-JPY)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ pair }) => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/forex/rate/${pair.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_forex_convert",
  {
    title: "Convert Currency",
    description: `Convert an amount from one currency to another using live forex rates.
Costs $0.02 USDC per request via x402 on Base.`,
    inputSchema: {
      from: z.string().min(3).max(3).describe("Source currency code (e.g., USD, EUR, GBP)"),
      to: z.string().min(3).max(3).describe("Target currency code (e.g., INR, JPY, EUR)"),
      amount: z.number().positive().describe("Amount to convert"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ from, to, amount }) => {
    const data = await apiPost(`${FINANCE_API}/api/v1/forex/convert`, { from, to, amount });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_market_overview",
  {
    title: "Get Market Overview",
    description: `Get global market overview: S&P 500, Dow Jones, NASDAQ, FTSE 100, Nikkei 225, DAX, plus Gold, Silver, Oil, and Treasury yields.
Costs $0.05 USDC per request via x402 on Base.`,
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async () => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/market/overview`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "finance_ai_report",
  {
    title: "Get AI Stock Report",
    description: `Get Claude AI-powered stock analysis including price action, fundamentals, competitive position, and investment outlook.
Costs $0.25 USDC per request via x402 on Base.`,
    inputSchema: {
      symbol: z.string().min(1).max(10).describe("Stock ticker (e.g., AAPL, MSFT, GOOGL)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ symbol }) => {
    const data = await apiFetch(`${FINANCE_API}/api/v1/market/ai-report/${symbol.toUpperCase()}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ══════════════════════════════════════════════════════════════
// WEB EXTRACT API — 10 tools
// ══════════════════════════════════════════════════════════════

server.registerTool(
  "web_extract_text",
  {
    title: "Extract Text from URL",
    description: `Extract clean, readable text from any web page URL.
Costs $0.01 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("URL to extract text from (e.g., https://example.com)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/text`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_metadata",
  {
    title: "Extract Page Metadata",
    description: `Extract title, author, description, images, links, and headings from any URL.
Costs $0.02 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("URL to extract metadata from"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/metadata`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_contacts",
  {
    title: "Extract Contacts from URL",
    description: `Extract emails, phone numbers, and social media links from any web page.
Costs $0.03 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("URL to extract contacts from"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/contacts`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_pdf",
  {
    title: "Extract Text from PDF",
    description: `Extract text content from any PDF URL.
Costs $0.03 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("PDF URL to extract text from"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/pdf`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_structured",
  {
    title: "Extract Structured Data",
    description: `Full structured extraction: text, tables, JSON-LD, metadata from any URL.
Costs $0.05 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("URL to extract structured data from"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/structured`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_product",
  {
    title: "Extract Product Data",
    description: `Extract product information: name, price, reviews, ratings from any product page.
Costs $0.05 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("Product page URL to extract data from"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/product`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_batch",
  {
    title: "Batch Extract Text",
    description: `Extract text from up to 5 URLs in a single request.
Costs $0.08 USDC per request via x402 on Base.`,
    inputSchema: {
      urls: z.array(z.string().url()).min(1).max(5).describe("Array of URLs to extract (max 5)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ urls }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/batch`, { urls });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_compare",
  {
    title: "Compare Two Pages",
    description: `Compare content of two web pages with AI analysis of similarities and differences.
Costs $0.08 USDC per request via x402 on Base.`,
    inputSchema: {
      url1: z.string().url().describe("First URL to compare"),
      url2: z.string().url().describe("Second URL to compare"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url1, url2 }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/compare`, { url1, url2 });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_translate",
  {
    title: "Extract and Translate",
    description: `Extract text from a URL and translate it to any language.
Costs $0.10 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("URL to extract and translate"),
      language: z.string().min(2).max(30).describe("Target language (e.g., Spanish, French, Hindi, Japanese)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url, language }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/translate`, { url, language });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.registerTool(
  "web_extract_ai_summary",
  {
    title: "AI Page Summary",
    description: `Extract content from any URL and get a Claude AI-powered summary.
Costs $0.15 USDC per request via x402 on Base.`,
    inputSchema: {
      url: z.string().url().describe("URL to summarize"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ url }) => {
    const data = await apiPost(`${WEB_EXTRACT_API}/api/v1/extract/ai-summary`, { url });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── START SERVER ─────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("x402 Data APIs MCP Server running — 22 tools available");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
