import axios from "axios";
import { load } from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Next.js App Router API route
export async function GET(request) {
  try {
    console.log("[DEBUG] Starting /api/pepe endpoint");
    
    // 1. Fetch Pepe coin data from the Pepecoin API
    const pepeData = {};
    try {
      // Fetch price data
      const priceRes = await axios.get("https://pepecoinexplorer.com/api/v1/lastprice");
      pepeData.price = priceRes.data;
      console.log(`[DEBUG] Fetched PEPE price: ${pepeData.price}`);
      
      // Fetch market cap
      const marketCapRes = await axios.get("https://pepecoinexplorer.com/api/v1/marketcap");
      pepeData.marketCap = marketCapRes.data;
      console.log(`[DEBUG] Fetched PEPE market cap: ${pepeData.marketCap}`);
      
      // Fetch coin supply
      const supplyRes = await axios.get("https://pepecoinexplorer.com/api/v1/coinsupply");
      pepeData.supply = supplyRes.data;
      console.log(`[DEBUG] Fetched PEPE coin supply: ${pepeData.supply}`);
      
      // Fetch block count
      const blockCountRes = await axios.get("https://pepecoinexplorer.com/api/v1/blockcount");
      pepeData.blockCount = blockCountRes.data;
      console.log(`[DEBUG] Fetched PEPE block count: ${pepeData.blockCount}`);
    } catch (error) {
      console.error("[ERROR] Failed to fetch PEPE data from API:", error);
      // Set default values if API fails
      pepeData.price = "0.00026452";
      pepeData.marketCap = "23322200.0";
      pepeData.supply = "87997562500.0";
      pepeData.blockCount = "307967";
    }
    
    // 2. Scrape Google News for PEPE coin news
    let googleNews = [];
    try {
      // Direct approach - use Google search instead of Google News
      const searchRes = await axios.get("https://www.google.com/search?q=pepe+coin&tbm=nws", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 15000 // 15 second timeout
      });
      console.log("[DEBUG] Fetched Google Search News page");
      
      const $$ = load(searchRes.data);
      
      // Extract news articles
      // First, try to find all news containers
      $$('.SoaBEf, .WlydOe, .DBQmFf, .T1diZc').each((i, el) => {
        if (i < 8) { // Get up to 8 news items
          try {
            // Try to extract headline, description, source, and time
            let headline = $$(el).find('.n0jPhd, .mCBkyc, h3').text().trim();
            let description = $$(el).find('.GI74Re, .Y3v8qd, .s3v9rd').text().trim();
            let source = $$(el).find('.CEMjEf, .UMOHqf').text().trim();
            let time = $$(el).find('.OSrXXb').text().trim();
            
            // Extract URL - try different approaches
            let url = $$(el).find('a').attr('href');
            if (url && url.startsWith('/url?')) {
              // Extract actual URL from Google's redirect URL
              const urlParams = new URL('https://google.com' + url);
              url = urlParams.searchParams.get('q') || url;
            }
            
            // Only add if we have at least a headline
            if (headline && headline.length > 10) {
              googleNews.push({
                headline,
                description: description || "",
                url: url || "#",
                source: `${source || "News Source"}${time ? ` • ${time}` : ""}`,
                type: "Google News"
              });
            }
          } catch (err) {
            console.error("[ERROR] Error parsing news item:", err);
          }
        }
      });
      
      // If we couldn't find any news with the above approach, try a simpler one
      if (googleNews.length === 0) {
        // Try to find headlines directly
        $$('h3').each((i, el) => {
          if (i < 8) {
            const headlineEl = $$(el);
            const headline = headlineEl.text().trim();
            const linkEl = headlineEl.closest('a');
            let url = linkEl.attr('href') || "#";
            
            // Only add if we have a headline and it mentions PEPE or Pepe
            if (headline && (headline.toLowerCase().includes('pepe'))) {
              googleNews.push({
                headline,
                url,
                source: "Google News",
                type: "Google News"
              });
            }
          }
        });
      }
      
      // If we still have no results, try one more approach with the raw HTML
      if (googleNews.length === 0) {
        // Use regex to extract headlines and descriptions
        const headlineMatches = searchRes.data.match(/<div class="[^"]*n0jPhd[^"]*"[^>]*>([^<]+)<\/div>/g);
        const descMatches = searchRes.data.match(/<div class="[^"]*GI74Re[^"]*"[^>]*>([^<]+)<\/div>/g);
        
        if (headlineMatches && headlineMatches.length > 0) {
          headlineMatches.forEach((match, i) => {
            if (i < 8) {
              const headline = match.replace(/<[^>]+>/g, '').trim();
              const description = descMatches && descMatches[i] ? 
                descMatches[i].replace(/<[^>]+>/g, '').trim() : "";
              
              googleNews.push({
                headline,
                description,
                url: "#",
                source: "Google News",
                type: "Google News"
              });
            }
          });
        }
      }
      console.log(`[DEBUG] Parsed Google news: ${googleNews.length} items found`);
    } catch (error) {
      console.error("[ERROR] Failed to scrape Google News:", error);
    }

    // 5. Prepare text for LLM summarization and sentiment analysis
    let prompt = `Here's the latest data about Pepe coin (crypto):\n\nPrice: $${pepeData.price}\nMarket Cap: $${pepeData.marketCap}\nCoin Supply: ${pepeData.supply}\nBlock Count: ${pepeData.blockCount}\n\nRecent headlines and news:\n`;
    googleNews.forEach((n, i) => { 
      prompt += `${i+1}. ${n.headline}\n`;
      if (n.description) prompt += `   ${n.description}\n`;
      if (n.source) prompt += `   Source: ${n.source}\n`;
      prompt += `\n`;
    });
    prompt += "\nBased on this information, please provide:\n1. A friendly summary of the news for a regular user\n2. A clear buy, sell, or hold recommendation for PEPE coin based on the news sentiment\n3. A brief explanation for your recommendation\n4. List the news as clickable links\n\nFormat your response with clear sections for the summary, recommendation, and news links.";
    console.log("[DEBUG] Prompt for OpenAI:\n", prompt);

    console.log("[DEBUG] Starting OpenAI summarization");
    console.log("[DEBUG] Prompt for OpenAI:\n", prompt);

    // 6. Summarize with OpenAI (gpt-4o-mini)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    console.log("[DEBUG] OpenAI response:", response);
    const summary = response.choices[0]?.message?.content || "No summary available.";

    console.log("[DEBUG] Summary:", summary);

    // Extract recommendation from summary
    let recommendation = "HOLD";
    let recommendationReason = "";
    
    // Try to extract recommendation from the summary
    if (summary.toLowerCase().includes("buy") && 
        (summary.toLowerCase().includes("recommend") || 
         summary.toLowerCase().includes("recommendation") || 
         summary.toLowerCase().includes("bullish"))) {
      recommendation = "BUY";
    } else if (summary.toLowerCase().includes("sell") && 
              (summary.toLowerCase().includes("recommend") || 
               summary.toLowerCase().includes("recommendation") || 
               summary.toLowerCase().includes("bearish"))) {
      recommendation = "SELL";
    }
    
    // Try to extract the reason
    const reasonPatterns = [
      /recommendation:([^\n]+)/i,
      /recommend([^\n.]+)/i,
      /because([^\n.]+)/i,
      /due to([^\n.]+)/i
    ];
    
    for (const pattern of reasonPatterns) {
      const match = summary.match(pattern);
      if (match && match[1]) {
        recommendationReason = match[1].trim();
        break;
      }
    }
    
    // If no reason was found, provide a generic one
    if (!recommendationReason) {
      if (recommendation === "BUY") {
        recommendationReason = "Positive sentiment in recent news";
      } else if (recommendation === "SELL") {
        recommendationReason = "Negative sentiment in recent news";
      } else {
        recommendationReason = "Mixed or neutral sentiment in recent news";
      }
    }
    
    return new Response(
      JSON.stringify({ 
        pepeData, 
        googleNews, 
        summary,
        tradingAdvice: {
          recommendation,
          reason: recommendationReason
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error('[ERROR] /api/pepe:', e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to fetch and summarize PEPE news." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
