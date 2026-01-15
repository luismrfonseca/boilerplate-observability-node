'use client';

import { useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/hello');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSlowOperation = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/slow');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNestedOperation = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/nested');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🔭 Observability Boilerplate
            </h1>
            <p className="text-xl text-gray-300">
              Next.js + NestJS + OpenTelemetry + Tempo + Prometheus + Loki
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-5 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Frontend Tracing</h3>
              <p className="text-sm text-gray-300">OpenTelemetry Web SDK</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Backend Tracing</h3>
              <p className="text-sm text-gray-300">NestJS Auto-instrumentation</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Grafana Tempo</h3>
              <p className="text-sm text-gray-300">Distributed Tracing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold mb-2">Prometheus</h3>
              <p className="text-sm text-gray-300">Metrics & Monitoring</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold mb-2">Grafana Loki</h3>
              <p className="text-sm text-gray-300">Logs Aggregation</p>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Test Observability</h2>

            <div className="space-y-4 mb-6">
              <button
                onClick={handleFetch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                {loading ? '⏳ Loading...' : '🚀 Simple API Call'}
              </button>

              <button
                onClick={handleSlowOperation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                {loading ? '⏳ Loading...' : '🐌 Slow Operation (3s)'}
              </button>

              <button
                onClick={handleNestedOperation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                {loading ? '⏳ Loading...' : '🎯 Nested Operation (Service Spans)'}
              </button>
            </div>

            {response && (
              <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold mb-2 text-gray-400">Response:</h3>
                <pre className="text-sm text-green-400 overflow-x-auto">{response}</pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>💡</span> How to view observability data
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">📊 Traces (Tempo)</h4>
                <ol className="space-y-2 text-sm text-gray-300 ml-4">
                  <li>1. Click the buttons above to generate traces</li>
                  <li>2. Open Grafana at <a href="http://localhost:3000" target="_blank" className="text-blue-400 hover:underline">http://localhost:3000</a></li>
                  <li>3. Go to Explore → Select Tempo → Search for traces</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">📈 Metrics (Prometheus)</h4>
                <ol className="space-y-2 text-sm text-gray-300 ml-4">
                  <li>1. View raw metrics at <a href="http://localhost:3001/metrics" target="_blank" className="text-green-400 hover:underline">http://localhost:3001/metrics</a></li>
                  <li>2. Open Prometheus at <a href="http://localhost:9090" target="_blank" className="text-green-400 hover:underline">http://localhost:9090</a></li>
                  <li>3. Or use Grafana → Explore → Select Prometheus</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">📝 Logs (Loki)</h4>
                <ol className="space-y-2 text-sm text-gray-300 ml-4">
                  <li>1. Logs are automatically sent to Loki</li>
                  <li>2. Open Grafana → Explore → Select Loki</li>
                  <li>3. Click on a log to jump to the related trace!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
