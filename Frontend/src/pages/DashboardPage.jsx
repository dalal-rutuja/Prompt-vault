// import React from 'react';

// const DashboardPage = () => {
//   return (
//     <div className="flex flex-col items-center justify-center h-full text-center">
//       <div className="bg-blue-100 rounded-2xl p-4 mb-6">
//         <span className="text-4xl">⚖️</span>
//       </div>
//       <h1 className="text-3xl font-semibold text-gray-800 mb-3">Welcome to Nexintel AI</h1>
//       <p className="text-gray-600 mb-8 max-w-md">
//         Your AI-powered legal assistant for document processing, case analysis, and legal drafting. Choose an action
//         below to get started.
//       </p>
//       {/* <div className="grid md:grid-cols-3 gap-4 w-full max-w-2xl">
//         <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
//           <div className="bg-blue-600 h-8 w-8 rounded-md mb-3"></div>
//           <h3 className="font-semibold text-gray-800 mb-1">Upload Documents</h3>
//           <p className="text-sm text-gray-600">Upload case files for AI-powered analysis and summarization</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
//           <div className="bg-blue-600 h-8 w-8 rounded-md mb-3"></div>
//           <h3 className="font-semibold text-gray-800 mb-1">AI Case Analysis</h3>
//           <p className="text-sm text-gray-600">Get role-specific summaries for judges, lawyers, and clients</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
//           <div className="bg-blue-600 h-8 w-8 rounded-md mb-3"></div>
//           <h3 className="font-semibold text-gray-800 mb-1">Document Drafting</h3>
//           <p className="text-sm text-gray-600">Generate legal documents using AI and templates</p>
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default DashboardPage;


// import React, { useState, useEffect } from 'react';
// import { Brain, TrendingUp, MessageSquare, Zap, Calendar, BarChart3, Loader2 } from 'lucide-react';

// const DashboardPage = () => {
//   const [tokenStats, setTokenStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_BASE_URL = "http://localhost:5000";

//   const getAuthToken = () => {
//     const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
//     for (const k of keys) {
//       const val = localStorage.getItem(k);
//       if (val) return val;
//     }
//     return null;
//   };

//   useEffect(() => {
//     fetchTokenStats();
//   }, []);

//   const fetchTokenStats = async () => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();
      
//       const response = await fetch(`${API_BASE_URL}/api/doc/token-stats`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error('Failed to fetch token stats');
      
//       const data = await response.json();
//       console.log('Token Stats:', data);
//       setTokenStats(data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching token stats:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatNumber = (num) => {
//     if (!num) return '0';
//     return num.toLocaleString();
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
//         <p className="text-gray-600">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <div className="mb-8">
//         <div className="bg-blue-100 rounded-2xl p-4 mb-6 inline-block">
//           <span className="text-4xl">⚖️</span>
//         </div>
//         <h1 className="text-3xl font-semibold text-gray-800 mb-3">Welcome to Nexintel AI</h1>
//         <p className="text-gray-600 max-w-2xl">
//           Your AI-powered legal assistant for document processing, case analysis, and legal drafting.
//         </p>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
//           <p className="font-semibold">Error loading statistics</p>
//           <p className="text-sm">{error}</p>
//         </div>
//       )}

//       {tokenStats && (
//         <>
//           <div className="mb-8">
//             <div className="flex items-center mb-4">
//               <Brain className="h-5 w-5 text-blue-600 mr-2" />
//               <h2 className="text-xl font-semibold text-gray-800">Token Usage Overview</h2>
//               <span className="ml-3 text-sm text-gray-500">{tokenStats.period}</span>
//             </div>

//             <div className="grid md:grid-cols-4 gap-4 mb-6">
//               <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-2">
//                   <Zap className="h-5 w-5 text-purple-600" />
//                   <TrendingUp className="h-4 w-4 text-purple-600" />
//                 </div>
//                 <h3 className="text-sm font-medium text-purple-900 mb-1">Total Tokens</h3>
//                 <p className="text-2xl font-bold text-purple-700">{formatNumber(tokenStats.overall.totalTokens)}</p>
//                 <p className="text-xs text-purple-600 mt-1">All time usage</p>
//               </div>

//               <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
//                 <MessageSquare className="h-5 w-5 text-blue-600 mb-2" />
//                 <h3 className="text-sm font-medium text-blue-900 mb-1">Prompt Tokens</h3>
//                 <p className="text-2xl font-bold text-blue-700">{formatNumber(tokenStats.overall.totalPromptTokens)}</p>
//                 <p className="text-xs text-blue-600 mt-1">Input tokens</p>
//               </div>

//               <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
//                 <Brain className="h-5 w-5 text-green-600 mb-2" />
//                 <h3 className="text-sm font-medium text-green-900 mb-1">Completion Tokens</h3>
//                 <p className="text-2xl font-bold text-green-700">{formatNumber(tokenStats.overall.totalCompletionTokens)}</p>
//                 <p className="text-xs text-green-600 mt-1">Output tokens</p>
//               </div>

//               <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
//                 <BarChart3 className="h-5 w-5 text-orange-600 mb-2" />
//                 <h3 className="text-sm font-medium text-orange-900 mb-1">Total Queries</h3>
//                 <p className="text-2xl font-bold text-orange-700">{formatNumber(tokenStats.overall.totalQueries)}</p>
//                 <p className="text-xs text-orange-600 mt-1">AI interactions</p>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-semibold text-gray-700">Average Usage</h3>
//                   <Calendar className="h-4 w-4 text-gray-500" />
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Tokens per Query</span>
//                     <span className="text-lg font-bold text-gray-800">{formatNumber(tokenStats.overall.avgTokensPerQuery)}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Active Days</span>
//                     <span className="text-lg font-bold text-gray-800">{tokenStats.overall.activeDays}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-semibold text-gray-700">Recent Activity (Last 7 Days)</h3>
//                   <TrendingUp className="h-4 w-4 text-gray-500" />
//                 </div>
//                 <div className="space-y-2 max-h-32 overflow-y-auto">
//                   {tokenStats.daily && tokenStats.daily.length > 0 ? (
//                     tokenStats.daily.slice(0, 5).map((day, index) => (
//                       <div key={index} className="flex justify-between items-center text-sm">
//                         <span className="text-gray-600">
//                           {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                         </span>
//                         <div className="flex items-center space-x-3">
//                           <span className="text-gray-500">{day.total_queries} queries</span>
//                           <span className="font-semibold text-gray-800">{formatNumber(day.total_tokens)}</span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-gray-500">No recent activity</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default DashboardPage;





// import React, { useState, useEffect } from 'react';
// import { Brain, TrendingUp, MessageSquare, Zap, Calendar, BarChart3, Loader2, Activity, Clock } from 'lucide-react';

// const DashboardPage = () => {
//   const [tokenStats, setTokenStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_BASE_URL = "http://localhost:5000";

//   const getAuthToken = () => {
//     const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
//     for (const k of keys) {
//       const val = localStorage.getItem(k);
//       if (val) return val;
//     }
//     return null;
//   };

//   useEffect(() => {
//     fetchTokenStats();
//   }, []);

//   const fetchTokenStats = async () => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();
      
//       const response = await fetch(`${API_BASE_URL}/api/doc/token-stats`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error('Failed to fetch token stats');
      
//       const data = await response.json();
//       console.log('Token Stats:', data);
//       setTokenStats(data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching token stats:', err);
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

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full bg-gray-50">
//         <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-4" />
//         <p className="text-gray-600">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-8 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
//           <p className="text-gray-600">AI-powered legal document analysis platform</p>
//         </div>

//         {error && (
//           <div className="bg-white border-l-4 border-red-500 text-gray-700 p-4 rounded mb-6 shadow-sm">
//             <div className="flex">
//               <div className="ml-3">
//                 <p className="text-sm font-medium">Error loading statistics</p>
//                 <p className="text-sm text-gray-600 mt-1">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {tokenStats && (
//           <>
//             {/* Main Stats Grid */}
//             <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <Zap className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">{formatNumber(tokenStats.overall.totalTokens)}</span>
//                   <span className="text-sm text-gray-500 mt-1">Total Tokens Used</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <MessageSquare className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Input</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">{formatNumber(tokenStats.overall.totalPromptTokens)}</span>
//                   <span className="text-sm text-gray-500 mt-1">Prompt Tokens</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <Brain className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Output</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">{formatNumber(tokenStats.overall.totalCompletionTokens)}</span>
//                   <span className="text-sm text-gray-500 mt-1">Completion Tokens</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <BarChart3 className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Queries</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">{formatNumber(tokenStats.overall.totalQueries)}</span>
//                   <span className="text-sm text-gray-500 mt-1">Total Queries</span>
//                 </div>
//               </div>
//             </div>

//             {/* Secondary Stats Row */}
//             <div className="grid lg:grid-cols-3 gap-6 mb-8">
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Average Usage</h3>
//                   <Activity className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-2xl font-bold text-gray-900">{formatNumber(tokenStats.overall.avgTokensPerQuery)}</p>
//                     <p className="text-sm text-gray-500">Tokens per query</p>
//                   </div>
//                   <div className="pt-4 border-t border-gray-100">
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-600">Active Days</span>
//                       <span className="text-sm font-semibold text-gray-900">{tokenStats.overall.activeDays}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 lg:col-span-2">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
//                   <Clock className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="space-y-3">
//                   {tokenStats.daily && tokenStats.daily.length > 0 ? (
//                     <>
//                       <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 pb-2 border-b border-gray-100">
//                         <div className="col-span-2">Date</div>
//                         <div className="col-span-2 text-right">Queries</div>
//                         <div className="col-span-3 text-right">Tokens</div>
//                       </div>
//                       {tokenStats.daily.slice(0, 5).map((day, index) => (
//                         <div key={index} className="grid grid-cols-7 gap-2 text-sm items-center">
//                           <div className="col-span-2 text-gray-600">
//                             {new Date(day.date).toLocaleDateString('en-US', { 
//                               month: 'short', 
//                               day: 'numeric',
//                               year: new Date(day.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
//                             })}
//                           </div>
//                           <div className="col-span-2 text-right text-gray-600">{day.total_queries}</div>
//                           <div className="col-span-3 text-right font-semibold text-gray-900">
//                             {formatNumber(day.total_tokens)}
//                           </div>
//                         </div>
//                       ))}
//                     </>
//                   ) : (
//                     <div className="text-center py-8">
//                       <p className="text-sm text-gray-500">No recent activity to display</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Usage Trend (if you have more data) */}
//             {tokenStats.daily && tokenStats.daily.length > 7 && (
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Usage Trend</h3>
//                   <TrendingUp className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="h-48 flex items-end space-x-2">
//                   {tokenStats.daily.slice(0, 14).reverse().map((day, index) => {
//                     const maxTokens = Math.max(...tokenStats.daily.slice(0, 14).map(d => d.total_tokens));
//                     const height = (day.total_tokens / maxTokens) * 100;
//                     return (
//                       <div key={index} className="flex-1 flex flex-col items-center">
//                         <div 
//                           className="w-full bg-gray-300 rounded-t transition-all duration-300 hover:bg-gray-400"
//                           style={{ height: `${height}%` }}
//                           title={`${new Date(day.date).toLocaleDateString()}: ${formatNumber(day.total_tokens)} tokens`}
//                         />
//                       </div>
//                     );
//                   })}
//                 </div>
//                 <div className="mt-4 flex justify-between text-xs text-gray-500">
//                   <span>{new Date(tokenStats.daily[13]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
//                   <span>Today</span>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;


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
//   CreditCard
// } from 'lucide-react';

// const DashboardPage = () => {
//   const [costStats, setCostStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_BASE_URL = "http://localhost:5000";

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

//   const fetchCostStats = async () => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();

//       const response = await fetch(`${API_BASE_URL}/api/doc/cost-stats`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error('Failed to fetch cost stats');

//       const data = await response.json();
//       console.log('Cost Stats:', data);
//       setCostStats(data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching cost stats:', err);
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
//       <div className="flex flex-col items-center justify-center h-full bg-gray-50">
//         <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-4" />
//         <p className="text-gray-600">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-8 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
//           <p className="text-gray-600">AI-powered legal document analysis platform</p>
//         </div>

//         {error && (
//           <div className="bg-white border-l-4 border-red-500 text-gray-700 p-4 rounded mb-6 shadow-sm">
//             <div className="flex">
//               <div className="ml-3">
//                 <p className="text-sm font-medium">Error loading statistics</p>
//                 <p className="text-sm text-gray-600 mt-1">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {costStats && (
//           <>
//             {/* Token Stats Grid */}
//             <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <Zap className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">
//                     {formatNumber(costStats.overall.totalTokens)}
//                   </span>
//                   <span className="text-sm text-gray-500 mt-1">Total Tokens Used</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <MessageSquare className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Input</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">
//                     {formatNumber(costStats.overall.totalPromptTokens)}
//                   </span>
//                   <span className="text-sm text-gray-500 mt-1">Prompt Tokens</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <Brain className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Output</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">
//                     {formatNumber(costStats.overall.totalCompletionTokens)}
//                   </span>
//                   <span className="text-sm text-gray-500 mt-1">Completion Tokens</span>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-gray-100 rounded-lg">
//                     <BarChart3 className="h-5 w-5 text-gray-700" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Queries</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">
//                     {formatNumber(costStats.overall.totalQueries)}
//                   </span>
//                   <span className="text-sm text-gray-500 mt-1">Total Queries</span>
//                 </div>
//               </div>
//             </div>

//             {/* Cost Cards */}
//             <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-6 mb-8">
//               <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm border border-green-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <TrendingUp className="h-5 w-5 text-green-700" />
//                   </div>
//                   <span className="text-xs font-medium text-green-700 uppercase tracking-wider">Input Cost</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">
//                     ₹{formatCurrency(costStats.overall.totalInputCostINR)}
//                   </span>
//                   <span className="text-sm text-gray-600 mt-1">Input Token Cost</span>
//                   <span className="text-xs text-gray-500 mt-1">
//                     {formatNumber(costStats.overall.totalPromptTokens)} tokens
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Brain className="h-5 w-5 text-blue-700" />
//                   </div>
//                   <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">Output Cost</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl font-bold text-gray-900">
//                     ₹{formatCurrency(costStats.overall.totalOutputCostINR)}
//                   </span>
//                   <span className="text-sm text-gray-600 mt-1">Output Token Cost</span>
//                   <span className="text-xs text-gray-500 mt-1">
//                     {formatNumber(costStats.overall.totalCompletionTokens)} tokens
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm border border-purple-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <DollarSign className="h-5 w-5 text-purple-700" />
//                   </div>
//                   <span className="text-xs font-medium text-purple-700 uppercase tracking-wider">Total Cost</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-3xl font-bold text-gray-900">
//                     ₹{formatCurrency(costStats.overall.totalCostINR)}
//                   </span>
//                   <span className="text-sm text-gray-600 mt-1">Total Cost</span>
//                   <span className="text-xs text-gray-500 mt-1">
//                     {formatNumber(costStats.overall.totalTokens)} total tokens
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Secondary Stats Row */}
//             <div className="grid lg:grid-cols-3 gap-6 mb-8">
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Average Usage</h3>
//                   <Activity className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {formatNumber(
//                         costStats.overall.totalQueries > 0
//                           ? Math.round(costStats.overall.totalTokens / costStats.overall.totalQueries)
//                           : 0
//                       )}
//                     </p>

//                     <p className="text-sm text-gray-500">Tokens per query</p>
//                   </div>
//                   <div className="pt-4 border-t border-gray-100">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm text-gray-600">Active Days</span>
//                       <span className="text-sm font-semibold text-gray-900">
//                         {costStats.overall.activeDays}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-600">Avg Cost/Query</span>
//                       <span className="text-sm font-semibold text-green-700">
//                         ₹{costStats.overall.totalQueries > 0
//                           ? (costStats.overall.totalCostINR / costStats.overall.totalQueries).toFixed(4)
//                           : '0.0000'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 lg:col-span-2">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
//                   <Clock className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="space-y-3">
//                   {costStats.daily && costStats.daily.length > 0 ? (
//                     <>
//                       <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 pb-2 border-b border-gray-100">
//                         <div className="col-span-2">Date</div>
//                         <div className="col-span-2 text-right">Queries</div>
//                         <div className="col-span-3 text-right">Tokens</div>
//                         <div className="col-span-2 text-right">Input</div>
//                         <div className="col-span-3 text-right">Total Cost</div>
//                       </div>
//                       {costStats.daily.slice(0, 5).map((day, index) => (
//                         <div key={index} className="grid grid-cols-12 gap-2 text-sm items-center">
//                           <div className="col-span-2 text-gray-600">
//                             {new Date(day.date).toLocaleDateString('en-US', {
//                               month: 'short',
//                               day: 'numeric',
//                               year: new Date(day.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
//                             })}
//                           </div>
//                           <div className="col-span-2 text-right text-gray-600">
//                             {day.total_queries}
//                           </div>
//                           <div className="col-span-3 text-right font-semibold text-gray-900">
//                             {formatNumber(day.total_tokens)}
//                           </div>
//                           <div className="col-span-2 text-right text-green-700 text-xs">
//                             ₹{formatCurrency(day.total_input_cost_inr)}
//                           </div>
//                           <div className="col-span-3 text-right font-semibold text-green-800">
//                             ₹{formatCurrency(day.total_cost_inr)}
//                           </div>
//                         </div>
//                       ))}
//                     </>
//                   ) : (
//                     <div className="text-center py-8">
//                       <p className="text-sm text-gray-500">No recent activity to display</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Usage Trend Chart */}
//             {costStats.daily && costStats.daily.length > 7 && (
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Token Usage Trend</h3>
//                   <TrendingUp className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="h-48 flex items-end space-x-2">
//                   {costStats.daily.slice(0, 14).reverse().map((day, index) => {
//                     const maxTokens = Math.max(...costStats.daily.slice(0, 14).map(d => d.total_tokens));
//                     const height = maxTokens > 0 ? (day.total_tokens / maxTokens) * 100 : 0;
//                     return (
//                       <div key={index} className="flex-1 flex flex-col items-center">
//                         <div
//                           className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-t transition-all duration-300 hover:from-blue-500 hover:to-blue-400"
//                           style={{ height: `${height}%` }}
//                           title={`${new Date(day.date).toLocaleDateString()}: ${formatNumber(day.total_tokens)} tokens, ₹${formatCurrency(day.total_cost_inr)}`}
//                         />
//                       </div>
//                     );
//                   })}
//                 </div>
//                 <div className="mt-4 flex justify-between text-xs text-gray-500">
//                   <span>
//                     {costStats.daily[13]?.date
//                       ? new Date(costStats.daily[13].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//                       : ''}
//                   </span>
//                   <span>Today</span>
//                 </div>
//               </div>
//             )}

//             {/* Cost Trend Chart */}
//             {costStats.daily && costStats.daily.length > 7 && (
//               <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-sm font-medium text-gray-900">Cost Trend</h3>
//                   <CreditCard className="h-4 w-4 text-gray-400" />
//                 </div>
//                 <div className="h-48 flex items-end space-x-2">
//                   {costStats.daily.slice(0, 14).reverse().map((day, index) => {
//                     const maxCost = Math.max(...costStats.daily.slice(0, 14).map(d => parseFloat(d.total_cost_inr || 0)));
//                     const cost = parseFloat(day.total_cost_inr || 0);
//                     const height = maxCost > 0 ? (cost / maxCost) * 100 : 0;
//                     return (
//                       <div key={index} className="flex-1 flex flex-col items-center">
//                         <div
//                           className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t transition-all duration-300 hover:from-green-500 hover:to-green-400"
//                           style={{ height: `${height}%` }}
//                           title={`${new Date(day.date).toLocaleDateString()}: ₹${formatCurrency(day.total_cost_inr)}`}
//                         />
//                       </div>
//                     );
//                   })}
//                 </div>
//                 <div className="mt-4 flex justify-between text-xs text-gray-500">
//                   <span>
//                     {costStats.daily[13]?.date
//                       ? new Date(costStats.daily[13].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//                       : ''}
//                   </span>
//                   <span>Today</span>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;



// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Zap,
  BarChart3,
  Loader2,
  Activity,
  Clock,
  DollarSign,
  CreditCard,
  Calendar,
} from 'lucide-react';

const DashboardPage = () => {
  const [costStats, setCostStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);

  const API_BASE_URL = "http://localhost:5000";

  const getAuthToken = () => {
    const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) return val;
    }
    return null;
  };

  useEffect(() => {
    fetchCostStats();
  }, []);

  useEffect(() => {
    if (costStats) {
      setTimeout(() => setAnimate(true), 100);
    }
  }, [costStats]);

  const fetchCostStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/doc/cost-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cost stats');
      const data = await response.json();
      setCostStats(data);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
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
          <div className="mb-8 bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-sm font-semibold text-red-900">Unable to load statistics</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        )}

        {costStats && (
          <>
            {/* Total Cost Card */}
            <div className={`mb-10 bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-700 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Cost</p>
                  <h2 className="text-4xl font-bold text-gray-900 mt-1">₹{formatCurrency(costStats.overall.totalCostINR)}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(costStats.overall.totalTokens)} tokens processed
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-gray-400" />
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

            {/* Token Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { icon: Zap, label: "Total Tokens", value: costStats.overall.totalTokens },
                { icon: MessageSquare, label: "Prompt Tokens", value: costStats.overall.totalPromptTokens },
                { icon: Brain, label: "Completion Tokens", value: costStats.overall.totalCompletionTokens },
                { icon: BarChart3, label: "Total Queries", value: costStats.overall.totalQueries },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-700 hover:shadow-md ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${150 + idx * 100}ms` }}>
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="h-5 w-5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stat.value)}</p>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              {/* Performance */}
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

              {/* Activity */}
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
                        <span className="w-16 text-right">{day.total_queries}</span>
                        <span className="w-24 text-right">{formatNumber(day.total_tokens)}</span>
                        <span className="w-24 text-right font-medium">₹{formatCurrency(day.total_cost_inr)}</span>
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
