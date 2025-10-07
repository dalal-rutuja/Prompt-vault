
// utils/documentAiPricing.js

const USD_TO_INR = 83;

const DOCUMENT_AI_PRICING = {
  ocr: {
    tier1: { rate: 1.50, limit: 5_000_000 },
    tier2: { rate: 0.60, limit: Infinity }
  },
  ocrAddons: { rate: 6.00 },
  customExtractor: {
    tier1: { rate: 30.00, limit: 1_000_000 },
    tier2: { rate: 20.00, limit: Infinity }
  },
  formParser: {
    tier1: { rate: 30.00, limit: 1_000_000 },
    tier2: { rate: 20.00, limit: Infinity }
  },
  layoutParser: { rate: 10.00 },
  reChunking: { rate: 0.02 },
  customSplitter: {
    tier1: { rate: 5.00, limit: 1_000_000 },
    tier2: { rate: 3.00, limit: Infinity }
  },
  customClassifier: {
    tier1: { rate: 5.00, limit: 1_000_000 },
    tier2: { rate: 3.00, limit: Infinity }
  },
  summarizer: { rate: 25.00 },
  invoiceParser: { rate: 0.10, per: 10 },
  expenseParser: { rate: 0.10, per: 10 },
  utilityParser: { rate: 0.10, per: 10 },
  bankStatementParser: { rate: 0.75, per: 1 },
  paySlipParser: { rate: 0.30, per: 1 },
  w2Parser: { rate: 0.30, per: 1 },
  usDriverLicense: { rate: 0.10, per: 1 },
  usPassport: { rate: 0.10, per: 1 },
  identityProofing: { rate: 0.10, per: 1 },
  procurementSplitter: { rate: 0.05, per: 1 },
  lendingSplitter: { rate: 0.05, per: 1 }
};

async function calculatePageCount(fileSize, mimeType, fileBuffer = null, actualPages = null) {
  if (actualPages && actualPages > 0) return actualPages;

  try {
    if (fileBuffer && mimeType === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(fileBuffer);
      if (data.numpages && data.numpages > 0) {
        console.log(`📄 Detected ${data.numpages} pages from PDF metadata`);
        return data.numpages;
      }
    }

    if (fileBuffer && mimeType === "image/tiff") {
      const tiff = require("tiff");
      const tiffDoc = await tiff.decode(fileBuffer);
      if (Array.isArray(tiffDoc) && tiffDoc.length > 0) {
        console.log(`📸 Detected ${tiffDoc.length} pages in TIFF`);
        return tiffDoc.length;
      }
    }
  } catch (err) {
    console.warn("⚠️ Page count extraction failed, using fallback:", err.message);
  }

  const mimeMap = {
    "image/jpeg": 1,
    "image/jpg": 1,
    "image/png": 1,
    "image/bmp": 1,
    "image/heif": 1,
    "image/tiff": 1,
    "application/pdf": Math.max(1, Math.ceil(fileSize / 150000)),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": Math.max(1, Math.ceil(fileSize / 3000)),
    "text/html": Math.max(1, Math.ceil(fileSize / 3000)),
    "text/plain": Math.max(1, Math.ceil(fileSize / 3000)),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": Math.max(1, Math.ceil(fileSize / 50000)),
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": Math.max(1, Math.ceil(fileSize / 100000))
  };

  const estimatedPages = mimeMap[mimeType] || 1;
  console.log(`📄 Estimated ${estimatedPages} pages (fallback)`);
  return estimatedPages;
}

function calculateTieredCost(pageCount, pricingTiers, monthlyUsage = 0) {
  if (!pricingTiers || typeof pricingTiers !== 'object') {
    console.error('Invalid pricing tiers:', pricingTiers);
    return {
      costUSD: 0,
      costINR: 0,
      tier: 'error',
      breakdown: { tier1Pages: 0, tier2Pages: 0, flatPages: 0 }
    };
  }

  if (!pricingTiers.tier2) {
    const costUSD = (pageCount / 1000) * (pricingTiers.rate || 0);
    return {
      costUSD: parseFloat(costUSD.toFixed(4)),
      costINR: parseFloat((costUSD * USD_TO_INR).toFixed(2)),
      tier: 'flat',
      breakdown: {
        tier1Pages: 0,
        tier2Pages: 0,
        flatPages: pageCount
      }
    };
  }

  let remainingPages = pageCount;
  let totalCostUSD = 0;
  let currentUsage = monthlyUsage;
  let tier1Pages = 0;
  let tier2Pages = 0;

  const tier1Remaining = Math.max(0, pricingTiers.tier1.limit - currentUsage);
  
  if (tier1Remaining > 0 && remainingPages > 0) {
    tier1Pages = Math.min(remainingPages, tier1Remaining);
    totalCostUSD += (tier1Pages / 1000) * pricingTiers.tier1.rate;
    remainingPages -= tier1Pages;
    currentUsage += tier1Pages;
  }

  if (remainingPages > 0) {
    tier2Pages = remainingPages;
    totalCostUSD += (tier2Pages / 1000) * pricingTiers.tier2.rate;
  }

  return {
    costUSD: parseFloat(totalCostUSD.toFixed(4)),
    costINR: parseFloat((totalCostUSD * USD_TO_INR).toFixed(2)),
    tier: tier2Pages > 0 ? 'mixed' : 'tier1',
    breakdown: {
      tier1Pages,
      tier2Pages,
      tier1Cost: parseFloat(((tier1Pages / 1000) * pricingTiers.tier1.rate).toFixed(4)),
      tier2Cost: parseFloat(((tier2Pages / 1000) * pricingTiers.tier2.rate).toFixed(4))
    }
  };
}

async function calculateDocumentAICost({
  processorType = 'ocr',
  fileSize,
  mimeType,
  actualPages = null,
  monthlyUsage = 0,
  useOcrAddons = false
}) {
  try {
    // ✅ CRITICAL FIX: Await the page count calculation
    const pageCount = await calculatePageCount(fileSize, mimeType, null, actualPages);

    console.log(`\n📊 Document AI Cost Calculation:`);
    console.log(`   Processor Type: ${processorType}`);
    console.log(`   File Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   MIME Type: ${mimeType}`);
    console.log(`   Estimated Pages: ${pageCount}`);
    console.log(`   Monthly Usage: ${monthlyUsage.toLocaleString()} pages`);

    const pricing = DOCUMENT_AI_PRICING[processorType];
    if (!pricing) {
      throw new Error(`Unknown processor type: ${processorType}`);
    }

    const baseCost = calculateTieredCost(pageCount, pricing, monthlyUsage);
    let addonCost = { costUSD: 0, costINR: 0, tier: null };

    if (processorType === 'ocr' && useOcrAddons && DOCUMENT_AI_PRICING.ocrAddons) {
      addonCost = calculateTieredCost(pageCount, DOCUMENT_AI_PRICING.ocrAddons, 0);
    }

    const totalCostUSD = Number(baseCost.costUSD || 0) + Number(addonCost.costUSD || 0);
    const totalCostINR = Number(baseCost.costINR || 0) + Number(addonCost.costINR || 0);

    const result = {
      pageCount,
      processorType,
      breakdown: {
        base: baseCost,
        addons: useOcrAddons ? addonCost : null
      },
      total: {
        costUSD: parseFloat(totalCostUSD.toFixed(4)),
        costINR: parseFloat(totalCostINR.toFixed(2))
      },
      exchangeRate: USD_TO_INR,
      monthlyUsageAtTime: monthlyUsage
    };

    console.log(`✅ Computed total cost: ₹${result.total.costINR} ($${result.total.costUSD})\n`);
    return result;
  } catch (error) {
    console.error('Error in calculateDocumentAICost:', error);
    return {
      pageCount: 0,
      processorType,
      breakdown: {
        base: { costUSD: 0, costINR: 0, tier: 'error' },
        addons: null
      },
      total: { costUSD: 0, costINR: 0 },
      exchangeRate: USD_TO_INR,
      monthlyUsageAtTime: monthlyUsage,
      error: error.message
    };
  }
}

async function getMonthlyDocumentAIUsage(userId) {
  const db = require('../config/db');
  
  try {
    const result = await db.query(
      `SELECT COALESCE(SUM(page_count), 0)::int as total_pages
       FROM document_ai_usage
       WHERE user_id = $1 
         AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    
    return result.rows[0]?.total_pages || 0;
  } catch (error) {
    console.error('Error fetching monthly Document AI usage:', error);
    return 0;
  }
}

async function saveDocumentAIUsage(usage) {
  const db = require('../config/db');
  
  try {
    await db.query(
      `INSERT INTO document_ai_usage 
        (user_id, file_id, processor_type, page_count, cost_usd, cost_inr, 
         mime_type, file_size_bytes, monthly_usage_at_time, tier_used, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        usage.userId,
        usage.fileId,
        usage.processorType,
        usage.pageCount,
        usage.costUSD,
        usage.costINR,
        usage.mimeType,
        usage.fileSize,
        usage.monthlyUsageAtTime,
        usage.tierUsed
      ]
    );

    await updateMonthlyStats(usage.userId);
    
    console.log(`✅ Document AI usage saved for file ${usage.fileId}`);
  } catch (error) {
    console.error('Error saving Document AI usage:', error);
    throw error;
  }
}

async function updateMonthlyStats(userId) {
  const db = require('../config/db');
  
  try {
    await db.query(
      `INSERT INTO document_ai_monthly_stats 
        (user_id, year, month, total_pages, total_cost_usd, total_cost_inr, files_processed)
       SELECT 
         user_id,
         EXTRACT(YEAR FROM created_at)::int,
         EXTRACT(MONTH FROM created_at)::int,
         SUM(page_count)::int,
         SUM(cost_usd)::numeric(12,4),
         SUM(cost_inr)::numeric(12,2),
         COUNT(DISTINCT file_id)::int
       FROM document_ai_usage
       WHERE user_id = $1
         AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
       GROUP BY user_id, EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
       ON CONFLICT (user_id, year, month) 
       DO UPDATE SET
         total_pages = EXCLUDED.total_pages,
         total_cost_usd = EXCLUDED.total_cost_usd,
         total_cost_inr = EXCLUDED.total_cost_inr,
         files_processed = EXCLUDED.files_processed,
         last_updated = CURRENT_TIMESTAMP`,
      [userId]
    );
  } catch (error) {
    console.error('Error updating monthly stats:', error);
  }
}

module.exports = {
  calculateDocumentAICost,
  calculatePageCount,
  getMonthlyDocumentAIUsage,
  saveDocumentAIUsage,
  updateMonthlyStats,
  DOCUMENT_AI_PRICING,
  USD_TO_INR
};