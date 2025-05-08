import React, { useEffect, useState } from "react";
import "../../styles/global.css";

// Import shadcn components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const fetchPepeData = async () => {
  try {
    const res = await fetch("/api/pepe-news");
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
};

export default function Home() {
  const [data, setData] = useState({ loading: true });
  const [currentTime, setCurrentTime] = useState("");
  
  // Set the time client-side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
  }, []);

  useEffect(() => {
    fetchPepeData().then((d) => setData({ ...d, loading: false }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-green-500 bg-green-100">
              <AvatarFallback>PEPE</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">PEPE Coin Dashboard</h1>
              <p className="text-sm text-gray-500">Real-time data and news analysis</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {currentTime ? `Last updated: ${currentTime}` : ''}
          </div>
        </header>

        {data.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl md:col-span-3" />
          </div>
        ) : data.error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{data.error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PEPE Price Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-400 to-green-600 text-white">
                <CardTitle>PEPE Price</CardTitle>
                <CardDescription className="text-green-100">Current market value</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">${data.pepeData?.price || "N/A"}</div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Market Cap</span>
                  <span className="font-medium">
                    ${data.pepeData?.marketCap ? `${(parseFloat(data.pepeData.marketCap)/1000000).toFixed(2)}M` : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* PEPE Supply Card */}
            <Card>
              <CardHeader>
                <CardTitle>Token Supply</CardTitle>
                <CardDescription>Circulation and blockchain data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Supply</span>
                    <span className="font-medium">
                      {data.pepeData?.supply ? `${(parseFloat(data.pepeData.supply)/1000000000).toFixed(2)}B` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Block Count</span>
                    <span className="font-medium">{data.pepeData?.blockCount || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Advice Card */}
            {data.tradingAdvice && (
              <Card>
                <CardHeader className={
                  `${data.tradingAdvice.recommendation === "BUY" 
                    ? "bg-green-50" 
                    : data.tradingAdvice.recommendation === "SELL" 
                      ? "bg-red-50" 
                      : "bg-yellow-50"}`
                }>
                  <CardTitle className="flex justify-between items-center">
                    <span>AI Recommendation</span>
                    <span className={
                      `px-3 py-1 rounded-full text-xs font-bold ${
                        data.tradingAdvice.recommendation === "BUY" 
                          ? "bg-green-200 text-green-800" 
                          : data.tradingAdvice.recommendation === "SELL" 
                            ? "bg-red-200 text-red-800" 
                            : "bg-yellow-200 text-yellow-800"
                      }`
                    }>
                      {data.tradingAdvice.recommendation}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {data.tradingAdvice.reason && (
                    <p className="text-sm text-gray-700 mb-3">{data.tradingAdvice.reason}</p>
                  )}
                  <p className="text-xs text-gray-500 italic">
                    Disclaimer: This is AI-generated advice based solely on news sentiment. 
                    Not financial advice. Always DYOR.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* News and Analysis Tabs */}
            <Card className="md:col-span-3">
              <Tabs defaultValue="summary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>News & Analysis</CardTitle>
                    <TabsList>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="news">Latest News</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="summary" className="mt-0">
                    {data.summary ? (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: data.summary.replace(/\n/g, '<br>') }} />
                      </div>
                    ) : (
                      <p className="text-gray-500">No summary available</p>
                    )}
                  </TabsContent>
                  <TabsContent value="news" className="mt-0">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {data.googleNews && data.googleNews.length ? (
                        data.googleNews.map((item, idx) => (
                          <div key={idx} className="border-b pb-3 last:border-b-0">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium block"
                            >
                              {item.headline}
                            </a>
                            
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            
                            <div className="flex items-center mt-1">
                              {item.source && (
                                <span className="text-xs text-gray-500">
                                  {item.source}
                                </span>
                              )}
                              {item.type && (
                                <span className="ml-auto text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                  {item.type}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div>No news found.</div>
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
                <CardFooter className="text-xs text-gray-500 border-t pt-4">
                  Data provided by Pepecoin API and Google News
                </CardFooter>
              </Tabs>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
