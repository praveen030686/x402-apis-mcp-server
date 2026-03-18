# x402-data-apis-mcp

MCP server providing 22 AI agent tools for crypto data, stock market data, forex rates, and web scraping — all powered by x402 micropayments on Base.

## Tools Available (22 total)

### Crypto Data (4 tools)
| Tool | Description | Cost |
|------|-------------|------|
| `crypto_get_price` | Real-time crypto prices for 53 coins | $0.01 |
| `crypto_get_signal` | Trading signal (BUY/HOLD/SELL) | $0.05 |
| `crypto_deep_analysis` | On-chain metrics, sentiment, risk | $0.10 |
| `crypto_ai_report` | Claude AI investment analysis | $0.25 |

### Finance Data (8 tools)
| Tool | Description | Cost |
|------|-------------|------|
| `finance_stock_price` | Real-time stock prices | $0.02 |
| `finance_stock_profile` | Company profile and key stats | $0.03 |
| `finance_stock_news` | Latest 10 news articles | $0.05 |
| `finance_stock_financials` | Income statement, balance sheet | $0.10 |
| `finance_forex_rate` | Exchange rates with 5-day history | $0.01 |
| `finance_forex_convert` | Currency conversion | $0.02 |
| `finance_market_overview` | Global indices, commodities, yields | $0.05 |
| `finance_ai_report` | Claude AI stock analysis | $0.25 |

### Web Extract (10 tools)
| Tool | Description | Cost |
|------|-------------|------|
| `web_extract_text` | Clean text from any URL | $0.01 |
| `web_extract_metadata` | Title, author, images, links | $0.02 |
| `web_extract_contacts` | Emails, phones, social links | $0.03 |
| `web_extract_pdf` | Text from PDF URLs | $0.03 |
| `web_extract_structured` | Full structured data extraction | $0.05 |
| `web_extract_product` | Product price, reviews, ratings | $0.05 |
| `web_extract_batch` | Extract from up to 5 URLs | $0.08 |
| `web_extract_compare` | Compare two pages with AI | $0.08 |
| `web_extract_translate` | Extract and translate to any language | $0.10 |
| `web_extract_ai_summary` | Claude-powered page summary | $0.15 |

## Installation

### Claude Desktop / Claude Code

Add to your MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "x402-data-apis": {
      "command": "npx",
      "args": ["x402-data-apis-mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "mcpServers": {
    "x402-data-apis": {
      "command": "npx",
      "args": ["x402-data-apis-mcp"]
    }
  }
}
```

## How It Works

This MCP server exposes 22 tools backed by 3 x402-powered APIs. When an AI agent calls a tool:

1. The MCP server forwards the request to the appropriate API
2. The API returns a 402 Payment Required response with USDC payment instructions
3. With an x402-enabled client, payment happens automatically
4. The API returns the data

**Note:** Without an x402 payment client, tools will return payment instructions showing the cost and how to pay. To enable automatic payments, use the APIs directly with `@x402/fetch` and a funded wallet.

## Payment

All payments are in **USDC on Base** (eip155:8453). Prices range from $0.01 to $0.25 per request.

No API keys. No subscriptions. No accounts. Just micropayments.

## Underlying APIs

| API | URL |
|-----|-----|
| Crypto Data | https://crypto-enrichment-api-production.up.railway.app |
| Finance Data | https://finance-data-api-production.up.railway.app |
| Web Extract | https://web-extract-api.up.railway.app |

## License

MIT
