

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import apiService from "../services/api";

// const ChatHistoryPage = () => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigate = useNavigate();

//   const fetchChats = async (pageNumber = 1) => {
//     try {
//       if (pageNumber === 1) setLoading(true);
//       else setLoadingMore(true);

//       const data = await apiService.fetchChatSessions(pageNumber, 20);

//       if (data.length < 20) setHasMore(false); // No more results

//       if (pageNumber === 1) {
//         setChats(data);
//       } else {
//         setChats((prev) => [...prev, ...data]);
//       }
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//       setError(err.message || "Error fetching chats");
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     fetchChats(1); // Initial fetch
//   }, []);

//   const handleLoadMore = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     fetchChats(nextPage);
//   };

//   const generateTopicTitle = (chat) => {
//     if (chat.isSecret) return chat.secretName || chat.promptName || "Secret Prompt";
//     if (!chat.question) return "Untitled Chat";

//     const words = chat.question.trim().split(" ");
//     return words.length <= 8 ? chat.question : words.slice(0, 8).join(" ") + "...";
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: new Date().getFullYear() !== date.getFullYear() ? "numeric" : undefined,
//     });
//   };

//   const handleChatClick = (chat) => {
//     navigate(`/analysis/${chat.file_id}/${chat.session_id}`, { state: { chat } });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-slate-500 text-sm">Loading conversations...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-slate-600 text-sm bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   const filteredChats = chats.filter(
//     (chat) =>
//       chat.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       chat.answer?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-3xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-medium text-slate-900 mb-2">Conversations</h1>
//           <p className="text-slate-600 text-sm mb-6">Your recent chat history</p>

//           {/* Search Input */}
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search conversations..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-300"
//             />
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//               <svg
//                 className="w-4 h-4 text-slate-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Chat List */}
//         <div className="space-y-3">
//           {[...filteredChats]
//             .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // ✅ latest first
//             .map((chat) => (
//               <div
//                 key={chat.id}
//                 onClick={() => handleChatClick(chat)}
//                 className="cursor-pointer block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-medium text-slate-900 mb-2 line-clamp-1">
//                       {generateTopicTitle(chat)}
//                     </h3>
//                     <p className="text-sm text-slate-600 line-clamp-2 mb-3">
//                       {chat.isSecret ? "Secret prompt used." : chat.question}
//                     </p>
//                     <p className="text-sm text-slate-500 line-clamp-2">{chat.answer}</p>
//                   </div>
//                   <div className="flex-shrink-0 text-right">
//                     <span className="text-xs text-slate-400">
//                       {formatDate(chat.created_at)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//         </div>

//         {/* Load More Button */}
//         {hasMore && (
//           <div className="mt-8 text-center">
//             <button
//               onClick={handleLoadMore}
//               disabled={loadingMore}
//               className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200"
//             >
//               {loadingMore ? "Loading..." : "Load older conversations"}
//             </button>
//           </div>
//         )}

//         {/* No Results */}
//         {searchQuery && filteredChats.length === 0 && (
//           <div className="text-center py-12 text-slate-500 text-sm">
//             No conversations match your search
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatHistoryPage;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import apiService from "../services/api";

// const ChatHistoryPage = () => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigate = useNavigate();

//   const fetchChats = async (pageNumber = 1) => {
//     try {
//       if (pageNumber === 1) setLoading(true);
//       else setLoadingMore(true);

//       const data = await apiService.fetchChatSessions(pageNumber, 20);

//       if (Array.isArray(data)) {
//         if (data.length < 20) setHasMore(false);

//         if (pageNumber === 1) {
//           setChats(data);
//         } else {
//           setChats((prev) => [...prev, ...data]);
//         }
//       } else {
//         setError("Invalid response format");
//       }
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//       setError(err.message || "Error fetching chats");
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     fetchChats(1);
//   }, []);

//   const handleLoadMore = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     fetchChats(nextPage);
//   };

//   const generateTopicTitle = (session) => {
//     if (!session.messages || session.messages.length === 0)
//       return "Untitled Chat";
//     const firstQ = session.messages[0].question;
//     if (!firstQ) return "Untitled Chat";
//     const words = firstQ.trim().split(" ");
//     return words.length <= 8 ? firstQ : words.slice(0, 8).join(" ") + "...";
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year:
//         new Date().getFullYear() !== date.getFullYear() ? "numeric" : undefined,
//     });
//   };

//   const handleChatClick = (session) => {
//     navigate(`/analysis/${session.file_id}/${session.session_id}`, {
//       state: { session },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-slate-500 text-sm">Loading conversations...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-slate-600 text-sm bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   const filteredChats = chats
//     .map((session) => {
//       const lastMessage =
//         session.messages && session.messages.length > 0
//           ? session.messages[session.messages.length - 1]
//           : {};
//       return { ...session, lastMessage };
//     })
//     .filter(
//       (chat) =>
//         chat.lastMessage.question
//           ?.toLowerCase()
//           .includes(searchQuery.toLowerCase()) ||
//         chat.lastMessage.answer
//           ?.toLowerCase()
//           .includes(searchQuery.toLowerCase())
//     );

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-3xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <h1 className="text-2xl font-medium text-slate-900 mb-2">
//             Conversations
//           </h1>
//           <p className="text-slate-600 text-sm mb-6">
//             Your recent chat history
//           </p>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search conversations..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-300"
//             />
//             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//               <svg
//                 className="w-4 h-4 text-slate-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-3">
//           {[...filteredChats]
//             .sort(
//               (a, b) =>
//                 new Date(
//                   b.lastMessage?.created_at || b.messages[0]?.created_at
//                 ) -
//                 new Date(
//                   a.lastMessage?.created_at || a.messages[0]?.created_at
//                 )
//             )
//             .map((session) => (
//               <div
//                 key={session.session_id}
//                 onClick={() => handleChatClick(session)}
//                 className="cursor-pointer block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-medium text-slate-900 mb-2 line-clamp-1">
//                       {generateTopicTitle(session)}
//                     </h3>
//                     <p className="text-sm text-slate-600 line-clamp-2 mb-3">
//                       {session.lastMessage.question}
//                     </p>
//                     <p className="text-sm text-slate-500 line-clamp-2">
//                       {session.lastMessage.answer}
//                     </p>
//                   </div>
//                   <div className="flex-shrink-0 text-right">
//                     <span className="text-xs text-slate-400">
//                       {formatDate(
//                         session.lastMessage?.created_at ||
//                           session.messages[0]?.created_at
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//         </div>

//         {hasMore && (
//           <div className="mt-8 text-center">
//             <button
//               onClick={handleLoadMore}
//               disabled={loadingMore}
//               className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200"
//             >
//               {loadingMore ? "Loading..." : "Load older conversations"}
//             </button>
//           </div>
//         )}

//         {searchQuery && filteredChats.length === 0 && (
//           <div className="text-center py-12 text-slate-500 text-sm">
//             No conversations match your search
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatHistoryPage;


// pages/ChatHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatHistoryPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

  const getAuthToken = () => {
    const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) return val;
    }
    return null;
  };

  const fetchChats = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/doc/chat-sessions?page=${pageNumber}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }

      const data = await response.json();
      console.log("📥 Fetched chat sessions:", data);

      if (Array.isArray(data)) {
        if (data.length < 20) setHasMore(false);

        if (pageNumber === 1) {
          setChats(data);
        } else {
          setChats((prev) => [...prev, ...data]);
        }
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.message || "Error fetching chats");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchChats(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchChats(nextPage);
  };

  const generateTopicTitle = (session) => {
    if (!session.messages || session.messages.length === 0)
      return "Untitled Chat";
    const firstQ = session.messages[0].question;
    if (!firstQ) return "Untitled Chat";
    const words = firstQ.trim().split(" ");
    return words.length <= 8 ? firstQ : words.slice(0, 8).join(" ") + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        new Date().getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  const calculateSessionTotals = (session) => {
    if (!session.messages || session.messages.length === 0) {
      return { totalTokens: 0, totalCost: 0, messageCount: 0 };
    }

    let totalTokens = 0;
    let totalCost = 0;

    session.messages.forEach((msg) => {
      totalTokens += parseInt(msg.total_tokens) || 0;
      totalCost += parseFloat(msg.total_cost_inr) || 0;
    });

    return {
      totalTokens,
      totalCost: totalCost.toFixed(4),
      messageCount: session.messages.length
    };
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const handleChatClick = (session) => {
    const totals = calculateSessionTotals(session);
    console.log("🔍 Opening chat session:", {
      sessionId: session.session_id,
      fileId: session.file_id,
      messages: totals.messageCount,
      totalTokens: totals.totalTokens,
      totalCost: `₹${totals.totalCost}`
    });

    navigate(`/analysis/${session.file_id}/${session.session_id}`, {
      state: { session },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600 text-sm bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
          {error}
        </div>
      </div>
    );
  }

  const filteredChats = chats
    .map((session) => {
      const lastMessage =
        session.messages && session.messages.length > 0
          ? session.messages[session.messages.length - 1]
          : {};
      return { ...session, lastMessage };
    })
    .filter(
      (chat) =>
        chat.lastMessage.question
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.answer
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-slate-900 mb-2">
            Conversations
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            Your recent chat history
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[...filteredChats]
            .sort(
              (a, b) =>
                new Date(b.last_message_at || b.messages[0]?.created_at) -
                new Date(a.last_message_at || a.messages[0]?.created_at)
            )
            .map((session) => {
              const totals = calculateSessionTotals(session);
              
              return (
                <div
                  key={session.session_id}
                  onClick={() => handleChatClick(session)}
                  className="cursor-pointer block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 mb-2 line-clamp-1">
                        {generateTopicTitle(session)}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {session.lastMessage.question}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {session.lastMessage.answer}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          {totals.messageCount} {totals.messageCount === 1 ? 'message' : 'messages'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {formatNumber(totals.totalTokens)} tokens
                        </span>
                        <span className="flex items-center gap-1 font-medium text-green-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ₹{totals.totalCost}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs text-slate-400">
                        {formatDate(session.last_message_at || session.messages[0]?.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200"
            >
              {loadingMore ? "Loading..." : "Load older conversations"}
            </button>
          </div>
        )}

        {searchQuery && filteredChats.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            No conversations match your search
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPage;