"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUp, ArrowDown, Minus, RefreshCw, ExternalLink } from "lucide-react";

export default function Home() {
  const [pepeData, setPepeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  
  // Function to fetch data from our API
  const fetchPepeData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pepe");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setPepeData(data);
      
      // Generate some mock price history data for the chart
      // In a real app, you would fetch this from an API
      const basePrice = parseFloat(data.pepeData.price);
      const mockHistory = Array.from({ length: 14 }, (_, i) => {
        const randomVariation = (Math.random() * 0.2 - 0.1) * basePrice;
        return {
          date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          price: (basePrice + randomVariation * (i / 7)).toFixed(8),
        };
      });
      setPriceHistory([...mockHistory, { date: "Today", price: basePrice.toFixed(8) }]);
    } catch (err) {
      console.error("Error fetching Pepe data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPepeData();
  }, []);
  
  // Helper function to format large numbers
  const formatNumber = (num) => {
    if (!num) return "0";
    const n = parseFloat(num);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return n.toFixed(2);
  };
  
  // Helper to determine recommendation color
  const getRecommendationColor = (rec) => {
    if (!rec) return "text-yellow-500";
    if (rec === "BUY") return "text-green-500";
    if (rec === "SELL") return "text-red-500";
    return "text-yellow-500"; // HOLD
  };
  
  // Helper to determine recommendation icon
  const RecommendationIcon = ({ recommendation }) => {
    if (recommendation === "BUY") return <ArrowUp className="text-green-500" />;
    if (recommendation === "SELL") return <ArrowDown className="text-red-500" />;
    return <Minus className="text-yellow-500" />;
  };
  
  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Pepe Coin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchPepeData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <ThemeToggle />
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          Error: {error}
        </div>
      )}
      
      {loading && !pepeData ? (
        <div className="grid place-items-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading Pepe data...</p>
          </div>
        </div>
      ) : pepeData ? (
        <>
          {/* Price and Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Price</CardTitle>
                <CardDescription>Current PEPE price in USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${parseFloat(pepeData.pepeData.price).toFixed(8)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Market Cap</CardTitle>
                <CardDescription>Total market capitalization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${formatNumber(pepeData.pepeData.marketCap)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Supply</CardTitle>
                <CardDescription>Total coin supply</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(pepeData.pepeData.supply)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Block Count</CardTitle>
                <CardDescription>Current blockchain height</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pepeData.pepeData.blockCount}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Price Chart */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Price History (14 Days)</CardTitle>
              <CardDescription>Historical price movement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)' 
                      }} 
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Trading Advice */}
          <Card className="border-t-4" style={{ borderTopColor: getRecommendationColor(pepeData.tradingAdvice?.recommendation).replace('text-', '') }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RecommendationIcon recommendation={pepeData.tradingAdvice?.recommendation} />
                <CardTitle>Trading Recommendation: <span className={getRecommendationColor(pepeData.tradingAdvice?.recommendation)}>{pepeData.tradingAdvice?.recommendation || "HOLD"}</span></CardTitle>
              </div>
              <CardDescription>{pepeData.tradingAdvice?.reason || "Based on current market conditions"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: pepeData.summary?.replace(/\n/g, '<br/>') }} />
              </div>
            </CardContent>
          </Card>
          
          {/* News */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Pepe News</CardTitle>
              <CardDescription>Recent news and updates about Pepe coin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pepeData.googleNews && pepeData.googleNews.length > 0 ? (
                  pepeData.googleNews.map((news, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium hover:text-primary">
                        <a href={news.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          {news.headline}
                          <ExternalLink size={14} />
                        </a>
                      </h3>
                      {news.description && <p className="text-sm text-muted-foreground mt-1">{news.description}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{news.source}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No news available at this time.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}
