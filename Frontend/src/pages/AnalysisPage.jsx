

// import React, { useState, useRef, useEffect } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import {
//   Loader2, Send, Paperclip, ChevronDown, Brain, AlertCircle, CheckCircle,
//   X, Copy, Check, Square, ArrowLeft, Plus, FileDown, FileText, Sparkles,
//   Zap, FileType, MoreVertical, Upload
// } from "lucide-react";

// const AnalysisPage = () => {
//   const { file_id, session_id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const sessionFromHistory = location.state?.session;

//   // All state variables
//   const [fileId, setFileId] = useState(file_id || null);
//   const [file, setFile] = useState(null);
//   const [files, setFiles] = useState([]);
//   const [uploadedFilesList, setUploadedFilesList] = useState([]);
//   const [processingStatus, setProcessingStatus] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [abortController, setAbortController] = useState(null);
//   const [chatInput, setChatInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [showModelDropdown, setShowModelDropdown] = useState(false);
//   const [selectedModel, setSelectedModel] = useState("gemini");
//   const [showSplit, setShowSplit] = useState(false);
//   const [copiedIndex, setCopiedIndex] = useState(null);
//   const [isExportingPDF, setIsExportingPDF] = useState(false);
//   const [streamingText, setStreamingText] = useState("");
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [sessionStats, setSessionStats] = useState(null);
//   const [documentAICost, setDocumentAICost] = useState(null);
//   const [showCostDropdown, setShowCostDropdown] = useState(false);

//   const fileInputRef = useRef(null);
//   const dropdownRef = useRef(null);
//   const costDropdownRef = useRef(null);
//   const streamingIntervalRef = useRef(null);

//   const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

//   const llmModels = [
//     { id: "gemini", name: "Gemini 2.0 Flash", icon: Zap, color: "text-blue-600", description: "Fast & efficient" },
//     { id: "gemini-pro-2.5", name: "Gemini 2.5 Pro", icon: Sparkles, color: "text-purple-600", description: "Advanced reasoning" },
//     { id: "anthropic", name: "Claude 3.5 Haiku", icon: Zap, color: "text-orange-600", description: "Quick responses" },
//     { id: "claude-sonnet-4", name: "Claude 4.0 Sonnet", icon: Brain, color: "text-indigo-600", description: "Most intelligent" },
//     { id: "openai", name: "GPT-4o Mini", icon: Zap, color: "text-green-600", description: "Balanced performance" },
//     { id: "deepseek", name: "DeepSeek Chat", icon: Brain, color: "text-teal-600", description: "Cost-effective" },
//   ];

//   const getAuthToken = () => {
//     const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
//     for (const k of keys) {
//       const val = localStorage.getItem(k);
//       if (val) return val;
//     }
//     return null;
//   };

//   const calculateSessionStats = (messages) => {
//     if (!messages || messages.length === 0) return null;
//     let totalPromptTokens = 0, totalCompletionTokens = 0, totalTokens = 0;
//     let totalInputCost = 0, totalOutputCost = 0, totalCost = 0;
//     messages.forEach((msg) => {
//       totalPromptTokens += parseInt(msg.prompt_tokens) || 0;
//       totalCompletionTokens += parseInt(msg.completion_tokens) || 0;
//       totalTokens += parseInt(msg.total_tokens) || 0;
//       totalInputCost += parseFloat(msg.input_cost_inr) || 0;
//       totalOutputCost += parseFloat(msg.output_cost_inr) || 0;
//       totalCost += parseFloat(msg.total_cost_inr) || 0;
//     });
//     return {
//       total_messages: messages.length,
//       total_prompt_tokens: totalPromptTokens,
//       total_completion_tokens: totalCompletionTokens,
//       total_tokens: totalTokens,
//       total_input_cost_inr: totalInputCost.toFixed(4),
//       total_output_cost_inr: totalOutputCost.toFixed(4),
//       total_cost_inr: totalCost.toFixed(4)
//     };
//   };

//   const getModelInfo = (modelId) => llmModels.find(m => m.id === modelId) || llmModels[0];

//   const fetchDocumentAICost = async (fileId) => {
//     try {
//       const token = getAuthToken();
//       const res = await fetch(`${API_BASE_URL}/api/doc/document-ai-cost/${fileId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         const data = await res.json();
//         if (data.document_ai_cost) setDocumentAICost(data.document_ai_cost);
//       }
//     } catch (err) {
//       console.error('Error fetching Document AI cost:', err);
//     }
//   };

//   const handleFileSelection = (event) => {
//     const selectedFiles = Array.from(event.target.files);
//     if (selectedFiles.length === 0) return;
//     setFiles(prev => [...prev, ...selectedFiles]);
//   };

//   const handleRemoveFile = (index) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleFileUpload = async () => {
//     if (files.length === 0) return;
//     setIsUploading(true);
//     setError(null);
//     setUploadProgress(0);

//     const formData = new FormData();
//     files.forEach(file => formData.append("documents", file));

//     const xhr = new XMLHttpRequest();
//     xhr.upload.onprogress = (e) => {
//       if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
//     };

//     xhr.onload = () => {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         const data = JSON.parse(xhr.responseText);
//         if (data.files && data.files.length > 0) {
//           const firstFileId = data.files[0].fileId;
//           setFileId(firstFileId);
//           setUploadedFilesList(files.map((f, i) => ({
//             name: f.name, size: f.size, fileId: data.files[i]?.fileId || null
//           })));
//           setFile({ name: data.files.length === 1 ? files[0].name : `${files.length} files uploaded` });
//           if (data.total_cost_inr) {
//             setDocumentAICost({
//               pages: data.total_pages,
//               cost_inr: data.total_cost_inr.toFixed(2),
//               cost_usd: data.total_cost_usd.toFixed(3),
//               tier: data.files[0]?.tier || 'standard'
//             });
//           }
//           setSuccess(`${files.length} file(s) uploaded successfully!`);
//           setIsUploading(false);
//           setFiles([]);
//           pollProcessingStatus(firstFileId);
//         } else {
//           setError("Upload succeeded but no file data returned");
//           setIsUploading(false);
//         }
//       } else {
//         setError(`Upload failed: ${xhr.status}`);
//         setIsUploading(false);
//       }
//     };

//     xhr.onerror = () => {
//       setError("Upload failed due to network error.");
//       setIsUploading(false);
//     };

//     const token = getAuthToken();
//     xhr.open("POST", `${API_BASE_URL}/api/doc/batch-upload`);
//     if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
//     xhr.send(formData);
//   };

//   const pollProcessingStatus = (id) => {
//     setProcessingStatus({ status: "batch_processing" });
//     let tries = 0;
//     const interval = setInterval(async () => {
//       tries++;
//       try {
//         const token = getAuthToken();
//         const res = await fetch(`${API_BASE_URL}/api/doc/status/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setProcessingStatus(data);
//         if (data.status === "processed") {
//           clearInterval(interval);
//           setSuccess("Document processed successfully!");
//         }
//         if (data.status === "error" || tries > 100) {
//           clearInterval(interval);
//           setError("Processing failed or timed out.");
//         }
//       } catch (err) {
//         clearInterval(interval);
//         setError("Error while checking status.");
//       }
//     }, 2000);
//   };

//   const animateResponse = (text) => {
//     return new Promise((resolve) => {
//       setIsStreaming(true);
//       setStreamingText("");
//       let currentIndex = 0;
//       streamingIntervalRef.current = setInterval(() => {
//         if (currentIndex < text.length) {
//           currentIndex += 3;
//           setStreamingText(text.slice(0, currentIndex));
//         } else {
//           clearInterval(streamingIntervalRef.current);
//           streamingIntervalRef.current = null;
//           setIsStreaming(false);
//           setStreamingText("");
//           resolve();
//         }
//       }, 20);
//     });
//   };

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!fileId) return setError("Upload a document first.");
//     if (processingStatus?.status !== "processed") return setError("Document not ready yet.");
//     if (!chatInput.trim()) return;

//     setIsProcessing(true);
//     setError(null);
//     const controller = new AbortController();
//     setAbortController(controller);

//     try {
//       const token = getAuthToken();
//       const res = await fetch(`${API_BASE_URL}/api/doc/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//         body: JSON.stringify({
//           file_id: fileId,
//           question: chatInput,
//           llmModelName: selectedModel,
//           used_secret_prompt: false,
//           session_id: session_id || undefined,
//         }),
//         signal: controller.signal,
//       });

//       if (!res.ok) throw new Error(`API error: ${res.status}`);
//       const data = await res.json();
//       const answer = data.answer || data.response || "No response";

//       if (data.sessionStats) setSessionStats(data.sessionStats);
//       if (!showSplit) setShowSplit(true);

//       const newMessage = { q: chatInput, a: answer, tokenUsage: data.tokenUsage, model: selectedModel };
//       setMessages((prev) => [...prev, newMessage]);
//       setSelectedQuestionIndex(messages.length);
//       setChatInput("");
      
//       const textarea = document.querySelector('textarea');
//       if (textarea) textarea.style.height = 'auto';
      
//       await animateResponse(answer);
//       setSuccess("Response generated!");
//     } catch (err) {
//       if (err.name === "AbortError") {
//         setError("Generation stopped");
//       } else {
//         setError(err.message);
//       }
//     } finally {
//       setIsProcessing(false);
//       setAbortController(null);
//     }
//   };

//   const handleStopGeneration = () => {
//     if (abortController) {
//       abortController.abort();
//       setAbortController(null);
//       setIsProcessing(false);
//       setIsStreaming(false);
//       if (streamingIntervalRef.current) {
//         clearInterval(streamingIntervalRef.current);
//         streamingIntervalRef.current = null;
//       }
//     }
//   };

//   const handleCopyAnswer = async (answerText, index) => {
//     try {
//       await navigator.clipboard.writeText(answerText);
//       setCopiedIndex(index);
//       setTimeout(() => setCopiedIndex(null), 2000);
//     } catch (err) {
//       setError("Failed to copy text");
//     }
//   };

//   const handleNewChat = () => {
//     navigate("/analysis");
//     setMessages([]);
//     setSelectedQuestionIndex(null);
//     setFileId(null);
//     setFile(null);
//     setFiles([]);
//     setUploadedFilesList([]);
//     setShowSplit(false);
//     setProcessingStatus(null);
//     setStreamingText("");
//     setIsStreaming(false);
//     setSessionStats(null);
//     setDocumentAICost(null);
//     setShowCostDropdown(false);
//     if (streamingIntervalRef.current) {
//       clearInterval(streamingIntervalRef.current);
//       streamingIntervalRef.current = null;
//     }
//   };

//   const handleBackToHistory = () => navigate("/chats");

//   const handleExportToPDF = async () => {
//     if (selectedQuestionIndex === null) {
//       setError("Please select a question to export");
//       return;
//     }
//     setIsExportingPDF(true);
//     try {
//       const { jsPDF } = await import('jspdf');
//       const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margins = { left: 20, right: 20, top: 20, bottom: 20 };
//       const contentWidth = pageWidth - margins.left - margins.right;
//       let yPos = margins.top;

//       doc.setFontSize(18);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Legal Analysis Report', margins.left, yPos);
//       yPos += 10;
//       doc.setFontSize(9);
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(100, 100, 100);
//       doc.text(`Generated on: ${new Date().toLocaleString()}`, margins.left, yPos);
//       yPos += 3;
//       const modelInfo = getModelInfo(messages[selectedQuestionIndex].model || 'gemini');
//       doc.text(`Model: ${modelInfo.name}`, margins.left, yPos);
//       yPos += 10;
//       doc.setDrawColor(200, 200, 200);
//       doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
//       yPos += 8;
//       doc.setFontSize(11);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(37, 99, 235);
//       doc.text('QUESTION', margins.left, yPos);
//       yPos += 6;
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(0, 0, 0);
//       const questionLines = doc.splitTextToSize(messages[selectedQuestionIndex].q, contentWidth);
//       questionLines.forEach(line => {
//         if (yPos > pageHeight - margins.bottom - 10) { doc.addPage(); yPos = margins.top; }
//         doc.text(line, margins.left, yPos);
//         yPos += 5;
//       });
//       yPos += 5;
//       doc.setFontSize(11);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(37, 99, 235);
//       doc.text('ANSWER', margins.left, yPos);
//       yPos += 6;
//       doc.setFontSize(9.5);
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(0, 0, 0);
//       const answerText = messages[selectedQuestionIndex].a;
//       const cleanedText = answerText.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/^\s*[-•]\s+/gm, '• ').replace(/^\s*\d+\.\s+/gm, (match) => match);
//       const paragraphs = cleanedText.split(/\n\n+/);
//       paragraphs.forEach((paragraph) => {
//         if (paragraph.trim()) {
//           const isBullet = paragraph.trim().startsWith('•');
//           const isNumbered = /^\d+\./.test(paragraph.trim());
//           if (isBullet || isNumbered) {
//             const lines = paragraph.split('\n').filter(l => l.trim());
//             lines.forEach(line => {
//               if (yPos > pageHeight - margins.bottom - 10) { doc.addPage(); yPos = margins.top; }
//               const wrappedLines = doc.splitTextToSize(line.trim(), contentWidth - 5);
//               wrappedLines.forEach((wLine, wIndex) => {
//                 if (yPos > pageHeight - margins.bottom - 10) { doc.addPage(); yPos = margins.top; }
//                 doc.text(wLine, margins.left + (wIndex === 0 ? 0 : 5), yPos);
//                 yPos += 4.5;
//               });
//               yPos += 1;
//             });
//           } else {
//             const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
//             lines.forEach(line => {
//               if (yPos > pageHeight - margins.bottom - 10) { doc.addPage(); yPos = margins.top; }
//               doc.text(line, margins.left, yPos);
//               yPos += 4.5;
//             });
//           }
//           yPos += 3;
//         }
//       });
//       if (messages[selectedQuestionIndex].tokenUsage) {
//         yPos += 5;
//         if (yPos > pageHeight - margins.bottom - 30) { doc.addPage(); yPos = margins.top; }
//         doc.setDrawColor(200, 200, 200);
//         doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
//         yPos += 6;
//         doc.setFontSize(9);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(100, 100, 100);
//         doc.text('Token Usage Statistics', margins.left, yPos);
//         yPos += 5;
//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(8);
//         const tokenUsage = messages[selectedQuestionIndex].tokenUsage;
//         doc.text(`Input Tokens: ${tokenUsage.promptTokens?.toLocaleString() || 'N/A'}`, margins.left, yPos);
//         doc.text(`Output Tokens: ${tokenUsage.completionTokens?.toLocaleString() || 'N/A'}`, margins.left + 60, yPos);
//         yPos += 4;
//         doc.text(`Total Tokens: ${tokenUsage.totalTokens?.toLocaleString() || 'N/A'}`, margins.left, yPos);
//         doc.text(`Cost: ₹${tokenUsage.totalCostINR?.toFixed(4) || 'N/A'}`, margins.left + 60, yPos);
//       }
//       doc.save(`Legal_Analysis_${new Date().getTime()}.pdf`);
//       setSuccess("PDF exported successfully!");
//     } catch (err) {
//       setError("Failed to export PDF: " + err.message);
//     } finally {
//       setIsExportingPDF(false);
//     }
//   };

//   const markdownComponents = {
//     h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold text-gray-900 mt-8 mb-4" {...props} />,
//     h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props} />,
//     h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2.5" {...props} />,
//     p: ({ node, ...props }) => <p className="text-base text-gray-700 leading-8 my-4 font-normal" {...props} />,
//     ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2 my-4 ml-6 text-gray-700" {...props} />,
//     ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2 my-4 ml-6 text-gray-700" {...props} />,
//     li: ({ node, ...props }) => <li className="text-base text-gray-700 leading-7 pl-2" {...props} />,
//     strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
//     code: ({ node, inline, ...props }) => inline ? <code className="bg-gray-100 text-[#e01e5a] px-1.5 py-0.5 rounded text-sm font-mono" {...props} /> : <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4 leading-6" {...props} />,
//     table: ({ node, ...props }) => (<div className="overflow-x-auto my-5 rounded-lg border border-gray-200"><table className="min-w-full divide-y divide-gray-300 bg-white" {...props} /></div>),
//     thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
//     tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200" {...props} />,
//     th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide" {...props} />,
//     td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-gray-700" {...props} />,
//     blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600" {...props} />,
//   };

//   useEffect(() => {
//     if (sessionFromHistory && sessionFromHistory.messages) {
//       const loadedMessages = sessionFromHistory.messages.map((msg) => ({ q: msg.question, a: msg.answer, tokenUsage: { promptTokens: parseInt(msg.prompt_tokens) || 0, completionTokens: parseInt(msg.completion_tokens) || 0, totalTokens: parseInt(msg.total_tokens) || 0, inputCostINR: parseFloat(msg.input_cost_inr) || 0, outputCostINR: parseFloat(msg.output_cost_inr) || 0, totalCostINR: parseFloat(msg.total_cost_inr) || 0 }, model: msg.llm_model_name || 'gemini' }));
//       const calculatedStats = calculateSessionStats(sessionFromHistory.messages);
//       if (calculatedStats) setSessionStats(calculatedStats);
//       if (sessionFromHistory.document_ai_cost) { setDocumentAICost(sessionFromHistory.document_ai_cost); } else if (sessionFromHistory.file_id) { fetchDocumentAICost(sessionFromHistory.file_id); }
//       setMessages(loadedMessages);
//       setFileId(sessionFromHistory.file_id);
//       setShowSplit(true);
//       setSelectedQuestionIndex(loadedMessages.length - 1);
//       setProcessingStatus({ status: "processed" });
//       setFile({ name: sessionFromHistory.file_id ? `Document ${sessionFromHistory.file_id}` : "Document" });
//     }
//   }, [sessionFromHistory]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (costDropdownRef.current && !costDropdownRef.current.contains(event.target)) setShowCostDropdown(false);
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowModelDropdown(false);
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

// // RENDERING STARTS HERE - WELCOME SCREEN
// if (!showSplit) {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
//       {session_id && (
//         <button onClick={handleBackToHistory} className="absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all z-10">
//           <ArrowLeft className="h-4 w-4" />
//           <span className="font-medium">Back to History</span>
//         </button>
//       )}
//       <div className="text-center mb-12">
//         <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Smart Legal Insights</h1>
//         <p className="text-xl text-gray-600">Upload documents and get intelligent answers powered by AI</p>
//       </div>
//       {uploadedFilesList.length > 0 && (
//         <div className="w-full max-w-4xl mb-6">
//           <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-gray-700">Uploaded Files</h3>
//               <span className="text-xs text-gray-500">{uploadedFilesList.length} file(s)</span>
//             </div>
//             <div className="space-y-2">
//               {uploadedFilesList.map((file, idx) => (
//                 <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//                   <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
//                     <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                   </div>
//                   <CheckCircle className="h-5 w-5 text-green-500" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="w-full max-w-4xl">
//         <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg overflow-visible">
//           {files.length > 0 && (
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-sm font-semibold text-gray-700">{files.length} file{files.length > 1 ? 's' : ''} attached</span>
//                 <button onClick={handleFileUpload} disabled={isUploading} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//                   {isUploading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>{uploadProgress}%</span></>) : (<><Upload className="h-4 w-4" /><span>Upload</span></>)}
//                 </button>
//               </div>
//               <div className="space-y-2 max-h-40 overflow-y-auto">
//                 {files.map((file, idx) => (
//                   <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
//                     <div className="flex items-center space-x-3 flex-1 min-w-0">
//                       <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
//                         <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                       </div>
//                     </div>
//                     <button onClick={() => handleRemoveFile(idx)} disabled={isUploading} className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0">
//                       <X className="h-4 w-4 text-red-500" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//               {isUploading && (
//                 <div className="mt-3">
//                   <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
//                     <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//           <div className="flex items-center space-x-3 p-6">
//           <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0" title="Attach files">
//               <Paperclip className="h-6 w-6 text-gray-600" />
//             </button>
//             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelection} multiple accept=".pdf,.docx,.txt" />
//             <div className="relative flex-shrink-0" ref={dropdownRef}>
//               <button type="button" onClick={() => setShowModelDropdown(!showModelDropdown)} className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl bg-white text-base font-medium hover:bg-gray-50 transition-colors">
//                 <span className="text-gray-700">{getModelInfo(selectedModel).name}</span>
//                 <ChevronDown className="h-5 w-5 text-gray-500" />
//               </button>
//               {showModelDropdown && (
//                 <div className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
//                   {llmModels.map((m) => {
//                     const Icon = m.icon;
//                     return (
//                       <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }} className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedModel === m.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
//                         <div className="flex items-center space-x-3">
//                           <Icon className={`h-5 w-5 ${m.color}`} />
//                           <div className="flex-1">
//                             <p className="text-sm font-semibold text-gray-900">{m.name}</p>
//                             <p className="text-xs text-gray-500">{m.description}</p>
//                           </div>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//             <textarea rows={1} value={chatInput} onChange={(e) => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} placeholder={!file ? "Upload documents to start..." : "Ask me anything about your documents..."} className="flex-1 resize-none bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none py-3 leading-6" style={{ minHeight: "56px", maxHeight: "200px" }} disabled={!file || processingStatus?.status !== "processed"} />
//             <button onClick={handleSend} disabled={!file || isProcessing || processingStatus?.status !== "processed" || !chatInput.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
//               {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>
//         {file && (
//           <div className="mt-4 text-center">
//             {processingStatus?.status === "batch_processing" && (<div className="flex items-center justify-center space-x-2 text-sm text-blue-600"><Loader2 className="h-4 w-4 animate-spin" /><span>Processing documents...</span></div>)}
//             {processingStatus?.status === "processed" && (<div className="flex items-center justify-center space-x-2 text-sm text-green-600"><CheckCircle className="h-4 w-4" /><span>Ready to chat</span></div>)}
//             {processingStatus?.status === "error" && (<div className="flex items-center justify-center space-x-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" /><span>Processing failed</span></div>)}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // SPLIT VIEW - CHAT INTERFACE
// return (
//   <div className="flex h-screen bg-white">
//     <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
//       <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
//         <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
//         <div className="flex items-center space-x-2">
//           <button onClick={handleNewChat} className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><Plus className="h-4 w-4" /><span>New</span></button>
//           <button onClick={handleBackToHistory} className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="h-4 w-4" /></button>
//         </div>
//       </div>
//       {uploadedFilesList.length > 0 && (
//         <div className="px-4 py-3 border-b border-gray-200 bg-white">
//           <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents</h3>
//           <div className="space-y-1.5">
//             {uploadedFilesList.map((file, idx) => (
//               <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
//                 <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
//                 <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
//                 <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.map((m, i) => {
//           const modelInfo = getModelInfo(m.model || 'gemini');
//           const ModelIcon = modelInfo.icon;
//           return (
//             <div key={i} className={`p-3 rounded-lg shadow-sm text-sm transition-colors relative ${i === selectedQuestionIndex ? "bg-white border-2 border-blue-500 shadow-md" : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>
//               <div className="pr-16 cursor-pointer" onClick={() => setSelectedQuestionIndex(i)}>
//                 <div className="flex items-center space-x-2 mb-1">
//                   <span className="text-xs font-bold text-gray-900">Q{i + 1}</span>
//                   <ModelIcon className={`h-3 w-3 ${modelInfo.color}`} />
//                   <span className="text-xs text-gray-500">{modelInfo.name}</span>
//                 </div>
//                 <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">{m.q}</p>
//               </div>
//               <div className="absolute top-2 right-2 flex items-center space-x-1">
//                 {m.tokenUsage && m.tokenUsage.totalTokens > 0 && (<div className="text-[10px] text-gray-400">{m.tokenUsage.totalTokens.toLocaleString()}</div>)}
//                 {(documentAICost || sessionStats) && i === messages.length - 1 && (
//                   <div className="relative" ref={i === messages.length - 1 ? costDropdownRef : null}>
//                     <button onClick={(e) => { e.stopPropagation(); setShowCostDropdown(!showCostDropdown); }} className="p-1 hover:bg-gray-200 rounded transition-colors"><MoreVertical className="h-4 w-4 text-gray-500" /></button>
//                     {showCostDropdown && (
//                       <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
//                         <div className="p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
//                             <button onClick={(e) => { e.stopPropagation(); setShowCostDropdown(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
//                           </div>
//                           {documentAICost && (
//                             <div className="mb-4 pb-4 border-b border-gray-200">
//                               <div className="flex items-center justify-between mb-3">
//                                 <div className="flex items-center space-x-2"><FileType className="h-5 w-5 text-indigo-600" /><span className="text-sm font-semibold text-gray-800">Document AI</span></div>
//                                 <span className="text-sm font-bold text-green-700">₹{documentAICost.cost_inr}</span>
//                               </div>
//                               <div className="grid grid-cols-2 gap-3 text-xs">
//                                 <div className="flex justify-between"><span className="text-gray-600">Pages:</span><span className="font-semibold text-gray-900">{documentAICost.pages}</span></div>
//                                 <div className="flex justify-between"><span className="text-gray-600">USD Cost:</span><span className="font-semibold text-gray-900">${documentAICost.cost_usd}</span></div>
//                                 <div className="flex justify-between"><span className="text-gray-600">Tier:</span><span className="font-semibold text-gray-900 capitalize">{documentAICost.tier}</span></div>
//                                 <div className="flex justify-between"><span className="text-gray-600">Processor:</span><span className="font-semibold text-gray-900">OCR</span></div>
//                               </div>
//                             </div>
//                           )}
//                           {sessionStats && parseInt(sessionStats.total_tokens) > 0 && (
//                             <div>
//                               <div className="flex items-center space-x-2 mb-3"><Brain className="h-5 w-5 text-blue-600" /><span className="text-sm font-semibold text-gray-800">LLM Usage</span></div>
//                               <div className="space-y-2 mb-3">
//                                 <div className="flex justify-between text-xs"><span className="text-gray-600">Total Queries:</span><span className="font-semibold text-gray-900">{sessionStats.total_messages}</span></div>
//                                 <div className="flex justify-between text-xs"><span className="text-gray-600">Input Tokens:</span><span className="font-semibold text-gray-900">{parseInt(sessionStats.total_prompt_tokens).toLocaleString()}</span></div>
//                                 <div className="flex justify-between text-xs"><span className="text-gray-600">Output Tokens:</span><span className="font-semibold text-gray-900">{parseInt(sessionStats.total_completion_tokens).toLocaleString()}</span></div>
//                                 <div className="flex justify-between text-xs pt-2 border-t border-gray-200"><span className="text-gray-700 font-medium">Total Tokens:</span><span className="font-bold text-gray-900">{parseInt(sessionStats.total_tokens).toLocaleString()}</span></div>
//                               </div>
//                               <div className="pt-3 border-t border-gray-200">
//                                 <p className="font-semibold text-gray-800 mb-2 text-xs">Cost Details</p>
//                                 <div className="space-y-2">
//                                   <div className="flex justify-between text-xs"><span className="text-gray-600">Input Cost:</span><span className="font-semibold text-green-700">₹{parseFloat(sessionStats.total_input_cost_inr).toFixed(4)}</span></div>
//                                   <div className="flex justify-between text-xs"><span className="text-gray-600">Output Cost:</span><span className="font-semibold text-green-700">₹{parseFloat(sessionStats.total_output_cost_inr).toFixed(4)}</span></div>
//                                   <div className="flex justify-between text-xs pt-2 border-t border-gray-200"><span className="text-gray-700 font-medium">LLM Total:</span><span className="font-bold text-green-800">₹{parseFloat(sessionStats.total_cost_inr).toFixed(4)}</span></div>
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                           {documentAICost && sessionStats && parseInt(sessionStats.total_tokens) > 0 && (
//                             <div className="mt-4 pt-4 border-t-2 border-gray-300">
//                               <div className="flex justify-between items-center">
//                                 <span className="text-sm font-bold text-gray-900">Grand Total:</span>
//                                 <span className="text-lg font-bold text-blue-700">₹{(parseFloat(sessionStats.total_cost_inr) + parseFloat(documentAICost.cost_inr)).toFixed(4)}</span>
//                               </div>
//                               <p className="text-[10px] text-gray-500 mt-1">Document AI + LLM costs</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {file && (<div className="px-4 py-3 text-sm border-t bg-gray-50"><p className="text-gray-600 mb-2 font-medium">{file.name}</p></div>)}
//       <div className="p-4 border-t border-gray-200 bg-white">
//         <form onSubmit={handleSend} className="flex items-end space-x-2">
//           <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"><Plus className="h-5 w-5 text-gray-700" /></button>
//           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelection} multiple accept=".pdf,.docx,.txt" />
//           <div className="relative flex-shrink-0" ref={dropdownRef}>
//             <button type="button" onClick={() => setShowModelDropdown(!showModelDropdown)} className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors">
//               <span className="text-gray-700">{getModelInfo(selectedModel).name}</span>
//               <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
//             </button>
//             {showModelDropdown && (
//               <div className="absolute bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
//                 {llmModels.map((m) => { const Icon = m.icon; return (<button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }} className={`block w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${selectedModel === m.id ? 'bg-blue-50' : ''}`}><div className="flex items-center space-x-2"><Icon className={`h-4 w-4 ${m.color}`} /><span className="text-sm font-medium text-gray-900">{m.name}</span></div></button>); })}
//               </div>
//             )}
//           </div>
//           <textarea rows={1} value={chatInput} onChange={(e) => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} placeholder="Ask something..." className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-base leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ minHeight: "40px", maxHeight: "150px" }} />
//           {isProcessing ? (<button type="button" onClick={handleStopGeneration} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"><Square className="h-5 w-5" /></button>) : (<button type="submit" disabled={isProcessing || !chatInput.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"><Send className="h-5 w-5" /></button>)}
//         </form>
//         {files.length > 0 && (
//           <div className="mt-3 space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-xs font-medium text-gray-700">{files.length} file(s) ready</span>
//               <button onClick={handleFileUpload} disabled={isUploading} className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50">{isUploading ? 'Uploading...' : 'Upload'}</button>
//             </div>
//             {files.map((file, idx) => (<div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"><span className="truncate flex-1">{file.name}</span><button onClick={() => handleRemoveFile(idx)} disabled={isUploading}><X className="h-3 w-3 text-red-500" /></button></div>))}
//           </div>
//         )}
//       </div>
//     </div>
//     <div className="w-2/3 flex flex-col bg-white">
//       <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <Brain className="h-6 w-6 text-blue-600" />
//           <h2 className="text-lg font-semibold text-gray-900">AI Response</h2>
//           {selectedQuestionIndex !== null && messages[selectedQuestionIndex] && (
//             <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
//               {React.createElement(getModelInfo(messages[selectedQuestionIndex].model || 'gemini').icon, { className: `h-4 w-4 ${getModelInfo(messages[selectedQuestionIndex].model || 'gemini').color}` })}
//               <span className="text-sm text-gray-700 font-medium">{getModelInfo(messages[selectedQuestionIndex].model || 'gemini').name}</span>
//             </div>
//           )}
//         </div>
//         <div className="flex items-center space-x-2">
//           {selectedQuestionIndex !== null && (
//             <>
//               <button onClick={handleExportToPDF} disabled={isExportingPDF} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">{isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}<span>Export</span></button>
//               <button onClick={() => handleCopyAnswer(messages[selectedQuestionIndex].a, selectedQuestionIndex)} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">{copiedIndex === selectedQuestionIndex ? (<><Check className="h-4 w-4 text-green-600" /><span className="text-green-600">Copied!</span></>) : (<><Copy className="h-4 w-4" /><span>Copy</span></>)}</button>
//             </>
//           )}
//         </div>
//       </div>
//       <div className="flex-1 overflow-y-auto p-8 bg-white">
//         {selectedQuestionIndex !== null ? (
//           <div className="max-w-4xl mx-auto">
//             <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
//               <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wide mb-2">Question</p>
//               <p className="text-base text-gray-900 leading-relaxed font-medium">{messages[selectedQuestionIndex].q}</p>
//             </div>
//             <div className="prose prose-base max-w-none">
//               <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{isStreaming && selectedQuestionIndex === messages.length - 1 ? streamingText : messages[selectedQuestionIndex].a}</ReactMarkdown>
//               {isStreaming && selectedQuestionIndex === messages.length - 1 && (<span className="inline-block w-1.5 h-5 bg-blue-600 animate-pulse ml-0.5 rounded-sm align-middle"></span>)}
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full">
//             <div className="text-center space-y-3">
//               <Brain className="h-16 w-16 text-gray-300 mx-auto" />
//               <p className="text-xl text-gray-400 font-medium">Select a question to view the answer</p>
//               <p className="text-sm text-gray-400">Your AI-powered responses will appear here</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     {error && (<div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-lg z-50 max-w-md"><AlertCircle className="h-5 w-5 flex-shrink-0" /><span className="text-sm font-medium">{error}</span><button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button></div>)}
//     {success && (<div className="fixed bottom-6 right-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-lg z-50 max-w-md"><CheckCircle className="h-5 w-5 flex-shrink-0" /><span className="text-sm font-medium">{success}</span><button onClick={() => setSuccess(null)} className="ml-auto"><X className="h-4 w-4" /></button></div>)}
//   </div>
// );
// };

// export default AnalysisPage;




import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2, Send, Paperclip, ChevronDown, Brain, AlertCircle, CheckCircle,
  X, Copy, Check, Square, ArrowLeft, Plus, FileDown, FileText, Sparkles,
  Zap, FileType, MoreVertical, Upload
} from "lucide-react";

const AnalysisPage = () => {
  const { file_id, session_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionFromHistory = location.state?.session;

  // Add shimmer animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // All state variables
  const [fileId, setFileId] = useState(file_id || null);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadedFilesList, setUploadedFilesList] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [showSplit, setShowSplit] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [documentAICost, setDocumentAICost] = useState(null);
  const [showCostDropdown, setShowCostDropdown] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const costDropdownRef = useRef(null);
  const streamingIntervalRef = useRef(null);
  const processingTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

  // Updated LLM Models with GPT-4o
  const llmModels = [
    { id: "gemini", name: "Gemini 2.0 Flash", icon: Zap, color: "text-blue-600", description: "Fast & efficient" },
    { id: "gemini-pro-2.5", name: "Gemini 2.5 Pro", icon: Sparkles, color: "text-purple-600", description: "Advanced reasoning" },
    { id: "anthropic", name: "Claude 3.5 Haiku", icon: Zap, color: "text-orange-600", description: "Quick responses" },
    { id: "claude-sonnet-4", name: "Claude 4.0 Sonnet", icon: Brain, color: "text-indigo-600", description: "Most intelligent" },
    { id: "openai", name: "GPT-4o Mini", icon: Zap, color: "text-green-600", description: "Balanced performance" },
    { id: "gpt-4o", name: "GPT-4o", icon: Brain, color: "text-emerald-600", description: "Advanced intelligence" },
    { id: "deepseek", name: "DeepSeek Chat", icon: Brain, color: "text-teal-600", description: "Cost-effective" },
  ];

  const getAuthToken = () => {
    const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) return val;
    }
    return null;
  };

  const calculateSessionStats = (messages) => {
    if (!messages || messages.length === 0) return null;
    let totalPromptTokens = 0, totalCompletionTokens = 0, totalTokens = 0;
    let totalInputCost = 0, totalOutputCost = 0, totalCost = 0;
    messages.forEach((msg) => {
      totalPromptTokens += parseInt(msg.prompt_tokens) || 0;
      totalCompletionTokens += parseInt(msg.completion_tokens) || 0;
      totalTokens += parseInt(msg.total_tokens) || 0;
      totalInputCost += parseFloat(msg.input_cost_inr) || 0;
      totalOutputCost += parseFloat(msg.output_cost_inr) || 0;
      totalCost += parseFloat(msg.total_cost_inr) || 0;
    });
    return {
      total_messages: messages.length,
      total_prompt_tokens: totalPromptTokens,
      total_completion_tokens: totalCompletionTokens,
      total_tokens: totalTokens,
      total_input_cost_inr: totalInputCost.toFixed(4),
      total_output_cost_inr: totalOutputCost.toFixed(4),
      total_cost_inr: totalCost.toFixed(4)
    };
  };

  const getModelInfo = (modelId) => llmModels.find(m => m.id === modelId) || llmModels[0];

  // Helper function to format time
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const fetchDocumentAICost = async (fileId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/doc/document-ai-cost/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.document_ai_cost) setDocumentAICost(data.document_ai_cost);
      }
    } catch (err) {
      console.error('Error fetching Document AI cost:', err);
    }
  };

  const handleFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => formData.append("documents", file));

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        if (data.files && data.files.length > 0) {
          const firstFileId = data.files[0].fileId;
          setFileId(firstFileId);
          setUploadedFilesList(files.map((f, i) => ({
            name: f.name, size: f.size, fileId: data.files[i]?.fileId || null
          })));
          setFile({ name: data.files.length === 1 ? files[0].name : `${files.length} files uploaded` });
          
          // Calculate estimated processing time based on pages
          const pages = data.total_pages || 0;
          setTotalPages(pages);
          // Estimate: ~2-3 seconds per page for OCR processing
          const estimatedSeconds = Math.ceil(pages * 2.5);
          setEstimatedTime(estimatedSeconds);
          
          if (data.total_cost_inr) {
            setDocumentAICost({
              pages: data.total_pages,
              cost_inr: data.total_cost_inr.toFixed(2),
              cost_usd: data.total_cost_usd.toFixed(3),
              tier: data.files[0]?.tier || 'standard'
            });
          }
          setSuccess(`${files.length} file(s) uploaded successfully!`);
          setIsUploading(false);
          setFiles([]);
          pollProcessingStatus(firstFileId);
        } else {
          setError("Upload succeeded but no file data returned");
          setIsUploading(false);
        }
      } else {
        setError(`Upload failed: ${xhr.status}`);
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      setError("Upload failed due to network error.");
      setIsUploading(false);
    };

    const token = getAuthToken();
    xhr.open("POST", `${API_BASE_URL}/api/doc/batch-upload`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  };

  const pollProcessingStatus = (id) => {
    setProcessingStatus({ status: "batch_processing" });
    setProcessingProgress(0);
    setProcessingTime(0);
    setProcessingStartTime(Date.now());
    
    let tries = 0;
    const maxTries = 100;
    let lastProgressUpdate = 0;
    let progressVelocity = 0;
    
    // Timer to update elapsed time
    processingTimerRef.current = setInterval(() => {
      setProcessingTime(prev => {
        const newTime = prev + 1;
        
        // Dynamic time estimation adjustment
        setProcessingProgress(currentProgress => {
          // Calculate progress velocity (progress per second)
          const progressChange = currentProgress - lastProgressUpdate;
          lastProgressUpdate = currentProgress;
          
          if (progressChange > 0) {
            progressVelocity = progressChange;
          }
          
          // If we're going slower than expected, adjust estimated time
          if (newTime > 5 && currentProgress < 90) {
            const projectedTotalTime = (newTime / currentProgress) * 100;
            if (projectedTotalTime > (estimatedTime || 30)) {
              setEstimatedTime(Math.ceil(projectedTotalTime * 1.1)); // Add 10% buffer
            }
          }
          
          return currentProgress;
        });
        
        return newTime;
      });
    }, 1000);
    
    // Progress bar animation (simulated smooth progress based on estimated time)
    const estimatedDuration = estimatedTime || 30;
    const progressIncrement = 85 / (estimatedDuration * 2); // Reach 85% by estimated time
    
    progressIntervalRef.current = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev < 85) {
          // Slow down progress as it approaches estimated time
          const currentTime = (Date.now() - (processingStartTime || Date.now())) / 1000;
          const timeRatio = currentTime / (estimatedTime || 30);
          
          let increment = progressIncrement;
          
          // Adjust increment based on time ratio
          if (timeRatio > 0.8) {
            increment = progressIncrement * 0.3; // Slow down significantly
          } else if (timeRatio > 0.6) {
            increment = progressIncrement * 0.6;
          }
          
          return Math.min(prev + increment, 85);
        } else if (prev < 95) {
          // Very slow progress between 85-95%
          return prev + 0.1;
        }
        return prev;
      });
    }, 500);
    
    const interval = setInterval(async () => {
      tries++;
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/api/doc/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProcessingStatus(data);
        
        if (data.status === "processed") {
          clearInterval(interval);
          clearInterval(processingTimerRef.current);
          clearInterval(progressIntervalRef.current);
          setProcessingProgress(100);
          const finalTime = Math.floor((Date.now() - (processingStartTime || Date.now())) / 1000);
          setSuccess(`Document processed successfully in ${formatTime(finalTime)}!`);
          
          // Reset after 3 seconds
          setTimeout(() => {
            setProcessingProgress(0);
            setProcessingTime(0);
            setProcessingStartTime(null);
            setEstimatedTime(null);
          }, 3000);
        }
        
        if (data.status === "error" || tries > maxTries) {
          clearInterval(interval);
          clearInterval(processingTimerRef.current);
          clearInterval(progressIntervalRef.current);
          setError("Processing failed or timed out.");
          setProcessingProgress(0);
          setProcessingTime(0);
          setProcessingStartTime(null);
          setEstimatedTime(null);
        }
      } catch (err) {
        clearInterval(interval);
        clearInterval(processingTimerRef.current);
        clearInterval(progressIntervalRef.current);
        setError("Error while checking status.");
        setProcessingProgress(0);
        setProcessingTime(0);
        setProcessingStartTime(null);
        setEstimatedTime(null);
      }
    }, 2000);
  };

  const animateResponse = (text) => {
    return new Promise((resolve) => {
      setIsStreaming(true);
      setStreamingText("");
      let currentIndex = 0;
      streamingIntervalRef.current = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex += 3;
          setStreamingText(text.slice(0, currentIndex));
        } else {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
          setIsStreaming(false);
          setStreamingText("");
          resolve();
        }
      }, 20);
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!fileId) return setError("Upload a document first.");
    if (processingStatus?.status !== "processed") return setError("Document not ready yet.");
    if (!chatInput.trim()) return;

    setIsProcessing(true);
    setError(null);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/doc/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          file_id: fileId,
          question: chatInput,
          llmModelName: selectedModel,
          used_secret_prompt: false,
          session_id: session_id || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const answer = data.answer || data.response || "No response";

      if (data.sessionStats) setSessionStats(data.sessionStats);
      if (!showSplit) setShowSplit(true);

      const newMessage = { q: chatInput, a: answer, tokenUsage: data.tokenUsage, model: selectedModel };
      setMessages((prev) => [...prev, newMessage]);
      setSelectedQuestionIndex(messages.length);
      setChatInput("");
      
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.style.height = 'auto';
      
      await animateResponse(answer);
      setSuccess("Response generated!");
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Generation stopped");
      } else {
        setError(err.message);
      }
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsProcessing(false);
      setIsStreaming(false);
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
    }
  };

  const handleCopyAnswer = async (answerText, index) => {
    try {
      await navigator.clipboard.writeText(answerText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      setError("Failed to copy text");
    }
  };

  const handleNewChat = () => {
    navigate("/analysis");
    setMessages([]);
    setSelectedQuestionIndex(null);
    setFileId(null);
    setFile(null);
    setFiles([]);
    setUploadedFilesList([]);
    setShowSplit(false);
    setProcessingStatus(null);
    setStreamingText("");
    setIsStreaming(false);
    setSessionStats(null);
    setDocumentAICost(null);
    setShowCostDropdown(false);
    setProcessingProgress(0);
    setProcessingTime(0);
    setProcessingStartTime(null);
    setEstimatedTime(null);
    setTotalPages(0);
    
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    if (processingTimerRef.current) {
      clearInterval(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleBackToHistory = () => navigate("/chats");

//   const handleExportToPDF = async () => {
//     if (selectedQuestionIndex === null) {
//       setError("Please select a question to export");
//       return;
//     }
//     setIsExportingPDF(true);
//     try {
//       const jsPDF = (await import('jspdf')).default;
//       const autoTable = (await import('jspdf-autotable')).default;

//       const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margins = { left: 15, right: 15, top: 15, bottom: 15 };
//       const contentWidth = pageWidth - margins.left - margins.right;
//       let yPos = margins.top;

//       const checkNewPage = (requiredSpace = 10) => {
//         if (yPos > pageHeight - margins.bottom - requiredSpace) {
//           doc.addPage();
//           yPos = margins.top;
//           return true;
//         }
//         return false;
//       };

//       // Helper function to clean text - remove markdown and HTML tags
//       const cleanText = (text) => {
//         return text
//           .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold **text**
//           .replace(/__(.+?)__/g, '$1')      // Remove bold __text__
//           .replace(/\*(.+?)\*/g, '$1')      // Remove italic *text*
//           .replace(/_(.+?)_/g, '$1')        // Remove italic _text_
//           .replace(/`(.+?)`/g, '$1')        // Remove inline code `text`
//           .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')  // Remove links [text](url)
//           .replace(/<br\s*\/?>/gi, ' ')     // Replace <br> with space
//           .replace(/<\/br>/gi, ' ')         // Replace </br> with space
//           .replace(/<[^>]+>/g, '')          // Remove all other HTML tags
//           .trim();
//       };

//       // Title
//       doc.setFontSize(22);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(30, 30, 30);
//       doc.text('Legal Analysis Report', margins.left, yPos);
//       yPos += 12;

//       // Metadata
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(100, 100, 100);
//       doc.text(`Generated: ${new Date().toLocaleString()}`, margins.left, yPos);
//       yPos += 5;
//       const modelInfo = getModelInfo(messages[selectedQuestionIndex].model || 'gemini');
//       doc.text(`Model: ${modelInfo.name}`, margins.left, yPos);
//       yPos += 10;

//       // Separator
//       doc.setDrawColor(180, 180, 180);
//       doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
//       yPos += 10;

//       const answerText = messages[selectedQuestionIndex].a;
//       const lines = answerText.split('\n');
//       let inCodeBlock = false;
//       let inTable = false;
//       let tableRows = [];

//       for (let i = 0; i < lines.length; i++) {
//         let line = lines[i];

//         // Handle code blocks
//         if (line.trim().startsWith('```')) {
//           inCodeBlock = !inCodeBlock;
//           if (!inCodeBlock) yPos += 6;
//           continue;
//         }

//         if (inCodeBlock) {
//           checkNewPage(10);
//           doc.setFillColor(245, 245, 245);
//           doc.rect(margins.left, yPos - 4, contentWidth, 7, 'F');
//           doc.setFont('courier', 'normal');
//           doc.setFontSize(9);
//           doc.setTextColor(50, 50, 50);
//           doc.text(line, margins.left + 2, yPos);
//           doc.setFont('helvetica', 'normal');
//           yPos += 6;
//           continue;
//         }

//         // Table detection and handling
//         if (line.includes('|') && line.trim().startsWith('|')) {
//           if (!inTable) {
//             inTable = true;
//             tableRows = [];
//           }
//           if (line.includes('---')) continue;

//           const cells = line.split('|')
//             .map(c => cleanText(c))  // Clean each cell
//             .filter(Boolean);
          
//           if (cells.length > 0) {
//             tableRows.push(cells);
//           }
//           continue;
//         } else if (inTable && tableRows.length > 0) {
//           // Render the table
//           const estimatedHeight = tableRows.length * 15 + 25;
//           checkNewPage(estimatedHeight);
          
//           const headers = tableRows[0];
//           const body = tableRows.slice(1);
          
//           if (body.length > 0) {
//             autoTable(doc, {
//               head: [headers],
//               body: body,
//               startY: yPos,
//               margin: { left: margins.left, right: margins.right },
//               theme: 'grid',
//               styles: {
//                 fontSize: 9,
//                 cellPadding: 3,
//                 lineColor: [200, 200, 200],
//                 lineWidth: 0.5,
//                 textColor: [40, 40, 40],
//                 fontStyle: 'normal',
//                 overflow: 'linebreak',
//                 cellWidth: 'wrap',
//                 valign: 'top',
//                 halign: 'left'
//               },
//               headStyles: {
//                 fillColor: [240, 240, 245],
//                 textColor: [30, 30, 30],
//                 fontStyle: 'bold',
//                 halign: 'left',
//                 fontSize: 10,
//                 cellPadding: 4
//               },
//               bodyStyles: {
//                 textColor: [40, 40, 40],
//                 fontSize: 9,
//                 cellPadding: 3
//               },
//               alternateRowStyles: {
//                 fillColor: [250, 250, 252]
//               },
//               columnStyles: {
//                 0: { cellWidth: 'auto', minCellWidth: 35 },
//                 1: { cellWidth: 'auto', minCellWidth: 100 }
//               },
//               didDrawPage: function(data) {
//                 // Handle page overflow
//               }
//             });
            
//             yPos = doc.lastAutoTable.finalY + 10;
//           }
          
//           inTable = false;
//           tableRows = [];
//           continue;
//         }

//         // Skip empty lines
//         if (!line.trim()) {
//           yPos += 4;
//           continue;
//         }

//         // Handle headers
//         let headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
//         if (headerMatch) {
//           const level = headerMatch[1].length;
//           const text = cleanText(headerMatch[2]);
//           checkNewPage(12);
          
//           const sizes = { 1: 16, 2: 14, 3: 13, 4: 12, 5: 11, 6: 11 };
//           doc.setFontSize(sizes[level]);
//           doc.setFont('helvetica', 'bold');
//           doc.setTextColor(30, 30, 30);
//           doc.text(text, margins.left, yPos);
//           yPos += (level === 1 ? 10 : level === 2 ? 9 : 8);
//           doc.setFont('helvetica', 'normal');
//           doc.setTextColor(40, 40, 40);
//           continue;
//         }

//         // Handle lists (bullets and numbered)
//         const listMatch = line.match(/^(\s*)([-*•]|\d+\.)\s+(.+)$/);
//         if (listMatch) {
//           checkNewPage(8);
//           const indent = (listMatch[1].length / 2) * 4;
//           const bullet = listMatch[2].startsWith('•') || listMatch[2].startsWith('-') || listMatch[2].startsWith('*') ? '• ' : listMatch[2] + ' ';
//           const content = cleanText(listMatch[3]);
          
//           const wrappedLines = doc.splitTextToSize(bullet + content, contentWidth - indent - 4);
          
//           doc.setFontSize(11);
//           doc.setTextColor(40, 40, 40);
//           wrappedLines.forEach((wLine, idx) => {
//             checkNewPage(8);
//             doc.text(wLine, margins.left + indent + (idx === 0 ? 0 : 4), yPos);
//             yPos += 6;
//           });
//           continue;
//         }

//         // Clean and render regular paragraph
//         const cleanedLine = cleanText(line);
        
//         if (cleanedLine.trim()) {
//           const wrappedLines = doc.splitTextToSize(cleanedLine, contentWidth);
//           doc.setFontSize(11);
//           doc.setFont('helvetica', 'normal');
//           doc.setTextColor(40, 40, 40);
          
//           wrappedLines.forEach(wLine => {
//             checkNewPage(8);
//             doc.text(wLine, margins.left, yPos);
//             yPos += 6.5;
//           });
//           yPos += 3;
//         }
//       }

//       // Render any remaining table at the end
//       if (inTable && tableRows.length > 0) {
//         const estimatedHeight = tableRows.length * 15 + 25;
//         checkNewPage(estimatedHeight);
        
//         const headers = tableRows[0];
//         const body = tableRows.slice(1);
        
//         if (body.length > 0) {
//           autoTable(doc, {
//             head: [headers],
//             body: body,
//             startY: yPos,
//             margin: { left: margins.left, right: margins.right },
//             theme: 'grid',
//             styles: {
//               fontSize: 9,
//               cellPadding: 3,
//               lineColor: [200, 200, 200],
//               lineWidth: 0.5,
//               textColor: [40, 40, 40],
//               overflow: 'linebreak',
//               cellWidth: 'wrap',
//               valign: 'top',
//               halign: 'left'
//             },
//             headStyles: {
//               fillColor: [240, 240, 245],
//               textColor: [30, 30, 30],
//               fontStyle: 'bold',
//               fontSize: 10,
//               cellPadding: 4
//             },
//             bodyStyles: {
//               textColor: [40, 40, 40],
//               fontSize: 9,
//               cellPadding: 3
//             },
//             columnStyles: {
//               0: { cellWidth: 'auto', minCellWidth: 35 },
//               1: { cellWidth: 'auto', minCellWidth: 100 }
//             }
//           });
//         }
//       }

//       doc.save(`Legal_Analysis_${new Date().getTime()}.pdf`);
//       setSuccess("PDF exported successfully!");
//     } catch (err) {
//       console.error("PDF Export Error:", err);
//       setError("Failed to export PDF: " + err.message);
//     } finally {
//       setIsExportingPDF(false);
//     }
//   };

  // Claude-like markdown styling with larger font sizes
  

const handleExportToPDF = async () => {
  if (selectedQuestionIndex === null) {
    setError("Please select a question to export");
    return;
  }

  setIsExportingPDF(true);

  try {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = { left: 18, right: 18, top: 20, bottom: 15 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let yPos = margins.top;

    // Helper: Clean markdown / HTML tags
    const cleanText = (text) =>
      text
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .replace(/<[^>]+>/g, "")
        .trim();

    const checkNewPage = (needed = 15) => {
      if (yPos > pageHeight - margins.bottom - needed) {
        doc.addPage();
        yPos = margins.top;
      }
    };

    // ---------- Title ----------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text("Legal Analysis Report", margins.left, yPos);
    yPos += 12;

    // ---------- Metadata ----------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margins.left, yPos);
    yPos += 5;
    const modelInfo = getModelInfo(messages[selectedQuestionIndex].model || "gemini");
    doc.text(`Model: ${modelInfo.name}`, margins.left, yPos);
    yPos += 10;

    // ---------- Separator ----------
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
    yPos += 10;

    // ---------- Content ----------
    const answerText = messages[selectedQuestionIndex].a;
    const lines = answerText.split("\n");
    let inTable = false;
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect table start
      if (line.includes("|") && line.trim().startsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (line.includes("---")) continue;
        const cells = line.split("|").map((c) => cleanText(c)).filter(Boolean);
        if (cells.length > 0) tableRows.push(cells);
        continue;
      }

      // Render table when block ends
      if (inTable && tableRows.length > 0) {
        const headers = tableRows[0];
        const body = tableRows.slice(1);

        autoTable(doc, {
          head: [headers],
          body,
          startY: yPos,
          margin: { left: margins.left, right: margins.right },
          tableWidth: "wrap",
          theme: "grid",
          styles: {
            fontSize: 9.5,
            cellPadding: 3,
            overflow: "linebreak",
            textColor: [40, 40, 40],
            lineColor: [220, 220, 220],
            valign: "top",
          },
          headStyles: {
            fillColor: [240, 240, 245],
            textColor: [15, 15, 15],
            fontStyle: "bold",
            halign: "left",
            fontSize: 10.5,
            lineWidth: 0.1,
          },
          bodyStyles: {
            textColor: [40, 40, 40],
            fontSize: 9.5,
            cellPadding: 3,
          },
          alternateRowStyles: {
            fillColor: [252, 252, 252],
          },
          columnStyles: {
            0: { cellWidth: 35 },  // Module
            1: { cellWidth: 70 },  // Learning Objectives
            2: { cellWidth: 70 },  // Specific Topics
          },
          didDrawPage: (data) => {},
        });

        yPos = doc.lastAutoTable.finalY + 10;
        inTable = false;
        tableRows = [];
        continue;
      }

      // Empty line spacing
      if (!line.trim()) {
        yPos += 4;
        continue;
      }

      // Section Headers (#)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = cleanText(headerMatch[2]);
        checkNewPage(12);
        const sizeMap = { 1: 14, 2: 13, 3: 12, 4: 11 };
        doc.setFontSize(sizeMap[level] || 11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(text, margins.left, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
        continue;
      }

      // Lists (- or •)
      const listMatch = line.match(/^(\s*)([-*•]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const indent = (listMatch[1].length / 2) * 4;
        const bullet = listMatch[2].match(/\d+\./) ? listMatch[2] + " " : "• ";
        const content = cleanText(listMatch[3]);
        const wrapped = doc.splitTextToSize(bullet + content, contentWidth - indent - 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(40, 40, 40);
        wrapped.forEach((line, idx) => {
          checkNewPage(8);
          doc.text(line, margins.left + indent, yPos);
          yPos += 6;
        });
        yPos += 2;
        continue;
      }

      // Normal paragraphs
      const cleaned = cleanText(line);
      if (cleaned.trim()) {
        const wrapped = doc.splitTextToSize(cleaned, contentWidth);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 30);
        wrapped.forEach((w) => {
          checkNewPage(8);
          doc.text(w, margins.left, yPos);
          yPos += 6;
        });
        yPos += 4;
      }
    }

    doc.save(`Legal_Analysis_${new Date().getTime()}.pdf`);
    setSuccess("PDF exported successfully!");
  } catch (err) {
    console.error("PDF Export Error:", err);
    setError("Failed to export PDF: " + err.message);
  } finally {
    setIsExportingPDF(false);
  }
};


  
  const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-[32px] font-semibold text-[#2C2D30] mt-6 mb-4 leading-[1.3] tracking-[-0.01em]" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-[28px] font-semibold text-[#2C2D30] mt-5 mb-3 leading-[1.3] tracking-[-0.01em]" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-[24px] font-semibold text-[#2C2D30] mt-4 mb-2.5 leading-[1.4]" {...props} />,
    p: ({ node, ...props }) => <p className="text-[17px] text-[#2C2D30] leading-[1.7] my-3 font-normal" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2 my-4 ml-6 text-[#2C2D30]" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2 my-4 ml-6 text-[#2C2D30]" {...props} />,
    li: ({ node, ...props }) => <li className="text-[17px] text-[#2C2D30] leading-[1.65] pl-1.5" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold text-[#1a1a1a]" {...props} />,
    em: ({ node, ...props }) => <em className="italic text-[#2C2D30]" {...props} />,
    br: ({ node, ...props }) => <span className="block h-2" />,
    code: ({ node, inline, ...props }) => 
      inline 
        ? <code className="bg-[#F3F3F3] text-[#C7254E] px-1.5 py-0.5 rounded text-[15px] font-mono border border-[#E5E5E5]" {...props} /> 
        : <code className="block bg-[#2C2D30] text-[#E8E8E8] p-4 rounded-lg overflow-x-auto text-[14px] font-mono my-4 leading-[1.5] border border-[#3E3F42]" {...props} />,
    pre: ({ node, ...props }) => <pre className="my-4 rounded-lg overflow-hidden" {...props} />,
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-5 rounded-lg border border-[#E0E0E0] shadow-sm">
        <table className="min-w-full divide-y divide-[#E0E0E0] bg-white text-[16px]" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-[#F8F9FA]" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-[#E8E8E8] bg-white" {...props} />,
    th: ({ node, ...props }) => (
      <th className="px-5 py-4 text-left text-[14px] font-semibold text-[#2C2D30] uppercase tracking-wide border-r border-[#E0E0E0] last:border-r-0" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-5 py-4 text-[16px] text-[#2C2D30] border-r border-[#E8E8E8] last:border-r-0" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-[#A8A8A8] pl-4 my-4 italic text-[#5A5A5A] bg-[#F9F9F9] py-2 rounded-r text-[17px]" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-[#0066CC] hover:text-[#0052A3] underline decoration-1 underline-offset-2" {...props} />
    ),
  };

  useEffect(() => {
    if (sessionFromHistory && sessionFromHistory.messages) {
      const loadedMessages = sessionFromHistory.messages.map((msg) => ({ 
        q: msg.question, 
        a: msg.answer, 
        tokenUsage: { 
          promptTokens: parseInt(msg.prompt_tokens) || 0, 
          completionTokens: parseInt(msg.completion_tokens) || 0, 
          totalTokens: parseInt(msg.total_tokens) || 0, 
          inputCostINR: parseFloat(msg.input_cost_inr) || 0, 
          outputCostINR: parseFloat(msg.output_cost_inr) || 0, 
          totalCostINR: parseFloat(msg.total_cost_inr) || 0 
        }, 
        model: msg.llm_model_name || 'gemini' 
      }));
      const calculatedStats = calculateSessionStats(sessionFromHistory.messages);
      if (calculatedStats) setSessionStats(calculatedStats);
      if (sessionFromHistory.document_ai_cost) { 
        setDocumentAICost(sessionFromHistory.document_ai_cost); 
      } else if (sessionFromHistory.file_id) { 
        fetchDocumentAICost(sessionFromHistory.file_id); 
      }
      setMessages(loadedMessages);
      setFileId(sessionFromHistory.file_id);
      setShowSplit(true);
      setSelectedQuestionIndex(loadedMessages.length - 1);
      setProcessingStatus({ status: "processed" });
      setFile({ name: sessionFromHistory.file_id ? `Document ${sessionFromHistory.file_id}` : "Document" });
    }
  }, [sessionFromHistory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (costDropdownRef.current && !costDropdownRef.current.contains(event.target)) setShowCostDropdown(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowModelDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimerRef.current) clearInterval(processingTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, []);

  // RENDERING STARTS HERE - WELCOME SCREEN
  if (!showSplit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
        {session_id && (
          <button onClick={handleBackToHistory} className="absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all z-10">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to History</span>
          </button>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Smart Legal Insights</h1>
          <p className="text-xl text-gray-600">Upload documents and get intelligent answers powered by AI</p>
        </div>
        {uploadedFilesList.length > 0 && (
          <div className="w-full max-w-4xl mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Uploaded Files</h3>
                <span className="text-xs text-gray-500">{uploadedFilesList.length} file(s)</span>
              </div>
              <div className="space-y-2">
                {uploadedFilesList.map((file, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="w-full max-w-4xl">
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg overflow-visible">
            {files.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{files.length} file{files.length > 1 ? 's' : ''} attached</span>
                  <button onClick={handleFileUpload} disabled={isUploading} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {isUploading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>{uploadProgress}%</span></>) : (<><Upload className="h-4 w-4" /><span>Upload</span></>)}
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFile(idx)} disabled={isUploading} className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0">
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
                {isUploading && (
                  <div className="mt-3">
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center space-x-3 p-6">
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0" title="Attach files">
                <Paperclip className="h-6 w-6 text-gray-600" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelection} multiple accept=".pdf,.docx,.txt" />
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button type="button" onClick={() => setShowModelDropdown(!showModelDropdown)} className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl bg-white text-base font-medium hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">{getModelInfo(selectedModel).name}</span>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </button>
                {showModelDropdown && (
                  <div className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {llmModels.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }} className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedModel === m.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${m.color}`} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500">{m.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <textarea rows={1} value={chatInput} onChange={(e) => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} placeholder={!file ? "Upload documents to start..." : "Ask me anything about your documents..."} className="flex-1 resize-none bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none py-3 leading-6" style={{ minHeight: "56px", maxHeight: "200px" }} disabled={!file || processingStatus?.status !== "processed"} />
              <button onClick={handleSend} disabled={!file || isProcessing || processingStatus?.status !== "processed" || !chatInput.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {file && (
            <div className="mt-6 text-center">
              {processingStatus?.status === "batch_processing" && (
                <div className="space-y-3">
                  {/* Circular Spinner like ChatGPT - Smaller Size */}
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="relative w-12 h-12">
                      {/* Background Circle */}
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          fill="none"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#3B82F6"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          strokeDashoffset={`${2 * Math.PI * 20 * (1 - processingProgress / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-300 ease-out"
                        />
                      </svg>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-gray-700">
                          {Math.round(processingProgress)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Processing Info */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                        <span className="font-medium">Processing {totalPages} page{totalPages !== 1 ? 's' : ''}</span>
                      </div>
                      
                      {/* Time Display with Minutes Format */}
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-blue-600">{formatTime(processingTime)}</span>
                        {estimatedTime && (
                          <span> / ~{formatTime(estimatedTime)}</span>
                        )}
                        {estimatedTime && processingTime > 0 && processingProgress < 95 && (
                          <span className="ml-2 text-gray-400">
                            (~{formatTime(Math.max(0, estimatedTime - processingTime))} left)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Processing Stage Messages */}
                  <p className="text-xs text-gray-400 italic">
                    {processingProgress < 20 && "Initializing document analysis..."}
                    {processingProgress >= 20 && processingProgress < 45 && "Analyzing document structure..."}
                    {processingProgress >= 45 && processingProgress < 70 && "Extracting text with OCR..."}
                    {processingProgress >= 70 && processingProgress < 90 && "Finalizing processing..."}
                    {processingProgress >= 90 && processingProgress < 100 && "Almost done..."}
                    {processingProgress === 100 && "Complete!"}
                  </p>
                </div>
              )}
              {processingStatus?.status === "processed" && (
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to chat!</span>
                </div>
              )}
              {processingStatus?.status === "error" && (
                <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Processing failed</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SPLIT VIEW - CHAT INTERFACE
  return (
    <div className="flex h-screen bg-white">
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleNewChat} className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><Plus className="h-4 w-4" /><span>New</span></button>
            <button onClick={handleBackToHistory} className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="h-4 w-4" /></button>
          </div>
        </div>
        {uploadedFilesList.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents</h3>
            <div className="space-y-1.5">
              {uploadedFilesList.map((file, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => {
            const modelInfo = getModelInfo(m.model || 'gemini');
            const ModelIcon = modelInfo.icon;
            return (
              <div key={i} className={`p-3 rounded-lg shadow-sm text-sm transition-colors relative ${i === selectedQuestionIndex ? "bg-white border-2 border-blue-500 shadow-md" : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>
                <div className="pr-16 cursor-pointer" onClick={() => setSelectedQuestionIndex(i)}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-gray-900">Q{i + 1}</span>
                    <ModelIcon className={`h-3 w-3 ${modelInfo.color}`} />
                    <span className="text-xs text-gray-500">{modelInfo.name}</span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">{m.q}</p>
                </div>
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  {m.tokenUsage && m.tokenUsage.totalTokens > 0 && (<div className="text-[10px] text-gray-400">{m.tokenUsage.totalTokens.toLocaleString()}</div>)}
                  {(documentAICost || sessionStats) && i === messages.length - 1 && (
                    <div className="relative" ref={i === messages.length - 1 ? costDropdownRef : null}>
                      <button onClick={(e) => { e.stopPropagation(); setShowCostDropdown(!showCostDropdown); }} className="p-1 hover:bg-gray-200 rounded transition-colors"><MoreVertical className="h-4 w-4 text-gray-500" /></button>
                      {showCostDropdown && (
                        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
                              <button onClick={(e) => { e.stopPropagation(); setShowCostDropdown(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                            </div>
                            {documentAICost && (
                              <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2"><FileType className="h-5 w-5 text-indigo-600" /><span className="text-sm font-semibold text-gray-800">Document AI</span></div>
                                  <span className="text-sm font-bold text-green-700">₹{documentAICost.cost_inr}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="flex justify-between"><span className="text-gray-600">Pages:</span><span className="font-semibold text-gray-900">{documentAICost.pages}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">USD Cost:</span><span className="font-semibold text-gray-900">${documentAICost.cost_usd}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Tier:</span><span className="font-semibold text-gray-900 capitalize">{documentAICost.tier}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Processor:</span><span className="font-semibold text-gray-900">OCR</span></div>
                                </div>
                              </div>
                            )}
                            {sessionStats && parseInt(sessionStats.total_tokens) > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3"><Brain className="h-5 w-5 text-blue-600" /><span className="text-sm font-semibold text-gray-800">LLM Usage</span></div>
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between text-xs"><span className="text-gray-600">Total Queries:</span><span className="font-semibold text-gray-900">{sessionStats.total_messages}</span></div>
                                  <div className="flex justify-between text-xs"><span className="text-gray-600">Input Tokens:</span><span className="font-semibold text-gray-900">{parseInt(sessionStats.total_prompt_tokens).toLocaleString()}</span></div>
                                  <div className="flex justify-between text-xs"><span className="text-gray-600">Output Tokens:</span><span className="font-semibold text-gray-900">{parseInt(sessionStats.total_completion_tokens).toLocaleString()}</span></div>
                                  <div className="flex justify-between text-xs pt-2 border-t border-gray-200"><span className="text-gray-700 font-medium">Total Tokens:</span><span className="font-bold text-gray-900">{parseInt(sessionStats.total_tokens).toLocaleString()}</span></div>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="font-semibold text-gray-800 mb-2 text-xs">Cost Details</p>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-gray-600">Input Cost:</span><span className="font-semibold text-green-700">₹{parseFloat(sessionStats.total_input_cost_inr).toFixed(4)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-gray-600">Output Cost:</span><span className="font-semibold text-green-700">₹{parseFloat(sessionStats.total_output_cost_inr).toFixed(4)}</span></div>
                                    <div className="flex justify-between text-xs pt-2 border-t border-gray-200"><span className="text-gray-700 font-medium">LLM Total:</span><span className="font-bold text-green-800">₹{parseFloat(sessionStats.total_cost_inr).toFixed(4)}</span></div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {documentAICost && sessionStats && parseInt(sessionStats.total_tokens) > 0 && (
                              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-bold text-gray-900">Grand Total:</span>
                                  <span className="text-lg font-bold text-blue-700">₹{(parseFloat(sessionStats.total_cost_inr) + parseFloat(documentAICost.cost_inr)).toFixed(4)}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Document AI + LLM costs</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {file && (<div className="px-4 py-3 text-sm border-t bg-gray-50"><p className="text-gray-600 mb-2 font-medium">{file.name}</p></div>)}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSend} className="flex items-end space-x-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"><Plus className="h-5 w-5 text-gray-700" /></button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelection} multiple accept=".pdf,.docx,.txt" />
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button type="button" onClick={() => setShowModelDropdown(!showModelDropdown)} className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors">
                <span className="text-gray-700">{getModelInfo(selectedModel).name}</span>
                <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
              </button>
              {showModelDropdown && (
                <div className="absolute bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
                  {llmModels.map((m) => { const Icon = m.icon; return (<button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }} className={`block w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${selectedModel === m.id ? 'bg-blue-50' : ''}`}><div className="flex items-center space-x-2"><Icon className={`h-4 w-4 ${m.color}`} /><span className="text-sm font-medium text-gray-900">{m.name}</span></div></button>); })}
                </div>
              )}
            </div>
            <textarea rows={1} value={chatInput} onChange={(e) => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} placeholder="Ask something..." className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-base leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ minHeight: "40px", maxHeight: "150px" }} />
            {isProcessing ? (<button type="button" onClick={handleStopGeneration} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"><Square className="h-5 w-5" /></button>) : (<button type="submit" disabled={isProcessing || !chatInput.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"><Send className="h-5 w-5" /></button>)}
          </form>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{files.length} file(s) ready</span>
                <button onClick={handleFileUpload} disabled={isUploading} className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50">{isUploading ? 'Uploading...' : 'Upload'}</button>
              </div>
              {files.map((file, idx) => (<div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"><span className="truncate flex-1">{file.name}</span><button onClick={() => handleRemoveFile(idx)} disabled={isUploading}><X className="h-3 w-3 text-red-500" /></button></div>))}
            </div>
          )}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Response</h2>
            {selectedQuestionIndex !== null && messages[selectedQuestionIndex] && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                {React.createElement(getModelInfo(messages[selectedQuestionIndex].model || 'gemini').icon, { className: `h-4 w-4 ${getModelInfo(messages[selectedQuestionIndex].model || 'gemini').color}` })}
                <span className="text-sm text-gray-700 font-medium">{getModelInfo(messages[selectedQuestionIndex].model || 'gemini').name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedQuestionIndex !== null && (
              <>
                <button onClick={handleExportToPDF} disabled={isExportingPDF} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">{isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}<span>Export</span></button>
                <button onClick={() => handleCopyAnswer(messages[selectedQuestionIndex].a, selectedQuestionIndex)} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">{copiedIndex === selectedQuestionIndex ? (<><Check className="h-4 w-4 text-green-600" /><span className="text-green-600">Copied!</span></>) : (<><Copy className="h-4 w-4" /><span>Copy</span></>)}</button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {selectedQuestionIndex !== null ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wide mb-2">Question</p>
                <p className="text-[17px] text-[#2C2D30] leading-relaxed font-medium">{messages[selectedQuestionIndex].q}</p>
              </div>
              <div className="prose prose-base max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{isStreaming && selectedQuestionIndex === messages.length - 1 ? streamingText : messages[selectedQuestionIndex].a}</ReactMarkdown>
                {isStreaming && selectedQuestionIndex === messages.length - 1 && (<span className="inline-block w-1.5 h-5 bg-blue-600 animate-pulse ml-0.5 rounded-sm align-middle"></span>)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Brain className="h-16 w-16 text-gray-300 mx-auto" />
                <p className="text-xl text-gray-400 font-medium">Select a question to view the answer</p>
                <p className="text-sm text-gray-400">Your AI-powered responses will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {error && (<div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-lg z-50 max-w-md"><AlertCircle className="h-5 w-5 flex-shrink-0" /><span className="text-sm font-medium">{error}</span><button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button></div>)}
      {success && (<div className="fixed bottom-6 right-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-lg z-50 max-w-md"><CheckCircle className="h-5 w-5 flex-shrink-0" /><span className="text-sm font-medium">{success}</span><button onClick={() => setSuccess(null)} className="ml-auto"><X className="h-4 w-4" /></button></div>)}
    </div>
  );
};

export default AnalysisPage;

