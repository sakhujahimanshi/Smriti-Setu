/**
 * Smriti Setu — Authoritative North Eastern Region (NER) Cultural Dataset
 * 
 * Scope: 8 Sister States of North Eastern India:
 * - Arunachal Pradesh
 * - Assam
 * - Manipur
 * - Meghalaya
 * - Mizoram
 * - Nagaland
 * - Sikkim
 * - Tripura
 * 
 * Decoupled Architecture:
 * - region: "NER" (scope)
 * - state: Originating state metadata (preserves authentic identity)
 * - language: Presentation layer (Assamese, Bengali, Nepali, English)
 */

export const NER_STATES = [
  { id: 'assam', name: { en: 'Assam', as: 'অসম', bn: 'অসম', ne: 'असम' } },
  { id: 'meghalaya', name: { en: 'Meghalaya', as: 'মেঘালয়', bn: 'মেঘালয়', ne: 'मेघालय' } },
  { id: 'nagaland', name: { en: 'Nagaland', as: 'নাগালেণ্ড', bn: 'নাগাল্যান্ড', ne: 'नागाल्यान्ड' } },
  { id: 'manipur', name: { en: 'Manipur', as: 'মণিপুৰ', bn: 'মণিপুর', ne: 'मणिपुर' } },
  { id: 'mizoram', name: { en: 'Mizoram', as: 'মিজোৰাম', bn: 'মিজোরাম', ne: 'मिजोरम' } },
  { id: 'arunachal', name: { en: 'Arunachal Pradesh', as: 'অৰুণাচল প্ৰদেশ', bn: 'অরুণাচল প্রদেশ', ne: 'अरुणाचल प्रदेश' } },
  { id: 'sikkim', name: { en: 'Sikkim', as: 'ছিকিম', bn: 'সিকিম', ne: 'सिक्किम' } },
  { id: 'tripura', name: { en: 'Tripura', as: 'ত্ৰিপুৰা', bn: 'ত্রিপুরা', ne: 'त्रिपुरा' } }
];

export const NER_CULTURAL_STORIES = [
  // 1. ASSAM — Bohag Bihu & Dhol (Level 1: Gentle)
  {
    id: 'ner_assam_bihu_01',
    region: 'NER',
    state: 'Assam',
    category: 'festival',
    level: 1,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Rongali Bihu & Dhol',
    title: {
      en: 'Rongali Bihu Celebrations & The Dhol',
      as: 'ৰঙালী বিহু আৰু ঢোলৰ ছন্দ',
      bn: 'রঙালী বিহু ও ঢোলের ছন্দ',
      ne: 'रङ्गाली बिहु र ढोलको धुन'
    },
    subtitle: {
      en: 'Springtime warmth and the joyful beat of the wooden dhol in Assam',
      as: 'বসন্তৰ আগমন আৰু গাঁৱৰ চোতালত বিহু ঢোলৰ মাঙ্গলিক মাত',
      bn: 'বসন্তের আগমন ও উঠোনে বিহু ঢোলের মঙ্গলধ্বনি',
      ne: 'वसन्तको आगमन र आँगनमा बिहु ढोलको मधुर धुन'
    },
    story: {
      en: 'When the spring breeze sweeps across the green valleys of Assam, the rhythmic beat of the Bihu dhol fills the air with happiness. Families gather on the veranda, tying hand-woven red Phulam Gamusas with deep affection and sharing warm Til Pitha and fresh Doi-Chira.',
      as: 'যেতিয়া অসমৰ সেউজ উপত্যকাত বসন্তৰ মলয়া বতাহ বয়, বিহু ঢোলৰ মাতে সকলোৰে মন আনন্দৰে ওপচাই পেলায়। সকলোৱে বাৰান্দাত বহি মৰমৰ ফুলাম গামোচাখন ডিঙিত মেৰিয়াই লয় আৰু গৰম তিল পিঠা আৰু দৈ-চিৰাৰে আপ্যায়ন কৰে।',
      bn: 'যখন অসমের সবুজ উপত্যকায় বসন্তের মৃদু বাতাস বয়ে যায়, বিহু ঢোলের ছন্দ সবার মনে আনন্দ এনে দেয়। পরিবারের সকলে বারান্দায় বসে লাল ফুলের নকশাতোলা গামোছা পরে এবং গরম তিল পিঠে আর দৈ-চিঁড়ে খায়।',
      ne: 'जब असमको हरियाली उपत्यकामा वसन्तको हावा चल्छ, बिहु ढोलको धुनले मनै हर्षित बनाउँछ। सबैजना बरण्डामा बसेर रातो फुलाम गामुछा ओढ्छन् र तातो तिलको पिठा अनि दही-चिउरा बाँडेर खान्छन्।'
    },
    reflectionPrompt: {
      en: 'Do you remember the morning laughter when the first Bihu beat started on your courtyard?',
      as: 'আপোনাৰ মনত পৰে নে, পুৱা চোতালত প্ৰথম বিহুৰ ঢোলৰ চাপৰ শুনাৰ সেই আনন্দৰ কথা?',
      bn: 'আপনার কি মনে পড়ে, সকালে উঠোনে প্রথম বিহুর ঢাকের তাল শোনার সেই আনন্দের দিনগুলো?',
      ne: 'के तपाईंलाई सम्झना छ, बिहान आँगनमा बिहु ढोलको पहिलो ताल बज्दाको त्यो खुसी?'
    },
    recallQuestion: {
      question: {
        en: 'What sweet traditional food is lovingly shared on the veranda during Bihu morning?',
        as: 'বিহুৰ পুৱা বাৰান্দাত মৰমেৰে কোনবিধ পৰম্পৰাগত খাদ্য খোৱা হয়?',
        bn: 'বিহুর সকালে বারান্দায় বসে ভালোবাসার সাথে কোন মিষ্টি ঐতিহ্যবাহী খাবার খাওয়া হয়?',
        ne: 'बिहुको बिहान बरण्डामा मायाका साथ कुन परम्परागत मीठो परिकार खाइन्छ?'
      },
      choices: [
        {
          id: 'til_pitha',
          label: {
            en: 'Warm Til Pitha & Doi-Chira',
            as: 'গৰম তিল পিঠা আৰু দৈ-চিৰা',
            bn: 'গরম তিল পিঠে ও দৈ-চিঁড়ে',
            ne: 'तातो तिलको पिठा र दही-चिउरा'
          },
          isCorrect: true
        },
        {
          id: 'bread_butter',
          label: {
            en: 'Market Bread & Biscuits',
            as: 'বজাৰৰ পাউৰুটী আৰু বিস্কুট',
            bn: 'বাজারের পাউরুটি ও বিস্কুট',
            ne: 'बजारको पाउरोटी र बिस्कुट'
          },
          isCorrect: false
        }
      ],
      targetId: 'til_pitha'
    },
    hints: {
      en: [
        'A warm delicacy made of soaked Bora rice and black sesame sweet jaggery.',
        'Served on polished brass plates with sweet fresh curd.',
        'It is hot Til Pitha and Doi-Chira.'
      ],
      as: [
        'বৰা চাউল আৰু ক’লা তিলৰ গুৰেৰে ভজা পৰম্পৰাগত পিঠা।',
        'কাঁহৰ বাটিত ঘৰুৱা মিঠা দৈ আৰু চিৰাৰ লগত খোৱা হয়।',
        'এয়া হৈছে গৰম তিল পিঠা আৰু দৈ-চিৰা।'
      ],
      bn: [
        'বোরো চাল আর কালো তিলের গুড় দিয়ে তৈরি ঐতিহ্যবাহী মিষ্টি পিঠে।',
        'কাঁসার বাটিতে মিষ্টি দই ও চিঁড়ের সাথে পরিবেশন করা হয়।',
        'এটি হলো গরম তিল পিঠে ও দৈ-চিঁড়ে।'
      ],
      ne: [
        'भिजाएको चामल र कालो तिलको सखरबाट बनाइने तातो परिकार।',
        'काँसको कचौरामा ताजा दही र चिउरासँग खाइन्छ।',
        'यो तातो तिलको पिठा र दही-चिउरा हो।'
      ]
    }
  },

  // 2. MEGHALAYA — Living Root Bridges of Cherrapunji (Level 2: Easy)
  {
    id: 'ner_meghalaya_rootbridge_02',
    region: 'NER',
    state: 'Meghalaya',
    category: 'heritage',
    level: 2,
    imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Living Root Bridges of Meghalaya',
    title: {
      en: 'Living Root Bridges of Meghalaya',
      as: 'মেঘালয়ৰ জীৱন্ত শিপাৰ সাঁকো (Jingkieng Jri)',
      bn: 'মেঘালয়ের জীবন্ত শিকড়ের সেতু (Jingkieng Jri)',
      ne: 'मेघालयको जीवित जराको पुल (Jingkieng Jri)'
    },
    subtitle: {
      en: 'Ancient Khasi and Jaintia wisdom guiding rubber tree roots across cascading mountain rivers',
      as: 'খাচী পাহাৰৰ প্ৰাকৃতিক বুদ্ধিমত্তাৰে গঢ়ি তোলা যুগমীয়া শিপাৰ সাঁকো',
      bn: 'খাসি পাহাড়ের প্রাকৃতিক দক্ষতায় গড়ে ওঠা শতবর্ষের জীবন্ত সাঁকো',
      ne: 'खासी पहाडको परम्परागत ज्ञानले बनेको जीवित रुखको जराको पुल'
    },
    story: {
      en: 'High up in the mist-laden hills of Cherrapunji and Nongriat, Khasi elders have guided the living aerial roots of Indian rubber fig trees across roaring mountain streams for centuries. With patience and respect for nature, these living bridges grow stronger every year, holding communities together across generations.',
      as: 'মেঘালয়ৰ চেৰাপুঞ্জী আৰু নংৰিয়াতৰ পাহাৰত যুগ যুগ ধৰি খাচী সম্প্ৰদায়ৰ লোকসকলে ৰবৰ গছৰ শিপাবোৰ নৈৰ সিপাৰলৈ বৈ নি জীৱন্ত সাঁকো গঢ়ি তুলিছে। প্ৰকৃতিৰ লগত সহবাস কৰি গঢ়ি তোলা এই শিপাৰ সাঁকোবোৰ সময়ৰ লগে লগে আৰু অধিক শক্তিশালী হৈ পৰে।',
      bn: 'মেঘালয়ের চেরাপুঞ্জি ও নংরিয়াটের পাহাড়ে শতাব্দী ধরে খাসি প্রবীণরা রবার গাছের ঝুরি শিকড়কে নদীর ওপারে মিলিয়ে জীবন্ত সাঁকো গড়ে তুলেছেন। প্রকৃতির প্রতি শ্রদ্ধায় গড়ে তোলা এই সেতুগুলি বয়সের সাথে সাথে আরও মজবুত হয়ে ওঠে।',
      ne: 'मेघालयको चेरापुन्जी र नोङ्रियाट पहाडमा शताब्दीयौँदेखि खासी समुदायले रबरको रुखका जराहरूलाई खोलाको वारपार मिलाएर जीवित पुल बनाएका छन्। प्रकृतिको सम्मान गर्दै बनाइएका यी पुलहरू समयसँगै झन् बलिया हुँदै जान्छन्।'
    },
    reflectionPrompt: {
      en: 'Can you picture the fresh smell of mountain rain falling over the cool green moss and living bridges?',
      as: 'পাহাৰীয়া জুৰ বৰষুণৰ পিছত শেলাই লগা সেউজীয়া শিপাৰ সাঁকোখনৰ সুবাস আপোনাৰ মনলৈ আহে নে?',
      bn: 'পাহাড়ের মিষ্টি বৃষ্টির পর সবুজ শেওলা আর জীবন্ত শিকড়ের ভেজা সুবাস কি আপনার মনে পড়ে?',
      ne: 'पहाडी चिसो वर्षापछि हरियो लेउ र जीवित जराको पुलको ताजा सुगन्ध याद आउँछ?'
    },
    recallQuestion: {
      question: {
        en: 'What living part of the tree was guided by Meghalaya elders to form these natural bridges?',
        as: 'মেঘালয়ৰ বয়োজ্যেষ্ঠসকলে গছৰ কোনটো জীৱন্ত অংশৰে নৈৰ ওপৰত এই সাঁকো সাজিছিল?',
        bn: 'মেঘালয়ের প্রবীণরা গাছের কোন জীবন্ত অংশ দিয়ে নদীর উপর এই প্রাকৃতিক সাঁকো গড়েছিলেন?',
        ne: 'मेघालयका पुर्खाहरूले रुखको कुन जीवित अङ्गलाई जोडेर यो प्राकृतिक पुल बनाएका थिए?'
      },
      choices: [
        {
          id: 'tree_roots',
          label: {
            en: 'Living Aerial Roots (শিপা)',
            as: 'জীৱন্ত গছৰ শিপা (Living Roots)',
            bn: 'গাছের জীবন্ত শিকড় (Living Roots)',
            ne: 'रुखको जीवित जरा (Living Roots)'
          },
          isCorrect: true
        },
        {
          id: 'steel_ropes',
          label: {
            en: 'Steel Wire Ropes',
            as: 'লোহাৰ ৰছী',
            bn: 'লোহার তার ও দড়ি',
            ne: 'फलामको डोरी'
          },
          isCorrect: false
        },
        {
          id: 'bamboo_slats',
          label: {
            en: 'Cement Pillars',
            as: 'চিমেণ্টৰ স্তম্ভ',
            bn: 'সিমেন্টের পিলার',
            ne: 'सिमेन्टका खम्बा'
          },
          isCorrect: false
        }
      ],
      targetId: 'tree_roots'
    },
    hints: {
      en: [
        'It grows naturally from the ancient Ficus elastica fig trees.',
        'It weaves across the river and anchors deep into the earth.',
        'The answer is the living tree roots.'
      ],
      as: [
        'ৰবৰ গছৰ ডালৰ পৰা ওলমি থকা প্ৰাকৃতিক অংশ।',
        'নদীৰ সিপাৰে গৈ শিল আৰু মাটিত শিপাই মজবুত হয়।',
        'সঠিক উত্তৰ হ’ল গছৰ শিপা।'
      ],
      bn: [
        'প্রাচীন রবার গাছ থেকে প্রাকৃতিকভাবে নেমে আসা ঝুরি।',
        'নদীর ওপারে মাটিতে গেঁথে শক্ত সাঁকো তৈরি করে।',
        'সঠিক উত্তর হলো গাছের শিকড়।'
      ],
      ne: [
        'रुखबाट प्राकृतिक रूपमा झरेको हाँगाको अंश।',
        'खोलाको वारपार पुगेर ढुङ्गा र माटोमा दरिलो बन्छ।',
        'सही उत्तर रुखको जरा हो।'
      ]
    }
  },

  // 3. NAGALAND — Hornbill Festival & Kisama Heritage (Level 3: Moderate)
  {
    id: 'ner_nagaland_hornbill_03',
    region: 'NER',
    state: 'Nagaland',
    category: 'festival',
    level: 3,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Hornbill Festival & Kisama Village',
    title: {
      en: 'The Hornbill Festival & Naga Heritage',
      as: 'হৰ্ণবিল উৎসৱ আৰু কিচামা ঐতিহ্য',
      bn: 'হর্নবিল উৎসব ও নাগাল্যান্ডের ঐতিহ্য',
      ne: 'हर्नबिल चाड र नागा परम्परा'
    },
    subtitle: {
      en: 'The Festival of Festivals in Kisama celebrating valor, traditional weaving, and folk songs',
      as: 'নাগালেণ্ডৰ কিচামা গাঁৱত জনজাতিসকলৰ মিলন উৎসৱ আৰু ঐতিহ্যমণ্ডিত কাপোৰৰ সৌন্দৰ্য্য',
      bn: 'কিসামা গ্রামে সমস্ত নাগা জনগোষ্ঠীর মিলনমেলা ও ঐতিহ্যবাহী বস্ত্রের সৌন্দর্য',
      ne: 'किसामा गाउँमा नागा जनजातिको भव्य चाड, परम्परागत बुनाइ र लोकगीत'
    },
    story: {
      en: 'Every December, the cool foothills of Mount Japfu near Kohima awaken with the grand Hornbill Festival at Kisama Heritage Village. Elders and youth from all Naga tribes don their hand-woven traditional shawls, feather headdresses, and amber beads, gathering around evening log fires to sing historic anthems of harmony.',
      as: 'প্ৰতি ডিচেম্বৰত কহিমাৰ ওচৰৰ কিচামা ঐতিহ্য গাঁৱত বিখ্যাত হৰ্ণবিল উৎসৱ অনুষ্ঠিত হয়। সকলো নাগা জনগোষ্ঠীৰ লোকসকলে নিজৰ হাতে বোৱা পৰম্পৰাগত ৰঙীন চাদৰ আৰু পখিৰ পাখিৰ শিৰস্ত্ৰাণ পিন্ধি জুইৰ কাষত সমবেত হৈ ঐক্য আৰু শান্তিৰ গীত গায়।',
      bn: 'প্রতি বছর ডিসেম্বরে কোহিমার কাছে কিসামা ঐতিহ্যবাহী গ্রামে বিখ্যাত হর্নবিল উৎসব অনুষ্ঠিত হয়। সমস্ত নাগা উপজাতির প্রবীণ ও নবীনরা তাদের হাতে বোনা বর্ণিল শাল এবং পালকের শিরস্ত্রাণ পরে আগুনের পাশে বসে ঐতিহ্যের গান গান।',
      ne: 'हरेक डिसेम्बरमा कोहिमा नजिकैको किसामा गाउँमा प्रसिद्ध हर्नबिल चाड मनाइन्छ। सबै नागा जनजातिका पुर्खाहरू र युवाहरूले हातले बुनेका रङ्गीन दोसल्ला र प्वाँखको मुकुट लगाएर आगोको वरिपरि बसी एकताका गीतहरू गाउँछन्।'
    },
    reflectionPrompt: {
      en: 'Do you remember sitting warmly by a winter wood fire, listening to ancestral stories echoing in the hills?',
      as: 'জাৰকালি পাহাৰৰ জুইৰ কাষত বহি পুৰণি বীৰত্বৰ সাধু শুনাৰ স্মৃতি আপোনাৰ মনলৈ আহে নে?',
      bn: 'শীতের সন্ধ্যায় আগুনের পাশে বসে পাহাড়ের প্রাচীন গল্প শোনার স্মৃতি কি মনে পড়ে?',
      ne: 'जाडो याममा आगो ताप्दै पहाडमा गुञ्जिने पुराना कथाहरू सुनेको सम्झना छ?'
    },
    recallQuestion: {
      question: {
        en: 'At which historic heritage village near Kohima do Naga tribes gather for the Hornbill Festival?',
        as: 'কহিমাৰ সমীপৰ কোনখন ঐতিহ্যবাহী গাঁৱত হৰ্ণবিল উৎসৱ উদযাপনৰ বাবে সকলো সমবেত হয়?',
        bn: 'কোহিমার কাছে কোন ঐতিহ্যবাহী গ্রামে হর্নবিল উৎসব উপলক্ষে সবাই একত্রিত হয়?',
        ne: 'कोहिमा नजिकैको कुन ऐतिहासिक परम्परागत गाउँमा हर्नबिल चाड मनाइन्छ?'
      },
      choices: [
        {
          id: 'kisama_village',
          label: {
            en: 'Kisama Heritage Village',
            as: 'কিচামা ঐতিহ্য গাঁও (Kisama)',
            bn: 'কিসামা ঐতিহ্যবাহী গ্রাম (Kisama)',
            ne: 'किसामा परम्परागत गाउँ (Kisama)'
          },
          isCorrect: true
        },
        {
          id: 'delhi_haat',
          label: {
            en: 'City Trade Hall',
            as: 'চহৰৰ বাণিজ্য ভৱন',
            bn: 'শহরের বাণিজ্য মেলা',
            ne: 'सहरको व्यापार भवन'
          },
          isCorrect: false
        },
        {
          id: 'railway_colony',
          label: {
            en: 'Railway Town Center',
            as: 'ৰে’ল ষ্টেচন কলনি',
            bn: 'রেলওয়ে টাউন সেন্টার',
            ne: 'रेलवे स्टेसन क्षेत्र'
          },
          isCorrect: false
        },
        {
          id: 'airport_plaza',
          label: {
            en: 'Modern Airport Plaza',
            as: 'বিমানবন্দৰৰ প্ৰাংগণ',
            bn: 'বিমানবন্দর চত্বর',
            ne: 'विमानस्थल परिसर'
          },
          isCorrect: false
        }
      ],
      targetId: 'kisama_village'
    },
    hints: {
      en: [
        'A dedicated cultural village nestled in the foothills of Mount Japfu near Kohima.',
        'Its name begins with the letter "K".',
        'It is Kisama Heritage Village.'
      ],
      as: [
        'কহিমাৰ ওচৰৰ জাপফু পাহাৰৰ পাদদেশত নিৰ্মিত বিশেষ সাংস্কৃতিক গাঁও।',
        'নামটো "কি" (K) আখৰেৰে আৰম্ভ হয়।',
        'সঠিক স্থান হ’ল কিচামা ঐতিহ্য গাঁও।'
      ],
      bn: [
        'কোহিমার কাছে জাপফু পাহাড়ের কোলে গড়ে ওঠা বিশেষ সাংস্কৃতিক গ্রাম।',
        'নামটি "কি" (K) দিয়ে শুরু হয়।',
        'সঠিক উত্তর হলো কিসামা ঐতিহ্যবাহী গ্রাম।'
      ],
      ne: [
        'कोहिमा नजिकै जाप्फु पहाडको काखमा रहेको विशेष सांस्कृतिक गाउँ।',
        'यसको नाम "कि" (K) बाट सुरु हुन्छ।',
        'सही ठाउँ किसामा परम्परागत गाउँ हो।'
      ]
    }
  },

  // 4. MANIPUR — Loktak Lake & Floating Phumdis (Level 4: Challenging / Nuanced)
  {
    id: 'ner_manipur_loktak_04',
    region: 'NER',
    state: 'Manipur',
    category: 'nature',
    level: 4,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Loktak Lake & Floating Phumdis',
    title: {
      en: 'Loktak Lake & The Floating Islands of Manipur',
      as: 'মণিপুৰৰ লোকটাক হ্ৰদ আৰু ওপঙা ফুmdi',
      bn: 'মণিপুরের লোকটাক হ্রদ ও ভাসমান ফুমদি',
      ne: 'मणिपुरको लोकताक ताल र तैरिने फुमदी'
    },
    subtitle: {
      en: 'The emerald jewel of Manipur with circular floating islands and the noble Sangai deer',
      as: 'মণিপুৰৰ লোকটাক হ্ৰদৰ প্ৰাকৃতিক ওপঙা দ্বীপ আৰু বিপন্ন চাংগাই পহুৰ সংৰক্ষণ স্থলী',
      bn: 'মণিপুরের লোকটাক হ্রদের বৃত্তাকার ভাসমান দ্বীপ ও বিরল সাঙ্গাই হরিণের অভয়ারণ্য',
      ne: 'मणिपुरको सुन्दर लोकताक ताल, तैरिने टापुहरू र दुर्लभ साङ्गै मृग'
    },
    story: {
      en: 'Loktak Lake, the largest freshwater lake in North East India, is renowned for its miraculous "Phumdis" — floating circular masses of vegetation, soil, and organic matter. Within the Keibul Lamjao National Park, the only floating park in the world, the gentle brow-antlered Sangai deer gracefully balances on these buoyant emerald islands.',
      as: 'উত্তৰ-পূৰ্বাঞ্চলৰ আটাইতকৈ ডাঙৰ নিৰ্মল পানীৰ হ্ৰদ লোকটাক হ্ৰদ নিজৰ ওপঙা "ফুmdi"ৰ বাবে বিশ্ববিখ্যাত। বিশ্বৰ একমাত্ৰ ওপঙা ৰাষ্ট্ৰীয় উদ্যান কেইবুল লামজাওত মণিপুৰৰ ৰাজ্যিক পশু, চঞ্চল আৰু সুন্দৰ চাংগাই পহুটোৱে এই প্ৰাকৃতিক ওপঙা দ্বীপবোৰত বিচৰণ কৰে।',
      bn: 'উত্তর-পূর্ব ভারতের বৃহত্তম মিষ্টি জলের হ্রদ লোকটাক হ্রদ তার অদ্ভুত "ফুমদি" বা ভাসমান বৃত্তাকার দ্বীপগুলির জন্য বিশ্বখ্যাত। বিশ্বের একমাত্র ভাসমান জাতীয় উদ্যান কেইবুল লামজাওতে মণিপুরের রাজ্য পশু বিরল সাঙ্গাই হরিণ ঘুরে বেড়ায়।',
      ne: 'उत्तर-पूर्वी भारतको सबैभन्दा ठूलो ताजा पानीको ताल लोकताक ताल आफ्ना तैरिने "फुमदी" टापुहरूका लागि विश्वभर प्रसिद्ध छ। संसारकै एक मात्र तैरिने राष्ट्रिय निकुञ्ज केइबुल लामजाओमा सुन्दर साङ्गै मृगहरू यहाँ विचरण गर्छन्।'
    },
    reflectionPrompt: {
      en: 'Do you remember the tranquil calm of gliding in a small wooden canoe across clear waters surrounded by floating lotus?',
      as: 'পদুম ফুল আৰু ফুmdiৰে ভৰা শান্ত পানীত নাও চলাই জুৰ বতাহ উপভোগ কৰাৰ সেই শান্ত অনুভূতি মনত পৰে নে?',
      bn: 'পদ্মফুল ও ভাসমান দ্বীপে ঘেরা শান্ত হ্রদের বুকে নৌকায় ভেসে বেড়ানোর সেই স্নিগ্ধ অনুভূতি কি মনে পড়ে?',
      ne: 'कमलको फूल र तैरिने टापुको बीचमा शान्त तालमा डुङ्गा चलाउँदाको त्यो मनमोहक सम्झना याद छ?'
    },
    recallQuestion: {
      question: {
        en: 'What unique brow-antlered deer finds its sanctuary on the floating Phumdis of Loktak Lake?',
        as: 'লোকটাক হ্ৰদৰ ওপঙা ফুmdiত মণিপুৰৰ কোনটো বিৰল আৰু মৰম লগা পহুৱে বাস কৰে?',
        bn: 'লোকটাক হ্রদের ভাসমান ফুমদিতে মণিপুরের কোন দুর্লভ ও সুন্দর হরিণ বাস করে?',
        ne: 'लोकताक तालका तैरिने फुमदीहरूमा मणिपुरको कुन दुर्लभ मृग बसोबास गर्छ?'
      },
      choices: [
        {
          id: 'sangai_deer',
          label: {
            en: 'Sangai Deer (চাংগাই পহু)',
            as: 'চাংগাই পহু (Sangai Deer)',
            bn: 'সাঙ্গাই হরিণ (Sangai Deer)',
            ne: 'साङ्गै मृग (Sangai Deer)'
          },
          isCorrect: true
        },
        {
          id: 'spotted_deer',
          label: {
            en: 'Common Spotted Deer',
            as: 'সাধাৰণ ফুটুকীয়া পহু',
            bn: 'সাধারণ চিত্রা হরিণ',
            ne: 'साधारण चित्तल'
          },
          isCorrect: false
        },
        {
          id: 'wild_bison',
          label: {
            en: 'Forest Bison',
            as: 'বনৰীয়া মিথুন / গৰু',
            bn: 'বুনো বাইসন',
            ne: 'जङ्गली बाइसन'
          },
          isCorrect: false
        },
        {
          id: 'mountain_goat',
          label: {
            en: 'Snow Mountain Goat',
            as: 'পাহাৰীয়া ছাগলী',
            bn: 'পাহাড়ি ছাগল',
            ne: 'हिमाली बाख्रा'
          },
          isCorrect: false
        }
      ],
      targetId: 'sangai_deer'
    },
    hints: {
      en: [
        'Known as the "dancing deer" of Manipur due to its delicate footing on floating grass.',
        'It has majestic curved antlers and is the state animal of Manipur.',
        'It is the noble Sangai deer.'
      ],
      as: [
        'ওপঙা ঘাঁহৰ ওপৰত খোজ কঢ়াৰ বাবে ইয়াক মণিপুৰৰ "নৃত্যৰত পহু" বুলিও জনা যায়।',
        'মণিপুৰৰ ৰাজ্যিক পশু যি কেইবুল লামজাওত সংৰক্ষিত।',
        'সঠিক উত্তৰ হ’ল চাংগাই পহু।'
      ],
      bn: [
        'ভাসমান ঘাসের উপর চড়ে বেড়ানোর কারণে একে মণিপুরের "নাচুনে হরিণ" বলা হয়।',
        'মণিপুরের রাজ্য পশু যার মাথায় সুন্দর বাঁকানো শিং থাকে।',
        'সঠিক উত্তর হলো সাঙ্গাই হরিণ।'
      ],
      ne: [
        'तैरिने घाँसमा सन्तुलन मिलाएर हिँड्ने भएकाले यसलाई मणिपुरको "नाच्ने मृग" पनि भनिन्छ।',
        'यो मणिपुरको राजकीय जनावर हो।',
        'सही उत्तर साङ्गै मृग हो।'
      ]
    }
  },

  // 5. MIZORAM — Cheraw Bamboo Dance & Chapchar Kut (Level 2: Easy)
  {
    id: 'ner_mizoram_cheraw_05',
    region: 'NER',
    state: 'Mizoram',
    category: 'craft',
    level: 2,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Cheraw Bamboo Dance of Mizoram',
    title: {
      en: 'The Cheraw Bamboo Dance of Mizoram',
      as: 'মিজোৰামৰ চেৰাও বাঁহ নৃত্য (Cheraw Dance)',
      bn: 'মিজোরামের চেরাও বাঁশ নৃত্য (Cheraw Dance)',
      ne: 'मिजोरमको चेराव बाँस नृत्य (Cheraw Dance)'
    },
    subtitle: {
      en: 'The rhythmic tapping of polished bamboo poles during Chapchar Kut spring harvest',
      as: 'মিজো পাহাৰৰ বসন্ত উৎসৱ চাপচাৰ কুটত বাঁহৰ সুন্দৰ ছন্দময় নৃত্য',
      bn: 'মিজোরামের বসন্ত উৎসবে বাঁশের ছন্দে অনুপম ঐতিহ্যবাহী নৃত্য',
      ne: 'मिजो पहाडको चापचार कुट चाडमा बाँसको तालमा गरिने परम्परागत नृत्य'
    },
    story: {
      en: 'During the vibrant festival of Chapchar Kut in Aizawl, the streets echo with the rhythmic clapping of bamboo poles. Young women dressed in traditional hand-woven Puanchei step gracefully in and out of the rhythmic grid, honoring nature and joyful harvest with unmatched poise and agility.',
      as: 'আইজলত চাপচাৰ কুট উৎসৱৰ সময়ত বাঁহৰ ছন্দময় শব্দৰে আকাশ মুখৰিত হৈ পৰে। পৰম্পৰাগত পুয়ানচেই চাদৰ পিন্ধি মিজো যুৱতীসকলে বাঁহৰ মাজত সুন্দৰ আৰু নিখুঁতভাৱে খোজ দি চেৰাও নৃত্য পৰিবেশন কৰে।',
      bn: 'আইজলে চাপচার কুট উৎসবের সময় বাঁশের ঠোকাঠুকির সুরে চারপাশ মেতে ওঠে। রঙিন ঐতিহ্যবাহী পোশাক পুয়ানচেই পরে তরুণীরা বাঁশের ফাঁকে নিখুঁত ছন্দে পা ফেলে চমৎকার চেরাও নৃত্য করে।',
      ne: 'आइजोलमा चापचार कुट चाडका बेला बाँसको तालले वातावरण गुञ्जिन्छ। परम्परागत पुवान्चेई पहिरनमा सजिएर मिजो युवतीहरूले बाँसको बिचमा लयबद्ध रूपमा पाइला चाल्दै चेराव नृत्य प्रस्तुत गर्छन्।'
    },
    reflectionPrompt: {
      en: 'Do you remember the cheerful rhythm of bamboo music bringing everyone together in celebration?',
      as: 'বাঁহৰ ছন্দময় তাল শুনি সকলোৱে একেলগে আনন্দ কৰাৰ সেই সোঁৱৰণি মনলৈ আহে নে?',
      bn: 'বাঁশের তাল আর হাসিমুখের সেই মিলনমেলার সুর কি আপনার মনে পড়ে?',
      ne: 'बाँसको मधुर ताल सुनेर सबैजना एकसाथ रमाएको त्यो दिन याद छ?'
    },
    recallQuestion: {
      question: {
        en: 'What natural forest material is rhythmically tapped together in the Cheraw dance?',
        as: 'চেৰাও নৃত্যত কোনবিধ প্ৰাকৃতিক পাহাৰীয়া সামগ্ৰীৰে ছন্দ তোলা হয়?',
        bn: 'চেরাও নৃত্যে কোন প্রাকৃতিক পাহাড়ি উপকরণ দিয়ে তাল তোলা হয়?',
        ne: 'चेराव नृत्यमा कुन प्राकृतिक पहाडी वस्तु बजाएर ताल निकालिन्छ?'
      },
      choices: [
        {
          id: 'bamboo_poles',
          label: {
            en: 'Bamboo Poles (বাঁহৰ কাণ্ড)',
            as: 'বাঁহৰ ডাঙৰ কাণ্ড (Bamboo Poles)',
            bn: 'বাঁশের বড় কাণ্ড (Bamboo Poles)',
            ne: 'बाँसको लाठो (Bamboo Poles)'
          },
          isCorrect: true
        },
        {
          id: 'brass_cymbals',
          label: {
            en: 'Metal Trumpets',
            as: 'ধাতুৰ শিঙা',
            bn: 'ধাতুর তূর্য',
            ne: 'धातुको बाजा'
          },
          isCorrect: false
        },
        {
          id: 'iron_rods',
          label: {
            en: 'Iron Rods',
            as: 'লোহাৰ শলা',
            bn: 'লোহার রড',
            ne: 'फलामको डन्डी'
          },
          isCorrect: false
        }
      ],
      targetId: 'bamboo_poles'
    },
    hints: {
      en: [
        'A hollow, strong green forest stalk abundantly found across the hills of Mizoram.',
        'Two performers hold pairs horizontally on the ground and tap them rhythmically.',
        'It is bamboo poles.'
      ],
      as: [
        'মিজোৰামৰ পাহাৰত উভৈনদীকৈ পোৱা দীঘল সেউজীয়া পাহাৰীয়া সামগ্ৰী।',
        'মাটিত দুজনে জোৰা পাতি ছন্দত টুক টুককৈ বজায়।',
        'সঠিক উত্তৰ হ’ল বাঁহৰ কাণ্ড।'
      ],
      bn: [
        'মিজোরামের পাহাড়ে প্রচুর পরিমাণে হওয়া ফাঁপা শক্ত সবুজ বনজ উপাদান।',
        'মাটিতে দুজন তালে তালে আঘাত করে ছন্দ তোলে।',
        'সঠিক উত্তর হলো বাঁশের কাণ্ড।'
      ],
      ne: [
        'मिजोरमका पहाडहरूमा प्रशस्त पाइने कडा हरियो वनस्पति।',
        'दुई जनाले भुइँमा राखेर ताल मिलाउँदै बजाउँछन्।',
        'सही उत्तर बाँसको लाठो हो।'
      ]
    }
  },

  // 6. ARUNACHAL PRADESH — Tawang Monastery & Snow Peaks (Level 3: Moderate)
  {
    id: 'ner_arunachal_tawang_06',
    region: 'NER',
    state: 'Arunachal Pradesh',
    category: 'heritage',
    level: 3,
    imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Tawang Monastery in Arunachal',
    title: {
      en: 'Tawang Monastery & The High Himalayan Peaks',
      as: 'তাৱাং মহাবিহাৰ আৰু হিমালয়ৰ বৰফাবৃত শৃঙ্গ',
      bn: 'তাওয়াং মহাবিহার ও হিমালয়ের বরফাবৃত শৃঙ্গ',
      ne: 'तवाङ गुम्बा र उच्च हिमाली शिखरहरू'
    },
    subtitle: {
      en: 'The serene 400-year-old monastery perched among the clouds in Arunachal Pradesh',
      as: 'মেঘৰ দেশ অৰুণাচলৰ তাৱাং পাহাৰত অৱস্থিত চাৰিশ বছৰ পুৰণি পৱিত্ৰ বৌদ্ধ বিহাৰ',
      bn: 'মেঘের রাজ্য অরুণাচলের পাহাড়ে অবস্থিত চারশত বছরের প্রাচীন বৌদ্ধ মহাবিহার',
      ne: 'अरुणाचल प्रदेशको तवाङमा रहेको चार सय वर्ष पुरानो पवित्र बौद्ध गुम्बा'
    },
    story: {
      en: 'Perched at ten thousand feet overlooking snow-crested mountain passes, Tawang Monastery is the largest monastery in India. Golden prayer wheels turn softly in the crisp mountain breeze, while red-robed Monpa monks chant deep sacred prayers under the watchful gaze of a grand 26-foot gilded Buddha statue.',
      as: 'হিমালয়ৰ বৰফাবৃত পাহাৰৰ মাজত দহ হাজাৰ ফুট উচ্চতাত অৱস্থিত তাৱাং মহাবিহাৰ ভাৰতৰ আটাইতকৈ ডাঙৰ বৌদ্ধ বিহাৰ। শীতল বতাহত সোণালী প্ৰাৰ্থনা চক্ৰবোৰ লাহে লাহে ঘূৰি থাকে আৰু ২৬ ফুট ওখ সোণালী বুদ্ধ মূৰ্তিৰ তলত লামাসকলে শান্তিৰ মন্ত্ৰ পাঠ কৰে।',
      bn: 'হিমালয়ের বরফাবৃত পাহাড়ে দশ হাজার ফুট উঁচুতে অবস্থিত তাওয়াং মহাবিহার ভারতের বৃহত্তম বৌদ্ধবিহার। পাহাড়ি নির্মল বাতাসে সোনালী প্রার্থনাচক্রগুলি ঘুরে চলে এবং ছাব্বিশ ফুট উঁচু বুদ্ধমূর্তির পদতলে সন্ন্যাসীরা শান্ত মনে মন্ত্র পাঠ করেন।',
      ne: 'दश हजार फिटको उचाइमा हिउँले ढाकिएका पहाडहरूको बिचमा रहेको तवाङ गुम्बा भारतकै सबैभन्दा ठूलो गुम्बा हो। पहाडी चिसो हावामा सुनौलो माने घुम्छन् र छब्बीस फिट अग्लो बुद्धको मूर्तिको अगाडि शान्तिका मन्त्रहरू गुञ्जिन्छन्।'
    },
    reflectionPrompt: {
      en: 'Do you recall the pure peace of hearing morning temple bells ringing out over mountain mist?',
      as: 'পাহাৰীয়া কুঁৱলীৰ মাজত পুৱাৰ শান্ত মন্দিৰৰ ঘণ্টা বাজি উঠাৰ সেই পৱিত্ৰ অনুভৱ মনলৈ আহে নে?',
      bn: 'কুয়াশাঘেরা পাহাড়ি সকালে দূর থেকে ভেসে আসা শান্ত ঘণ্টার ধ্বনির কথা কি মনে পড়ে?',
      ne: 'बिहानको कुइरोमा पहाडभरि गुञ्जिने घण्टीको शान्त आवाज सुनेको याद छ?'
    },
    recallQuestion: {
      question: {
        en: 'At what sacred historical site in Arunachal Pradesh is India’s largest monastery situated?',
        as: 'অৰুণাচল প্ৰদেশৰ কোনখন পৱিত্ৰ পাহাৰীয়া ঠাইত ভাৰতৰ বৃহত্তম বৌদ্ধ বিহাৰ অৱস্থিত?',
        bn: 'অরুণাচল প্রদেশের কোন পবিত্র পাহাড়ি স্থানে ভারতের বৃহত্তম বৌদ্ধ মহাবিহার অবস্থিত?',
        ne: 'अरुणाचल प्रदेशको कुन पवित्र स्थानमा भारतकै सबैभन्दा ठूलो बौद्ध गुम्बा रहेको छ?'
      },
      choices: [
        {
          id: 'tawang',
          label: {
            en: 'Tawang (তাৱাং)',
            as: 'তাৱাং (Tawang)',
            bn: 'তাওয়াং (Tawang)',
            ne: 'तवाङ (Tawang)'
          },
          isCorrect: true
        },
        {
          id: 'guwahati_city',
          label: {
            en: 'Dispur City',
            as: 'দিছপুৰ মহানগৰী',
            bn: 'দিসপুর শহর',
            ne: 'दिसपुर सहर'
          },
          isCorrect: false
        },
        {
          id: 'siliguri_junction',
          label: {
            en: 'Railway Town',
            as: 'ৰে’ল চহৰ',
            bn: 'রেল শহর',
            ne: 'रेल सहर'
          },
          isCorrect: false
        },
        {
          id: 'coastal_port',
          label: {
            en: 'Sea Harbor',
            as: 'সাগৰীয় বন্দৰ',
            bn: 'সমুদ্র বন্দর',
            ne: 'समुद्री बन्दरगाह'
          },
          isCorrect: false
        }
      ],
      targetId: 'tawang'
    },
    hints: {
      en: [
        'A breathtaking Himalayan town in western Arunachal Pradesh famous for snow passes.',
        'Begins with the letter "T".',
        'It is Tawang.'
      ],
      as: [
        'পশ্চিম অৰুণাচলৰ বৰফেৰে আবৃত উচ্চ পাহাৰীয়া পৱিত্ৰ অঞ্চল।',
        'নামটো "তা" (T) আখৰেৰে আৰম্ভ হয়।',
        'সঠিক উত্তৰ হ’ল তাৱাং।'
      ],
      bn: [
        'পশ্চিম অরুণাচলের বরফে ঢাকা একটি মনোরম ঐতিহ্যবাহী পাহাড়ি শহর।',
        'নামটি "তা" (T) দিয়ে শুরু হয়।',
        'সঠিক উত্তর হলো তাওয়াং।'
      ],
      ne: [
        'पश्चिम अरुणाचलको हिउँले सजिएको एक सुन्दर ऐतिहासिक तीर्थस्थल।',
        'यसको नाम "त" (T) बाट सुरु हुन्छ।',
        'सही ठाउँ तवाङ हो।'
      ]
    }
  },

  // 7. SIKKIM — Kanchenjunga Dawn & Rumtek Monastery (Level 1: Gentle)
  {
    id: 'ner_sikkim_kanchenjunga_07',
    region: 'NER',
    state: 'Sikkim',
    category: 'nature',
    level: 1,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Mount Kanchenjunga Dawn in Sikkim',
    title: {
      en: 'Golden Dawn over Mount Kanchenjunga',
      as: 'কাঞ্চনজঙ্ঘাৰ পুৱাৰ সোণালী কিৰণ',
      bn: 'কাঞ্চনজঙ্ঘার ভোরের সোনালী কিরণ',
      ne: 'कञ्चनजङ्घाको बिहानीको सुनौलो किरण'
    },
    subtitle: {
      en: 'The guardian peak of Sikkim turning to radiant gold in the early morning light',
      as: 'ছিকিমৰ ৰক্ষক কাঞ্চনজঙ্ঘা শৃঙ্গত পুৱাৰ প্ৰথম ৰ’দৰ অপূৰ্ব শোভা',
      bn: 'সিকিমের অভিভাবক কাঞ্চনজঙ্ঘা চূড়ায় ভোরের প্রথম সূর্যের রূপালী ও সোনালী আলো',
      ne: 'सिक्किमको रक्षक कञ्चनजङ्घा हिमालमा बिहानीको पहिलो घामको सुन्दर दृश्य'
    },
    story: {
      en: 'As dawn breaks across Gangtok, the majestic snowy crests of Mount Kanchenjunga catch the first rays of the sun, glowing in bright amber gold against the blue Himalayan sky. Prayer flags flutter in the cool breeze, sending blessings of health and peace across the mountains.',
      as: 'গেংটকৰ পুৱতি আকাশত যেতিয়া বেলি ওলায়, কাঞ্চনজঙ্ঘাৰ বৰফাবৃত শৃঙ্গবোৰ সোণালী ৰঙেৰে উজলি উঠে। শীতল বতাহত ৰঙীন বৌদ্ধ প্ৰাৰ্থনা পতাকাবোৰে সকলোৰে বাবে সুখ, শান্তি আৰু সুস্বাস্থ্যৰ বাৰ্তা কঢ়িয়াই আনে।',
      bn: 'গ্যাংটকের ভোরের আকাশে যখন প্রথম সূর্য ওঠে, কাঞ্চনজঙ্ঘার তুষারশুভ্র শৃঙ্গগুলি উজ্জ্বল সোনালী আলোয় ঝলমল করে ওঠে। পাহাড়ি বাতাসে রঙিন প্রার্থনার পতাকাগুলি উড়ে শান্তি ও সুস্থতার বার্তা ছড়িয়ে দেয়।',
      ne: 'गान्तोकमा बिहानीको घाम झुल्कँदा कञ्चनजङ्घाको हिउँले ढाकिएको शिखर सुनझैँ चम्किन्छ। चिसो हावामा रङ्गीन लुङ्दर (प्रार्थना ध्वजा) फहराउँदै सबैका लागि सुख, शान्ति र सुस्वास्थ्यको कामना गर्छन्।'
    },
    reflectionPrompt: {
      en: 'Remember holding a steaming cup of tea in your hands while watching the majestic snowy peaks glow?',
      as: 'হাতত গৰম চাহৰ কাপটো লৈ বৰফৰ পাহাৰত পুৱাৰ সোণালী ৰ’দ পৰা চোৱাৰ সেই অনুপম অনুভূতি মনত পৰে নে?',
      bn: 'হাতে গরম চায়ের কাপ নিয়ে পাহাড়ের চূড়ায় সোনালী রোদ পড়ার সেই স্নিগ্ধ দৃশ্য কি মনে পড়ে?',
      ne: 'हातमा तातो चियाको कप लिएर हिमालमा सुनौलो घाम लागेको दृश्य हेरेको सम्झना छ?'
    },
    recallQuestion: {
      question: {
        en: 'What revered guardian snowy peak illuminates with golden light at dawn in Sikkim?',
        as: 'ছিকিমৰ পুৱাৰ বেলিৰ পোহৰত কোনটো পৱিত্ৰ বৰফাবৃত পৰ্বত শৃঙ্গ সোণালী হৈ উজলি উঠে?',
        bn: 'সিকিমের ভোরের সূর্যের আলোয় কোন বরফাবৃত পবিত্র পর্বতচূড়া সোনালী আলোয় আলোকিত হয়?',
        ne: 'सिक्किमको बिहानीको घाममा कुन पवित्र हिमाल सुनौलो भएर चम्किन्छ?'
      },
      choices: [
        {
          id: 'kanchenjunga',
          label: {
            en: 'Mount Kanchenjunga (কাঞ্চনজঙ্ঘা)',
            as: 'কাঞ্চনজঙ্ঘা (Kanchenjunga)',
            bn: 'কাঞ্চনজঙ্ঘা (Kanchenjunga)',
            ne: 'कञ्चनजङ्घा (Kanchenjunga)'
          },
          isCorrect: true
        },
        {
          id: 'desert_dune',
          label: {
            en: 'Sand Dune Hill',
            as: 'মৰুভূমিৰ বালিৰ ঢিপ',
            bn: 'মরুভূমির বালিয়াড়ি',
            ne: 'बालुवाको डाँडा'
          },
          isCorrect: false
        }
      ],
      targetId: 'kanchenjunga'
    },
    hints: {
      en: [
        'The third highest mountain peak in the world, revered as the sacred guardian of Sikkim.',
        'Its name begins with "K".',
        'It is Mount Kanchenjunga.'
      ],
      as: [
        'পৃথিৱীৰ তৃতীয় সৰ্বোচ্চ শৃঙ্গ যাক ছিকিমৰ লোকসকলে অতি পৱিত্ৰ জ্ঞান কৰে।',
        'নামটো "কা" (K) আখৰেৰে আৰম্ভ হয়।',
        'সঠিক উত্তৰ হ’ল কাঞ্চনজঙ্ঘা।'
      ],
      bn: [
        'বিশ্বের তৃতীয় উচ্চতম পর্বতশৃঙ্গ, যা সিকিমের পবিত্র রক্ষক বলে গণ্য করা হয়।',
        'নামটি "কা" (K) দিয়ে শুরু হয়।',
        'সঠিক উত্তর হলো কাঞ্চনজঙ্ঘা।'
      ],
      ne: [
        'संसारकै तेस्रो अग्लो हिमाल, जसलाई सिक्किमको पवित्र रक्षक मानिन्छ।',
        'यसको नाम "क" (K) बाट सुरु हुन्छ।',
        'सही हिमाल कञ्चनजङ्घा हो।'
      ]
    }
  },

  // 8. TRIPURA — Ujjayanta Palace & Neermahal Lake (Level 4: Challenging / Nuanced)
  {
    id: 'ner_tripura_ujjayanta_08',
    region: 'NER',
    state: 'Tripura',
    category: 'heritage',
    level: 4,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    favoriteTag: 'Ujjayanta & Neermahal Water Palace',
    title: {
      en: 'The Water Palace Neermahal of Tripura',
      as: 'ত্ৰিপুৰাৰ পানীৰ ৰাজপ্ৰসাদ নীৰমহল',
      bn: 'ত্রিপুরা রাজপ্রাসাদ ও ভাসমান নীরমহল',
      ne: 'त्रिपुराको जलमहल नीरमहल र उज्जायन्त दरबार'
    },
    subtitle: {
      en: 'The magnificent fairytale royal water palace resting in the heart of Rudrasagar Lake',
      as: 'ত্ৰিপুৰাৰ ৰুদ্ৰসাগৰ হ্ৰদৰ মাজমজিয়াত স্থাপিত সুন্দৰ ঐতিহাসিক পানীৰ মহল',
      bn: 'ত্রিপুরার রুদ্রসাগর হ্রদের শান্ত বুকে গড়ে ওঠা অপূর্ব ঐতিহাসিক জলপ্রাসাদ',
      ne: 'त्रिपुराको रुद्रसागर तालको बिचमा रहेको ऐतिहासिक जलमहल'
    },
    story: {
      en: 'Rising like a white marble dream in the center of Rudrasagar Lake, Neermahal is one of India’s only two water palaces. Built by Maharaja Bir Bikram Kishore Manikya, its ornate Mughal-Hindu arches reflect in the shimmering waters where migratory waterfowl glide during the calm winter months.',
      as: 'ত্ৰিপুৰাৰ ৰুদ্ৰসাগৰ হ্ৰদৰ বুকুত অৱস্থিত নীৰমহল ভাৰতৰ অন্যতম অপূৰ্ব পানীৰ ৰাজপ্ৰসাদ। মহাৰাজ বীৰ বিক্ৰম কিশোৰ মাণিক্যই নিৰ্মাণ কৰা এই মহলৰ সুন্দৰ ভাস্কৰ্য্যই আজিও হ্ৰদৰ পানীত শান্তভাৱে প্ৰতিফলিত হৈ গৌৰৱোজ্জ্বল ইতিহাসৰ কথা সোঁৱৰাই দিয়ে।',
      bn: 'ত্রিপুরার রুদ্রসাগর হ্রদের শান্ত বুকে অবস্থিত নীরমহল ভারতের অন্যতম বিস্ময়কর জলপ্রাসাদ। মহারাজা বীর বিক্রম কিশোর মাণিক্যের তৈরি এই প্রাসাদের স্থাপত্যশৈলী আজও হ্রদের স্নিগ্ধ জলে প্রতিফলিত হয়ে প্রাচীন রাজকীয় ঐতিহ্যের সাক্ষী দেয়।',
      ne: 'त्रिपुराको रुद्रसागर तालको बिचमा रहेको नीरमहल भारतकै भव्य जलमहलहरूमध्ये एक हो। महाराजा वीर विक्रम किशोर माणिक्यले बनाएको यो दरबारको सुन्दर बनावट आज पनि तालको शान्त पानीमा मनमोहक देखिन्छ।'
    },
    reflectionPrompt: {
      en: 'Do you remember the peaceful feeling of gliding on a boat towards the illuminated marble palace at sunset?',
      as: 'সন্ধিয়া বেলি লহিওৱা পৰত নাও লৈ পানীৰ মহলটোলৈ আগবঢ়াৰ সেই অপূৰ্ব শান্ত দৃশ্য মনলৈ আহে নে?',
      bn: 'সন্ধ্যার গোধূলি আলোয় নৌকায় ভেসে জলপ্রাসাদের দিকে এগিয়ে যাওয়ার সেই শান্ত রূপ কি মনে পড়ে?',
      ne: 'साँझको घाम अस्ताउँदा डुङ्गामा चढेर पानीको दरबारतर्फ जाँदाको त्यो शान्त दृश्य याद छ?'
    },
    recallQuestion: {
      question: {
        en: 'In the center of which historic lake in Tripura is the Neermahal water palace built?',
        as: 'ত্ৰিপুৰাৰ কোনটো ঐতিহাসিক হ্ৰদৰ মাজত নীৰমহল পানীৰ প্ৰসাদটো নিৰ্মাণ কৰা হৈছে?',
        bn: 'ত্রিপুরার কোন ঐতিহাসিক হ্রদের বুকে ভাসমান নীরমহল জলপ্রাসাদটি অবস্থিত?',
        ne: 'त्रिपुराको कुन ऐतिहासिक तालको बिचमा नीरमहल जलमहल बनाइएको छ?'
      },
      choices: [
        {
          id: 'rudrasagar_lake',
          label: {
            en: 'Rudrasagar Lake (ৰুদ্ৰসাগৰ হ্ৰদ)',
            as: 'ৰুদ্ৰসাগৰ হ্ৰদ (Rudrasagar Lake)',
            bn: 'রুদ্রসাগর হ্রদ (Rudrasagar Lake)',
            ne: 'रुद्रसागर ताल (Rudrasagar Lake)'
          },
          isCorrect: true
        },
        {
          id: 'city_reservoir',
          label: {
            en: 'City Water Tank',
            as: 'চহৰৰ কৃত্ৰিম পুখুৰী',
            bn: 'শহরের কৃত্রিম জলাশয়',
            ne: 'सहरको पोखरी'
          },
          isCorrect: false
        },
        {
          id: 'swamp_marsh',
          label: {
            en: 'Paddy Canal',
            as: 'পানীৰ নলা',
            bn: 'ধানক্ষেতের নালা',
            ne: 'सिँचाइको कुलो'
          },
          isCorrect: false
        },
        {
          id: 'swimming_pool',
          label: {
            en: 'Hotel Swimming Pool',
            as: 'হোটেলৰ পুখুৰী',
            bn: 'হোটেলের সুইমিং পুল',
            ne: 'होटेलको पौडी पोखरी'
          },
          isCorrect: false
        }
      ],
      targetId: 'rudrasagar_lake'
    },
    hints: {
      en: [
        'A sacred and historic lake designated as a wetland of national and international importance.',
        'Its name begins with "Rudra".',
        'It is Rudrasagar Lake.'
      ],
      as: [
        'ত্ৰিপুৰাৰ মেলাঘৰত অৱস্থিত ৰামচন্দ্ৰপুৰৰ বিখ্যাত পৱিত্ৰ হ্ৰদ।',
        'নামটো "ৰুদ্ৰ" (Rudra) শব্দৰে আৰম্ভ হয়।',
        'সঠিক উত্তৰ হ’ল ৰুদ্ৰসাগৰ হ্ৰদ।'
      ],
      bn: [
        'ত্রিপুরার মেলাঘরে অবস্থিত একটি বিখ্যাত ঐতিহ্যবাহী প্রাকৃতিক হ্রদ।',
        'নামটি "রুদ্র" (Rudra) দিয়ে শুরু হয়।',
        'সঠিক উত্তর হলো রুদ্রসাগর হ্রদ।'
      ],
      ne: [
        'त्रिपुरामा रहेको एक ऐतिहासिक र पवित्र प्राकृतिक ताल।',
        'यसको नाम "रुद्र" (Rudra) बाट सुरु हुन्छ।',
        'सही ताल रुद्रसागर ताल हो।'
      ]
    }
  }
];
