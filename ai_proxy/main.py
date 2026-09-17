"""
Smriti Setu (স্মৃতি সেতু) — FastAPI AI Proxy
Runs on Port 8000 (0.0.0.0)
Connects to Ollama / Qwen2.5:1.5b with quad-lingual native NER cultural fallback engine.

Strict Safety Directives:
- NEVER output diagnostic clinical labels or dementia severity stages.
- Language is strictly supportive, nostalgic, respectful, and dignity-first.
- Supports 4 languages ('as', 'bn', 'ne', 'en') and strictly focuses on the North Eastern Region of India (NER).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import requests
import random
import os

app = FastAPI(
    title="Smriti Setu AI Proxy",
    description="Culturally sensitive, dignity-first AI reminiscence proxy for North Eastern Region elderly support",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")

# Strict safety filter
BANNED_WORDS = [
    "dementia", "alzheimer", "mci", "mild cognitive impairment",
    "clinical score", "severity stage", "deterioration", "brain damage",
    "score: ", "iq score", "failed test", "mental deficit"
]

def sanitize_dignity_text(text: str, lang: str = "en") -> str:
    """Ensures LLM output strictly abides by dignity-first guidelines."""
    cleaned = text
    lower = text.lower()
    for word in BANNED_WORDS:
        if word in lower:
            fallbacks = {
                "as": "এই মধুৰ স্মৃতিটোৱে মনত শান্তি আৰু পৰিয়ালৰ আন্তৰিক মৰম কঢ়িয়াই আনে।",
                "bn": "এই মধুর স্মৃতিটি মনে অনাবিল শান্তি আর পরিবারের গভীর ভালোবাসা নিয়ে আসে।",
                "ne": "यो मिठो सम्झनाले मनमा शान्ति र परिवारको आत्मीय माया ल्याउँछ।",
                "en": "This memory brings a warm sense of familiar comfort and connection."
            }
            return fallbacks.get(lang, fallbacks["en"])
    return cleaned.strip()

# Authentic North Eastern Cultural Memory Knowledge Base across 4 languages
NER_CULTURAL_KNOWLEDGE_I18N = {
    "bihu": {
        "as": "ব’হাগ বিহুৰ লাটাসিল পথাৰত বিহু ঢোলৰ মাত মনত পৰে নে? ৰঙা ফুলম গামোচা আৰু বতাহত ফুলি থকা কপৌ ফুলৰ সুবাস।",
        "bn": "বোহাগ বিহুর রঙিন সকালে বিহুর ঢোলের মিষ্টি আওয়াজ মনে পড়ে কি? গলায় জড়িয়ে রাখা লাল ফুলম গামোচা আর বাতাসে কপৌ ফুলের সুবাস।",
        "ne": "बिहूको रमाइलो धुन र ढोलको ताल सम्झनुहुन्छ? गलामा रातो गामोचा र चिसो हावामा फुलेको सुनाखरी फूलको मिठो सुगन्ध।",
        "en": "Remember the cheerful beat of the Bihu dhol echoing across the fields during Bohag Bihu? The red Phulam Gamusa tied with love, and wild Kopou orchids in bloom."
    },
    "tea_garden": {
        "as": "উজনি অসমৰ চাহ বাগিচাত পুৱাৰ কুঁৱলী আৰু সেউজীয়া দুটা পাত এটা কুঁহিপাতৰ মিঠা সুবাসৰ কথা মনত পেলাওক।",
        "bn": "আসামের চা বাগানের সেই স্নিগ্ধ সকালের কথা ভাবুন, যেখানে শিশিরভেজা দুটি পাতা একটি কুঁড়ির তাজা সুবাস বাতাসে ভেসে আসত।",
        "ne": "चिया बगानको हरियाली र बिहानीको शीतले भिजेका दुई पात र एउटा सुइरोको मिठो सुगन्ध सम्झनुहोस्।",
        "en": "Recall the tranquil morning mist rising over the neat green tea bushes in Upper Assam, where the sweet earthy aroma of tender two leaves and a bud filled the air."
    },
    "brahmaputra_river": {
        "as": "গধূলি বেলি শুক্লেশ্বৰ ঘাটৰ পৰা ব্ৰহ্মপুত্ৰৰ সোণালী পানীত শিহুবোৰে খেলিবলৈ আৰম্ভ কৰা দৃশ্য মনত পৰে নে?",
        "bn": "গোধূলির সোনালী আলোয় ব্রহ্মপুত্রের বুকে শান্ত জল আর নদীর শুশুকদের খেলা মনে পড়ে কি?",
        "ne": "साँझपख ब्रह्मपुत्र नदीको सुनौलो छालहरू र पानीमा रमाउने डल्फिनहरूको दृश्य सम्झनुहोस्।",
        "en": "Do you remember standing at the riverbank in the gentle twilight, watching the Brahmaputra turn into a sheet of glowing liquid gold as dolphins leap through the waves?"
    },
    "majuli_heritage": {
        "as": "মাজুলীৰ সত্ৰত বৰতাল আৰু ডবাৰ পৱিত্ৰ ধ্বনিৰ লগতে মুখা শিল্পৰ অপূৰ্ব কাৰুকাৰ্য মনত পেলাওক।",
        "bn": "মাজুলীর সত্রের বরতাল আর মৃদঙ্গের পবিত্র ধ্বনির সাথে ঐতিহ্যবাহী মুখোশ শিল্পের অপরূপ স্মৃতি।",
        "ne": "माजुलीका सत्रहरूमा बज्ने परम्परागत बाजा र माटोबाट बनाइएका सुन्दर मुकुण्डोहरूको सम्झना गर्नुहोस्।",
        "en": "Recall the sacred calm of the Majuli Satras, with the rhythmic sound of the Borthal cymbal and resonant Doba drum echoing through the grand prayer hall."
    },
    "shillong_hills": {
        "as": "শ্বিলঙৰ পাহাৰত পাইন বননিৰ শীতল বতাহ আৰু বৰাপানীৰ পাৰত গৰম পোৰা ভুটা খোৱাৰ সোৱাদ মনত পৰে নে?",
        "bn": "শিলং পাহাড়ের পাইন বনের শীতল হাওয়া আর বড়াপানির ধারে গরম পোড়া ভুট্টার স্মৃতি।",
        "ne": "शिलोङको सल्लाको जङ्गलबाट आउने चिसो हावा र तालको किनारमा पोलेको मकै खाएको मीठो सम्झना।",
        "en": "Remember the cool, crisp mountain air of Shillong surrounded by tall, fragrant pine trees and gentle mist rolling down the ridges."
    },
    "family_reminiscence": {
        "as": "বাৰান্দাত বহি পৰিয়ালৰ সকলোৱে কাঁহৰ বাটিত কোমল চাউল, দৈ আৰু গুড় খোৱাৰ সেই মৰমৰ দিনবোৰ মনত পেলাওক।",
        "bn": "বারান্দায় বসে পরিবারের সবাই মিলে কাঁসার বাটিতে মিষ্টি দই-চিঁড়ে খাওয়ার সেই সোনালী দিনগুলোর কথা ভাবুন।",
        "ne": "परिवारका सबैजना आँगनमा बसेर पुराना रमाइला कथाहरू बाँड्दै गरेको त्यो न्यानो क्षण सम्झनुहोस्।",
        "en": "How wonderful it was to gather together on the veranda, sharing stories of the old days while enjoying fresh curd and golden molasses."
    }
}

class CulturalClueRequest(BaseModel):
    topic: Optional[str] = "Family & Heritage"
    relationship: Optional[str] = "Granddaughter"
    elderName: Optional[str] = "Bhaben Koka"
    lang: Optional[str] = "as"
    region: Optional[str] = "NER"

class CulturalClueResponse(BaseModel):
    clue: str
    source: str
    sentiment: str

class ReminiscencePromptRequest(BaseModel):
    region: Optional[str] = "NER"
    theme: Optional[str] = "bihu"
    lang: Optional[str] = "as"

class ReminiscencePromptResponse(BaseModel):
    prompt: str
    source: str
    sentiment: str

def query_ollama(prompt: str, lang: str = "en") -> Optional[str]:
    """Attempts to query Ollama locally if running."""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 80
            }
        }
        res = requests.post(OLLAMA_URL, json=payload, timeout=2.0)
        if res.status_code == 200:
            result = res.json().get("response", "")
            return sanitize_dignity_text(result, lang)
    except Exception:
        pass
    return None

@app.get("/health")
def health_check():
    ollama_active = False
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=1.0)
        if r.status_code == 200:
            ollama_active = True
    except Exception:
        ollama_active = False

    return {
        "status": "active",
        "service": "Smriti Setu AI Proxy",
        "ollama_connected": ollama_active,
        "default_engine": "Ollama Qwen2.5:1.5b" if ollama_active else "Native NER Cultural Knowledge Engine",
        "supported_languages": ["as", "bn", "ne", "en"],
        "cultural_region": "North Eastern Region (NER) 8 Sister States",
        "safety_guardrails": "Enforced (Strict Dignity-First, No Clinical Labels)"
    }

@app.post("/api/generate-clue", response_model=CulturalClueResponse)
def generate_cultural_clue(req: CulturalClueRequest):
    topic_lower = (req.topic or "").lower()
    relation_lower = (req.relationship or "").lower()
    lang = req.lang or "as"

    # If Ollama is available, query with strict dignity-first system prompt
    llm_prompt = (
        f"You are a compassionate, respectful memory companion for an elder named {req.elderName} from the North Eastern Region of India. "
        f"Write a 1-sentence, nostalgic, gentle memory clue in {lang} about their loved one ({req.relationship}) or cultural theme ({req.topic}). "
        f"Strictly never diagnose or mention memory loss."
    )
    llm_reply = query_ollama(llm_prompt, lang)
    if llm_reply and len(llm_reply) > 10:
        return CulturalClueResponse(
            clue=llm_reply,
            source="ollama_qwen2.5",
            sentiment="supportive_nostalgia"
        )

    # Native Cultural Fallback in requested language
    if "tea" in topic_lower:
        clue = NER_CULTURAL_KNOWLEDGE_I18N["tea_garden"].get(lang, NER_CULTURAL_KNOWLEDGE_I18N["tea_garden"]["en"])
    elif "bihu" in topic_lower:
        clue = NER_CULTURAL_KNOWLEDGE_I18N["bihu"].get(lang, NER_CULTURAL_KNOWLEDGE_I18N["bihu"]["en"])
    elif "river" in topic_lower or "brahmaputra" in topic_lower:
        clue = NER_CULTURAL_KNOWLEDGE_I18N["brahmaputra_river"].get(lang, NER_CULTURAL_KNOWLEDGE_I18N["brahmaputra_river"]["en"])
    elif "majuli" in topic_lower:
        clue = NER_CULTURAL_KNOWLEDGE_I18N["majuli_heritage"].get(lang, NER_CULTURAL_KNOWLEDGE_I18N["majuli_heritage"]["en"])
    elif "shillong" in topic_lower or "hill" in topic_lower:
        clue = NER_CULTURAL_KNOWLEDGE_I18N["shillong_hills"].get(lang, NER_CULTURAL_KNOWLEDGE_I18N["shillong_hills"]["en"])
    else:
        clue = NER_CULTURAL_KNOWLEDGE_I18N["family_reminiscence"].get(lang, NER_CULTURAL_KNOWLEDGE_I18N["family_reminiscence"]["en"])

    return CulturalClueResponse(
        clue=clue,
        source="native_ner_cultural_engine",
        sentiment="warm_respectful"
    )

@app.post("/api/reminiscence-prompt", response_model=ReminiscencePromptResponse)
def generate_reminiscence_prompt(req: ReminiscencePromptRequest):
    lang = req.lang or "as"
    theme_key = "family_reminiscence"
    t_low = (req.theme or "").lower()
    if "bihu" in t_low:
        theme_key = "bihu"
    elif "tea" in t_low:
        theme_key = "tea_garden"
    elif "river" in t_low or "brahmaputra" in t_low:
        theme_key = "brahmaputra_river"
    elif "majuli" in t_low or "art" in t_low:
        theme_key = "majuli_heritage"
    elif "shillong" in t_low or "hill" in t_low:
        theme_key = "shillong_hills"

    prompt_dict = NER_CULTURAL_KNOWLEDGE_I18N.get(theme_key, NER_CULTURAL_KNOWLEDGE_I18N["family_reminiscence"])
    prompt_text = prompt_dict.get(lang, prompt_dict["en"])

    return ReminiscencePromptResponse(
        prompt=prompt_text,
        source="native_ner_cultural_engine",
        sentiment="calming_reflection"
    )

class LevelHintRequest(BaseModel):
    current_level: Optional[int] = 1
    target_name: Optional[str] = ""
    relation: Optional[str] = "Family Member"
    memory_context: Optional[str] = ""
    region: Optional[str] = "Assam, NER"

class LevelHintResponse(BaseModel):
    hint: str
    status: Optional[str] = "success"
    source: Optional[str] = "qwen"

LEVEL_FALLBACKS = {
    1: "Take your time. Look gently at the warm eyes and familiar smile in the pictures.",
    2: "Think of the one who brings warmth to your tea time and loves sitting by your side.",
    3: "Remember the pleasant memories and family moments shared together during celebrations.",
    4: "Close your eyes for a calm moment and picture the area of the screen where that familiar face first appeared."
}

@app.post("/generate-level-hint", response_model=LevelHintResponse)
@app.post("/generate-hint", response_model=LevelHintResponse)
def generate_level_hint(req: LevelHintRequest):
    lvl = max(1, min(4, req.current_level or 1))
    target = (req.target_name or "").strip()
    rel = req.relation or "Family Member"
    fallback_hint = LEVEL_FALLBACKS.get(lvl, LEVEL_FALLBACKS[1])

    prompt = (
        f"You are Smriti Setu, a gentle, culturally respectful memory companion for an elder in North Eastern India.\n"
        f"The elder asked for a hint for Level {lvl}.\n"
        f"CRITICAL RULES:\n"
        f"- NEVER say the name '{target}'.\n"
        f"- NEVER say the relation '{rel}'.\n"
        f"- NEVER use clinical words like 'wrong', 'test', 'dementia', or 'score'.\n"
        f"STRATEGY FOR LEVEL {lvl}:\n"
        f"- Level 1: Visual clue (expression, smile, face).\n"
        f"- Level 2: Shared daily habit or warm routine.\n"
        f"- Level 3: Event or place detail from notes: '{req.memory_context}'.\n"
        f"- Level 4: Spatial clue about where the photo was positioned.\n"
        f"Region: {req.region}\n"
        f"Return ONLY 1 gentle, reassuring hint sentence."
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=3.0
        )
        if resp.status_code == 200:
            hint_text = resp.json().get("response", "").strip()
            # Guardrail check
            name_leaked = target and (target.lower() in hint_text.lower())
            relation_leaked = rel and (rel.lower() in hint_text.lower())
            if hint_text and not name_leaked and not relation_leaked:
                return LevelHintResponse(
                    hint=sanitize_dignity_text(hint_text),
                    status="success",
                    source="qwen"
                )
    except Exception:
        pass

    return LevelHintResponse(
        hint=fallback_hint,
        status="fallback",
        source="deterministic_fallback"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

