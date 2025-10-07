
// // routes/documentRoutes.js
// const express = require('express');
// const multer = require('multer');
// const router = express.Router();

// const controller = require('../controllers/documentController');
// const { protect } = require('../middleware/auth');

// const upload = multer({ storage: multer.memoryStorage() });

// // Batch Upload & processing for large documents
// router.post('/batch-upload', protect, upload.single('document'), controller.batchUploadDocument);

// // Post-processing analytics
// router.post('/analyze', protect, controller.analyzeDocument);

// // Summarize selected chunks (RAG-efficient)
// router.post('/summary', protect, controller.getSummary);

// // Chat with the document (RAG)
// router.post('/chat', protect, controller.chatWithDocument);

// // Save edited (docx + pdf variants)
// router.post('/save', protect, controller.saveEditedDocument);

// // Download edited variants via signed URL
// router.get('/download/:file_id/:format', protect, controller.downloadDocument);

// // Chat history for a document
// router.get('/chat-history/:file_id', protect, controller.getChatHistory);

// // Processing status
// router.get('/status/:file_id', protect, controller.getDocumentProcessingStatus);

// // Token statistics (legacy endpoint - kept for backward compatibility)
// router.get('/token-stats', protect, controller.getTokenStats);

// // Cost + Token stats report (NEW - primary endpoint)
// router.get('/cost-stats', protect, controller.getCostStats);

// // Add this line with your other routes
// router.get('/chat-sessions', protect, controller.getChatSessions);

// module.exports = router;



// routes/documentRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();

const controller = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Batch Upload & processing for large documents
// router.post('/batch-upload', protect, upload.single('document'), controller.batchUploadDocument);


// Option A: Use .any() to accept any field name (most flexible)
router.post(
  '/batch-upload', 
  protect, 
  upload.any(), // Accepts all files regardless of field name
  controller.batchUploadDocument
);


// Post-processing analytics
router.post('/analyze', protect, controller.analyzeDocument);

// Summarize selected chunks (RAG-efficient)
router.post('/summary', protect, controller.getSummary);

// Chat with the document (RAG)
router.post('/chat', protect, controller.chatWithDocument);

// Save edited (docx + pdf variants)
router.post('/save', protect, controller.saveEditedDocument);

// Download edited variants via signed URL
router.get('/download/:file_id/:format', protect, controller.downloadDocument);

// Chat history for a document
router.get('/chat-history/:file_id', protect, controller.getChatHistory);

// Processing status
router.get('/status/:file_id', protect, controller.getDocumentProcessingStatus);

// Token statistics (legacy endpoint - kept for backward compatibility)
router.get('/token-stats', protect, controller.getTokenStats);

// Cost + Token stats report (NEW - primary endpoint)
router.get('/cost-stats', protect, controller.getCostStats);

// Chat sessions
router.get('/chat-sessions', protect, controller.getChatSessions);

// Storage utilization
router.get('/user-storage-utilization', protect, controller.getUserStorageUtilization);

// 🆕 NEW ROUTES FOR DOCUMENT AI COST TRACKING
router.get('/document-ai-stats', protect, controller.getDocumentAIStats);

// 🆕 UPDATED: Now accepts file upload to extract actual page count
router.post('/estimate-cost', protect, upload.single('file'), controller.estimateDocumentAICost);

module.exports = router;