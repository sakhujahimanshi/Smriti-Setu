/**
 * Memory Lane Items Dataset
 * Fully localized across 'en', 'bn', 'as', 'ne' with language-neutral target IDs.
 * Supports 4 cognitive difficulty levels and 3-attempt tiered hints.
 */

export const DEFAULT_MEMORY_ITEMS = [
  {
    id: "item_maina",
    imageSrc: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    targetId: "maina",
    level: 1, // Gentle familiarity
    options: [
      {
        id: "maina",
        personName: { en: "Maina", bn: "মায়না", as: "মায়না", ne: "माइना" },
        relationKey: "granddaughter"
      },
      {
        id: "ananya",
        personName: { en: "Ananya", bn: "অনন্যা", as: "অনন্যা", ne: "अनन्या" },
        relationKey: "daughter"
      },
      {
        id: "priya",
        personName: { en: "Priya", bn: "প্রিয়া", as: "প্ৰিয়া", ne: "प्रिया" },
        relationKey: "niece"
      },
      {
        id: "kavita",
        personName: { en: "Kavita", bn: "কবিতা", as: "কবিতা", ne: "कविता" },
        relationKey: "niece"
      }
    ],
    content: {
      en: {
        question: "Koka, who has come to visit you today?",
        clue: "She made hot Til Pitha and sweet Narikol Laru with you during Magh Bihu on the veranda.",
        story: "Maina loves sitting on the cane chair next to you, listening to your stories about the Brahmaputra river.",
        correctFeedback: "Wonderful! You remembered correctly. It is Maina, your granddaughter.",
        incorrectFeedback: "That is close, take a slow look again."
      },
      bn: {
        question: "কোকা, আপনার সঙ্গে কে দেখা করতে এসেছে?",
        clue: "মাঘ বিহুর দিনে বারান্দায় বসে আপনার সঙ্গে গরম তিল পিঠে আর নারকেল লাড়ু বানিয়েছিল।",
        story: "মায়না আপনার পাশের বেতের চেয়ারে বসে ব্রহ্মপুত্রের গল্প শুনতে আর হাসতে ভালোবাসে।",
        correctFeedback: "খুব সুন্দর! একদম ঠিক মনে রেখেছেন। ইনি মায়না, আপনার নাতনি।",
        incorrectFeedback: "কাছাকাছি গেছেন, শান্তভাবে আরেকবার দেখুন।"
      },
      as: {
        question: "কোকা, আপোনাক দেখা কৰিবলৈ আজি কোন আহিছে?",
        clue: "মাঘ বিহুৰ সময়ত বাৰান্দাত আপোনাৰ সৈতে গৰম তিল পিঠা আৰু নাৰিকলৰ লাড়ু বনাইছিল।",
        story: "মায়নাক আপোনাৰ কাষৰ বেতৰ চকীত বহি ব্ৰহ্মপুত্ৰৰ সাধু শুনিবলৈ বৰ ভাল পায়।",
        correctFeedback: "বৰ ধুনীয়া! আপোনাৰ সঠিককৈ মনত আছে। এয়া মায়না, আপোনাৰ নাতিনী।",
        incorrectFeedback: "ওচৰ চাপিছে, লাহেকৈ আকৌ এবাৰ চাওক।"
      },
      ne: {
        question: "हजुरबुबा, आज तपाईंलाई भेट्न को आएको छ?",
        clue: "माघ बिहुको बेला बरण्डामा तपाईंसँगै बसेर तातो तिलको पिठा र नरिवलको लड्डु बनाएकी थिइन्।",
        story: "माइना तपाईंको नजिकैको बेतको कुर्सीमा बसेर ब्रम्हपुत्रको कथा सुन्न धेरै मन पराउँछिन्।",
        correctFeedback: "धेरै राम्रो! तपाईंले एकदम सही सम्झनुभयो। यिनी माइना, तपाईंको नातिनी हुन्।",
        incorrectFeedback: "नजिकै पुग्नुभयो, शान्त भएर फेरि एकपटक हेर्नुहोस्।"
      }
    },
    hints: {
      en: [
        "A beloved young family member living in Bangalore who teaches school children.",
        "She rolls hot Til Pitha with you on the sunny morning of Magh Bihu.",
        "It is your granddaughter Maina."
      ],
      as: [
        "বাংগালুৰুত থকা মৰমৰ পৰিয়ালৰ সদস্য যিয়ে আপোনাৰ পুৰণি সাধু শুনি ভাল পায়।",
        "মাঘ বিহুৰ ৰ’দালি পুৱা আপোনাৰ লগত গৰম তিল পিঠা আৰু লাৰু বনায়।",
        "এয়া আপোনাৰ মৰমৰ নাতিনী মায়না।"
      ],
      bn: [
        "ব্যাঙ্গালোরে থাকা প্রিয় পারিবারিক সদস্য যিনি আপনার গল্প শুনতে খুব ভালোবাসেন।",
        "মাঘ বিহুর মিষ্টি সকালে আপনার সাথে গরম তিল পিঠে তৈরি করেন।",
        "ইনি আপনার প্রিয় নাতনি মায়না।"
      ],
      ne: [
        "बैंगलोरमा बस्ने प्यारी परिवारकी सदस्य जसले तपाईंका कथाहरू सुन्न रुचाउँछिन्।",
        "माघ बिहुको बिहान तपाईंसँगै तातो तिलको पिठा बनाउँछिन्।",
        "यिनी तपाईंको नातिनी माइना हुन्।"
      ]
    }
  },
  {
    id: "item_rohan",
    imageSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    targetId: "rohan",
    level: 2, // Moderate familiarity
    options: [
      {
        id: "rohan",
        personName: { en: "Rohan", bn: "রোহন", as: "ৰোহণ", ne: "रोहन" },
        relationKey: "grandson"
      },
      {
        id: "deepak",
        personName: { en: "Deepak", bn: "দীপক", as: "দীপক", ne: "दीपक" },
        relationKey: "son"
      },
      {
        id: "bikash",
        personName: { en: "Bikash", bn: "বিকাশ", as: "বিকাশ", ne: "बिकाश" },
        relationKey: "niece"
      },
      {
        id: "arun",
        personName: { en: "Arun", bn: "অরুণ", as: "অৰুণ", ne: "अरुण" },
        relationKey: "son"
      }
    ],
    content: {
      en: {
        question: "Look closely at this warm smile, who is this visiting?",
        clue: "He tied the red Phulam Gamusa and played the Bihu dhol rhythm with you in the courtyard.",
        story: "Rohan brings warm jilapi sweets from the market and loves practicing the cheerful dhol rhythm with you.",
        correctFeedback: "Wonderful! You remembered correctly. That is your grandson Rohan.",
        incorrectFeedback: "That is close, take a slow look again."
      },
      bn: {
        question: "এই হাসিমুখটি কার, কোকা?",
        clue: "যিনি আপনার সঙ্গে উঠোনে লাল ফুলম গামোছা পরে বিহু ঢোলের তাল বাজিয়েছিলেন।",
        story: "রোহন বাজার থেকে গরম জিলিপি নিয়ে আসে এবং আপনার সঙ্গে বিহু ঢাকের তাল তুলতে পছন্দ করে।",
        correctFeedback: "খুব সুন্দর! একদম ঠিক মনে রেখেছেন। ইনি আপনার নাতি রোহন।",
        incorrectFeedback: "কাছাকাছি গেছেন, শান্তভাবে আরেকবার দেখুন।"
      },
      as: {
        question: "কোকা, এই মৰম লগা হাঁহিটো কাৰ?",
        clue: "যিয়ে চোতালত ৰঙা ফুলাম গামোচা বান্ধি আপোনাৰ সৈতে বিহু ঢোলৰ চাপৰ বজাইছিল।",
        story: "ৰোহণে বজাৰৰ পৰা গৰম জিলাপী আনে আৰু বাৰান্দাত বহি আপোনাৰ লগত বিহুৰ কথা পাতে।",
        correctFeedback: "বৰ ধুনীয়া! আপোনাৰ সঠিককৈ মনত আছে। এয়া আপোনাৰ নাতি ৰোহণ।",
        incorrectFeedback: "ওচৰ চাপিছে, লাহেকৈ আকৌ এবাৰ চাওক।"
      },
      ne: {
        question: "हजुरबुबा, यो मायालु मुस्कान कसको हो?",
        clue: "जसले आँगनमा रातो फुलाम गामुछा बाँधेर तपाईंसँगै बिहु ढोल बजाएको थियो।",
        story: "रोहनले बजारबाट तातो जेरी ल्याउँछन् र तपाईंसँग बसेर ढोलको ताल अभ्यास गर्न मन पराउँछन्।",
        correctFeedback: "धेरै राम्रो! तपाईंले एकदम सही सम्झनुभयो। यिनी तपाईंको नाति रोहन हुन्।",
        incorrectFeedback: "नजिकै पुग्नुभयो, शान्त भएर फेरि एकपटक हेर्नुहोस्।"
      }
    },
    hints: {
      en: [
        "A cheerful young grandson passionate about Assamese folk music.",
        "He proudly plays the classic 3-beat rhythm of the Bihu dhol for you.",
        "It is your grandson Rohan."
      ],
      as: [
        "বিহু সংগীত আৰু ঢোলৰ চৰ্চা কৰা এজন উৎসাহী ডেকা নাতি।",
        "চোতালত ফুলাম গামোচা বান্ধি আপোনাৰ কাষত বিহুৰ চাপৰ বজায়।",
        "এয়া আপোনাৰ নাতি ৰোহণ।"
      ],
      bn: [
        "বিহুর বাদ্যযন্ত্র বাজাতে পছন্দ করা এক হাসিখুশি তরুণ নাতি।",
        "গলায় লাল গামোছা জড়িয়ে আপনার সামনে ঢোল বাজাতে ভালোবাসে।",
        "ইনি আপনার নাতি রোহন।"
      ],
      ne: [
        "लोकसंगीत र बिहु ढोल बजाउन मन पराउने उत्साही नाति।",
        "आँगनमा तपाईंकै अगाडि बिहु ढोलको ताल अभ्यास गर्छन्।",
        "यिनी तपाईंको नाति रोहन हुन्।"
      ]
    }
  },
  {
    id: "item_deepak",
    imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    targetId: "deepak",
    level: 3, // Nuanced
    options: [
      {
        id: "deepak",
        personName: { en: "Deepak", bn: "দীপক", as: "দীপক", ne: "दीपक" },
        relationKey: "son"
      },
      {
        id: "rohan",
        personName: { en: "Rohan", bn: "রোহন", as: "ৰোহণ", ne: "रोहन" },
        relationKey: "grandson"
      },
      {
        id: "arun",
        personName: { en: "Arun", bn: "অরুণ", as: "অৰুণ", ne: "अरुण" },
        relationKey: "son"
      },
      {
        id: "pradip",
        personName: { en: "Pradip", bn: "প্রদীপ", as: "প্ৰদীপ", ne: "प्रदीप" },
        relationKey: "brother"
      }
    ],
    content: {
      en: {
        question: "Who is this bringing you a fresh brass cup of tea today?",
        clue: "He brought the fragrant box of first-flush Golden Tips tea straight from Upper Assam.",
        story: "Deepak makes sure you enjoy your evening tea in your favorite brass cup while discussing the day.",
        correctFeedback: "Wonderful! You remembered correctly. That is your son Deepak.",
        incorrectFeedback: "That is close, take a slow look again."
      },
      bn: {
        question: "আজকে আপনার জন্য কাংস্য বাটিতে চা নিয়ে কে এসেছেন?",
        clue: "যিনি আপার অসমের বাগান থেকে সুগন্ধি গোল্ডেন টিপস চা এনে দিয়েছেন।",
        story: "দীপক প্রতিদিন সন্ধ্যায় আপনার প্রিয় কাঁসার কাপে চা এনে দেন এবং খবরের কাগজ নিয়ে আলোচনা করেন।",
        correctFeedback: "খুব সুন্দর! একদম ঠিক মনে রেখেছেন। ইনি আপনার ছেলে দীপক।",
        incorrectFeedback: "কাছাকাছি গেছেন, শান্তভাবে আরেকবার দেখুন।"
      },
      as: {
        question: "আজি আপোনাৰ বাবে কাঁহৰ কাপত চাহ লৈ কোন আহিছে?",
        clue: "যিয়ে উজনি অসমৰ বাগিচাৰ পৰা সুগন্ধি ফাৰ্ষ্ট-ফ্লাছ গোল্ডেন টিপছ চাহৰ বাকচ আনিছিল।",
        story: "দীপকে সদায় সন্ধিয়া আপোনাৰ প্ৰিয় কাঁহৰ কাপত চাহ দিয়ে আৰু বাতৰি কাকতৰ বিষয়ে কথা পাতে।",
        correctFeedback: "বৰ ধুনীয়া! আপোনাৰ সঠিককৈ মনত আছে। এয়া আপোনাৰ ল'ৰা দীপক।",
        incorrectFeedback: "ওচৰ চাপিছে, লাহেকৈ আকৌ এবাৰ চাওক।"
      },
      ne: {
        question: "आज तपाईंको लागि काँसको गिलासमा चिया लिएर को आएको छ?",
        clue: "जसले माथिल्लो असमको बगानबाट ताजा गोल्डेन टिप्स चियाको बट्टा ल्याएका थिए।",
        story: "दीपकले साँझपख तपाईंको मनपर्ने काँसको गिलासमा चिया ल्याएर खबरका कुरा गर्न मन पराउँछन्।",
        correctFeedback: "धेरै राम्रो! तपाईंले एकदम सही सम्झनुभयो। यिनी तपाईंको छोरा दीपक हुन्।",
        incorrectFeedback: "नजिकै पुग्नुभयो, शान्त भएर फेरि एकपटक हेर्नुहोस्।"
      }
    },
    hints: {
      en: [
        "Your eldest son who manages the green tea gardens in Golaghat.",
        "He brings you the fresh box of first-flush Golden Tips tea every weekend.",
        "It is your son Deepak."
      ],
      as: [
        "গোলাঘাটৰ চাহ বাগিচা পৰিচালনা কৰা আপোনাৰ ডাঙৰ ল’ৰা।",
        "প্ৰতি শনিবাৰে আপোনাৰ বাবে বাগানৰ সুগন্ধি গোল্ডেন টিপছ চাহ লৈ আহে।",
        "এয়া আপোনাৰ ল’ৰা দীপক।"
      ],
      bn: [
        "গোলাঘাটের চা বাগান দেখাশোনা করা আপনার বড় ছেলে।",
        "প্রতি সপ্তাহে আপনার জন্য সুগন্ধি ফার্স্ট-ফ্লাশ চা নিয়ে আসেন।",
        "ইনি আপনার ছেলে দীপক।"
      ],
      ne: [
        "गोलाघाटको चिया बगान सम्हाल्ने तपाईंको जेठो छोरा।",
        "हरेक साता तपाईंको लागि ताजा गोल्डेन टिप्स चिया ल्याउँछन्।",
        "यिनी तपाईंको छोरा दीपक हुन्।"
      ]
    }
  },
  {
    id: "item_ananya",
    imageSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    targetId: "ananya",
    level: 4, // Higher recall detail
    options: [
      {
        id: "ananya",
        personName: { en: "Ananya", bn: "অনন্যা", as: "অনন্যা", ne: "अनन्या" },
        relationKey: "daughter"
      },
      {
        id: "maina",
        personName: { en: "Maina", bn: "মায়না", as: "মায়না", ne: "माइना" },
        relationKey: "granddaughter"
      },
      {
        id: "kavita",
        personName: { en: "Kavita", bn: "কবিতা", as: "কবিতা", ne: "कविता" },
        relationKey: "niece"
      },
      {
        id: "sunita",
        personName: { en: "Sunita", bn: "সুনীতা", as: "সুনীতা", ne: "सुनीता" },
        relationKey: "daughter"
      }
    ],
    content: {
      en: {
        question: "Who is this smiling warmly in her silk Mekhela Sador?",
        clue: "She visits every Sunday evening to share ginger-clove tea and peaceful conversation.",
        story: "Ananya always checks that your warm shawl is comfortable and brings fresh flowers for the prayer room.",
        correctFeedback: "Wonderful! You remembered correctly. That is your daughter Ananya.",
        incorrectFeedback: "That is close, take a slow look again."
      },
      bn: {
        question: "সিল্কের পোশাকে সুন্দর করে হাসছেন ইনি কে?",
        clue: "যিনি প্রতি রবিবার সন্ধ্যায় আদা-লবঙ্গ চা আর শান্ত আড্ডা দিতে আসেন।",
        story: "অনন্যা সবসময় আপনার শাল ঠিক করে দেয় এবং ঠাকুরঘরের জন্য তাজা ফুল নিয়ে আসে।",
        correctFeedback: "খুব সুন্দর! একদম ঠিক মনে রেখেছেন। ইনি আপনার মেয়ে অনন্যা।",
        incorrectFeedback: "কাছাকাছি গেছেন, শান্তভাবে আরেকবার দেখুন।"
      },
      as: {
        question: "মুগাৰ সাজ পিন্ধি মৰমেৰে হাঁহি থকা এইগৰাকী কোন?",
        clue: "যিয়ে প্ৰতি দেওবাৰে সন্ধিয়া আদা-লং দিয়া চাহ আৰু শান্ত মনৰ মেল মাৰিবলৈ আহে।",
        story: "অনন্যাই সদায় আপোনাৰ চাদৰখন ঠিক কৰি দিয়ে আৰু গোসাঁইঘৰৰ বাবে নতুন ফুল লৈ আহে।",
        correctFeedback: "বৰ ধুনীয়া! আপোনাৰ সঠিককৈ মনত আছে। এয়া আপোনাৰ জী অনন্যা।",
        incorrectFeedback: "ওচৰ চাপিছে, লাহেকৈ আকৌ এবাৰ চাওক।"
      },
      ne: {
        question: "रेशमी पोशाकमा मायालु मुस्कान दिनुभएकी यिनी को हुन्?",
        clue: "जो हरेक आइतबार साँझ अदुवा-ल्वाङको चिया खान र शान्त गफगाफ गर्न आउँछिन्।",
        story: "अनन्याले सधैं तपाईंको न्यानो दोसल्ला मिलाइदिन्छिन् र पूजाकोठाका लागि ताजा फूलहरू ल्याउँछिन्।",
        correctFeedback: "धेरै राम्रो! तपाईंले एकदम सही सम्झनुभयो। यिनी तपाईंको छोरी अनन्या हुन्।",
        incorrectFeedback: "नजिकै पुग्नुभयो, शान्त भएर फेरि एकपटक हेर्नुहोस्।"
      }
    },
    hints: {
      en: [
        "A compassionate physician working at Guwahati Medical College.",
        "She arrives dressed in elegant Muga silk Mekhela Sador with fresh evening flowers.",
        "It is your daughter Dr. Ananya."
      ],
      as: [
        "গুৱাহাটী চিকিৎসা মহাবিদ্যালয়ৰ এগৰাকী মৰমিয়াল চিকিৎসক জীয়ৰী।",
        "প্ৰতি দেওবাৰে মুগাৰ সাজ পিন্ধি গোসাঁইঘৰৰ নতুন ফুল লৈ আহে।",
        "এয়া আপোনাৰ মৰমৰ জী অনন্যা।"
      ],
      bn: [
        "গুয়াহাটি মেডিক্যাল কলেজে কর্মরত একজন স্নেহময়ী চিকিৎসক কন্যা।",
        "প্রতি রবিবার সন্ধ্যায় মুগা সিল্ক পরে আপনার খোঁজ নিতে আসেন।",
        "ইনি আপনার মেয়ে ডঃ অনন্যা।"
      ],
      ne: [
        "गुवाहाटी मेडिकल कलेजमा कार्यरत दयालु चिकित्सक छोरी।",
        "हरेक आइतबार साँझ रेशमी दोसल्ला लगाएर पूजाका फूलहरू ल्याउँछिन्।",
        "यिनी तपाईंको छोरी डाक्टर अनन्या हुन्।"
      ]
    }
  }
];

/**
 * Normalizes any dynamic family member records from backend into the authoritative MemoryItem schema.
 */
export function normalizeFamilyMemberToMemoryItem(member, index = 0) {
  if (member.targetId && member.options && member.content) {
    return member;
  }

  const name = member.name || `Family Member ${index + 1}`;
  const rawRel = (member.relation || 'granddaughter').toLowerCase();
  
  let relationKey = 'granddaughter';
  if (rawRel.includes('son') && !rawRel.includes('grand')) relationKey = 'son';
  else if (rawRel.includes('daughter') && !rawRel.includes('grand')) relationKey = 'daughter';
  else if (rawRel.includes('grandson')) relationKey = 'grandson';
  else if (rawRel.includes('granddaughter')) relationKey = 'granddaughter';
  else if (rawRel.includes('niece') || rawRel.includes('nephew')) relationKey = 'niece';

  const neutralId = (member._id || member.id || name).toLowerCase().replace(/[^a-z0-9]/g, '_');
  const clue = member.memoryHook || "A beloved family member visiting you with warmth and affection.";
  const story = member.voicePrompt || member.favoriteMemory || member.memoryHook || "Sharing joyful moments together at home.";

  return {
    id: `dyn_${neutralId}`,
    imageSrc: member.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    targetId: neutralId,
    level: Math.min(4, Math.max(1, (index % 4) + 1)),
    options: [
      {
        id: neutralId,
        personName: { en: name, bn: name, as: name, ne: name },
        relationKey
      },
      {
        id: `alt1_${neutralId}`,
        personName: { en: "Neighbor / Friend", bn: "প্রতিবেশী / বন্ধু", as: "চুবুৰীয়া / বন্ধু", ne: "छिमेकी / साथी" },
        relationKey: "niece"
      },
      {
        id: `alt2_${neutralId}`,
        personName: { en: "Cousin", bn: "জ্ঞাতি ভাই/বোন", as: "সম্পৰ্কীয় ভাই/ভনী", ne: "काका-मामाको छोरा/छोरी" },
        relationKey: "daughter"
      },
      {
        id: `alt3_${neutralId}`,
        personName: { en: "Family Elder", bn: "পরিবারের প্রবীণ", as: "পৰিয়ালৰ জ্যেষ্ঠ", ne: "परिवारको ज्येष्ठ सदस्य" },
        relationKey: "son"
      }
    ],
    content: {
      en: {
        question: `Who is this visiting with you, Koka?`,
        clue: clue,
        story: story,
        correctFeedback: `Wonderful! You remembered correctly. It is ${name}.`,
        incorrectFeedback: "That is close, take a slow look again."
      },
      bn: {
        question: `কোকা, আপনার সঙ্গে কে দেখা করতে এসেছেন?`,
        clue: clue,
        story: story,
        correctFeedback: `খুব সুন্দর! একদম ঠিক মনে রেখেছেন। ইনি ${name}।`,
        incorrectFeedback: "কাছাকাছি গেছেন, শান্তভাবে আরেকবার দেখুন।"
      },
      as: {
        question: `কোকা, আপোনাক দেখা কৰিবলৈ কোন আহিছে?`,
        clue: clue,
        story: story,
        correctFeedback: `বৰ ধুনীয়া! আপোনাৰ সঠিককৈ মনত আছে। এয়া ${name}।`,
        incorrectFeedback: "ওচৰ চাপিছে, লাহেকৈ আকৌ এবাৰ চাওক।"
      },
      ne: {
        question: `हजुरबुबा, आज तपाईंलाई भेट्न को आएको छ?`,
        clue: clue,
        story: story,
        correctFeedback: `धेरै राम्रो! तपाईंले एकदम सही सम्झनुभयो। यिनी ${name} हुन्।`,
        incorrectFeedback: "नजिकै पुग्नुभयो, शान्त भएर फेरि एकपटक हेर्नुहोस्।"
      }
    },
    hints: {
      en: [
        `A dear family member who loves spending time with you.`,
        clue,
        `It is ${name}.`
      ],
      as: [
        `আপোনাৰ মৰমৰ পৰিয়ালৰ সদস্য।`,
        clue,
        `সঠিক নাম হ’ল ${name}।`
      ],
      bn: [
        `আপনার প্রিয় পরিবারের সদস্য।`,
        clue,
        `ইনি হলেন ${name}।`
      ],
      ne: [
        `तपाईंको मायालु परिवारका सदस्य।`,
        clue,
        `सही नाम ${name} हो।`
      ]
    }
  };
}
