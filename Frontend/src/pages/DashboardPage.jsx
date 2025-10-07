

// // pages/DashboardPage.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Brain,
//   TrendingUp,
//   MessageSquare,
//   Zap,
//   BarChart3,
//   Loader2,
//   Activity,
//   Clock,
//   DollarSign,
//   CreditCard,
//   Calendar,
// } from 'lucide-react';

// const DashboardPage = () => {
//   const [costStats, setCostStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [animate, setAnimate] = useState(false);

//   const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

//   const getAuthToken = () => {
//     const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
//     for (const k of keys) {
//       const val = localStorage.getItem(k);
//       if (val) return val;
//     }
//     return null;
//   };

//   useEffect(() => {
//     fetchCostStats();
//   }, []);

//   useEffect(() => {
//     if (costStats) {
//       setTimeout(() => setAnimate(true), 100);
//     }
//   }, [costStats]);

//   const fetchCostStats = async () => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();
//       const response = await fetch(`${API_BASE_URL}/api/doc/cost-stats`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (!response.ok) throw new Error('Failed to fetch cost stats');
//       const data = await response.json();
//       setCostStats(data);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatNumber = (num) => {
//     if (!num) return '0';
//     if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
//     if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
//     return num.toLocaleString();
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '0.0000';
//     return parseFloat(amount).toFixed(4);
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
//         <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-3" />
//         <p className="text-gray-600 text-sm">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-6 py-10">
        
//         {/* Header */}
//         <div className={`mb-10 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
//               <p className="text-sm text-gray-600 mt-1">Analytics overview (last 30 days)</p>
//             </div>
//             <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm text-gray-700">
//               <Calendar className="h-4 w-4 text-gray-500" />
//               <span>Last 30 Days</span>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-8 bg-red-50 border border-red-200 p-4 rounded-md">
//             <p className="text-sm font-semibold text-red-900">Unable to load statistics</p>
//             <p className="text-xs text-red-700 mt-1">{error}</p>
//           </div>
//         )}

//         {costStats && (
//           <>
//             {/* Total Cost Card */}
//             <div className={`mb-10 bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-700 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 uppercase">Total Cost</p>
//                   <h2 className="text-4xl font-bold text-gray-900 mt-1">₹{formatCurrency(costStats.overall.totalCostINR)}</h2>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {formatNumber(costStats.overall.totalTokens)} tokens processed
//                   </p>
//                 </div>
//                 <CreditCard className="h-10 w-10 text-gray-400" />
//               </div>
//               <div className="grid grid-cols-3 gap-6 text-sm">
//                 <div>
//                   <p className="text-gray-500">Input</p>
//                   <p className="font-semibold text-gray-900">₹{formatCurrency(costStats.overall.totalInputCostINR)}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Output</p>
//                   <p className="font-semibold text-gray-900">₹{formatCurrency(costStats.overall.totalOutputCostINR)}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Avg/Query</p>
//                   <p className="font-semibold text-gray-900">
//                     ₹{costStats.overall.totalQueries > 0 ? (costStats.overall.totalCostINR / costStats.overall.totalQueries).toFixed(4) : '0.0000'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Token Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//               {[
//                 { icon: Zap, label: "Total Tokens", value: costStats.overall.totalTokens },
//                 { icon: MessageSquare, label: "Prompt Tokens", value: costStats.overall.totalPromptTokens },
//                 { icon: Brain, label: "Completion Tokens", value: costStats.overall.totalCompletionTokens },
//                 { icon: BarChart3, label: "Total Queries", value: costStats.overall.totalQueries },
//               ].map((stat, idx) => (
//                 <div key={idx} className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${150 + idx * 100}ms` }}>
//                   <div className="flex items-center justify-between mb-4">
//                     <stat.icon className="h-5 w-5 text-gray-500" />
//                     <span className="text-xs font-medium text-gray-500 uppercase">{stat.label}</span>
//                   </div>
//                   <p className="text-2xl font-semibold text-gray-900">{formatNumber(stat.value)}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
//               {/* Performance */}
//               <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
//                   <Activity className="h-4 w-4 text-gray-500" />
//                 </div>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Tokens/Query</span>
//                     <span className="font-semibold text-gray-900">
//                       {formatNumber(costStats.overall.totalQueries > 0 ? Math.round(costStats.overall.totalTokens / costStats.overall.totalQueries) : 0)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Cost/Query</span>
//                     <span className="font-semibold text-gray-900">
//                       ₹{costStats.overall.totalQueries > 0 ? (costStats.overall.totalCostINR / costStats.overall.totalQueries).toFixed(4) : '0.0000'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Active Days</span>
//                     <span className="font-semibold text-gray-900">{costStats.overall.activeDays}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Activity */}
//               <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-2 transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
//                   <Clock className="h-4 w-4 text-gray-500" />
//                 </div>
//                 {costStats.daily?.length > 0 ? (
//                   <div className="divide-y divide-gray-100 text-sm">
//                     {costStats.daily.slice(0, 5).map((day, idx) => (
//                       <div key={idx} className="flex justify-between py-2 hover:bg-gray-50 transition-colors">
//                         <span className="w-24 text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
//                         <span className="w-16 text-right">{day.total_queries}</span>
//                         <span className="w-24 text-right">{formatNumber(day.total_tokens)}</span>
//                         <span className="w-24 text-right font-medium">₹{formatCurrency(day.total_cost_inr)}</span>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-500 text-center py-6">No activity data</p>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;





import React, { useState, useEffect } from 'react';
import {
  Brain,
  MessageSquare,
  Zap,
  BarChart3,
  Loader2,
  Activity,
  Clock,
  DollarSign,
  CreditCard,
  Calendar,
  FileType,
  Layers,
} from 'lucide-react';

const DashboardPage = () => {
  const [costStats, setCostStats] = useState(null);
  const [documentAIStats, setDocumentAIStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);

  const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

  const getAuthToken = () => {
    const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) return val;
    }
    return null;
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  useEffect(() => {
    if (costStats && documentAIStats) {
      setTimeout(() => setAnimate(true), 100);
    }
  }, [costStats, documentAIStats]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const [costResponse, docAIResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/doc/cost-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/doc/document-ai-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!costResponse.ok) throw new Error('Failed to fetch cost stats');
      if (!docAIResponse.ok) throw new Error('Failed to fetch Document AI stats');

      const costData = await costResponse.json();
      const docAIData = await docAIResponse.json();

      setCostStats(costData);
      setDocumentAIStats(docAIData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0.0000';
    return parseFloat(amount).toFixed(4);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-3" />
        <p className="text-gray-600 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const totalCombinedCost = (costStats?.overall.totalCostINR || 0) + (documentAIStats?.overall.totalCostINR || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <div className={`mb-10 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Analytics overview (last 30 days)</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm text-gray-700">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Last 30 Days</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-white border border-gray-300 p-4 rounded-md">
            <p className="text-sm font-semibold text-gray-900">Unable to load statistics</p>
            <p className="text-xs text-gray-600 mt-1">{error}</p>
          </div>
        )}

        {/* Combined Total Cost */}
        <div className={`mb-10 bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm transition-all duration-700 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Combined Cost</p>
              <h2 className="text-4xl font-bold text-gray-900 mt-1">₹{formatCurrency(totalCombinedCost)}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Document AI + LLM Processing
              </p>
            </div>
            <CreditCard className="h-10 w-10 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-xs mb-1">Document AI</p>
              <p className="font-semibold text-lg text-gray-900">₹{formatCurrency(documentAIStats?.overall.totalCostINR || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(documentAIStats?.overall.totalPages || 0)} pages</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-xs mb-1">LLM Processing</p>
              <p className="font-semibold text-lg text-gray-900">₹{formatCurrency(costStats?.overall.totalCostINR || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(costStats?.overall.totalTokens || 0)} tokens</p>
            </div>
          </div>
        </div>

        {/* Document AI Stats Section */}
        {documentAIStats && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document AI Processing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { icon: FileType, label: "Total Pages", value: documentAIStats.overall.totalPages },
                { icon: Layers, label: "Files Processed", value: documentAIStats.overall.filesProcessed },
                { icon: DollarSign, label: "Total Cost (INR)", value: `₹${formatCurrency(documentAIStats.overall.totalCostINR)}` },
                { icon: Activity, label: "Operations", value: documentAIStats.overall.totalOperations },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${150 + idx * 100}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LLM Stats Section */}
        {costStats && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-12">LLM Usage</h2>
            
            <div className={`mb-10 bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-700 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">LLM Processing Cost</p>
                  <h2 className="text-4xl font-bold text-gray-900 mt-1">₹{formatCurrency(costStats.overall.totalCostINR)}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(costStats.overall.totalTokens)} tokens processed
                  </p>
                </div>
                <Brain className="h-10 w-10 text-gray-400" />
              </div>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-500">Input</p>
                  <p className="font-semibold text-gray-900">₹{formatCurrency(costStats.overall.totalInputCostINR)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Output</p>
                  <p className="font-semibold text-gray-900">₹{formatCurrency(costStats.overall.totalOutputCostINR)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg/Query</p>
                  <p className="font-semibold text-gray-900">
                    ₹{costStats.overall.totalQueries > 0 ? (costStats.overall.totalCostINR / costStats.overall.totalQueries).toFixed(4) : '0.0000'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { icon: Zap, label: "Total Tokens", value: costStats.overall.totalTokens },
                { icon: MessageSquare, label: "Prompt Tokens", value: costStats.overall.totalPromptTokens },
                { icon: Brain, label: "Completion Tokens", value: costStats.overall.totalCompletionTokens },
                { icon: BarChart3, label: "Total Queries", value: costStats.overall.totalQueries },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${550 + idx * 100}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(stat.value)}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
                  <Activity className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tokens/Query</span>
                    <span className="font-semibold text-gray-900">
                      {formatNumber(costStats.overall.totalQueries > 0 ? Math.round(costStats.overall.totalTokens / costStats.overall.totalQueries) : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost/Query</span>
                    <span className="font-semibold text-gray-900">
                      ₹{costStats.overall.totalQueries > 0 ? (costStats.overall.totalCostINR / costStats.overall.totalQueries).toFixed(4) : '0.0000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Days</span>
                    <span className="font-semibold text-gray-900">{costStats.overall.activeDays}</span>
                  </div>
                </div>
              </div>

              <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-2 transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                {costStats.daily?.length > 0 ? (
                  <div className="divide-y divide-gray-100 text-sm">
                    {costStats.daily.slice(0, 5).map((day, idx) => (
                      <div key={idx} className="flex justify-between py-2 hover:bg-gray-50 transition-colors">
                        <span className="w-24 text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="w-16 text-right text-gray-900">{day.total_queries}</span>
                        <span className="w-24 text-right text-gray-900">{formatNumber(day.total_tokens)}</span>
                        <span className="w-24 text-right font-medium text-gray-900">₹{formatCurrency(day.total_cost_inr)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">No activity data</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;