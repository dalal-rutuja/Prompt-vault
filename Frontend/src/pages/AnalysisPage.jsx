

// import React, { useState, useRef, useEffect } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import {
//   Loader2,
//   Send,
//   Paperclip,
//   ChevronDown,
//   Brain,
//   AlertCircle,
//   CheckCircle,
//   X,
//   Copy,
//   Check,
//   Square,
//   ArrowLeft,
//   Plus,
//   FileDown,
//   FileText,
//   Sparkles,
//   Zap,
// } from "lucide-react";

// const AnalysisPage = () => {
//   const { file_id, session_id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const sessionFromHistory = location.state?.session;

//   const [fileId, setFileId] = useState(file_id || null);
//   const [file, setFile] = useState(null);
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

//   const fileInputRef = useRef(null);
//   const dropdownRef = useRef(null);
//   const streamingIntervalRef = useRef(null);

//   const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

//   const llmModels = [
//     { 
//       id: "gemini", 
//       name: "Gemini 2.0 Flash",
//       icon: Zap,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50",
//       description: "Fast & efficient"
//     },
//     { 
//       id: "gemini-pro-2.5", 
//       name: "Gemini 2.5 Pro",
//       icon: Sparkles,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50",
//       description: "Advanced reasoning",
//     },
//     { 
//       id: "anthropic", 
//       name: "Claude 3.5 Haiku",
//       icon: Zap,
//       color: "text-orange-600",
//       bgColor: "bg-orange-50",
//       description: "Quick responses"
//     },
//     { 
//       id: "claude-sonnet-4", 
//       name: "Claude 4.0 Sonnet",
//       icon: Brain,
//       color: "text-indigo-600",
//       bgColor: "bg-indigo-50",
//       description: "Most intelligent",
//     },
//     { 
//       id: "openai", 
//       name: "GPT-4o Mini",
//       icon: Zap,
//       color: "text-green-600",
//       bgColor: "bg-green-50",
//       description: "Balanced performance"
//     },
//     { 
//       id: "deepseek", 
//       name: "DeepSeek Chat",
//       icon: Brain,
//       color: "text-teal-600",
//       bgColor: "bg-teal-50",
//       description: "Cost-effective"
//     },
//   ];

//   const calculateSessionStats = (messages) => {
//     if (!messages || messages.length === 0) {
//       return null;
//     }

//     let totalPromptTokens = 0;
//     let totalCompletionTokens = 0;
//     let totalTokens = 0;
//     let totalInputCost = 0;
//     let totalOutputCost = 0;
//     let totalCost = 0;

//     messages.forEach((msg) => {
//       const promptTokens = parseInt(msg.prompt_tokens) || 0;
//       const completionTokens = parseInt(msg.completion_tokens) || 0;
//       const tokens = parseInt(msg.total_tokens) || 0;
//       const inputCost = parseFloat(msg.input_cost_inr) || 0;
//       const outputCost = parseFloat(msg.output_cost_inr) || 0;
//       const cost = parseFloat(msg.total_cost_inr) || 0;

//       totalPromptTokens += promptTokens;
//       totalCompletionTokens += completionTokens;
//       totalTokens += tokens;
//       totalInputCost += inputCost;
//       totalOutputCost += outputCost;
//       totalCost += cost;
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

//   useEffect(() => {
//     if (sessionFromHistory && sessionFromHistory.messages) {
//       const loadedMessages = sessionFromHistory.messages.map((msg) => {
//         const tokenUsage = {
//           promptTokens: parseInt(msg.prompt_tokens) || 0,
//           completionTokens: parseInt(msg.completion_tokens) || 0,
//           totalTokens: parseInt(msg.total_tokens) || 0,
//           inputCostINR: parseFloat(msg.input_cost_inr) || 0,
//           outputCostINR: parseFloat(msg.output_cost_inr) || 0,
//           totalCostINR: parseFloat(msg.total_cost_inr) || 0
//         };

//         return {
//           q: msg.question,
//           a: msg.answer,
//           tokenUsage,
//           model: msg.llm_model_name || 'gemini'
//         };
//       });

//       const calculatedStats = calculateSessionStats(sessionFromHistory.messages);
      
//       if (calculatedStats) {
//         setSessionStats(calculatedStats);
//       }

//       setMessages(loadedMessages);
//       setFileId(sessionFromHistory.file_id);
//       setShowSplit(true);
//       setSelectedQuestionIndex(loadedMessages.length - 1);
//       setProcessingStatus({ status: "processed" });
//       setFile({ name: sessionFromHistory.file_id ? `Document ${sessionFromHistory.file_id}` : "Document" });
//     }
//   }, [sessionFromHistory]);

//   const getAuthToken = () => {
//     const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
//     for (const k of keys) {
//       const val = localStorage.getItem(k);
//       if (val) return val;
//     }
//     return null;
//   };

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     setError(null);
//     setFile(file);
//     setUploadProgress(0);

//     const formData = new FormData();
//     formData.append("document", file);

//     const xhr = new XMLHttpRequest();
//     xhr.upload.onprogress = (e) => {
//       if (e.lengthComputable) {
//         setUploadProgress(Math.round((e.loaded / e.total) * 100));
//       }
//     };

//     xhr.onload = () => {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         const data = JSON.parse(xhr.responseText);
//         const id = data.file_id || data.document_id || data.id;

//         if (!id) {
//           setError("Upload succeeded but no file_id returned");
//           setIsUploading(false);
//           return;
//         }
//         setFileId(id);
//         setSuccess("File uploaded successfully!");
//         setIsUploading(false);
//         pollProcessingStatus(id);
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

//   const handleStopGeneration = () => {
//     if (abortController) {
//       abortController.abort();
//       setAbortController(null);
//       setIsProcessing(false);
//       setIsStreaming(false);
//       setError("Generation stopped by user");

//       if (streamingIntervalRef.current) {
//         clearInterval(streamingIntervalRef.current);
//         streamingIntervalRef.current = null;
//       }
//     }
//   };

//   const animateResponse = (text) => {
//     return new Promise((resolve) => {
//       setIsStreaming(true);
//       setStreamingText("");

//       let currentIndex = 0;
//       const chunkSize = 3;
//       const intervalTime = 20;

//       streamingIntervalRef.current = setInterval(() => {
//         if (currentIndex < text.length) {
//           currentIndex += chunkSize;
//           setStreamingText(text.slice(0, currentIndex));
//         } else {
//           clearInterval(streamingIntervalRef.current);
//           streamingIntervalRef.current = null;
//           setIsStreaming(false);
//           setStreamingText("");
//           resolve();
//         }
//       }, intervalTime);
//     });
//   };

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!fileId) return setError("Upload a document first.");
//     if (processingStatus?.status !== "processed")
//       return setError("Document not ready yet.");
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

//       if (data.sessionStats) {
//         setSessionStats(data.sessionStats);
//       }

//       if (!showSplit) setShowSplit(true);

//       const newMessage = {
//         q: chatInput,
//         a: answer,
//         tokenUsage: data.tokenUsage,
//         model: selectedModel
//       };
//       setMessages((prev) => [...prev, newMessage]);
//       const newIndex = messages.length;
//       setSelectedQuestionIndex(newIndex);
//       setChatInput("");

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
//     setShowSplit(false);
//     setProcessingStatus(null);
//     setStreamingText("");
//     setIsStreaming(false);
//     setSessionStats(null);

//     if (streamingIntervalRef.current) {
//       clearInterval(streamingIntervalRef.current);
//       streamingIntervalRef.current = null;
//     }
//   };

//   const handleBackToHistory = () => {
//     navigate("/chat-history");
//   };

//   const getModelInfo = (modelId) => {
//     return llmModels.find(m => m.id === modelId) || llmModels[0];
//   };

//   const parseMarkdownToPDF = (doc, text, startY, margin, maxWidth, pageHeight, pageWidth) => {
//     let yPosition = startY;
//     const lineHeight = 7;
//     const paragraphSpacing = 5;
    
//     const lines = text.split('\n');
//     let i = 0;
    
//     while (i < lines.length) {
//       let line = lines[i];
      
//       if (line.trim() === '') {
//         yPosition += paragraphSpacing;
//         i++;
//         continue;
//       }
      
//       if (yPosition > pageHeight - 30) {
//         doc.addPage();
//         yPosition = margin;
//       }
      
//       if (line.includes('|')) {
//         const tableLines = [];
//         let j = i;
        
//         while (j < lines.length && lines[j].trim().includes('|')) {
//           tableLines.push(lines[j]);
//           j++;
//         }
        
//         if (tableLines.length >= 2) {
//           const headers = tableLines[0]
//             .split('|')
//             .map(h => h.trim())
//             .filter(h => h);
//           const separatorLine = tableLines[1];
          
//           if (separatorLine.includes('-')) {
//             const rows = [];
            
//             for (let k = 2; k < tableLines.length; k++) {
//               const cells = tableLines[k]
//                 .split('|')
//                 .map(c => c.trim())
//                 .filter((c, idx, arr) => {
//                   if (idx === 0 && c === '') return false;
//                   if (idx === arr.length - 1 && c === '') return false;
//                   return true;
//                 });
              
//               if (cells.length > 0) {
//                 while (cells.length < headers.length) {
//                   cells.push('');
//                 }
//                 rows.push(cells.slice(0, headers.length));
//               }
//             }
            
//             const numColumns = headers.length;
//             const tableWidth = maxWidth;
//             const colWidth = tableWidth / numColumns;
//             const rowHeight = 12;
//             const cellPadding = 3;
            
//             const tableHeight = (rows.length + 1) * rowHeight;
//             if (yPosition + tableHeight > pageHeight - 30) {
//               doc.addPage();
//               yPosition = margin;
//             }
            
//             doc.setFillColor(249, 250, 251);
//             doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
            
//             doc.setDrawColor(209, 213, 219);
//             doc.setLineWidth(0.5);
            
//             doc.setTextColor(31, 41, 55);
//             doc.setFont('helvetica', 'bold');
//             doc.setFontSize(10);
            
//             for (let col = 0; col < headers.length; col++) {
//               const x = margin + col * colWidth;
//               const y = yPosition + rowHeight / 2 + 3;
              
//               doc.line(x, yPosition, x, yPosition + rowHeight);
              
//               let headerText = headers[col].replace(/\*\*/g, '').replace(/\*/g, '');
//               const headerLines = doc.splitTextToSize(headerText, colWidth - 2 * cellPadding);
//               doc.text(headerLines[0] || '', x + cellPadding, y);
//             }
            
//             doc.line(margin + tableWidth, yPosition, margin + tableWidth, yPosition + rowHeight);
//             doc.line(margin, yPosition, margin + tableWidth, yPosition);
//             doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
            
//             yPosition += rowHeight;
            
//             doc.setTextColor(0, 0, 0);
//             doc.setFont('helvetica', 'normal');
//             doc.setFontSize(9);
            
//             for (let row = 0; row < rows.length; row++) {
//               if (row % 2 === 0) {
//                 doc.setFillColor(255, 255, 255);
//               } else {
//                 doc.setFillColor(249, 250, 251);
//               }
//               doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
              
//               for (let col = 0; col < numColumns; col++) {
//                 const x = margin + col * colWidth;
//                 const y = yPosition + rowHeight / 2 + 3;
                
//                 doc.setDrawColor(226, 232, 240);
//                 doc.setLineWidth(0.3);
//                 doc.line(x, yPosition, x, yPosition + rowHeight);
                
//                 let cellText = '';
//                 if (rows[row] && col < rows[row].length) {
//                   cellText = rows[row][col] || '';
//                 }
                
//                 cellText = cellText.replace(/\*\*/g, '');
//                 cellText = cellText.replace(/\*/g, '');
//                 cellText = cellText.replace(/`(.+?)`/g, '$1');
//                 cellText = cellText.replace(/\[(.+?)\]\((.+?)\)/g, '$1');
                
//                 const wrappedText = doc.splitTextToSize(cellText, colWidth - 2 * cellPadding);
//                 doc.text(wrappedText[0] || '', x + cellPadding, y);
//               }
              
//               doc.setDrawColor(226, 232, 240);
//               doc.line(margin + tableWidth, yPosition, margin + tableWidth, yPosition + rowHeight);
//               doc.line(margin, yPosition + rowHeight, margin + tableWidth, yPosition + rowHeight);
              
//               yPosition += rowHeight;
              
//               if (yPosition > pageHeight - 30) {
//                 doc.addPage();
//                 yPosition = margin;
//               }
//             }
            
//             doc.setDrawColor(209, 213, 219);
//             doc.setLineWidth(0.5);
//             doc.line(margin, yPosition - (rows.length + 1) * rowHeight, margin, yPosition);
//             doc.line(margin + tableWidth, yPosition - (rows.length + 1) * rowHeight, margin + tableWidth, yPosition);
            
//             yPosition += 10;
//             i = j;
//             continue;
//           }
//         }
//       }
      
//       const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
//       if (headerMatch) {
//         const level = headerMatch[1].length;
//         let headerText = headerMatch[2].replace(/\*\*/g, '');
        
//         yPosition += 5;
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(31, 41, 55);
        
//         if (level === 1) {
//           doc.setFontSize(16);
//           yPosition += 3;
//         } else if (level === 2) {
//           doc.setFontSize(14);
//           yPosition += 2;
//         } else if (level === 3) {
//           doc.setFontSize(12);
//           yPosition += 1;
//         } else {
//           doc.setFontSize(11);
//         }
        
//         const headerLines = doc.splitTextToSize(headerText, maxWidth);
//         doc.text(headerLines, margin, yPosition);
//         yPosition += headerLines.length * lineHeight + paragraphSpacing;
        
//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(11);
//         doc.setTextColor(0, 0, 0);
//         i++;
//         continue;
//       }
      
//       const bulletMatch = line.match(/^\s*[-*+]\s+(.+)$/);
//       if (bulletMatch) {
//         let bulletText = bulletMatch[1];
//         bulletText = bulletText.replace(/\*\*(.+?)\*\*/g, '$1');
//         bulletText = bulletText.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1');
//         bulletText = bulletText.replace(/`(.+?)`/g, '"$1"');
//         bulletText = bulletText.replace(/\[(.+?)\]\((.+?)\)/g, '$1');
        
//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(11);
//         const bulletLines = doc.splitTextToSize('• ' + bulletText, maxWidth - 8);
//         doc.text(bulletLines, margin + 8, yPosition);
//         yPosition += bulletLines.length * lineHeight;
//         i++;
//         continue;
//       }
      
//       const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
//       if (numberedMatch) {
//         const number = numberedMatch[1];
//         let listText = numberedMatch[2];
//         listText = listText.replace(/\*\*(.+?)\*\*/g, '$1');
//         listText = listText.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1');
//         listText = listText.replace(/`(.+?)`/g, '"$1"');
//         listText = listText.replace(/\[(.+?)\]\((.+?)\)/g, '$1');
        
//         const fullText = `${number}. ${listText}`;
//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(11);
//         const listLines = doc.splitTextToSize(fullText, maxWidth - 8);
//         doc.text(listLines, margin + 8, yPosition);
//         yPosition += listLines.length * lineHeight;
//         i++;
//         continue;
//       }
      
//       const boldPattern = /\*\*(.+?)\*\*/g;
//       const parts = [];
//       let lastIndex = 0;
//       let match;
      
//       while ((match = boldPattern.exec(line)) !== null) {
//         if (match.index > lastIndex) {
//           parts.push({ text: line.substring(lastIndex, match.index), bold: false });
//         }
//         parts.push({ text: match[1], bold: true });
//         lastIndex = match.index + match[0].length;
//       }
      
//       if (lastIndex < line.length) {
//         parts.push({ text: line.substring(lastIndex), bold: false });
//       }
      
//       if (parts.length === 0) {
//         parts.push({ text: line, bold: false });
//       }
      
//       for (let part of parts) {
//         part.text = part.text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1');
//         part.text = part.text.replace(/`(.+?)`/g, '"$1"');
//         part.text = part.text.replace(/\[(.+?)\]\((.+?)\)/g, '$1');
//       }
      
//       let currentX = margin;
//       doc.setFontSize(11);
      
//       for (let part of parts) {
//         if (!part.text) continue;
        
//         if (part.bold) {
//           doc.setFont('helvetica', 'bold');
//         } else {
//           doc.setFont('helvetica', 'normal');
//         }
        
//         const words = part.text.split(' ');
        
//         for (let word of words) {
//           const wordWidth = doc.getTextWidth(word + ' ');
          
//           if (currentX + wordWidth > pageWidth - margin && currentX > margin) {
//             yPosition += lineHeight;
//             currentX = margin;
            
//             if (yPosition > pageHeight - 30) {
//               doc.addPage();
//               yPosition = margin;
//             }
//           }
          
//           doc.text(word, currentX, yPosition);
//           currentX += wordWidth;
//         }
//       }
      
//       doc.setFont('helvetica', 'normal');
//       yPosition += lineHeight + paragraphSpacing;
//       i++;
//     }
    
//     return yPosition;
//   };

//   const handleExportToPDF = async () => {
//     if (selectedQuestionIndex === null) {
//       setError("Please select a question to export");
//       return;
//     }

//     setIsExportingPDF(true);

//     try {
//       const { jsPDF } = await import('jspdf');
      
//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margin = 20;
//       const maxWidth = pageWidth - 2 * margin;
//       let yPosition = margin;

//       doc.setTextColor(31, 41, 55);
//       doc.setFontSize(22);
//       doc.setFont('times', 'bold');
//       doc.text("Legal Analysis Report", margin, yPosition);
//       yPosition += 10;
      
//       doc.setFontSize(10);
//       doc.setFont('times', 'normal');
//       doc.setTextColor(107, 114, 128);
//       doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
//       yPosition += 8;
      
//       doc.setDrawColor(209, 213, 219);
//       doc.setLineWidth(0.5);
//       doc.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 12;
      
//       doc.setFont('times', 'normal');
//       doc.setTextColor(0, 0, 0);
//       doc.setFontSize(11);

//       yPosition = parseMarkdownToPDF(
//         doc,
//         messages[selectedQuestionIndex].a,
//         yPosition,
//         margin,
//         maxWidth,
//         pageHeight,
//         pageWidth
//       );

//       const totalPages = doc.internal.pages.length - 1;
//       for (let i = 1; i <= totalPages; i++) {
//         doc.setPage(i);
        
//         doc.setDrawColor(229, 231, 235);
//         doc.setLineWidth(0.3);
//         doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
//         doc.setFontSize(9);
//         doc.setTextColor(156, 163, 175);
//         doc.setFont('times', 'normal');
//         doc.text(
//           `Page ${i} of ${totalPages}`,
//           pageWidth / 2,
//           pageHeight - 10,
//           { align: 'center' }
//         );
        
//         doc.text(
//           "Legal Analysis - Confidential",
//           margin,
//           pageHeight - 10
//         );
//       }

//       const filename = `Legal_Analysis_${new Date().getTime()}.pdf`;
//       doc.save(filename);
      
//       setSuccess("PDF exported successfully!");
//     } catch (err) {
//       console.error("PDF export error:", err);
//       setError("Failed to export PDF: " + err.message);
//     } finally {
//       setIsExportingPDF(false);
//     }
//   };

//   if (!showSplit) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-white">
//         {session_id && (
//           <button
//             onClick={handleBackToHistory}
//             className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             <span>Back to History</span>
//           </button>
//         )}

//         <h1 className="text-2xl font-bold text-gray-800 mb-2">
//           Welcome to smart legal insights
//         </h1>
//         <p className="text-gray-500 mb-6">
//           Upload a legal document, choose a model, and type your first question to begin.
//         </p>
//         <div className="flex items-center space-x-3 border rounded-lg px-4 py-3 bg-gray-50 shadow-sm w-[600px]">
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
//           >
//             <Paperclip className="h-5 w-5" />
//           </button>
//           <input
//             type="file"
//             ref={fileInputRef}
//             className="hidden"
//             onChange={handleFileUpload}
//           />
//           <div className="relative" ref={dropdownRef}>
//             <button
//               type="button"
//               onClick={() => setShowModelDropdown(!showModelDropdown)}
//               className="flex items-center px-3 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors"
//             >
//               {getModelInfo(selectedModel).name}
//               <ChevronDown className="h-4 w-4 ml-2" />
//             </button>
//             {showModelDropdown && (
//               <div className="absolute bottom-full mb-2 w-56 bg-white border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
//                 {llmModels.map((m) => {
//                   const Icon = m.icon;
//                   return (
//                     <button
//                       key={m.id}
//                       onClick={() => {
//                         setSelectedModel(m.id);
//                         setShowModelDropdown(false);
//                       }}
//                       className={`block w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
//                         selectedModel === m.id ? 'bg-blue-50' : ''
//                       }`}
//                     >
//                       <div className="flex items-center space-x-2">
//                         <Icon className={`h-4 w-4 ${m.color}`} />
//                         <span className="text-sm font-medium text-gray-900">{m.name}</span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//           <textarea
//             rows={1}
//             value={chatInput}
//             onChange={(e) => setChatInput(e.target.value)}
//             placeholder={!file ? "Upload a document first..." : "Type your question..."}
//             className="flex-1 resize-none bg-transparent text-sm outline-none overflow-hidden"
//             style={{ minHeight: "40px", maxHeight: "150px" }}
//             disabled={!file || processingStatus?.status !== "processed"}
//           />
//           <button
//             onClick={handleSend}
//             disabled={!file || isProcessing || processingStatus?.status !== "processed"}
//             className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
//           >
//             {isProcessing ? (
//               <Loader2 className="h-5 w-5 animate-spin" />
//             ) : (
//               <Send className="h-5 w-5" />
//             )}
//           </button>
//         </div>

//         {file && (
//           <div className="mt-3 w-[600px]">
//             <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2 flex-1 min-w-0">
//                   <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
//                   <p className="text-xs text-gray-700 truncate">{file.name}</p>
//                 </div>
                
//                 <div className="flex items-center space-x-2 ml-3">
//                   {isUploading && (
//                     <>
//                       <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
//                       <span className="text-xs text-blue-600 font-medium">{uploadProgress}%</span>
//                     </>
//                   )}
                  
//                   {processingStatus?.status === "batch_processing" && !isUploading && (
//                     <>
//                       <Loader2 className="h-4 w-4 text-slate-500 animate-spin flex-shrink-0" />
//                       <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Batch Processing...</span>
//                     </>
//                   )}
                  
//                   {processingStatus?.status === "processing" && !isUploading && (
//                     <>
//                       <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
//                       <span className="text-xs text-blue-600 font-medium whitespace-nowrap">Processing...</span>
//                     </>
//                   )}
                  
//                   {processingStatus?.status === "processed" && (
//                     <>
//                       <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
//                       <span className="text-xs text-green-600 font-medium whitespace-nowrap">Processed</span>
//                     </>
//                   )}
                  
//                   {processingStatus?.status === "error" && (
//                     <>
//                       <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
//                       <span className="text-xs text-red-600 font-medium whitespace-nowrap">Failed</span>
//                     </>
//                   )}
//                 </div>
//               </div>
              
//               {(isUploading || processingStatus?.status === "batch_processing" || processingStatus?.status === "processing") && (
//                 <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
//                   <div
//                     className={`h-1 rounded-full transition-all duration-300 ${
//                       isUploading 
//                         ? 'bg-blue-500' 
//                         : processingStatus?.status === "batch_processing"
//                         ? 'bg-slate-400 animate-pulse w-full'
//                         : 'bg-blue-500 animate-pulse w-full'
//                     }`}
//                     style={isUploading ? { width: `${uploadProgress}%` } : {}}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-white">
//       <div className="w-1/3 border-r border-gray-200 flex flex-col">
//         <div className="p-4 border-b flex items-center justify-between">
//           <h2 className="font-semibold text-lg">Asked Questions</h2>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handleNewChat}
//               className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <Plus className="h-4 w-4" />
//               <span>New</span>
//             </button>
//             <button
//               onClick={handleBackToHistory}
//               className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {messages.map((m, i) => {
//             const modelInfo = getModelInfo(m.model || 'gemini');
//             const ModelIcon = modelInfo.icon;
            
//             return (
//               <div
//                 key={i}
//                 className={`p-3 border rounded-lg shadow-sm text-sm cursor-pointer transition-colors relative ${
//                   i === selectedQuestionIndex
//                     ? "bg-blue-50 border-blue-300"
//                     : "bg-gray-50 hover:bg-gray-100"
//                 }`}
//                 onClick={() => setSelectedQuestionIndex(i)}
//               >
//                 <div className="pr-16">
//                   <div className="flex items-center space-x-2 mb-1">
//                     <b>Q{i + 1}:</b>
//                     <ModelIcon className={`h-3 w-3 ${modelInfo.color}`} />
//                     <span className="text-xs text-gray-500">{modelInfo.name}</span>
//                   </div>
//                   <p className="text-gray-700">{m.q}</p>
//                 </div>
//                 {m.tokenUsage && m.tokenUsage.totalTokens > 0 && (
//                   <div className="absolute top-2 right-2 text-[10px] text-gray-400">
//                     {m.tokenUsage.totalTokens.toLocaleString()}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {file && (
//           <div className="px-4 py-3 text-sm border-t bg-gray-50">
//             <p className="text-gray-600 mb-2 font-medium">{file.name}</p>

//             {sessionStats && parseInt(sessionStats.total_tokens) > 0 ? (
//               <div className="mt-3 pt-3 border-t border-gray-200">
//                 <p className="font-semibold text-gray-800 mb-3">Session Summary</p>
                
//                 <div className="space-y-2 mb-3">
//                   <div className="flex justify-between text-xs">
//                     <span className="text-gray-600">Total Queries:</span>
//                     <span className="font-semibold text-gray-900">{sessionStats.total_messages}</span>
//                   </div>
//                   <div className="flex justify-between text-xs">
//                     <span className="text-gray-600">Input Tokens:</span>
//                     <span className="font-semibold text-gray-900">
//                       {parseInt(sessionStats.total_prompt_tokens).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-xs">
//                     <span className="text-gray-600">Output Tokens:</span>
//                     <span className="font-semibold text-gray-900">
//                       {parseInt(sessionStats.total_completion_tokens).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
//                     <span className="text-gray-700 font-medium">Total Tokens:</span>
//                     <span className="font-bold text-gray-900">
//                       {parseInt(sessionStats.total_tokens).toLocaleString()}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="pt-3 border-t border-gray-200">
//                   <p className="font-semibold text-gray-800 mb-2 text-xs">Cost Breakdown</p>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-xs">
//                       <span className="text-gray-600">Input Cost:</span>
//                       <span className="font-semibold text-green-700">
//                         ₹{parseFloat(sessionStats.total_input_cost_inr).toFixed(4)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-xs">
//                       <span className="text-gray-600">Output Cost:</span>
//                       <span className="font-semibold text-green-700">
//                         ₹{parseFloat(sessionStats.total_output_cost_inr).toFixed(4)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
//                       <span className="text-gray-700 font-medium">Total Cost:</span>
//                       <span className="font-bold text-green-800">
//                         ₹{parseFloat(sessionStats.total_cost_inr).toFixed(4)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="mt-3 pt-3 border-t border-gray-200">
//                 <p className="text-xs text-amber-600">Token data not available</p>
//               </div>
//             )}
//           </div>
//         )}

//         <form onSubmit={handleSend} className="p-4 border-t flex items-center space-x-2">
//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
//           >
//             <Paperclip className="h-5 w-5" />
//           </button>
//           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

//           <div className="relative flex-shrink-0" ref={dropdownRef}>
//             <button
//               type="button"
//               onClick={() => setShowModelDropdown(!showModelDropdown)}
//               className="flex items-center px-3 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors"
//             >
//               {getModelInfo(selectedModel).name}
//               <ChevronDown className="h-4 w-4 ml-2" />
//             </button>
//             {showModelDropdown && (
//               <div className="absolute bottom-full mb-2 w-56 bg-white border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
//                 {llmModels.map((m) => {
//                   const Icon = m.icon;
//                   return (
//                     <button
//                       key={m.id}
//                       onClick={() => {
//                         setSelectedModel(m.id);
//                         setShowModelDropdown(false);
//                       }}
//                       className={`block w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
//                         selectedModel === m.id ? 'bg-blue-50' : ''
//                       }`}
//                     >
//                       <div className="flex items-center space-x-2">
//                         <Icon className={`h-4 w-4 ${m.color}`} />
//                         <span className="text-sm font-medium text-gray-900">{m.name}</span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <textarea
//             rows={1}
//             value={chatInput}
//             onChange={(e) => setChatInput(e.target.value)}
//             placeholder="Ask something..."
//             className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm overflow-hidden"
//             style={{ minHeight: "40px", maxHeight: "150px" }}
//           />

//           {isProcessing ? (
//             <button
//               type="button"
//               onClick={handleStopGeneration}
//               className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//             >
//               <Square className="h-5 w-5" />
//             </button>
//           ) : (
//             <button
//               type="submit"
//               disabled={isProcessing}
//               className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           )}
//         </form>
//       </div>

//       <div className="w-2/3 flex flex-col bg-white">
//         <div className="p-4 border-b flex items-center justify-between bg-white">
//           <div className="flex items-center space-x-2">
//             <Brain className="h-5 w-5" />
//             <h2 className="text-lg font-semibold">AI Response</h2>
//             {selectedQuestionIndex !== null && messages[selectedQuestionIndex] && (
//               <div className="flex items-center space-x-2 ml-4">
//                 {React.createElement(getModelInfo(messages[selectedQuestionIndex].model || 'gemini').icon, {
//                   className: `h-4 w-4 ${getModelInfo(messages[selectedQuestionIndex].model || 'gemini').color}`
//                 })}
//                 <span className="text-sm text-gray-600">
//                   {getModelInfo(messages[selectedQuestionIndex].model || 'gemini').name}
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="flex items-center space-x-2">
//             {selectedQuestionIndex !== null && (
//               <>
//                 <button
//                   onClick={handleExportToPDF}
//                   disabled={isExportingPDF}
//                   className="flex items-center space-x-2 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
//                   title="Export to PDF"
//                 >
//                   {isExportingPDF ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <FileDown className="h-4 w-4" />
//                   )}
//                   <span>Export PDF</span>
//                 </button>
//                 <button
//                   onClick={() => handleCopyAnswer(messages[selectedQuestionIndex].a, selectedQuestionIndex)}
//                   className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   {copiedIndex === selectedQuestionIndex ? (
//                     <>
//                       <Check className="h-4 w-4 text-green-600" />
//                       <span className="text-green-600">Copied!</span>
//                     </>
//                   ) : (
//                     <>
//                       <Copy className="h-4 w-4" />
//                       <span>Copy</span>
//                     </>
//                   )}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto p-8 bg-white">
//           {selectedQuestionIndex !== null ? (
//             <div className="max-w-4xl mx-auto">
//               <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question</p>
//                 <p className="text-base text-gray-800 leading-relaxed">{messages[selectedQuestionIndex].q}</p>
//               </div>

//               <div className="document-output">
//                 {isStreaming && selectedQuestionIndex === messages.length - 1 ? (
//                   <div className="animate-fade-in">
//                     <ReactMarkdown 
//                       remarkPlugins={[remarkGfm]}
//                       components={{
//                         h1: ({ node, ...props }) => (
//                           <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200" {...props} />
//                         ),
//                         h2: ({ node, ...props }) => (
//                           <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />
//                         ),
//                         h3: ({ node, ...props }) => (
//                           <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />
//                         ),
//                         h4: ({ node, ...props }) => (
//                           <h4 className="text-base font-semibold text-gray-900 mt-3 mb-2" {...props} />
//                         ),
//                         h5: ({ node, ...props }) => (
//                           <h5 className="text-sm font-semibold text-gray-900 mt-2 mb-1" {...props} />
//                         ),
//                         h6: ({ node, ...props }) => (
//                           <h6 className="text-sm font-semibold text-gray-700 mt-2 mb-1" {...props} />
//                         ),
//                         p: ({ node, ...props }) => (
//                           <p className="text-base text-gray-800 leading-relaxed mb-4" {...props} />
//                         ),
//                         ul: ({ node, ...props }) => (
//                           <ul className="list-disc list-outside ml-6 mb-4 space-y-2" {...props} />
//                         ),
//                         ol: ({ node, ...props }) => (
//                           <ol className="list-decimal list-outside ml-6 mb-4 space-y-2" {...props} />
//                         ),
//                         li: ({ node, ...props }) => (
//                           <li className="text-base text-gray-800 leading-relaxed" {...props} />
//                         ),
//                         blockquote: ({ node, ...props }) => (
//                           <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4" {...props} />
//                         ),
//                         code: ({ node, inline, ...props }) => 
//                           inline ? (
//                             <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
//                           ) : (
//                             <code className="block bg-gray-100 text-gray-800 p-4 rounded text-sm font-mono overflow-x-auto my-4" {...props} />
//                           ),
//                         pre: ({ node, ...props }) => (
//                           <pre className="bg-gray-100 p-4 rounded overflow-x-auto my-4" {...props} />
//                         ),
//                         strong: ({ node, ...props }) => (
//                           <strong className="font-semibold text-gray-900" {...props} />
//                         ),
//                         em: ({ node, ...props }) => (
//                           <em className="italic text-gray-800" {...props} />
//                         ),
//                         table: ({ node, ...props }) => (
//                           <div className="overflow-x-auto my-6">
//                             <table className="min-w-full border-collapse border border-gray-300" {...props} />
//                           </div>
//                         ),
//                         thead: ({ node, ...props }) => (
//                           <thead className="bg-gray-100" {...props} />
//                         ),
//                         th: ({ node, ...props }) => (
//                           <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900" {...props} />
//                         ),
//                         tbody: ({ node, ...props }) => (
//                           <tbody {...props} />
//                         ),
//                         tr: ({ node, ...props }) => (
//                           <tr className="even:bg-gray-50 hover:bg-gray-100" {...props} />
//                         ),
//                         td: ({ node, ...props }) => (
//                           <td className="border border-gray-300 px-4 py-3 text-base text-gray-800" {...props} />
//                         ),
//                         a: ({ node, ...props }) => (
//                           <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
//                         ),
//                         hr: ({ node, ...props }) => (
//                           <hr className="my-6 border-t-2 border-gray-200" {...props} />
//                         ),
//                       }}
//                     >
//                       {streamingText}
//                     </ReactMarkdown>
//                     <span className="inline-block w-2 h-5 bg-gray-800 animate-pulse ml-1"></span>
//                   </div>
//                 ) : (
//                   <ReactMarkdown 
//                     remarkPlugins={[remarkGfm]}
//                     components={{
//                       h1: ({ node, ...props }) => (
//                         <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-gray-200" {...props} />
//                       ),
//                       h2: ({ node, ...props }) => (
//                         <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />
//                       ),
//                       h3: ({ node, ...props }) => (
//                         <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />
//                       ),
//                       h4: ({ node, ...props }) => (
//                         <h4 className="text-base font-semibold text-gray-900 mt-3 mb-2" {...props} />
//                       ),
//                       h5: ({ node, ...props }) => (
//                         <h5 className="text-sm font-semibold text-gray-900 mt-2 mb-1" {...props} />
//                       ),
//                       h6: ({ node, ...props }) => (
//                         <h6 className="text-sm font-semibold text-gray-700 mt-2 mb-1" {...props} />
//                       ),
//                       p: ({ node, ...props }) => (
//                         <p className="text-base text-gray-800 leading-relaxed mb-4" {...props} />
//                       ),
//                       ul: ({ node, ...props }) => (
//                         <ul className="list-disc list-outside ml-6 mb-4 space-y-2" {...props} />
//                       ),
//                       ol: ({ node, ...props }) => (
//                         <ol className="list-decimal list-outside ml-6 mb-4 space-y-2" {...props} />
//                       ),
//                       li: ({ node, ...props }) => (
//                         <li className="text-base text-gray-800 leading-relaxed" {...props} />
//                       ),
//                       blockquote: ({ node, ...props }) => (
//                         <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4" {...props} />
//                       ),
//                       code: ({ node, inline, ...props }) => 
//                         inline ? (
//                           <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
//                         ) : (
//                           <code className="block bg-gray-100 text-gray-800 p-4 rounded text-sm font-mono overflow-x-auto my-4" {...props} />
//                         ),
//                       pre: ({ node, ...props }) => (
//                         <pre className="bg-gray-100 p-4 rounded overflow-x-auto my-4" {...props} />
//                       ),
//                       strong: ({ node, ...props }) => (
//                         <strong className="font-semibold text-gray-900" {...props} />
//                       ),
//                       em: ({ node, ...props }) => (
//                         <em className="italic text-gray-800" {...props} />
//                       ),
//                       table: ({ node, ...props }) => (
//                         <div className="overflow-x-auto my-6">
//                           <table className="min-w-full border-collapse border border-gray-300" {...props} />
//                         </div>
//                       ),
//                       thead: ({ node, ...props }) => (
//                         <thead className="bg-gray-100" {...props} />
//                       ),
//                       th: ({ node, ...props }) => (
//                         <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900" {...props} />
//                       ),
//                       tbody: ({ node, ...props }) => (
//                         <tbody {...props} />
//                       ),
//                       tr: ({ node, ...props }) => (
//                         <tr className="even:bg-gray-50 hover:bg-gray-100" {...props} />
//                       ),
//                       td: ({ node, ...props }) => (
//                         <td className="border border-gray-300 px-4 py-3 text-base text-gray-800" {...props} />
//                       ),
//                       a: ({ node, ...props }) => (
//                         <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
//                       ),
//                       hr: ({ node, ...props }) => (
//                         <hr className="my-6 border-t-2 border-gray-200" {...props} />
//                       ),
//                     }}
//                   >
//                     {messages[selectedQuestionIndex].a}
//                   </ReactMarkdown>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-gray-400 text-lg">Select a question to view the answer</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {error && (
//         <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg z-50">
//           <AlertCircle className="h-4 w-4" />
//           <span>{error}</span>
//           <button onClick={() => setError(null)}>
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}
//       {success && (
//         <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg z-50">
//           <CheckCircle className="h-4 w-4" />
//           <span>{success}</span>
//           <button onClick={() => setSuccess(null)}>
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AnalysisPage;




import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  Send,
  Paperclip,
  ChevronDown,
  Brain,
  AlertCircle,
  CheckCircle,
  X,
  Copy,
  Check,
  Square,
  ArrowLeft,
  Plus,
  FileDown,
  FileText,
  Sparkles,
  Zap,
  DollarSign,
  FileType,
  MoreVertical,
} from "lucide-react";

const AnalysisPage = () => {
  const { file_id, session_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionFromHistory = location.state?.session;

  const [fileId, setFileId] = useState(file_id || null);
  const [file, setFile] = useState(null);
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
  const [costEstimate, setCostEstimate] = useState(null);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  
  const [showCostDropdown, setShowCostDropdown] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const costDropdownRef = useRef(null);
  const streamingIntervalRef = useRef(null);

  const API_BASE_URL = "https://backend-110685455967.asia-south1.run.app";

  const llmModels = [
    { 
      id: "gemini", 
      name: "Gemini 2.0 Flash",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Fast & efficient"
    },
    { 
      id: "gemini-pro-2.5", 
      name: "Gemini 2.5 Pro",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Advanced reasoning",
    },
    { 
      id: "anthropic", 
      name: "Claude 3.5 Haiku",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Quick responses"
    },
    { 
      id: "claude-sonnet-4", 
      name: "Claude 4.0 Sonnet",
      icon: Brain,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Most intelligent",
    },
    { 
      id: "openai", 
      name: "GPT-4o Mini",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Balanced performance"
    },
    { 
      id: "deepseek", 
      name: "DeepSeek Chat",
      icon: Brain,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      description: "Cost-effective"
    },
  ];

  const calculateSessionStats = (messages) => {
    if (!messages || messages.length === 0) {
      return null;
    }

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let totalInputCost = 0;
    let totalOutputCost = 0;
    let totalCost = 0;

    messages.forEach((msg) => {
      const promptTokens = parseInt(msg.prompt_tokens) || 0;
      const completionTokens = parseInt(msg.completion_tokens) || 0;
      const tokens = parseInt(msg.total_tokens) || 0;
      const inputCost = parseFloat(msg.input_cost_inr) || 0;
      const outputCost = parseFloat(msg.output_cost_inr) || 0;
      const cost = parseFloat(msg.total_cost_inr) || 0;

      totalPromptTokens += promptTokens;
      totalCompletionTokens += completionTokens;
      totalTokens += tokens;
      totalInputCost += inputCost;
      totalOutputCost += outputCost;
      totalCost += cost;
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

  const fetchDocumentAICost = async (fileId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/doc/document-ai-cost/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.document_ai_cost) {
          setDocumentAICost(data.document_ai_cost);
          console.log('💰 Fetched Document AI Cost:', data.document_ai_cost);
        }
      }
    } catch (err) {
      console.error('Error fetching Document AI cost:', err);
    }
  };

  useEffect(() => {
    if (sessionFromHistory && sessionFromHistory.messages) {
      const loadedMessages = sessionFromHistory.messages.map((msg) => {
        const tokenUsage = {
          promptTokens: parseInt(msg.prompt_tokens) || 0,
          completionTokens: parseInt(msg.completion_tokens) || 0,
          totalTokens: parseInt(msg.total_tokens) || 0,
          inputCostINR: parseFloat(msg.input_cost_inr) || 0,
          outputCostINR: parseFloat(msg.output_cost_inr) || 0,
          totalCostINR: parseFloat(msg.total_cost_inr) || 0
        };

        return {
          q: msg.question,
          a: msg.answer,
          tokenUsage,
          model: msg.llm_model_name || 'gemini'
        };
      });

      const calculatedStats = calculateSessionStats(sessionFromHistory.messages);
      
      if (calculatedStats) {
        setSessionStats(calculatedStats);
      }

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
      if (costDropdownRef.current && !costDropdownRef.current.contains(event.target)) {
        setShowCostDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getAuthToken = () => {
    const keys = ["authToken", "token", "accessToken", "jwt", "bearerToken"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) return val;
    }
    return null;
  };

  const estimateDocumentAICost = async (file) => {
    try {
      const token = getAuthToken();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileSize', file.size.toString());
      formData.append('mimeType', file.type);
      formData.append('processorType', 'ocr');
      
      const res = await fetch(`${API_BASE_URL}/api/doc/estimate-cost`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setCostEstimate(data.estimation);
        console.log('📊 Cost Estimate:', data.estimation);
      } else {
        const errorText = await res.text();
        console.error('Failed to estimate cost:', errorText);
        setError(`Failed to estimate cost: ${errorText || "An unexpected error occurred."}`);
      }
    } catch (err) {
      console.error('Error estimating cost:', err);
      setError(`Failed to estimate cost: ${err.message || "An unexpected error occurred."}`);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    await estimateDocumentAICost(file);

    setIsUploading(true);
    setError(null);
    setFile(file);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("document", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        const id = data.file_id || data.document_id || data.id;

        if (!id) {
          setError("Upload succeeded but no file_id returned");
          setIsUploading(false);
          return;
        }

        if (data.document_ai_cost) {
          setDocumentAICost(data.document_ai_cost);
          console.log('💰 Actual Document AI Cost:', data.document_ai_cost);
        }

        setFileId(id);
        setSuccess("File uploaded successfully!");
        setIsUploading(false);
        pollProcessingStatus(id);
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
    let tries = 0;
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
          setSuccess("Document processed successfully!");
        }
        if (data.status === "error" || tries > 100) {
          clearInterval(interval);
          setError("Processing failed or timed out.");
        }
      } catch (err) {
        clearInterval(interval);
        setError("Error while checking status.");
      }
    }, 2000);
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsProcessing(false);
      setIsStreaming(false);
      setError("Generation stopped by user");

      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
    }
  };

  const animateResponse = (text) => {
    return new Promise((resolve) => {
      setIsStreaming(true);
      setStreamingText("");

      let currentIndex = 0;
      const chunkSize = 3;
      const intervalTime = 20;

      streamingIntervalRef.current = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex += chunkSize;
          setStreamingText(text.slice(0, currentIndex));
        } else {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
          setIsStreaming(false);
          setStreamingText("");
          resolve();
        }
      }, intervalTime);
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!fileId) return setError("Upload a document first.");
    if (processingStatus?.status !== "processed")
      return setError("Document not ready yet.");
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

      if (data.sessionStats) {
        setSessionStats(data.sessionStats);
      }

      if (!showSplit) setShowSplit(true);

      const newMessage = {
        q: chatInput,
        a: answer,
        tokenUsage: data.tokenUsage,
        model: selectedModel
      };
      setMessages((prev) => [...prev, newMessage]);
      const newIndex = messages.length;
      setSelectedQuestionIndex(newIndex);
      setChatInput("");

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
    setShowSplit(false);
    setProcessingStatus(null);
    setStreamingText("");
    setIsStreaming(false);
    setSessionStats(null);
    setDocumentAICost(null);
    setCostEstimate(null);

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
  };

  const handleBackToHistory = () => {
    navigate("/chat-history");
  };

  const getModelInfo = (modelId) => {
    return llmModels.find(m => m.id === modelId) || llmModels[0];
  };

  const handleExportToPDF = async () => {
    if (selectedQuestionIndex === null) {
      setError("Please select a question to export");
      return;
    }

    setIsExportingPDF(true);

    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(22);
      doc.setFont('times', 'bold');
      doc.text("Legal Analysis Report", margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 8;
      
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;
      
      doc.setFont('times', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      const text = messages[selectedQuestionIndex].a;
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(splitText, margin, yPosition);

      const filename = `Legal_Analysis_${new Date().getTime()}.pdf`;
      doc.save(filename);
      
      setSuccess("PDF exported successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      setError("Failed to export PDF: " + err.message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const markdownComponents = {
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6 shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-300 bg-white" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-gray-50" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-gray-200 bg-white" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-gray-50 transition-colors" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th 
        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
        {...props} 
      />
    ),
    td: ({ node, ...props }) => (
      <td 
        className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100 last:border-r-0"
        {...props} 
      />
    ),
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-gray-200" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-semibold text-gray-700 mt-4 mb-2" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-base text-gray-800 leading-relaxed my-4" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside space-y-2 my-4 ml-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside space-y-2 my-4 ml-4" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-gray-800 leading-relaxed" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50" {...props} />
    ),
    code: ({ node, inline, ...props }) => 
      inline ? (
        <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
      ) : (
        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props} />
      ),
    pre: ({ node, ...props }) => (
      <pre className="bg-gray-900 rounded-lg overflow-hidden my-4" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-gray-900" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-gray-800" {...props} />
    ),
  };

  if (!showSplit) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        {session_id && (
          <button
            onClick={handleBackToHistory}
            className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to History</span>
          </button>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to smart legal insights
        </h1>
        <p className="text-gray-500 mb-6">
          Upload a legal document, choose a model, and type your first question to begin.
        </p>
        
        {costEstimate && !documentAICost && (
          <div className="mb-4 w-[600px] bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Processing Cost Estimate</span>
              </div>
              <button
                onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showCostBreakdown ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-600">Pages</p>
                <p className="text-lg font-bold text-gray-900">{costEstimate.pageCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Processor</p>
                <p className="text-sm font-semibold text-gray-900">{costEstimate.processorType}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Cost</p>
                <p className="text-lg font-bold text-green-700">₹{costEstimate.total.costINR}</p>
              </div>
            </div>

            {showCostBreakdown && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">USD Cost:</span>
                    <span className="font-semibold text-gray-900">${costEstimate.total.costUSD}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tier:</span>
                    <span className="font-semibold text-gray-900">{costEstimate.breakdown.base.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Usage:</span>
                    <span className="font-semibold text-gray-900">{costEstimate.monthlyUsageAtTime.toLocaleString()} pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-semibold text-gray-900">₹{costEstimate.exchangeRate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3 border rounded-lg px-4 py-3 bg-gray-50 shadow-sm w-[600px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center px-3 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors"
            >
              {getModelInfo(selectedModel).name}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showModelDropdown && (
              <div className="absolute bottom-full mb-2 w-56 bg-white border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                {llmModels.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                        selectedModel === m.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${m.color}`} />
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <textarea
            rows={1}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={!file ? "Upload a document first..." : "Type your question..."}
            className="flex-1 resize-none bg-transparent text-sm outline-none overflow-hidden"
            style={{ minHeight: "40px", maxHeight: "150px" }}
            disabled={!file || processingStatus?.status !== "processed"}
          />
          <button
            onClick={handleSend}
            disabled={!file || isProcessing || processingStatus?.status !== "processed"}
            className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {file && (
          <div className="mt-3 w-[600px]">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p className="text-xs text-gray-700 truncate">{file.name}</p>
                </div>
                
                <div className="flex items-center space-x-2 ml-3">
                  {isUploading && (
                    <>
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                      <span className="text-xs text-blue-600 font-medium">{uploadProgress}%</span>
                    </>
                  )}
                  
                  {processingStatus?.status === "batch_processing" && !isUploading && (
                    <>
                      <Loader2 className="h-4 w-4 text-slate-500 animate-spin flex-shrink-0" />
                      <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Batch Processing...</span>
                    </>
                  )}
                  
                  {processingStatus?.status === "processing" && !isUploading && (
                    <>
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap">Processing...</span>
                    </>
                  )}
                  
                  {processingStatus?.status === "processed" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-green-600 font-medium whitespace-nowrap">Processed</span>
                    </>
                  )}
                  
                  {processingStatus?.status === "error" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-600 font-medium whitespace-nowrap">Failed</span>
                    </>
                  )}
                </div>
              </div>
              
              {(isUploading || processingStatus?.status === "batch_processing" || processingStatus?.status === "processing") && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isUploading 
                        ? 'bg-blue-500' 
                        : processingStatus?.status === "batch_processing"
                        ? 'bg-slate-400 animate-pulse w-full'
                        : 'bg-blue-500 animate-pulse w-full'
                    }`}
                    style={isUploading ? { width: `${uploadProgress}%` } : {}}
                  />
                </div>
              )}

              {documentAICost && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileType className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-gray-700">Document AI Processing</span>
                    </div>
                    <span className="text-xs font-bold text-green-700">₹{documentAICost.cost_inr}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Pages</p>
                      <p className="font-semibold text-gray-900">{documentAICost.pages}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">USD</p>
                      <p className="font-semibold text-gray-900">${documentAICost.cost_usd}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tier</p>
                      <p className="font-semibold text-gray-900 capitalize">{documentAICost.tier}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Asked Questions</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>
            <button
              onClick={handleBackToHistory}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => {
            const modelInfo = getModelInfo(m.model || 'gemini');
            const ModelIcon = modelInfo.icon;
            
            return (
              <div
                key={i}
                className={`p-3 border rounded-lg shadow-sm text-sm transition-colors relative ${i === selectedQuestionIndex
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div 
                  className="pr-16 cursor-pointer"
                  onClick={() => setSelectedQuestionIndex(i)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <b>Q{i + 1}:</b>
                    <ModelIcon className={`h-3 w-3 ${modelInfo.color}`} />
                    <span className="text-xs text-gray-500">{modelInfo.name}</span>
                  </div>
                  <p className="text-gray-700">{m.q}</p>
                </div>
                
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  {m.tokenUsage && m.tokenUsage.totalTokens > 0 && (
                    <div className="text-[10px] text-gray-400">
                      {m.tokenUsage.totalTokens.toLocaleString()}
                    </div>
                  )}
                  
                  {(documentAICost || sessionStats) && i === messages.length - 1 && (
                    <div className="relative" ref={i === messages.length - 1 ? costDropdownRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCostDropdown(!showCostDropdown);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>

                      {showCostDropdown && (
                        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCostDropdown(false);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {documentAICost && (
                              <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <FileType className="h-5 w-5 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-800">Document AI</span>
                                  </div>
                                  <span className="text-sm font-bold text-green-700">₹{documentAICost.cost_inr}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Pages:</span>
                                    <span className="font-semibold text-gray-900">{documentAICost.pages}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">USD Cost:</span>
                                    <span className="font-semibold text-gray-900">${documentAICost.cost_usd}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Tier:</span>
                                    <span className="font-semibold text-gray-900 capitalize">{documentAICost.tier}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Processor:</span>
                                    <span className="font-semibold text-gray-900">OCR</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {sessionStats && parseInt(sessionStats.total_tokens) > 0 && (
                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <Brain className="h-5 w-5 text-blue-600" />
                                  <span className="text-sm font-semibold text-gray-800">LLM Usage</span>
                                </div>
                                
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Total Queries:</span>
                                    <span className="font-semibold text-gray-900">{sessionStats.total_messages}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Input Tokens:</span>
                                    <span className="font-semibold text-gray-900">
                                      {parseInt(sessionStats.total_prompt_tokens).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Output Tokens:</span>
                                    <span className="font-semibold text-gray-900">
                                      {parseInt(sessionStats.total_completion_tokens).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                                    <span className="text-gray-700 font-medium">Total Tokens:</span>
                                    <span className="font-bold text-gray-900">
                                      {parseInt(sessionStats.total_tokens).toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                  <p className="font-semibold text-gray-800 mb-2 text-xs">Cost Details</p>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Input Cost:</span>
                                      <span className="font-semibold text-green-700">
                                        ₹{parseFloat(sessionStats.total_input_cost_inr).toFixed(4)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Output Cost:</span>
                                      <span className="font-semibold text-green-700">
                                        ₹{parseFloat(sessionStats.total_output_cost_inr).toFixed(4)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                                      <span className="text-gray-700 font-medium">LLM Total:</span>
                                      <span className="font-bold text-green-800">
                                        ₹{parseFloat(sessionStats.total_cost_inr).toFixed(4)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {documentAICost && sessionStats && parseInt(sessionStats.total_tokens) > 0 && (
                              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-bold text-gray-900">Grand Total:</span>
                                  <span className="text-lg font-bold text-blue-700">
                                    ₹{(parseFloat(sessionStats.total_cost_inr) + parseFloat(documentAICost.cost_inr)).toFixed(4)}
                                  </span>
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

        {file && (
          <div className="px-4 py-3 text-sm border-t bg-gray-50">
            <p className="text-gray-600 mb-2 font-medium">{file.name}</p>
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 border-t flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center px-3 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors"
            >
              {getModelInfo(selectedModel).name}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showModelDropdown && (
              <div className="absolute bottom-full mb-2 w-56 bg-white border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                {llmModels.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                        selectedModel === m.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${m.color}`} />
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <textarea
            rows={1}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm overflow-hidden"
            style={{ minHeight: "40px", maxHeight: "150px" }}
          />

          {isProcessing ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <Square className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isProcessing}
              className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>

      <div className="w-2/3 flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <h2 className="text-lg font-semibold">AI Response</h2>
            {selectedQuestionIndex !== null && messages[selectedQuestionIndex] && (
              <div className="flex items-center space-x-2 ml-4">
                {React.createElement(getModelInfo(messages[selectedQuestionIndex].model || 'gemini').icon, {
                  className: `h-4 w-4 ${getModelInfo(messages[selectedQuestionIndex].model || 'gemini').color}`
                })}
                <span className="text-sm text-gray-600">
                  {getModelInfo(messages[selectedQuestionIndex].model || 'gemini').name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedQuestionIndex !== null && (
              <>
                <button
                  onClick={handleExportToPDF}
                  disabled={isExportingPDF}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Export to PDF"
                >
                  {isExportingPDF ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => handleCopyAnswer(messages[selectedQuestionIndex].a, selectedQuestionIndex)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copiedIndex === selectedQuestionIndex ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {selectedQuestionIndex !== null ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question</p>
                <p className="text-base text-gray-800 leading-relaxed">{messages[selectedQuestionIndex].q}</p>
              </div>

              <div className="prose prose-lg max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {isStreaming && selectedQuestionIndex === messages.length - 1 ? streamingText : messages[selectedQuestionIndex].a}
                </ReactMarkdown>
                {isStreaming && selectedQuestionIndex === messages.length - 1 && (
                  <span className="inline-block w-2 h-5 bg-gray-800 animate-pulse ml-1"></span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg">Select a question to view the answer</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg z-50">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg z-50">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;