import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ArrowRight, Lightbulb, RotateCcw, FileText, Volume2 } from 'lucide-react';
import SpeechSpeaker from './SpeechSpeaker';
import { speechService } from '../services/speechService';
import { adaptiveDifficultyManager } from '../services/adaptiveDifficulty';
import { GAME_UI } from '../i18n/gameUI';
import { emitTelemetry } from '../socket';

const GAME_ID = 'word_puzzle';

/**
 * Authentic Native Word & Memory Puzzle Dataset
 * 
 * Truly native across all 4 languages ('as', 'bn', 'ne', 'en'):
 * - Words are in the actual native script and vernacular spoken at home.
 * - Syllable/letter tiles match natural aksharas (e.g., 'চা' + 'হ' -> 'চাহ').
 * - Contextual questions ask about familiar daily routines and nostalgic memories
 *   without any technical or foreign jargon.
 * - Distractors are drawn from the exact same native alphabet and script.
 */
const PUZZLE_WORDS = [
  // LEVEL 1: Short, highly familiar everyday items
  {
    id: 'morning_tea',
    level: 1,
    category: {
      en: 'Morning Beverage',
      as: 'পুৱাৰ সতেজ চাহ',
      bn: 'সকালের মিষ্টি দই',
      ne: 'बिहानको न्यानो चिया'
    },
    question: {
      en: 'What warm, fragrant drink brewed from fresh garden leaves do you sip from your brass cup every morning?',
      as: 'পুৱা সাৰ পাই কাঁহৰ কাপত জুৰ বতাহ উপভোগ কৰি আপুনি আদা দিয়া কি সোণালী পানীয় খায়?',
      bn: 'চিঁড়ে ও মিষ্টি গুড়ের সাথে মেখে কাঁসার বাটিতে খাওয়া ঘন সাদা খাবারটি কী?',
      ne: 'हरेक बिहान काँसको गिलासमा अदुवा र अलैँची हालेर पिइने तातो सुगन्धित पेय के हो?'
    },
    word: {
      en: 'TEA',
      as: 'চাহ',
      bn: 'দই',
      ne: 'चिया'
    },
    tokens: {
      en: ['T', 'E', 'A'],
      as: ['চা', 'হ'],
      bn: ['দ', 'ই'],
      ne: ['चि', 'या']
    },
    distractors: {
      en: ['B', 'D', 'N'],
      as: ['ভাত', 'পানী'],
      bn: ['ভাত', 'জল'],
      ne: ['दूध', 'भात']
    },
    hints: {
      en: [
        'A warm, soothing brew enjoyed every single morning in your courtyard.',
        'Brewed with fresh Assam tea leaves, ginger, and cardamom.',
        'It is your morning TEA (T - E - A).'
      ],
      as: [
        'কাঁহৰ কাপত জুৰ বতাহ উপভোগ কৰি পুৱা খোৱা সুগন্ধি পানীয়।',
        'সেউজীয়া দুটা পাত আৰু এটা কুঁহিপাতৰ পৰা তৈয়াৰ কৰা সোণালী চাহ।',
        'এয়া হ’ল আমাৰ পুৱাৰ ‘চাহ’ (চা - হ)।'
      ],
      bn: [
        'উৎসবের সকালে মাটির পাত্র বা কাঁসার বাটিতে পরিবেশন করা খাবার।',
        'চিঁড়ে ও গুড়ের সাথে মিশিয়ে খাওয়া মিষ্টি সাদা পদ।',
        'এটি হলো আমাদের মিষ্টি ‘দই’ (দ - ই)।'
      ],
      ne: [
        'हरेक बिहान काँसको गिलासमा पिइने तातो सुगन्धित पेय।',
        'अदुवा र अलैँची हालेर पकाइने ताजा चिया।',
        'यो हाम्रो प्यारो ‘चिया’ (चि - या) हो।'
      ]
    }
  },
  {
    id: 'sweet_curd',
    level: 1,
    category: {
      en: 'Sweet Curd Bowl',
      as: 'কোমল চিৰা জলপান',
      bn: 'জলখাবার চিঁড়ে',
      ne: 'ताजा मीठो दही'
    },
    question: {
      en: 'What thick, creamy bowl is enjoyed on the sunny veranda with flattened rice and golden molasses?',
      as: 'বিহুৰ পুৱা বাটিত ঘন দৈ আৰু গুৰৰ লগত কোমলকৈ সানি খোৱা পৰম্পৰাগত জলপানবিধ কি?',
      bn: 'দই ও মিষ্টি গুড়ের সাথে মেখে ভোরের আলোয় খাওয়া প্রিয় জলখাবার কোনটি?',
      ne: 'चिउरा र सखरसँग मिसाएर बिहानको खाजामा खाइने बाक्लो सेतो परिकार के हो?'
    },
    word: {
      en: 'CURD',
      as: 'চিৰা',
      bn: 'চিঁড়ে',
      ne: 'दही'
    },
    tokens: {
      en: ['C', 'U', 'R', 'D'],
      as: ['চি', 'ৰা'],
      bn: ['চিঁ', 'ড়ে'],
      ne: ['द', 'ही']
    },
    distractors: {
      en: ['M', 'P', 'S'],
      as: ['মুৰি', 'লাৰু'],
      bn: ['মুড়ি', 'ভাত'],
      ne: ['मोही', 'घ्यू']
    },
    hints: {
      en: [
        'Thick, cool white curd served in brass bowls on festive mornings.',
        'Enjoyed with soaked Chira and sweet golden Gur.',
        'It is fresh CURD (C - U - R - D).'
      ],
      as: [
        'ঘৰুৱা দৈ আৰু গুৰৰ লগত সানি খোৱা পুৱাৰ পৰম্পৰাগত আহাৰ।',
        'বিহুৰ দিনা সকলো আলহীক কাঁহৰ বাটিত দিয়া হয়।',
        'এয়া হ’ল আমাৰ মৰমৰ ‘চিৰা’ (চি - ৰা)।'
      ],
      bn: [
        'মিষ্টি দইয়ের সাথে মেখে খাওয়া ঐতিহ্যবাহী সকালের খাবার।',
        'উৎসবের সকালে কাঁসার পাত্রে পরিবেশন করা হয়।',
        'এটি হলো আমাদের পরিচিত ‘চিঁড়ে’ (চিঁ - ড়ে)।'
      ],
      ne: [
        'काँसको कचौरामा चिउरासँग मिसाएर खाइने बाक्लो परिकार।',
        'चाडपर्वको बिहान खाजामा खाइने चिसो र मीठो स्वाद।',
        'यो हाम्रो मिठो ‘दही’ (द - ही) हो।'
      ]
    }
  },

  // LEVEL 2: Beloved cultural items & instruments
  {
    id: 'bihu_festival',
    level: 2,
    category: {
      en: 'Spring Festival',
      as: 'প্ৰাণৰ ৰঙালী বিহু',
      bn: 'বসন্ত উৎসব বিহু',
      ne: 'परम्परागत बाजा'
    },
    question: {
      en: 'What beloved springtime festival celebrates harvest, joy, and family gatherings across Assam?',
      as: 'বসন্তৰ আগমনত ঢোল আৰু পেঁপাৰ মাতেৰে চোতালত উদযাপিত অসমীয়াৰ বাপতি-সাহোন উৎসৱটো কি?',
      bn: 'বসন্তের আগমনে লাল গামোছা ও মিষ্টি ঢাকের বাদ্যে উদযাপিত প্রধান উৎসবটি কী?',
      ne: 'चाडपर्व र लोकगीतमा दुवै हातले ठोकेर बजाइने परम्परागत काठको बाजा के हो?'
    },
    word: {
      en: 'BIHU',
      as: 'বিহু',
      bn: 'বিহু',
      ne: 'मादल'
    },
    tokens: {
      en: ['B', 'I', 'H', 'U'],
      as: ['বি', 'হু'],
      bn: ['বি', 'হু'],
      ne: ['मा', 'द', 'ल']
    },
    distractors: {
      en: ['M', 'R', 'K'],
      as: ['গীত', 'নাচ'],
      bn: ['গান', 'নাচ'],
      ne: ['बाँसुरी', 'डम्फु']
    },
    hints: {
      en: [
        "The grand celebration of springtime warmth across Assam's green valleys.",
        'Celebrated with red Gamusas, dhol rhythms, and joyful folk dance.',
        'It is the festival of BIHU (B - I - H - U).'
      ],
      as: [
        'বসন্তৰ আগমনত সেউজীয়া পথাৰ আৰু চোতালত উদযাপিত উৎসৱ।',
        'ফুলাম গামোচা, ঢোলৰ চাপৰ আৰু পেঁপাৰ সুৰেৰে মুখৰিত দিন।',
        'এয়া হ’ল আমাৰ জাতীয় উৎসৱ ‘বিহু’ (বি - হু)।'
      ],
      bn: [
        'বসন্তের আগমনে সবুজ উপত্যকা জুড়ে উদযাপিত উৎসব।',
        'লাল ফুলের গামোছা ও ঢোলের ছন্দে মেতে ওঠার দিন।',
        'এটি হলো আনন্দের উৎসব ‘বিহু’ (বি - হু)।'
      ],
      ne: [
        'लोकगीत र चाडपर्वमा बजाउने ताल दिने काठको बाजा।',
        'काँधमा भिरेर दुवै हातले छमछमी बजाइन्छ।',
        'यो हाम्रो परम्परागत ‘मादल’ (मा - द - ल) हो।'
      ]
    }
  },
  {
    id: 'sacred_drum',
    level: 2,
    category: {
      en: 'Folk Rhythm Drum',
      as: 'বিহুৰ প্ৰাণ ঢোল',
      bn: 'ঐতিহ্যবাহী ঢাক',
      ne: 'प्यारो पुरानो बस्ती'
    },
    question: {
      en: 'What traditional wooden folk instrument produces the heart-thumping rhythm of spring celebrations?',
      as: 'বিহুৰ সময়ত কাঠ আৰু চামৰাৰে তৈয়াৰী কোনটো বাদ্যৰ মাঙ্গলিক চাপৰত সকলোৱে নাচি উঠে?',
      bn: 'পূজা ও উৎসবের দিনে আনন্দের সাথে বাজানো ঐতিহ্যবাহী কাঠের বাদ্যযন্ত্রটি কী?',
      ne: 'आफन्तहरू र हरियाली खेतले घेरिएको हाम्रो प्यारो पुरानो शान्त बस्तीलाई के भनिन्छ?'
    },
    word: {
      en: 'DRUM',
      as: 'ঢোল',
      bn: 'ঢাক',
      ne: 'गाउँ'
    },
    tokens: {
      en: ['D', 'R', 'U', 'M'],
      as: ['ঢো', 'ল'],
      bn: ['ঢা', 'ক'],
      ne: ['गा', 'उँ']
    },
    distractors: {
      en: ['B', 'H', 'L'],
      as: ['তাল', 'বাঁহী'],
      bn: ['কাঁসি', 'বাঁশি'],
      ne: ['सहर', 'पहाड']
    },
    hints: {
      en: [
        'A hollow wooden instrument covered in hide, struck with a bamboo stick.',
        'Its thunderous beats bring everyone to their feet dancing.',
        'It is the festive DRUM (D - R - U - M).'
      ],
      as: [
        'কাঠৰ খোলা আৰু চামৰাৰে তৈয়াৰী বাদ্য, বাঁহৰ মাৰিৰে বজোৱা হয়।',
        'ইয়াৰ মাঙ্গলিক শব্দ শুনিলেই মন নাচি উঠে।',
        'এয়া হ’ল বিহুৰ প্ৰধান বাদ্য ‘ঢোল’ (ঢো - ল)।'
      ],
      bn: [
        'উৎসবের সকালে যার মিষ্টি বাদ্যে চারপাশ মুখরিত হয়ে ওঠে।',
        'কাঠের কাঠির টোকায় আনন্দের ছন্দ তোলে।',
        'এটি হলো আমাদের উৎসবের ‘ঢাক’ (ঢা - ক)।'
      ],
      ne: [
        'पुराना साथीभाइ र हरियालीले भरिएको शान्त ठाउँ।',
        'आँगनमा बसेर गफ गर्ने हाम्रो बाल्यकालको ठाउँ।',
        'यो हाम्रो प्यारो ‘गाउँ’ (गा - उँ) हो।'
      ]
    }
  },

  // LEVEL 3: Cultural heritage & sacred places
  {
    id: 'gamusa_textile',
    level: 3,
    category: {
      en: 'Sacred Textile',
      as: 'সন্মান আৰু শ্ৰদ্ধাৰ বস্ত্ৰ',
      bn: 'প্রাকৃতিক পাহাড়',
      ne: 'सेतो हिउँचुली'
    },
    question: {
      en: 'What sacred white and red woven textile is presented with deepest reverence and blessings in Assam?',
      as: 'অসমত শ্ৰদ্ধা, মৰম আৰু সন্মান জনাবলৈ ডিঙিত পিন্ধাই দিয়া ফুলাম বগা বস্ত্ৰখন কি?',
      bn: 'মেঘালয় ও আসামের সীমান্তে মাথা উঁচু করে দাঁড়িয়ে থাকা পাইন বনে ঘেরা স্থানকে কী বলে?',
      ne: 'सेतो हिउँले सजिएको सिक्किम र उत्तर-पूर्वको अग्लो सुन्दर पर्वतलाई के भनिन्छ?'
    },
    word: {
      en: 'GAMUSA',
      as: 'গামোচা',
      bn: 'পাহাড়',
      ne: 'हिमाल'
    },
    tokens: {
      en: ['G', 'A', 'M', 'U', 'S', 'A'],
      as: ['গা', 'মো', 'চা'],
      bn: ['পা', 'হা', 'ড়'],
      ne: ['हि', 'मा', 'ल']
    },
    distractors: {
      en: ['S', 'D', 'R'],
      as: ['চাদৰ', 'মেখেলা'],
      bn: ['নদী', 'সাগর'],
      ne: ['नदी', 'ताल']
    },
    hints: {
      en: [
        'A hand-woven white cotton textile offered with reverence to elders and guests.',
        'Woven with intricate red floral motifs known as Phulam.',
        'It is the venerable GAMUSA (G - A - M - U - S - A).'
      ],
      as: [
        'বগা কপাহী সূতাৰে বোৱা আৰু দুয়োকাষে ৰঙা ফুলাম ফুল থকা বস্ত্ৰ।',
        'গুৰুজন আৰু বয়োজ্যেষ্ঠক সেৱা জনাবলৈ ডিঙিত আঁৰি দিয়া হয়।',
        'এয়া হ’ল আমাৰ অতি পৱিত্ৰ ‘গামোচা’ (গা - মো - চা)।'
      ],
      bn: [
        'উঁচু সবুজ উপত্যকা আর মেঘে ঢাকা চিরসবুজ স্থান।',
        'যেখান দিয়ে আঁকাবাঁকা রাস্তা চলে গেছে পাইন বনের ভেতর।',
        'এটি হলো আমাদের স্নিগ্ধ ‘পাহাড়’ (পা - হা - ড়)।'
      ],
      ne: [
        'बिहानीको घाममा चाँदी जस्तै चम्किने अग्लो चुली।',
        'उत्तर-पूर्वको शान्त र पवित्र प्राकृतिक धरोहर।',
        'यो हाम्रो गौरव ‘हिमाल’ (हि - मा - ल) हो।'
      ]
    }
  },
  {
    id: 'river_island_majuli',
    level: 3,
    category: {
      en: 'Sacred Island',
      as: 'সত্ৰীয়া ঐতিহ্যৰ নদী দ্বীপ',
      bn: 'পবিত্র পদ্মফুল',
      ne: 'सुन्दर पहाडी फूल'
    },
    question: {
      en: 'What peaceful river island on the Brahmaputra is world-renowned for Vaishnavite Satras and mask art?',
      as: 'ব্ৰহ্মপুত্ৰৰ বুকুত অৱস্থিত সত্ৰ আৰু মুখাশিল্পৰ বিশ্ববিখ্যাত পৱিত্ৰ নদী দ্বীপটো কি?',
      bn: 'পুকুরের শান্ত জলে মাথা তুলে ফুটে থাকা সুন্দর গোলাপি পবিত্র ফুল কোনটি?',
      ne: 'वसन्त ऋतुमा पहाडी रूखहरूमा फुल्ने र चाडपर्वमा गलामा सिउरिने सुन्दर सुनाखरी फूल?'
    },
    word: {
      en: 'MAJULI',
      as: 'মাজুলী',
      bn: 'পদ্মফুল',
      ne: 'सुनाखरी'
    },
    tokens: {
      en: ['M', 'A', 'J', 'U', 'L', 'I'],
      as: ['মা', 'জু', 'লী'],
      bn: ['প', 'দ্ম', 'ফু', 'ল'],
      ne: ['सु', 'ना', 'ख', 'री']
    },
    distractors: {
      en: ['S', 'T', 'R'],
      as: ['তেজপুৰ', 'শিলঘাট'],
      bn: ['গোলাপ', 'জবা'],
      ne: ['गुलाब', 'मखमली']
    },
    hints: {
      en: [
        'The world-renowned freshwater river island surrounded by the Brahmaputra.',
        'Home to devotional Borthal music, ancient monasteries, and clay masks.',
        'It is the island of MAJULI (M - A - J - U - L - I).'
      ],
      as: [
        'ব্ৰহ্মপুত্ৰৰ বুকুত অৱস্থিত পৃথিৱীৰ সৰ্ববৃহৎ নদী দ্বীপ।',
        'সত্ৰীয়া নৃত্য, ভাওনা আৰু মুখা শিল্পৰ পৱিত্ৰ স্থান।',
        'এয়া হ’ল আমাৰ গৌৰৱ ‘মাজুলী’ (মা - জু - লী)।'
      ],
      bn: [
        'সকালের মিষ্টি রোদে পুকুরের জলে প্রস্ফুটিত রূপকথা।',
        'গোলাপি পাপড়ির স্নিগ্ধ পবিত্রতার প্রতীক।',
        'এটি হলো সুন্দর ‘পদ্মফুল’ (প - দ্ম - ফু - ল)।'
      ],
      ne: [
        'पहाडका अग्ला रूखहरूमा फुल्ने मनमोहक सुनाखरी।',
        'वसन्त ऋतुमा चाडपर्वको शोभा बढाउने फूल।',
        'यो हाम्रो प्यारो ‘सुनाखरी’ (सु - ना - ख - री) हो।'
      ]
    }
  },

  // LEVEL 4: World heritage landmarks & historical capitals
  {
    id: 'kaziranga_rhino',
    level: 4,
    category: {
      en: 'Heritage Sanctuary',
      as: 'বিশ্ব ঐতিহ্য ৰাষ্ট্ৰীয় উদ্যান',
      bn: 'চিরন্তন ব্রহ্মপুত্র নদী',
      ne: 'सुन्दर हिमाली राज्य'
    },
    question: {
      en: 'What world-famous national park in Assam provides a safe sanctuary for the magnificent one-horned rhino?',
      as: 'এশিঙীয়া গঁড় আৰু কুঁৱলীভৰা সেউজীয়া অৰণ্যৰ বাবে বিশ্ববিখ্যাত অসমৰ ৰাষ্ট্ৰীয় উদ্যানখন কি?',
      bn: 'উত্তর-পূর্ব ভারতের বুক চিরে বয়ে চলা পবিত্র, অপরূপ ও বিশাল নদীটির নাম কী?',
      ne: 'कञ्चनजङ्घाको काखमा बसेको शान्त बौद्ध गुम्बा र हरियाली भएको सुन्दर हिमाली राज्य कुन हो?'
    },
    word: {
      en: 'KAZIRANGA',
      as: 'কাজিৰঙা',
      bn: 'ব্রহ্মপুত্র',
      ne: 'सिक्किम'
    },
    tokens: {
      en: ['K', 'A', 'Z', 'I', 'R', 'A', 'N', 'G', 'A'],
      as: ['কা', 'জি', 'ৰ', 'ঙা'],
      bn: ['ব্র', 'হ্ম', 'পু', 'ত্র'],
      ne: ['सि', 'क्कि', 'म']
    },
    distractors: {
      en: ['M', 'N', 'S', 'T'],
      as: ['মানাহ', 'ওৰাং', 'নামেৰি'],
      bn: ['গঙ্গা', 'যমুনা', 'পদ্মা'],
      ne: ['भूटान', 'नेपाल', 'असम']
    },
    hints: {
      en: [
        'The vast green sanctuary nestled under the Karbi hills along the Brahmaputra.',
        'Famed worldwide for the ancient Greater One-Horned Rhinoceros.',
        'It is KAZIRANGA (K - A - Z - I - R - A - N - G - A).'
      ],
      as: [
        'কাৰ্বি পাহাৰৰ নামনিত অৱস্থিত সেউজ অৰণ্যৰ বিশ্ব ঐতিহ্য ক্ষেত্র।',
        'এশিঙীয়া গঁড় আৰু বন্য হস্তীৰ সুৰক্ষিত বিচৰণ ভূমি।',
        'এয়া হ’ল আমাৰ গৌৰৱ ‘কাজিৰঙা’ (কা - জি - ৰ - ঙা)।'
      ],
      bn: [
        'সূর্যাস্তের সোনালী আভায় যার জল রূপোর মতো জ্বলজ্বল করে।',
        'যার বুকে ডলফিনেরা তিড়িং-বিড়িং করে খেলা করে।',
        'এটি হলো মহান নদী ‘ব্রহ্মপুত্র’ (ব্র - হ্ম - পু - ত্র)।'
      ],
      ne: [
        'सफा हावापानी र अग्ला हिमालको काखमा अवस्थित राज्य।',
        'शान्त बौद्ध गुम्बाहरू र हरिया चिया बगानहरू भएको ठाउँ।',
        'यो हाम्रो सुन्दर राज्य ‘सिक्किम’ (सि - क्कि - म) हो।'
      ]
    }
  },
  {
    id: 'historical_capital',
    level: 4,
    category: {
      en: 'Misty Hill Town',
      as: 'ঐতিহাসিক ৰাজধানী চহৰ',
      bn: 'মেঘে ঢাকা পাহাড়ি শহর',
      ne: 'प्रसिद्ध पहाडी सहर'
    },
    question: {
      en: 'What misty mountain hill station is famous for pine-scented breezes and tranquil lakeside walks?',
      as: 'ঐতিহাসিক দৌল আৰু আহোম স্বৰ্গদেউসকলৰ বিশাল পুখুৰী থকা উজনি অসমৰ প্ৰাচীন ৰাজধানী চহৰখন কি?',
      bn: 'পাইন বনের স্নিগ্ধ সুবাস আর মেঘে ঢাকা বড়াপানি হ্রদের মনোরম পাহাড়ি শহর কোনটি?',
      ne: 'चिया बगान र पुरानो पहाडी रेलका लागि प्रख्यात हाम्रो नजिकैको सुन्दर सहर कुन हो?'
    },
    word: {
      en: 'SHILLONG',
      as: 'শিৱসাগৰ',
      bn: 'শিলং',
      ne: 'दार्जिलिङ'
    },
    tokens: {
      en: ['S', 'H', 'I', 'L', 'L', 'O', 'N', 'G'],
      as: ['শি', 'ৱ', 'সা', 'গ', 'ৰ'],
      bn: ['শি', 'লং'],
      ne: ['दा', 'र्जि', 'लि', 'ङ']
    },
    distractors: {
      en: ['P', 'T', 'K', 'M'],
      as: ['যোৰহাট', 'তেজপুৰ', 'গুৱাহাটী'],
      bn: ['গুয়াহাটি', 'শিলিগুড়ি'],
      ne: ['काठमाडौँ', 'पोखरा', 'धरान']
    },
    hints: {
      en: [
        'The capital hill station wrapped in cool mountain mist and rolling ridges.',
        "Famed for Barapani lake, Ward's lake, and roadside roasted corn.",
        'It is SHILLONG (S - H - I - L - L - O - N - G).'
      ],
      as: [
        'আহোম ৰাজবংশৰ ঐতিহাসিক কীৰ্তিচিহ্ন আৰু বিশাল শিৱসাগৰ পুখুৰী থকা চহৰ।',
        'দিখৌ নদীৰ পাৰৰ শীতল বতাহে য’ত ল’ৰালি কালৰ স্মৃতি কঢ়িয়াই আনে।',
        'এয়া হ’ল আমাৰ ঐতিহ্যমণ্ডিত ‘শিৱসাগৰ’ (শি - ৱ - সা - গ - ৰ)।'
      ],
      bn: [
        'শীতল স্নিগ্ধ হাওয়া আর পাইন গাছে ঘেরা উঁচু পাহাড়ি পথ।',
        'বড়াপানি হ্রদের ধারে গরম ভুট্টা খাওয়ার মিষ্টি স্মৃতি যেখানে জড়িয়ে।',
        'এটি হলো আমাদের পরিচিত ‘শিলং’ (শি - লং)।'
      ],
      ne: [
        'सुन्दर चिया बगान र पहाडी रेल गुड्ने चर्चित ठाउँ।',
        'बिहानी घाममा हिमाल हेर्दै तातो चिया पिउने रमाइलो सहर।',
        'यो हाम्रो छिमेकी सहर ‘दार्जिलिङ’ (दा - र्जि - लि - ङ) हो।'
      ]
    }
  }
];

export default function WordPuzzleGame({ onSessionComplete, apiUrl, lang = 'en', selectedLanguage, selectedContentRegion = 'NER', t }) {
  const activeLang = selectedLanguage || lang;
  const wStrings = t?.wordGame || {};
  const ui = useMemo(() => GAME_UI[activeLang] || GAME_UI.en, [activeLang]);

  // Current level from AdaptiveDifficultyManager (Levels 1 to 4)
  const [currentLevel, setCurrentLevel] = useState(1);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [hintTier, setHintTier] = useState(1);
  const [typedTokens, setTypedTokens] = useState([]);
  const [adaptiveSimplifyNotice, setAdaptiveSimplifyNotice] = useState(false);
  const [isReinforcementWord, setIsReinforcementWord] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [startTime] = useState(Date.now());

  // Determine appropriate puzzle item based on Level and ReinforcementQueue
  const currentPuzzle = useMemo(() => {
    // Check if reinforcement queue has a word waiting for delayed recall
    const queued = adaptiveDifficultyManager.getNextReinforcementItem(GAME_ID);
    if (queued) {
      const match = PUZZLE_WORDS.find(w => w.id === queued.itemId || w.id === queued.targetId);
      if (match) {
        setIsReinforcementWord(true);
        return match;
      }
    }
    setIsReinforcementWord(false);

    // Filter items matching currentLevel
    const matchingLevel = PUZZLE_WORDS.filter(w => w.level === currentLevel);
    if (matchingLevel.length > 0) {
      return matchingLevel[puzzleIndex % matchingLevel.length];
    }
    return PUZZLE_WORDS[0];
  }, [currentLevel, puzzleIndex]);

  // Target word and token tiles in selectedLanguage
  const targetWord = currentPuzzle.word[activeLang] || currentPuzzle.word.en;
  const targetTokens = currentPuzzle.tokens[activeLang] || currentPuzzle.tokens.en;
  const activeQuestion = currentPuzzle.question[activeLang] || currentPuzzle.question.en;
  const activeHints = currentPuzzle.hints[activeLang] || currentPuzzle.hints.en;
  const activeCategory = currentPuzzle.category[activeLang] || currentPuzzle.category.en;
  const activeDistractors = currentPuzzle.distractors[activeLang] || currentPuzzle.distractors.en;
  const currentHintText = activeHints[Math.min(hintTier - 1, activeHints.length - 1)];

  // Reset to Level 1 on mount (fresh session start)
  useEffect(() => {
    adaptiveDifficultyManager.resetSessionLevel(GAME_ID);
    setCurrentLevel(1);
  }, []);

  // Stop active speech on language change
  useEffect(() => {
    speechService.stop();
    setTypedTokens([]);
  }, [activeLang]);

  // Tiles Pool: distractors depend on cognitive Level and adaptive state
  const activePool = useMemo(() => {
    if (adaptiveSimplifyNotice || currentLevel === 1) {
      // Level 1: 0 distractors (only exact tiles, shuffled)
      return [...targetTokens].sort(() => 0.5 - Math.random());
    }
    if (currentLevel === 2) {
      // Level 2: 1 distractor
      const extra = activeDistractors.slice(0, 1);
      return [...targetTokens, ...extra].sort(() => 0.5 - Math.random());
    }
    if (currentLevel === 3) {
      // Level 3: 2 distractors
      const extra = activeDistractors.slice(0, 2);
      return [...targetTokens, ...extra].sort(() => 0.5 - Math.random());
    }
    // Level 4: 2-3 distractors
    const extra = activeDistractors.slice(0, 3);
    return [...targetTokens, ...extra].sort(() => 0.5 - Math.random());
  }, [targetTokens, activeDistractors, currentLevel, adaptiveSimplifyNotice]);

  const handleTileClick = (token) => {
    if (isSuccess) return;
    if (typedTokens.length >= targetTokens.length) return;

    const nextTyped = [...typedTokens, token];
    setTypedTokens(nextTyped);

    if (nextTyped.length === targetTokens.length) {
      const spelled = nextTyped.join('');
      const isCorrect = spelled === targetWord;

      emitTelemetry({
        activityTitle: 'Xobdo Xondhan (Word Puzzle)',
        activityType: 'word_puzzle',
        status: isCorrect ? `Spelled correctly: ${targetWord}` : `Attempt ${attemptCount} miss for ${targetWord}`,
        attempts: attemptCount,
        hintsDelivered: hintTier,
        isCorrect,
        gameLevel: currentLevel
      });

      if (isCorrect) {
        setIsSuccess(true);
        const successMsg = isReinforcementWord
          ? (ui.reinforcementSuccess || 'Wonderful! You remembered this previously challenging memory.')
          : (ui.wellDone || 'Wonderful! You remembered correctly.');

        setFeedback(successMsg);
        speechService.speak(`${targetWord}. ${successMsg}`, activeLang);

        const evaluation = adaptiveDifficultyManager.recordResult({
          gameId: GAME_ID,
          itemId: currentPuzzle.id,
          isCorrect: true,
          attempts: attemptCount,
          hintsUsed: hintTier,
          itemDifficulty: currentLevel
        });

        if (evaluation.leveledUp) {
          setCurrentLevel(evaluation.nextLevel);
        }
      } else {
        // 3-Attempt Adaptive Rule Handling
        if (attemptCount < 3) {
          const nextAttempt = attemptCount + 1;
          setAttemptCount(nextAttempt);
          setHintTier(nextAttempt);

          const hintMsg = activeHints[Math.min(nextAttempt - 1, activeHints.length - 1)];
          setFeedback(ui.gentleEncouragement || 'That is close, take a slow look again.');
          speechService.speak(hintMsg, activeLang);

          setTimeout(() => {
            setTypedTokens([]);
          }, 1400);
        } else {
          // Attempt 3 failed -> queue for reinforcement and intentionally simplify
          adaptiveDifficultyManager.recordAttempt(GAME_ID, false, attemptCount, hintTier, true);
          adaptiveDifficultyManager.queueForReinforcement(GAME_ID, {
            id: currentPuzzle.id,
            targetId: currentPuzzle.id,
            failedAttempts: attemptCount,
            hintsGiven: hintTier
          });

          setAdaptiveSimplifyNotice(true);
          const reducedLevel = Math.max(1, currentLevel - 1);
          setCurrentLevel(reducedLevel);
          setFeedback(ui.adaptiveSimplify || "That's okay. Let's try something a little easier.");
          speechService.speak(ui.adaptiveSimplify || "That's okay. Let's try something a little easier.", activeLang);

          setTimeout(() => {
            setTypedTokens([]);
            setAttemptCount(1);
          }, 2400);
        }
      }
    }
  };

  const handleUndo = () => {
    setTypedTokens(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setTypedTokens([]);
  };

  const handleNextWord = async () => {
    speechService.stop();
    setIsSuccess(false);
    setTypedTokens([]);
    setAttemptCount(1);
    setHintTier(1);
    setFeedback('');
    setAdaptiveSimplifyNotice(false);

    const duration = Math.round((Date.now() - startTime) / 1000);
    let savedSession = null;
    try {
      const res = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'word_puzzle',
          activityTitle: `Word Puzzle (${activeLang.toUpperCase()}) — ${targetWord}`,
          durationSeconds: duration || 150,
          supportiveFeedback: adaptiveSimplifyNotice ? 'Needs a Gentler Pace' : 'High Recall Day',
          favoriteTopicRevisited: targetWord,
          itemsEngaged: 1,
          paceObservation: 'Comfortable & Dignified',
          gameLevel: currentLevel,
          attempts: attemptCount,
          hintsUsed: hintTier,
          needsReinforcement: attemptCount > 3,
          contentRegion: selectedContentRegion
        })
      });
      if (res.ok) {
        savedSession = await res.json();
      }
    } catch (err) {
      console.warn('Session logging notice:', err);
    }

    if (currentLevel < 4) {
      setCurrentLevel(prev => prev + 1);
      setPuzzleIndex(prev => prev + 1);
    } else {
      if (onSessionComplete) onSessionComplete(savedSession);
    }
  };

  return (
    <div className="focus-card" style={{ maxWidth: '960px' }}>
      {/* Header Meta with Level Badge and Attempt Counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        borderBottom: '2px solid var(--border-subtle)',
        paddingBottom: '1rem',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <FileText size={36} color="#7C3AED" />
          <div>
            <h2 style={{ fontSize: '30px', margin: 0 }}>
              {activeLang === 'as' ? 'শব্দ সেতু — স্মৃতিৰ সাঁথৰ' : activeLang === 'bn' ? 'শব্দ সেতু — স্মৃতির ধাঁধা' : activeLang === 'ne' ? 'शब्द सेतु — स्मृति पहेली' : 'Word & Memory Puzzle'}
            </h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{
                background: '#F5F3FF',
                color: '#6D28D9',
                fontSize: '15px',
                fontWeight: '800',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '2px solid #DDD6FE'
              }}>
                {ui.levels[currentLevel] || `Level ${currentLevel}`}
              </span>
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '14px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                {selectedContentRegion}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
            {ui.attemptText ? ui.attemptText.replace('{current}', String(attemptCount)) : `Attempt ${attemptCount} of 3`}
          </span>
          <span style={{
            background: 'var(--accent-amber-light)',
            color: 'var(--accent-amber-hover)',
            fontSize: '18px',
            fontWeight: '700',
            padding: '6px 16px',
            borderRadius: '16px'
          }}>
            {activeCategory}
          </span>
        </div>
      </div>

      {/* Delayed Recall / Reinforcement Banner */}
      {isReinforcementWord && !isSuccess && (
        <div style={{
          background: '#EFF6FF',
          border: '2px solid #93C5FD',
          borderRadius: '16px',
          padding: '12px 18px',
          fontSize: '20px',
          color: '#1E40AF',
          fontWeight: '700',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={24} color="#2563EB" />
          <span>{ui.reinforcementNotice || "Let's revisit this memory from earlier together."}</span>
        </div>
      )}

      {/* CONTEXTUAL MEMORY QUESTION CARD (100% Native, Familiar, Vernacular) */}
      <div style={{
        background: '#FFFDF9',
        border: '3px solid #E5E7EB',
        borderRadius: '22px',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <span style={{
              fontSize: '17px',
              color: 'var(--accent-amber)',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {activeLang === 'as' ? 'ঘৰুৱা স্মৃতিৰ প্ৰশ্ন:' : activeLang === 'bn' ? 'ঘরোয়া স্মৃতির প্রশ্ন:' : activeLang === 'ne' ? 'घरेलु स्मृतिको प्रश्न:' : 'Memory Question:'}
            </span>
            <p style={{
              fontSize: '25px',
              color: 'var(--text-main)',
              fontWeight: '700',
              lineHeight: '1.5',
              marginTop: '6px',
              marginBottom: 0
            }}>
              "{activeQuestion}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => speechService.speak(activeQuestion, activeLang)}
            className="btn-speaker"
            title="Listen to question aloud"
            style={{
              flexShrink: 0,
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-amber-light)',
              color: 'var(--accent-amber-hover)',
              border: '2px solid var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Volume2 size={28} />
          </button>
        </div>
      </div>

      {/* 3-Tier Gentle Hints Card */}
      <div style={{
        background: '#FFFBEB',
        border: '2px solid #FCD34D',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontWeight: '800', fontSize: '22px' }}>
            <Lightbulb size={26} color="#D97706" />
            <span>{hintTier === 1 ? ui.hintTier1 : hintTier === 2 ? ui.hintTier2 : ui.hintTier3}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  setHintTier(tier);
                  speechService.speak(activeHints[tier - 1], activeLang);
                }}
                style={{
                  background: hintTier === tier ? 'var(--accent-amber)' : '#FFFFFF',
                  color: hintTier === tier ? '#FFFFFF' : 'var(--text-main)',
                  border: '2px solid #FCD34D',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Hint {tier}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '22px', color: '#78350F', lineHeight: '1.5', margin: '0 0 1rem' }}>
          {currentHintText}
        </p>

        <SpeechSpeaker
          text={currentHintText}
          label={ui.readClueAloud || "Listen to Hint Aloud"}
          lang={activeLang}
        />
      </div>

      {/* Adaptive Simplification Notice on 3 failed attempts */}
      {adaptiveSimplifyNotice && !isSuccess && (
        <div style={{
          background: '#FEF3C7',
          border: '2px solid #FCD34D',
          borderRadius: '16px',
          padding: '12px 20px',
          fontSize: '20px',
          color: '#92400E',
          marginBottom: '1.5rem',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          💡 {ui.adaptiveSimplify || "That's okay. Let's try something a little easier."}
        </div>
      )}

      {/* Target Token Slot Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '14px',
        marginBottom: '2.5rem',
        flexWrap: 'wrap'
      }}>
        {targetTokens.map((_, idx) => {
          const char = typedTokens[idx];
          return (
            <div
              key={idx}
              style={{
                minWidth: '84px',
                height: '88px',
                padding: '0 12px',
                borderRadius: '18px',
                background: char ? '#EDE9FE' : '#FFFFFF',
                border: '3px solid #C4B5FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '800',
                color: '#5B21B6',
                boxShadow: char ? '0 6px 15px rgba(109, 40, 217, 0.15)' : 'none'
              }}
            >
              {char || ''}
            </div>
          );
        })}
      </div>

      {/* Native Scrambled Syllable / Letter Tiles */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {activePool.map((token, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleTileClick(token)}
            style={{
              minWidth: '80px',
              height: '84px',
              padding: '0 16px',
              borderRadius: '18px',
              background: '#FFFFFF',
              border: '3px solid var(--border-subtle)',
              fontSize: '32px',
              fontWeight: '800',
              color: 'var(--text-main)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-soft)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'var(--accent-amber)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {token}
          </button>
        ))}
      </div>

      {/* Actions: Undo & Clear */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="btn-large btn-outline"
          onClick={handleUndo}
          style={{ minHeight: '56px', padding: '8px 24px', fontSize: '18px' }}
          disabled={typedTokens.length === 0}
        >
          {wStrings.undo || 'Undo Letter'}
        </button>
        <button
          type="button"
          className="btn-large btn-outline"
          onClick={handleClear}
          style={{ minHeight: '56px', padding: '8px 24px', fontSize: '18px' }}
          disabled={typedTokens.length === 0}
        >
          {wStrings.clear || 'Clear All'}
        </button>
      </div>

      {/* Success Affirmation Banner */}
      {isSuccess && (
        <div style={{
          background: 'var(--affirm-green-light)',
          border: '3px solid var(--affirm-green)',
          borderRadius: '24px',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--affirm-green)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Sparkles size={36} />
          </div>

          <h3 style={{ fontSize: '30px', color: '#065F46', marginBottom: '8px' }}>
            {wStrings.successTitle || 'Splendid Memory!'}
          </h3>
          <p style={{ fontSize: '22px', color: '#047857', marginBottom: '1.5rem' }}>
            {feedback}
          </p>

          <button
            type="button"
            className="btn-large btn-sage"
            onClick={handleNextWord}
          >
            <span>{currentLevel === 4 ? (wStrings.complete || 'Complete Puzzle') : (wStrings.nextWord || 'Next Word')}</span>
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
