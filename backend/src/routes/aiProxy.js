const express = require('express');
const router = express.Router();
const http = require('http');

// Helper to make fast HTTP POST to FastAPI proxy
function requestFastApi(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: '127.0.0.1',
      port: 8000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 3500
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: 'Failed to parse AI response', raw: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AI Proxy timeout'));
    });

    req.write(data);
    req.end();
  });
}

const LEVEL_FALLBACKS = {
  1: "Take your time. Look gently at the warm eyes and familiar smile in the pictures.",
  2: "Think of the one who brings warmth to your tea time and loves sitting by your side.",
  3: "Remember the pleasant memories and family moments shared together during celebrations.",
  4: "Close your eyes for a calm moment and picture the area of the screen where that familiar face first appeared."
};

// POST /api/ai/hint — Level-Aware Contextual AI Hint with Deterministic Edge Fallback
router.post('/hint', async (req, res) => {
  const {
    current_level = 1,
    currentLevel = 1,
    targetName = '',
    target_name = '',
    relation = 'Family Member',
    question = '',
    memory_context = '',
    region = 'Assam, NER'
  } = req.body;

  const lvl = parseInt(current_level || currentLevel, 10) || 1;
  const name = targetName || target_name || '';
  const rel = relation || 'loved one';
  const fallback = LEVEL_FALLBACKS[lvl] || `Take your time. Think of your warm times with your loving ${rel}.`;

  try {
    const aiResult = await requestFastApi('/generate-level-hint', {
      current_level: lvl,
      target_name: name,
      relation: rel,
      memory_context: memory_context || question,
      region
    });

    if (aiResult && aiResult.hint) {
      // Guardrail: Ensure model did not accidentally blurt out the secret target name
      if (name && aiResult.hint.toLowerCase().includes(name.toLowerCase())) {
        return res.json({ hint: fallback, source: 'guardrail_fallback' });
      }
      return res.json({ hint: aiResult.hint, source: aiResult.status || 'qwen_local' });
    }

    return res.json({ hint: fallback, source: 'deterministic_fallback' });
  } catch (err) {
    return res.json({ hint: fallback, source: 'deterministic_fallback' });
  }
});

// POST generate cultural clue
router.post('/cultural-clue', async (req, res) => {
  const { topic, relationship, elderName, lang = 'as', region = 'NER' } = req.body;
  try {
    const result = await requestFastApi('/api/generate-clue', { topic, relationship, elderName, lang, region });
    return res.json(result);
  } catch (err) {
    // Quad-lingual NER cultural fallback
    const clues = {
      as: "ব’হাগ বিহুৰ লাটাসিল পথাৰত বিহু ঢোলৰ মাত মনত পৰে নে? পৰিয়ালৰ সকলোৱে একেলগে বহি গৰম মালভোগ কল আৰু দৈ-চিৰা খাইছিলোঁ।",
      bn: "বোহাগ বিহুর রঙিন সকালে লাটাসিল মাঠে ঢোলের মিষ্টি আওয়াজ মনে পড়ে কি? পরিবারের সবাই একসাথে বসে গরম মালভোগ কলা আর মিষ্টি দই-চিঁড়ে খাওয়া হতো।",
      ne: "बिहूको रमाइलो धुन र ढोलको ताल सम्झनुहुन्छ? परिवारका सबैजना मिलेर ताजा दही-चिउरा खाएको मीठो सम्झना।",
      en: "Remember the sound of the Bihu dhol at Latasil field during Bohag Bihu? Your family sat together enjoying hot Malbhog bananas and fresh Doi-Chira."
    };
    const clue = clues[lang] || clues['en'];
    return res.json({
      clue,
      source: 'native_ner_cultural_engine',
      sentiment: 'peaceful_nostalgia'
    });
  }
});

// POST reminiscence prompt
router.post('/reminiscence-prompt', async (req, res) => {
  const { region = 'NER', theme = 'bihu', lang = 'as' } = req.body;
  try {
    const result = await requestFastApi('/api/reminiscence-prompt', { region, theme, lang });
    return res.json(result);
  } catch (err) {
    const prompts = {
      as: "বাৰান্দাত বহি সুগন্ধি শেৱালি ফুল আৰু পুৱাৰ জুৰ বতাহজাকৰ মধুৰ স্মৃতি মনত পেলাওক।",
      bn: "বারান্দায় বসে শিউলি ফুলের মিষ্টি সুবাস আর ভোরের স্নিগ্ধ বাতাসের মধুর স্মৃতি মনে করুন।",
      ne: "आँगनमा बसेर बिहानीको चिसो हावा र फूलहरूको सुगन्धको मीठो सम्झना गर्नुहोस्।",
      en: "Koka, do you recall the sweet smell of the Sewali flowers blooming in the courtyard on early autumn mornings?"
    };
    const prompt = prompts[lang] || prompts['en'];
    return res.json({
      prompt,
      source: 'native_ner_cultural_engine',
      sentiment: 'warm_supportive'
    });
  }
});

module.exports = router;
