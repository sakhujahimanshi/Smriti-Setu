import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Sparkles, ArrowRight, RotateCcw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { speechService } from '../services/speechService';
import { adaptiveDifficultyManager } from '../services/adaptiveDifficulty';
import { GAME_UI } from '../i18n/gameUI';
import { emitTelemetry, emitSessionComplete } from '../socket';

const GAME_ID = 'picture_match';

const PICTURE_LEVELS = [
  // LEVEL 1: Gentle (2 choices, highly distinct cultural items)
  {
    id: 'dhol_assam',
    level: 1,
    state: 'Assam',
    title: {
      en: 'Level 1 — Traditional Bihu Dhol',
      as: 'স্তৰ ১ — পৰম্পৰাগত বিহু ঢোল',
      ne: 'स्तर १ — परम्परागत बिहु ढोल',
      bn: 'স্তর ১ — ঐতিহ্যবাহী বিহু ঢোল'
    },
    target: {
      id: 'dhol',
      name: {
        en: 'Traditional Bihu Dhol',
        as: 'বিহু ঢোল',
        ne: 'बिहु ढोल',
        bn: 'ঐতিহ্যবাহী বিহু ঢোল'
      },
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'The rhythmic wooden drum of Bohag Bihu.',
        as: 'ব’হাগ বিহুৰ প্ৰাণ ঢোলৰ ছন্দময় মাত।',
        ne: 'चाडपर्वमा बजाइने परम्परागत काठको बाजा।',
        bn: 'বসন্ত উৎসবের মিষ্টি কাঠের বাদ্যযন্ত্র।'
      }
    },
    choices: [
      {
        id: 'dhol',
        name: { en: 'Bihu Dhol', as: 'বিহু ঢোল', ne: 'बिहु ढोल', bn: 'বিহু ঢোল' },
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'tea',
        name: { en: 'Tea Bushes', as: 'চাহ বাগিচা', ne: 'चिया बगान', bn: 'চা বাগান' },
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'rhino_kaziranga',
    level: 1,
    state: 'Assam',
    title: {
      en: 'Level 1 — One-Horned Rhino of Kaziranga',
      as: 'স্তৰ ১ — কাজিৰঙাৰ এশিঙীয়া গঁড়',
      ne: 'स्तर १ — काजिरङ्गाको एक सिङ्गे गैँडा',
      bn: 'স্তর ১ — কাজিরাঙ্গার একশৃঙ্গ গণ্ডার'
    },
    target: {
      id: 'rhino',
      name: {
        en: 'Kaziranga One-Horned Rhino',
        as: 'এশিঙীয়া গঁড়',
        ne: 'एक सिङ्गे गैँडा',
        bn: 'একশৃঙ্গ গণ্ডার'
      },
      imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'The majestic pride of Kaziranga grasslands.',
        as: 'কাজিৰঙাৰ সেউজ ঘাঁহনিত চৰি থকা মৰমৰ গঁড়।',
        ne: 'काजिरङ्गाको शान, घाँसे मैदानको एक सिङ्गे गैँडा।',
        bn: 'কাজিরাঙ্গার বুক চিরে বিচরণ করা ঐতিহাসিক একশৃঙ্গ গণ্ডার।'
      }
    },
    choices: [
      {
        id: 'rhino',
        name: { en: 'Kaziranga Rhino', as: 'এশিঙীয়া গঁড়', ne: 'एक सिङ्गे गैँडा', bn: 'একশৃঙ্গ গণ্ডার' },
        imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'mask',
        name: { en: 'Clay Mask', as: 'মাটিৰ মুখা', ne: 'माटोको मुखौटो', bn: 'মাটির মুখোশ' },
        imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'muga_silk',
    level: 1,
    state: 'Assam',
    title: {
      en: 'Level 1 — Golden Assam Muga Silk',
      as: 'স্তৰ ১ — অসমৰ সোণালী মুগা ৰেচম',
      ne: 'स्तर १ — असमको सुनौलो मुगा रेशम',
      bn: 'স্তর ১ — আসামের সোনালী মুগা সিল্ক'
    },
    target: {
      id: 'muga',
      name: {
        en: 'Golden Muga Silk',
        as: 'সোণালী মুগা বস্ত্ৰ',
        ne: 'सुनौलो मुगा रेशम',
        bn: 'সোনালী মুগা রেশম'
      },
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'The naturally golden, glossy silk unique to the Brahmaputra valley.',
        as: 'ব্ৰহ্মপুত্ৰ উপত্যকাৰ বিশ্ববিখ্যাত উজ্জ্বল সোণালী ৰেচম বস্ত্ৰ।',
        ne: 'असमको प्रसिद्ध सुनौलो चम्किलो रेशमी लुगा।',
        bn: 'ব্রহ্মপুত্র উপত্যকার বিশ্ববিখ্যাত প্রাকৃতিক সোনালী মুগা সিল্ক।'
      }
    },
    choices: [
      {
        id: 'muga',
        name: { en: 'Muga Silk', as: 'মুগা বস্ত্ৰ', ne: 'मुगा रेशम', bn: 'মুগা সিল্ক' },
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'dhol',
        name: { en: 'Bihu Dhol', as: 'বিহু ঢোল', ne: 'बिहु ढोल', bn: 'বিহু ঢোল' },
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },

  // LEVEL 2: Easy (3 choices, moderate distinction)
  {
    id: 'rootbridge_cherra',
    level: 2,
    state: 'Meghalaya',
    title: {
      en: 'Level 2 — Living Root Bridge of Meghalaya',
      as: 'স্তৰ ২ — মেঘালয়ৰ জীৱন্ত শিপাৰ সাঁকো',
      ne: 'स्तर २ — मेघालयको जीवित जराको पुल',
      bn: 'স্তর ২ — মেঘালয়ের জীবন্ত শিকড়ের সেতু'
    },
    target: {
      id: 'rootbridge',
      name: {
        en: 'Living Root Bridge',
        as: 'জীৱন্ত শিপাৰ সাঁকো',
        ne: 'जीवित जराको पुल',
        bn: 'জীবন্ত শিকড়ের সেতু'
      },
      imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'Centuries-old bio-engineering across cascading Cherrapunji rivers.',
        as: 'চেৰাপুঞ্জীৰ পাহাৰীয়া জুৰ নৈৰ ওপৰত গঢ়ি উঠা প্ৰাকৃতিক সাঁকো।',
        ne: 'चेरापुन्जी खोलाको वारपार बनेको जीवित जराको पुल।',
        bn: 'চেরাপুঞ্জির পাহাড়ি নদীর উপর শতাব্দীপ্রাচীন জীবন্ত শিকড়ের সেতু।'
      }
    },
    choices: [
      {
        id: 'rhino',
        name: { en: 'One-Horned Rhino', as: 'এশিঙীয়া গঁড়', ne: 'एक सिङ्गे गैँडा', bn: 'একশৃঙ্গ গণ্ডার' },
        imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'rootbridge',
        name: { en: 'Living Root Bridge', as: 'জীৱন্ত শিপাৰ সাঁকো', ne: 'जीवित जराको पुल', bn: 'জীবন্ত শিকড়ের সেতু' },
        imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'ferry',
        name: { en: 'River Steamer', as: 'ব্ৰহ্মপুত্ৰৰ ফেৰী', ne: 'नदीको डुङ्गा', bn: 'নদীর ফেরি' },
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'majuli_mask',
    level: 2,
    state: 'Assam',
    title: {
      en: 'Level 2 — Majuli Island Clay Mask Craft',
      as: 'স্তৰ ২ — মাজুলীৰ পৰম্পৰাগত মুখা শিল্প',
      ne: 'स्तर २ — माजुलीको माटोको मुखौटो कला',
      bn: 'স্তর ২ — মাজুলীর ঐতিহ্যবাহী মুখোশ শিল্প'
    },
    target: {
      id: 'majuli_mask',
      name: {
        en: 'Majuli Island Mask',
        as: 'মাজুলীৰ মুখা',
        ne: 'माजुलीको मुखौटो',
        bn: 'মাজুলীর মুখোশ'
      },
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'Sacred handmade bamboo and clay masks used in Bhaona spiritual drama.',
        as: 'ভাওনাত ব্যৱহাৰ হোৱা বাঁহ আৰু মাটিৰে সজা ঐতিহ্যমণ্ডিত মুখা।',
        ne: 'धार्मिक नाटकमा प्रयोग गरिने बाँस र माटोको पवित्र मुखौटो।',
        bn: 'ঐতিহ্যবাহী নাটকে ব্যবহৃত বাঁশ ও মাটির তৈরি পবিত্র মুখোশ।'
      }
    },
    choices: [
      {
        id: 'tea',
        name: { en: 'Tea Bushes', as: 'চাহ বাগিচা', ne: 'चिया बगान', bn: 'চা বাগান' },
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'majuli_mask',
        name: { en: 'Majuli Mask', as: 'মাজুলীৰ মুখা', ne: 'माजुली मुखौटो', bn: 'মাজুলীর মুখোশ' },
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'dhol',
        name: { en: 'Bihu Dhol', as: 'বিহু ঢোল', ne: 'बिहु ढोल', bn: 'বিহু ঢোল' },
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },

  // LEVEL 3: Moderate (4 choices, finer cultural themes)
  {
    id: 'naga_textiles',
    level: 3,
    state: 'Nagaland',
    title: {
      en: 'Level 3 — Traditional Naga Warrior Shawl',
      as: 'স্তৰ ৩ — নাগালেণ্ডৰ পৰম্পৰাগত চাদৰ',
      ne: 'स्तर ३ — नागाल्यान्डको परम्परागत दोसल्ला',
      bn: 'স্তর ৩ — নাগাল্যান্ডের ঐতিহ্যবাহী শাল'
    },
    target: {
      id: 'hornbill_textile',
      name: {
        en: 'Naga Shawl & Heritage',
        as: 'নাগা বস্ত্ৰ আৰু ঐতিহ্য',
        ne: 'नागा दोसल्ला र संस्कृति',
        bn: 'নাগা শাল ও ঐতিহ্য'
      },
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'Vibrant hand-woven geometric patterns honoring ancestral bravery.',
        as: 'পুৰণি বীৰত্ব আৰু সংস্কৃতিৰ প্ৰতীক হাতে বোৱা উজ্জ্বল চাদৰ।',
        ne: 'पुर्खाहरूको वीरता र संस्कृतिको प्रतीक हातले बुनेको दोसल्ला।',
        bn: 'পূর্বপুরুষদের বীরত্বের প্রতীক বর্ণিল হাতে বোনা নাগা শাল।'
      }
    },
    choices: [
      {
        id: 'tea',
        name: { en: 'Tea Estate', as: 'চাহ বাগিচা', ne: 'चिया बगान', bn: 'চা বাগান' },
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'hornbill_textile',
        name: { en: 'Naga Shawl', as: 'নাগা বস্ত্ৰ', ne: 'नागा दोसल्ला', bn: 'নাগা শাল' },
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'mask',
        name: { en: 'Majuli Mask', as: 'মাজুলীৰ মুখা', ne: 'माजुलीको मुखौटो', bn: 'মাজুলীর মুখোশ' },
        imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'dhol',
        name: { en: 'Bihu Dhol', as: 'বিহু ঢোল', ne: 'बिहु ढोल', bn: 'বিহু ঢোল' },
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'tawang_monastery',
    level: 3,
    state: 'Arunachal Pradesh',
    title: {
      en: 'Level 3 — Tawang Golden Monastery',
      as: 'স্তৰ ৩ — অৰুণাচলৰ তাৱাং মহাবিহাৰ',
      ne: 'स्तर ३ — तवाङको पवित्र गुम्बा',
      bn: 'স্তর ৩ — তাওয়াং বৌদ্ধ মহাবিহার'
    },
    target: {
      id: 'tawang',
      name: {
        en: 'Tawang Monastery',
        as: 'তাৱাং মহাবিহাৰ',
        ne: 'तवाङ गुम्बा',
        bn: 'তাওয়াং মহাবিহার'
      },
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'The second largest Buddhist monastery in the world perched amidst high Himalayan clouds.',
        as: 'হিমালয়ৰ শুভ্ৰ মেঘৰ বুকুত অৱস্থিত ঐতিহাসিক বৌদ্ধ মহাবিহাৰ।',
        ne: 'हिमालको काखमा अवस्थित पवित्र ऐतिहासिक बौद्ध गुम्बा।',
        bn: 'হিমালয়ের মেঘের মাঝে অবস্থিত ঐতিহাসিক বৌদ্ধ মহাবিহার।'
      }
    },
    choices: [
      {
        id: 'rhino',
        name: { en: 'One-Horned Rhino', as: 'এশিঙীয়া গঁড়', ne: 'एक सिङ्गे गैँडा', bn: 'একশৃঙ্গ গণ্ডার' },
        imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'tawang',
        name: { en: 'Tawang Monastery', as: 'তাৱাং মহাবিহাৰ', ne: 'तवाङ गुम्बा', bn: 'তাওয়াং মহাবিহার' },
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'rootbridge',
        name: { en: 'Living Root Bridge', as: 'শিপাৰ সাঁকো', ne: 'जराको पुल', bn: 'শিকড়ের সেতু' },
        imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'tea',
        name: { en: 'Tea Bushes', as: 'চাহ বাগিচা', ne: 'चिया बगान', bn: 'চা বাগান' },
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },

  // LEVEL 4: Challenging (4 choices with fine nuances & natural landscapes)
  {
    id: 'loktak_lake_manipur',
    level: 4,
    state: 'Manipur',
    title: {
      en: 'Level 4 — Loktak Lake Floating Phumdis',
      as: 'স্তৰ ৪ — মণিপুৰৰ লোকটাক হ্ৰদৰ ওপঙা ফুmdi',
      ne: 'स्तर ४ — मणिपुरको लोकताक ताल र तैरिने फुमदी',
      bn: 'স্তর ৪ — মণিপুরের লোকটাক হ্রদের ভাসমান ফুমদি'
    },
    target: {
      id: 'loktak_lake',
      name: {
        en: 'Floating Phumdis of Loktak',
        as: 'লোকটাকৰ ওপঙা ফুmdi',
        ne: 'लोकताकको तैरिने फुमदी',
        bn: 'লোকটাকের ভাসমান ফুমদি'
      },
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'Unique circular floating emerald islands in Manipur.',
        as: 'মণিপুৰৰ হ্ৰদৰ পানীত শান্তভাৱে ওপঙি থকা বৃত্তাকাৰ প্ৰাকৃতিক দ্বীপ।',
        ne: 'मणिपुरको तालमा शान्त रूपमा तैरिरहेका हरिया प्राकृतिक टापुहरू।',
        bn: 'মণিপুরের হ্রদে প্রাকৃতিকভাবে ভাসমান বৃত্তাকার সবুজ দ্বীপ।'
      }
    },
    choices: [
      {
        id: 'rhino',
        name: { en: 'One-Horned Rhino', as: 'এশিঙীয়া গঁড়', ne: 'एक सिङ्गे गैँडा', bn: 'একশৃঙ্গ গণ্ডার' },
        imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'loktak_lake',
        name: { en: 'Loktak Phumdis', as: 'লোকটাক ফুmdi', ne: 'लोकताक फुमदी', bn: 'লোকটাক ফুমদি' },
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'mask',
        name: { en: 'Clay Mask', as: 'মাটিৰ মুখা', ne: 'माटोको मुखौटो', bn: 'মাটির মুখোশ' },
        imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'tea',
        name: { en: 'Assam Tea', as: 'অসমৰ চাহ', ne: 'असमको चिया', bn: 'আসামের চা' },
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'brahmaputra_river',
    level: 4,
    state: 'Assam',
    title: {
      en: 'Level 4 — Majestic Brahmaputra River at Twilight',
      as: 'স্তৰ ৪ — সন্ধিয়াৰ শান্ত ব্ৰহ্মপুত্ৰ নদী',
      ne: 'स्तर ४ — गोधूली साँझमा ब्रम्हपुत्र नदी',
      bn: 'স্তর ৪ — শান্ত ব্রহ্মপুত্র নদের গোধূলি রূপ'
    },
    target: {
      id: 'brahmaputra',
      name: {
        en: 'Brahmaputra River Sunset',
        as: 'ব্ৰহ্মপুত্ৰৰ সূৰ্যাস্ত',
        ne: 'ब्रम्हपुत्रको सूर्यास्त',
        bn: 'ব্রহ্মপুত্রের সূর্যাস্ত'
      },
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      description: {
        en: 'The life-giving golden waters flowing peacefully through Assam.',
        as: 'অসমৰ বুকুত শান্তভাৱে বৈ যোৱা বিশাল আৰু পৱিত্ৰ মহাবাহু ব্ৰহ্মপুত্ৰ।',
        ne: 'असमको जीवनरेखा, शान्त बगिरहेको पवित्र ब्रम्हपुत्र नदी।',
        bn: 'আসামের বুক চিরে বয়ে চলা শান্ত ও পবিত্র মহানদী ব্রহ্মপুত্র।'
      }
    },
    choices: [
      {
        id: 'brahmaputra',
        name: { en: 'Brahmaputra Sunset', as: 'ব্ৰহ্মপুত্ৰৰ সূৰ্যাস্ত', ne: 'ब्रम्हपुत्र नदी', bn: 'ব্রহ্মপুত্র সূর্যাস্ত' },
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'dhol',
        name: { en: 'Bihu Dhol', as: 'বিহু ঢোল', ne: 'बिहु ঢोल', bn: 'বিহু ঢোল' },
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'rhino',
        name: { en: 'One-Horned Rhino', as: 'এশিঙীয়া গঁড়', ne: 'एक सिङ्गे गैँडा', bn: 'একশৃঙ্গ গণ্ডার' },
        imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac6550407b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'rootbridge',
        name: { en: 'Living Root Bridge', as: 'শিপাৰ সাঁকো', ne: 'जराको पुल', bn: 'শিকড়ের সেতু' },
        imageUrl: 'https://images.unsplash.com/photo-1609137144820-22165c71d6f2?w=600&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export default function PictureMatchGame({ onSessionComplete, apiUrl, lang = 'en', selectedLanguage, t }) {
  const activeLang = selectedLanguage || lang;
  const pStrings = t?.pictureGame || {};
  const ui = useMemo(() => GAME_UI[activeLang] || GAME_UI.en, [activeLang]);

  // Current level from AdaptiveDifficultyManager (1 to 4)
  const [currentLevel, setCurrentLevel] = useState(1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState('preview'); // 'preview', 'match', 'success'
  const [attemptCount, setAttemptCount] = useState(1);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [adaptiveSimplifyNotice, setAdaptiveSimplifyNotice] = useState(false);
  const [isReinforcementItem, setIsReinforcementItem] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [startTime] = useState(Date.now());

  // Determine current puzzle dynamically based on Level, Round & ReinforcementQueue
  const currentConfig = useMemo(() => {
    const queued = adaptiveDifficultyManager.getNextReinforcementItem(GAME_ID);
    if (queued) {
      const match = PICTURE_LEVELS.find(p => p.target.id === queued.itemId || p.id === queued.itemId);
      if (match) {
        setIsReinforcementItem(true);
        return match;
      }
    }
    setIsReinforcementItem(false);

    const eligibleForLevel = PICTURE_LEVELS.filter(p => p.level === currentLevel);
    if (eligibleForLevel.length > 0) {
      return eligibleForLevel[roundIndex % eligibleForLevel.length];
    }
    return PICTURE_LEVELS[0];
  }, [currentLevel, roundIndex]);

  const targetItem = currentConfig.target;
  const targetName = targetItem.name[activeLang] || targetItem.name.en;
  const targetDesc = targetItem.description[activeLang] || targetItem.description.en;

  // Active choices adjusted for level and simplification
  const displayChoices = useMemo(() => {
    const choices = currentConfig.choices;
    const correctChoice = choices.find(c => c.id === targetItem.id) || choices[0];
    const distractors = choices.filter(c => c.id !== targetItem.id);

    if (adaptiveSimplifyNotice || currentLevel === 1) {
      return [correctChoice, distractors[0]].filter(Boolean);
    }
    if (currentLevel === 2) {
      return [correctChoice, ...distractors.slice(0, 2)].filter(Boolean);
    }
    return choices;
  }, [currentConfig, targetItem, currentLevel, adaptiveSimplifyNotice]);

  // Reset to Level 1 on mount (fresh session start)
  useEffect(() => {
    adaptiveDifficultyManager.resetSessionLevel(GAME_ID);
    setCurrentLevel(1);
  }, []);

  // Stop active voice on language change
  useEffect(() => {
    speechService.stop();
  }, [activeLang]);

  // Auto transition from preview to match phase
  const handleReadyToMatch = () => {
    speechService.stop();
    setPhase('match');
    const matchPrompt = pStrings.whichMatch || "Which picture matches the one you just saw?";
    speechService.speak(matchPrompt, activeLang);
  };

  const handleChoiceClick = (choice) => {
    if (phase !== 'match') return;
    setSelectedChoiceId(choice.id);

    const isCorrect = choice.id === targetItem.id;

    // Stream live gameplay telemetry to Caregiver Dashboard
    emitTelemetry({
      activityTitle: 'Sobi Milua (Picture Match)',
      activityType: 'picture_match',
      status: isCorrect ? `Matched correctly: ${targetName}` : `Choice made for ${targetName}`,
      attempts: attemptCount,
      hintsDelivered: attemptCount - 1,
      isCorrect,
      gameLevel: currentLevel
    });

    if (isCorrect) {
      setPhase('success');
      const successMsg = isReinforcementItem
        ? (ui.reinforcementSuccess || "Wonderful! You remembered this previously challenging memory.")
        : (ui.wellDone || "Wonderful! You remembered correctly.");

      setFeedback(successMsg);
      speechService.speak(successMsg, activeLang);

      const evaluation = adaptiveDifficultyManager.recordResult({
        gameId: GAME_ID,
        itemId: targetItem.id,
        isCorrect: true,
        attempts: attemptCount,
        hintsUsed: attemptCount - 1,
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
        const encouragement = ui.gentleEncouragement || "That is close, take a slow look again.";
        setFeedback(encouragement);

        let hasPreviewReset = false;
        const resetToPreview = () => {
          if (hasPreviewReset) return;
          hasPreviewReset = true;
          setTimeout(() => {
            setSelectedChoiceId(null);
            setPhase('preview');
          }, 500);
        };

        speechService.speak(encouragement, activeLang, 0.85, {
          onEnd: resetToPreview,
          onError: resetToPreview
        });

        setTimeout(resetToPreview, 4000);
      } else {
        // 3rd attempt failed -> Dignified difficulty step-down & polite empathy
        adaptiveDifficultyManager.clearQueueForGame(GAME_ID);

        const reducedLevel = Math.max(1, currentLevel - 1);
        adaptiveDifficultyManager.setLevel(GAME_ID, reducedLevel);
        setCurrentLevel(reducedLevel);
        setAdaptiveSimplifyNotice(true);

        const politeMsgByLang = {
          en: "Okay, let's try something different.",
          as: "ঠিক আছে, আহক আন কিবা এটা চেষ্টা কৰোঁ।",
          bn: "ঠিক আছে, আসুন অন্য কিছু চেষ্টা করি।",
          ne: "हुन्छ, अब अर्कै केही प्रयास गरौँ।"
        };
        const simplifyMsg = politeMsgByLang[activeLang] || "Okay, let's try something different.";

        setFeedback(simplifyMsg);

        let hasAdvanced = false;
        const advanceToNext = () => {
          if (hasAdvanced) return;
          hasAdvanced = true;
          setTimeout(() => {
            setSelectedChoiceId(null);
            setAttemptCount(1);
            setRoundIndex(prev => prev + 1);
            setPhase('preview');
          }, 600);
        };

        speechService.speak(simplifyMsg, activeLang, 0.85, {
          onEnd: advanceToNext,
          onError: advanceToNext
        });

        setTimeout(advanceToNext, 4500);
      }
    }
  };

  const handleNextLevel = async () => {
    speechService.stop();
    setPhase('preview');
    setSelectedChoiceId(null);
    setAttemptCount(1);
    setAdaptiveSimplifyNotice(false);
    setFeedback('');
    setRoundIndex(prev => prev + 1);

    const isLast = currentLevel === 4;
    const duration = Math.round((Date.now() - startTime) / 1000);

    let savedSession = null;
    try {
      const res = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'picture_match',
          activityTitle: `Chobi Mel — Match Picture (${ui.levels[currentLevel] || 'Level ' + currentLevel})`,
          durationSeconds: duration || 120,
          supportiveFeedback: adaptiveSimplifyNotice ? 'Needs a Gentler Pace' : 'High Recall Day',
          favoriteTopicRevisited: targetName,
          itemsEngaged: 1,
          paceObservation: 'Comfortable & Dignified',
          gameLevel: currentLevel
        })
      });
      if (res.ok) {
        savedSession = await res.json();
      }
    } catch (err) {
      console.warn('Session logging notice:', err);
    }

    if (!isLast) {
      setCurrentLevel(prev => Math.min(4, prev + 1));
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
          <Eye size={36} color="var(--affirm-green)" />
          <h2 style={{ fontSize: '32px' }}>ছবি মিল — Match the Picture</h2>
          <span style={{
            background: 'var(--affirm-green-light)',
            color: 'var(--affirm-green-hover)',
            fontSize: '16px',
            fontWeight: '800',
            padding: '4px 14px',
            borderRadius: '16px',
            border: '2px solid #A7F3D0'
          }}>
            {ui.levels[currentLevel] || `Level ${currentLevel}`}
          </span>
          <span style={{
            background: '#F0F9FF',
            color: '#0369A1',
            fontSize: '15px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '12px',
            border: '1px solid #BAE6FD'
          }}>
            {ui.states[currentConfig.state] || currentConfig.state}
          </span>
        </div>

        <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
          {ui.attemptText ? ui.attemptText.replace('{current}', String(attemptCount)) : `Attempt ${attemptCount} of 3`}
        </span>
      </div>

      {/* Delayed Recall / Reinforcement Banner */}
      {isReinforcementItem && phase !== 'success' && (
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

      {/* PHASE 1: STUDY PREVIEW */}
      {phase === 'preview' && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <h3 style={{ fontSize: '26px', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {pStrings.studyPrompt || 'Study this picture carefully:'}
          </h3>

          <div style={{
            maxWidth: '480px',
            height: '320px',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '4px solid var(--accent-amber)',
            boxShadow: 'var(--shadow-card)',
            margin: '0 auto 1.5rem',
            background: '#F1F5F9'
          }}>
            <img
              src={targetItem.imageUrl}
              alt={targetName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h4 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '6px' }}>
            {targetName}
          </h4>
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {targetDesc}
          </p>

          <button
            type="button"
            className="btn-large btn-amber"
            onClick={handleReadyToMatch}
            style={{ width: '100%', maxWidth: '420px' }}
          >
            <span>{pStrings.readyBtn || 'I Have Seen It, Ready to Find!'}</span>
            <ArrowRight size={26} />
          </button>
        </div>
      )}

      {/* PHASE 2: MATCHING FROM CHOICES */}
      {phase === 'match' && (
        <div>
          <h3 style={{ fontSize: '26px', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            {pStrings.whichMatch || 'Which picture matches the one you just saw?'}
          </h3>

          {/* Adaptive Notice if active */}
          {feedback && (
            <div style={{
              background: '#FEF3C7',
              border: '2px solid #FCD34D',
              borderRadius: '16px',
              padding: '12px 18px',
              fontSize: '20px',
              color: '#92400E',
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontWeight: '700'
            }}>
              💡 {feedback}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${displayChoices.length > 2 ? '2' : '2'}, 1fr)`,
            gap: '24px',
            maxWidth: '850px',
            margin: '0 auto 1.5rem'
          }}>
            {displayChoices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isTarget = choice.id === targetItem.id;
              const choiceName = choice.name[activeLang] || choice.name.en;

              let borderStyle = '3px solid var(--border-subtle)';
              if (isSelected) {
                borderStyle = isTarget ? '4px solid var(--affirm-green)' : '4px solid #F59E0B';
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoiceClick(choice)}
                  style={{
                    background: '#FFFFFF',
                    border: borderStyle,
                    borderRadius: '24px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'var(--shadow-soft)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--accent-amber)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = isSelected ? borderStyle : 'var(--border-subtle)';
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '210px',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    background: '#F8FAFC'
                  }}>
                    <img
                      src={choice.imageUrl}
                      alt={choiceName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {choiceName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 3: SUCCESS CELEBRATION */}
      {phase === 'success' && (
        <div style={{
          background: 'var(--affirm-green-light)',
          border: '3px solid var(--affirm-green)',
          borderRadius: '24px',
          padding: '2.5rem',
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

          <h3 style={{ fontSize: '32px', color: '#065F46', marginBottom: '8px' }}>
            {ui.wellDone || 'Wonderful! You remembered correctly.'}
          </h3>
          <p style={{ fontSize: '22px', color: '#047857', marginBottom: '1.75rem' }}>
            {feedback || targetDesc}
          </p>

          <button
            type="button"
            className="btn-large btn-sage"
            onClick={handleNextLevel}
          >
            <span>{currentLevel === 4 ? (ui.completedTitle ? ui.next : 'Complete Activity') : `${ui.next} →`}</span>
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
