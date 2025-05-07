import React, { useEffect, useState } from "react";
import "../styles/global.css";

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

  useEffect(() => {
    fetchPepeData().then((d) => setData({ ...d, loading: false }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-3">PEPE Coin Price & News</h1>
        {data.loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : data.error ? (
          <div className="text-red-600 font-semibold">{data.error}</div>
        ) : (
          <>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-semibold mb-2">PEPE Coin Data</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="text-gray-600">Price:</span>{" "}
                  <span className="font-semibold">${data.pepeData?.price || "N/A"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Market Cap:</span>{" "}
                  <span className="font-semibold">
                    ${data.pepeData?.marketCap ? `${(parseFloat(data.pepeData.marketCap)/1000000).toFixed(2)}M` : "N/A"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Supply:</span>{" "}
                  <span className="font-semibold">
                    {data.pepeData?.supply ? `${(parseFloat(data.pepeData.supply)/1000000000).toFixed(2)}B` : "N/A"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Block Count:</span>{" "}
                  <span className="font-semibold">{data.pepeData?.blockCount || "N/A"}</span>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Recent News</h2>
            <div className="space-y-4">
              {data.news && data.news.length ? (
                data.news.map((item, idx) => (
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
            {data.citations && data.citations.length > 0 && (
              <div className="mt-6 text-xs text-gray-500">
                Sources: {data.citations.map((c, i) => (
                  <span key={i}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline">
                      [{i + 1}] {c.title}
                    </a>{" "}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
