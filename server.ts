import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback trending catalog for smart heuristic recommendations
const TRENDING_STYLES = [
  {
    id: 'rec-fade-crop',
    title: 'Textured Crop & Low Skin Fade',
    category: 'Hair',
    suggestedSalon: 'Luxe Cut & Style Studio',
    salonId: 'salon-1',
    pricePaise: 14900,
    durationMin: 35,
    reason: 'Top trending style for men this season. Low maintenance with sharp texture.',
    tag: 'TRENDING #1',
    trendScore: 98,
    stylistTip: 'Ask for matte styling paste for natural non-greasy volume.',
  },
  {
    id: 'rec-beard-detox',
    title: 'Beard Sculpting & Charcoal Spa',
    category: 'Beard',
    suggestedSalon: 'GlowSlot At-Home Pro',
    salonId: 'salon-2',
    pricePaise: 11900,
    durationMin: 30,
    reason: 'Complements sharp haircuts. Activated charcoal deeply cleanses beard follicles.',
    tag: 'POPULAR COMBO',
    trendScore: 95,
    stylistTip: 'Follow up with argan beard oil daily to lock in moisture.',
  },
  {
    id: 'rec-scalp-spa',
    title: 'Aromatic Scalp Detox & Head Massage',
    category: 'Spa',
    suggestedSalon: 'Urban Glow Unisex Lounge',
    salonId: 'salon-3',
    pricePaise: 22900,
    durationMin: 45,
    reason: 'Recommended 3-4 weeks after your haircut to rejuvenate roots and release screen stress.',
    tag: 'TIME TO REFRESH',
    trendScore: 92,
    stylistTip: 'Leaves scalp residue-free; perfect after heavy outdoor pollution exposure.',
  },
  {
    id: 'rec-hydra-glow',
    title: 'Hydra-Facial Quick Glow & Exfoliation',
    category: 'Skin',
    suggestedSalon: 'Crown & Blade Barbershop',
    salonId: 'salon-4',
    pricePaise: 29900,
    durationMin: 40,
    reason: 'Fast 40-minute de-tan & hydration session trending for weekend events.',
    tag: 'INSTANT GLOW',
    trendScore: 96,
    stylistTip: 'Avoid direct harsh sunlight for 24 hours post-treatment for best results.',
  },
];

// POST /api/recommendations - Smart AI Grooming Recommendations Endpoint
app.post('/api/recommendations', async (req, res) => {
  try {
    const { userName, bookingHistory, categoryFilter, gender } = req.body;

    // If Gemini API is configured, use gemini-3.8-flash for intelligent contextual reasoning
    if (aiClient) {
      const historySummary = Array.isArray(bookingHistory) && bookingHistory.length > 0
        ? bookingHistory.map((b: any) => {
            const services = (b.services || []).map((s: any) => s.name).join(', ');
            return `- Booking on ${b.slot?.date || 'recent'} at ${b.salonName || 'Salon'}: ${services || 'Grooming service'}`;
          }).join('\n')
        : 'New user with no previous booking history.';

      const prompt = `Analyze this user's profile and recommend 4 distinct, personalized salon grooming services or packages available in urban salons.

User Profile:
- Name: ${userName || 'Customer'}
- Preferred Gender: ${gender || 'all'}
- Active Filter: ${categoryFilter || 'all'}
- Past Booking History:
${historySummary}

Trending 2026 Grooming Context:
- Low-fade textured crops, clean beard tapering with hot towel, scalp detoxification, and express hydra facials are trending heavily.
- Calculate approximate reasonable prices in Indian Paise (e.g. ₹999 = 99900 paise, ₹1499 = 149900 paise).
- Provide personalized 'reason' linking either to the user's past booking history (e.g. interval since last haircut, companion service) or the trending 2026 grooming style.
- Include a practical 'stylistTip'.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are the Chief Grooming Stylist & AI Recommendation Engine for GlowSlot, a premier salon booking platform in India. Always generate accurate, fashionable recommendations formatted as JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                suggestedSalon: { type: Type.STRING },
                pricePaise: { type: Type.INTEGER },
                durationMin: { type: Type.INTEGER },
                reason: { type: Type.STRING },
                tag: { type: Type.STRING },
                trendScore: { type: Type.INTEGER },
                stylistTip: { type: Type.STRING },
              },
              required: ['id', 'title', 'category', 'suggestedSalon', 'pricePaise', 'durationMin', 'reason', 'tag'],
            },
          },
        },
      });

      const text = response.text?.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({
              success: true,
              source: 'gemini-ai',
              recommendations: parsed,
            });
          }
        } catch (parseError) {
          console.warn('[GlowSlot AI] Failed to parse JSON from Gemini, falling back to smart engine:', parseError);
        }
      }
    }

    // Smart fallback recommendation generation
    let filtered = [...TRENDING_STYLES];
    if (categoryFilter && categoryFilter !== 'all') {
      const match = filtered.filter((s) => s.category.toLowerCase() === categoryFilter.toLowerCase());
      if (match.length > 0) filtered = match;
    }

    // Customize reasons based on booking history if available
    const hasHaircutHistory = Array.isArray(bookingHistory) && bookingHistory.some((b: any) =>
      (b.services || []).some((s: any) => s.name?.toLowerCase().includes('hair') || s.name?.toLowerCase().includes('cut'))
    );

    const customized = filtered.map((item, idx) => {
      let reason = item.reason;
      let tag = item.tag;

      if (hasHaircutHistory && item.category === 'Hair') {
        reason = `Based on your regular haircut cycle — 3 weeks have passed, perfect timing for a clean line-up refresh.`;
        tag = 'STYLE REFRESH';
      } else if (hasHaircutHistory && item.category === 'Beard') {
        reason = `Frequently paired by clients who booked Precision Haircuts at your favorite salon.`;
        tag = 'PERFECT PAIRING';
      }

      return {
        ...item,
        id: `rec-${idx + 1}-${Date.now()}`,
        reason,
        tag,
      };
    });

    return res.json({
      success: true,
      source: 'smart-engine',
      recommendations: customized,
    });
  } catch (error: any) {
    console.error('[GlowSlot API] /api/recommendations error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate smart recommendations',
      recommendations: TRENDING_STYLES,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[GlowSlot Full-Stack] Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
