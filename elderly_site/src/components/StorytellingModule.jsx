import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, ArrowRight, CheckCircle2, RotateCcw, HelpCircle, Music, ShieldCheck } from 'lucide-react';
import { speechService } from '../services/speechService';
import { adaptiveDifficultyManager } from '../services/adaptiveDifficulty';
import { GAME_UI } from '../i18n/gameUI';

const STORIES = [
  {
    id: 'steamer_umananda',
    state: 'Assam',
    title: {
      en: 'The Historic Steamer to Umananda Island',
      as: 'ব্ৰহ্মপুত্ৰৰ পুৰণি ষ্টিমাৰ যাত্ৰা',
      ne: 'ब्रह्मपुत्रको पुरानो डुङ्गा यात्रा',
      bn: 'ব্রহ্মপুত্রের পুরনো স্টিমার ভ্রমণ'
    },
    subtitle: {
      en: 'A golden twilight voyage across the mighty Brahmaputra',
      as: 'শুক্লেশ্বৰ ঘাটৰ পৰা উমানন্দলৈ পুৰণি দিনৰ স্মৃতি',
      ne: 'नदीको छालमा रमाउँदै गरिएको पुरानो यात्रा',
      bn: 'গোধূলি আলোয় ময়ূর দ্বীপে পৌঁছানোর রূপকথা'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    narrative: {
      en: 'Do you remember boarding the wooden steam ferry at Sukreswar Ghat in the late afternoon? The river breeze was cool and refreshing. As the engine gently churned the water, playful river dolphins, our beloved Xihu, leaped through the golden waves. We held steaming earthen cups of cardamom tea, watching the twilight sun dip behind the hills of Umananda temple.',
      as: 'আপোনাৰ মনত পৰে নে, আবেলি শুক্লেশ্বৰ ঘাটৰ পৰা কাঠৰ ষ্টিমাৰখনত উঠাৰ কথা? নৈৰ জুৰ বতাহজাকে মনটো জুৰাই পেলাইছিল। ষ্টিমাৰৰ শব্দৰ লগে লগে পানীত ব্ৰহ্মপুত্ৰৰ শিহুবোৰে খেলিবলৈ আৰম্ভ কৰিছিল। হাতত মাটির ভাঁড়ত গৰম ইলাচি দিয়া চাহ লৈ আমি পশ্চিম আকাশৰ ৰঙা বেলিটোলৈ চাইছিলোঁ, যেতিয়া নাওখনে উমানন্দৰ পাৰ পাইছিলহি।',
      ne: 'के तपाईंलाई सम्झना छ, साँझपख नदीको किनारबाट पुरानो काठको डुङ्गा चढेको? नदीको चिसो हावाले मनै शान्त बनाउँथ्यो। डुङ्गा चल्दै गर्दा पानीमा डल्फिनहरू उफ्रिरहेका हुन्थे। हातमा माटोको कचौरामा तातो अलैँची चिया पिउँदै, हामीले अस्ताउँदो घाम हेरेका थियौँ।',
      bn: 'মনে পড়ে কি সেই বিকেলে ঘাটের থেকে পুরনো স্টিমারে ওঠার দিনগুলি? নদীর শীতল হাওয়া যেন সব ক্লান্তি জুড়িয়ে দিত। জল কেটে স্টিমার যখন এগিয়ে যেত, পাশে শুশুক বা নদীর ডলফিনেরা তিড়িং-বিড়িং করে লাফাত। হাতে মাটির ভাঁড়ের গরম এলাচ দেওয়া চা নিয়ে আমরা দিগন্তের লাল সূর্য দেখতাম।'
    },
    question: {
      en: 'In our story, what playful river animals did we watch leaping alongside the steamer?',
      as: 'আমাৰ সাধুটোত ষ্টিমাৰৰ কাষে কাষে কোনবোৰ মৰমলগা জলচৰ প্ৰাণীয়ে জপিয়াই খেলিছিল?',
      ne: 'कथामा डुङ्गाको छेउमा कुन जनावरहरू पानीमा उफ्रिरहेका थिए?',
      bn: 'আমাদের গল্পে স্টিমারের পাশে কোন জলজ প্রাণীগুলি খেলা করছিল?'
    },
    hints: {
      en: [
        'Think of the gentle mammals leaping in the golden waves of the Brahmaputra.',
        'They are known locally in Assam as Xihu, swimming alongside ferries.',
        'The answer is the beloved river dolphins (Xihu).'
      ],
      as: [
        'ব্ৰহ্মপুত্ৰৰ সোণালী পানীত ওমলা মৰমৰ জলচৰ প্ৰাণীটোৰ কথা ভাবক।',
        'ইহঁতক আমি মৰমেৰে "শিহু" বুলি মাতোঁ, যিয়ে নাও আৰু ষ্টিমাৰৰ কাষে কাষে সাঁতুৰে।',
        'সঠিক উত্তৰ হ’ল ব্ৰহ্মপুত্ৰৰ মৰমলগা শিহু (River Dolphins)।'
      ],
      ne: [
        'ब्रह्मपुत्र नदीको छालहरूमा उफ्रिने मायालु जलचरको सम्झना गर्नुहोस्।',
        'स्थानीय रूपमा यिनलाई सिहु भनिन्छ, जो डुङ्गासँगै पौडिरहन्छन्।',
        'सही उत्तर नदीका डल्फिनहरू हुन्।'
      ],
      bn: [
        'ব্রহ্মপুত্রের শান্ত জলে খেলা করা মায়াবী জলজ প্রাণীর কথা ভাবুন।',
        'এদের ভালোবেসে শুশুক বা শিহু বলা হয়, যারা নৌকার সাথে সাঁতার কাটে।',
        'সঠিক উত্তর হলো নদীর শুশুক বা ডলফিন।'
      ]
    },
    choices: {
      en: [
        { id: 'dolphins', label: 'River Dolphins (Xihu)', isCorrect: true },
        { id: 'swans', label: 'White River Swans', isCorrect: false },
        { id: 'otters', label: 'Playful Otters', isCorrect: false }
      ],
      as: [
        { id: 'dolphins', label: 'ব্ৰহ্মপুত্ৰৰ শিহু (River Dolphins)', isCorrect: true },
        { id: 'swans', label: 'বগা ৰাজহাঁহ', isCorrect: false },
        { id: 'otters', label: 'নৈৰ উদ বা ভোঁদড়', isCorrect: false }
      ],
      ne: [
        { id: 'dolphins', label: 'नदीका डल्फिनहरू (River Dolphins)', isCorrect: true },
        { id: 'swans', label: 'सेता हाँसहरू', isCorrect: false },
        { id: 'otters', label: 'पानी ओतहरू', isCorrect: false }
      ],
      bn: [
        { id: 'dolphins', label: 'নদীর শুশুক বা ডলফিন (River Dolphins)', isCorrect: true },
        { id: 'swans', label: 'সাদা রাজহাঁস', isCorrect: false },
        { id: 'otters', label: 'নদীর ভোঁদড়', isCorrect: false }
      ]
    }
  },
  {
    id: 'shillong_drive',
    state: 'Meghalaya',
    title: {
      en: 'The Misty Mountain Drive to Shillong',
      as: 'শ্বিলঙৰ পাইন বননি আৰু পুৰণি বাট',
      ne: 'शिलोङको धुम्म परेको पहाडी बाटो',
      bn: 'শিলং পাহাড়ের পাইন বন ও পুরনো পথ'
    },
    subtitle: {
      en: 'Winding through fragrant pine forests and roadside tea stalls',
      as: 'বৰাপানীৰ নীলা পানী আৰু গৰম ভুটাৰ স্মৃতি',
      ne: 'चिसो पहाडी हावा र मकै पोलेको मिठो सुगन्ध',
      bn: 'মেঘে ঢাকা পাহাড় আর গরম ভুট্টার স্মৃতি'
    },
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    narrative: {
      en: 'Remember packing a warm woollen muffler and starting early on the winding highway towards Shillong? The air turned crisp as we climbed higher into the clouds. We passed tall, fragrant pine trees that whispered in the mountain wind. We paused by the sparkling waters of Barapani lake to eat hot roasted corn rubbed with lemon and black salt.',
      as: 'আপোনাৰ মনত পৰে নে, পুৱা গৰম মাফলাৰ মেৰিয়াই শ্বিলঙৰ পাহাৰীয়া বাটেৰে যোৱাৰ কথা? যিমানে ওপৰলৈ গৈছিলোঁ, সিমানে বতাহজাক শীতল হৈ পৰিছিল। বাটৰ দুয়োকাষে ওখ ওখ পাইন গছবোৰে সুবাস বিলাইছিল। বৰাপানীৰ নীলা পানীৰ পাৰত ৰৈ আমি নেমু আৰু ক’লা নিমখ সনা গৰম পোৰা ভুটা খাইছিলোঁ।',
      ne: 'बिहानै न्यानो गलबन्दी बाँधेर पहाडी बाटो हुँदै यात्रा सुरु गरेको सम्झना छ? माथि उक्लँदै जाँदा चिसो हावा र बादलहरू भेटिन्थे। बाटोभरि अग्ला-अग्ला सल्लाका रूखहरू थिए। तालको किनारमा रोकिएर कागती र नुन लगाएको तातो पोलेको मकै खाएको कति रमाइलो थियो।',
      bn: 'মনে পড়ে কি ভোরের আলোয় মাফলার জড়িয়ে আঁকাবাঁকা পাহাড়ি রাস্তা দিয়ে শিলং যাওয়ার দিনগুলি? যত উপরে উঠতাম, হাওয়া ততই স্নিগ্ধ আর শীতল হতো। দুপাশে লম্বা পাইন গাছের বুনো সুবাস বাতাসে ভেসে আসত। বড়াপানি হ্রদের ধারে গাড়ি থামিয়ে লেবু আর বিটনুন মাখানো গরম ভুট্টা খাওয়ার সেই আনন্দ।'
    },
    question: {
      en: 'What tall, fragrant trees lined the mountain road in our journey?',
      as: 'আমাৰ পাহাৰীয়া বাটটোৰ দুয়োকাষে কোনবোৰ ওখ আৰু সুগন্ধি গছ আছিল?',
      ne: 'हाम्रो पहाडी यात्राको बाटोभरि कुन अग्ला सुगन्धित रूखहरू थिए?',
      bn: 'আমাদের পাহাড়ি রাস্তার দুপাশে কোন লম্বা সুগন্ধি গাছগুলি ছিল?'
    },
    hints: {
      en: [
        'Recall the tall evergreen trees in Meghalaya that smell like refreshing pine resin.',
        'Their needles whistle softly in the cool mountain breeze near Barapani.',
        'The answer is the tall fragrant pine trees.'
      ],
      as: [
        'মেঘালয়ৰ পাহাৰত পোৱা ওখ সেউজীয়া সুগন্ধি পাইন গছৰ কথা মনত পেলাওক।',
        'বৰাপানীৰ জুৰ বতাহত এই সৰল বা পাইন গছৰ পাতবোৰে গান গাইছিল।',
        'সঠিক উত্তৰ হ’ল ওখ সুগন্ধি পাইন গছ (Pine Trees)।'
      ],
      ne: [
        'पहाडको चिसो हावामा सल्बलाउने अग्ला सल्लाका रूखहरूको सम्झना गर्नुहोस्।',
        'यिनको पातहरू सुइरो जस्ता हुन्छन् र मिठो सुगन्ध दिन्छन्।',
        'सही उत्तर अग्ला सल्लाका रूखहरू हुन्।'
      ],
      bn: [
        'মেঘালয়ের পাহাড়ে পাইন বনের সেই মিষ্টি সুবাসের কথা মনে করুন।',
        'উঁচু পাহাড়ি রাস্তার দুধারে সারি দিয়ে দাঁড়িয়ে থাকা চিরসবুজ গাছ।',
        'সঠিক উত্তর হলো লম্বা সুগন্ধি পাইন গাছ।'
      ]
    },
    choices: {
      en: [
        { id: 'pine', label: 'Tall Fragrant Pine Trees', isCorrect: true },
        { id: 'coconut', label: 'Coconut Palms', isCorrect: false },
        { id: 'banyan', label: 'Banyan Trees', isCorrect: false }
      ],
      as: [
        { id: 'pine', label: 'ওখ সুগন্ধি পাইন গছ (Pine Trees)', isCorrect: true },
        { id: 'coconut', label: 'নাৰিকল গছ', isCorrect: false },
        { id: 'banyan', label: 'বৰগছ', isCorrect: false }
      ],
      ne: [
        { id: 'pine', label: 'अग्ला सल्लाका रूखहरू (Pine Trees)', isCorrect: true },
        { id: 'coconut', label: 'नारिवलका रूखहरू', isCorrect: false },
        { id: 'banyan', label: 'बरका रूखहरू', isCorrect: false }
      ],
      bn: [
        { id: 'pine', label: 'লম্বা সুগন্ধি পাইন গাছ (Pine Trees)', isCorrect: true },
        { id: 'coconut', label: 'নারকেল গাছ', isCorrect: false },
        { id: 'banyan', label: 'বটগাছ', isCorrect: false }
      ]
    }
  },
  {
    id: 'tejimola_lotus',
    state: 'Assam',
    title: {
      en: 'Tejimola and the Blooming Lotus',
      as: 'তেজীমলা আৰু পদুম ফুলৰ সাধু',
      ne: 'तेजीमला र कमलको फूलको लोककथा',
      bn: 'তেজীমলা ও প্রস্ফুটিত পদ্মফুলের গল্প'
    },
    subtitle: {
      en: 'The beloved timeless tale from Grandmother’s Tales (Burhi Aair Xadhu)',
      as: 'বুঢ়ী আইৰ সাধুৰ মৰমৰ আৰু ধৈৰ্যৰ চিৰসেউজ কাহিনী',
      ne: 'हजुरआमाका कथाहरूबाट सुनिने स्नेह र धैर्यको लोककथा',
      bn: 'ঠাকুমার ঝুলির মতো চিরন্তন স্নেহ ও ভালোবাসার রূপকথা'
    },
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80',
    narrative: {
      en: 'In the gentle villages of old Assam, grandmothers told the tale of little Tejimola. Through trials and unkindness, her pure spirit never vanished. She transformed into a radiant, sweet-scented pink lotus flower swaying gently on the clear waters of the village pond, smiling under the morning sun until her loving merchant father returned home.',
      as: 'পুৰণি অসমৰ গাঁৱত আইতাই জোনাকী ৰাতি তেজীমলাৰ সাধু শুনাইছিল। সকলো দুখ-কষ্টৰ পাছতো তাইৰ নিৰ্দোষ মৰম কেতিয়াও শেষ নহ’ল। গাঁৱৰ পুখুৰীৰ নিৰ্মল পানীত তাই এজনী সুবাসিত ৰঙচুৱা পদুম ফুল হৈ ফুলি উঠিল, আৰু পুৱাৰ ৰ’দত নাচি থাকিল যেতিয়ালৈকে সাউদ দেউতাক নাৱেৰে ঘৰলৈ উভতি নাহিল।',
      ne: 'गाउँघरमा हजुरआमाले सुनाउने तेजीमलाको कथा कति प्यारो थियो। अनेक दुःख सहेर पनि उनको पवित्र मन कहिल्यै हराएन। उनी गाउँको पोखरीमा सुगन्धित कमलको फूल बनेर फुलिन्, र आफ्ना व्यापारी बुबा घर नफर्किएसम्म बिहानीको घाममा मुस्कुराइरहिन्।',
      bn: 'ছোটবেলায় ঠাকুমা-দিদিমারা তেজীমলার সেই মায়াবী রূপকথা শোনাতেন। শত দুঃখের মাঝেও তার নিষ্পাপ ভালোবাসা মুছে যায়নি। গ্রামের শান্ত পুকুরের জলে সে একটি অপূর্ব সুবাসিত পদ্মফুল হয়ে ফুটে উঠেছিল, আর সকালের মিঠে রোদে দোলা খাচ্ছিল যতদিন না তার সওদাগর পিতা বাড়ি ফিরে আসেন।'
    },
    question: {
      en: 'In this folk tale, what fragrant flower did Tejimola transform into?',
      as: 'এই সাধুটোত তেজীমলা পুখুৰীৰ পানীত কি সুবাসিত ফুল হৈ ফুলিছিল?',
      ne: 'यो लोककथामा तेजीमला पोखरीको पानीमा कुन फूल बनेर फुलिन्?',
      bn: 'এই রূপকথায় তেজীমলা পুকুরের জলে কোন সুবাসিত ফুল হয়ে ফুটে উঠেছিল?'
    },
    hints: {
      en: [
        'Think of the graceful flower that blooms above the clear pond waters.',
        'It has pink petals and is the sacred blossom of innocence.',
        'The answer is the radiant pink lotus flower.'
      ],
      as: [
        'পুখুৰীৰ পানীত ফুলি থকা নিৰ্মল পাহিৰ ফুলটোৰ কথা মনত পেলাওক।',
        'ৰঙচুৱা পাহিৰ এই পৱিত্ৰ ফুলটো সাউদ দেউতাক দেখি নাচি উঠিছিল।',
        'সঠিক উত্তৰ হ’ল ৰঙচুৱা পদুম ফুল (Lotus Flower)।'
      ],
      ne: [
        'पोखरीको पानीमा फुल्ने गुलाबी पत्रदल भएको फूलको सम्झना गर्नुहोस्।',
        'यो पवित्र कमलको फूल बनेर पानीमा मुस्कुराइरहेकी थिइन्।',
        'सही उत्तर गुलाबी कमलको फूल हो।'
      ],
      bn: [
        'পুকুরের শান্ত জলে মাথা তুলে দাঁড়িয়ে থাকা মায়াবী ফুলের কথা ভাবুন।',
        'গোলাপি পাপড়ির এই স্নিগ্ধ পদ্মফুলটি রূপকথার এক চিরন্তন প্রতীক।',
        'সঠিক উত্তর হলো স্নিগ্ধ গোলাপি পদ্মফুল।'
      ]
    },
    choices: {
      en: [
        { id: 'lotus', label: 'Radiant Pink Lotus Flower', isCorrect: true },
        { id: 'rose', label: 'Red Courtyard Rose', isCorrect: false },
        { id: 'marigold', label: 'Yellow Marigold', isCorrect: false }
      ],
      as: [
        { id: 'lotus', label: 'ৰঙচুৱা পদুম ফুল (Lotus Flower)', isCorrect: true },
        { id: 'rose', label: 'ৰঙা গোলাপ ফুল', isCorrect: false },
        { id: 'marigold', label: 'হালধীয়া গেন্ধাই ফুল', isCorrect: false }
      ],
      ne: [
        { id: 'lotus', label: 'गुलाबी कमलको फूल (Lotus Flower)', isCorrect: true },
        { id: 'rose', label: 'रातो गुलाब', isCorrect: false },
        { id: 'marigold', label: 'पहेँलो सयपत्री', isCorrect: false }
      ],
      bn: [
        { id: 'lotus', label: 'স্নিগ্ধ গোলাপি পদ্মফুল (Lotus Flower)', isCorrect: true },
        { id: 'rose', label: 'লাল গোলাপ', isCorrect: false },
        { id: 'marigold', label: 'হলুদ গাঁদা ফুল', isCorrect: false }
      ]
    }
  },
  {
    id: 'tea_estate_morning',
    state: 'Assam',
    title: {
      en: 'First Flush Harvest at Jorhat Tea Estate',
      as: 'যোৰহাটৰ চাহ বাগিচাৰ পুৱা',
      ne: 'जोरहाटको चिया बगानको बिहानी',
      bn: 'যোরহাটের চা বাগানের প্রথম সকাল'
    },
    subtitle: {
      en: 'The earthy aroma of two leaves and a bud brewed in a brass pot',
      as: 'কাঁহৰ চাহদানীৰ সোণালী সুবাস আৰু পুৱাৰ কুঁৱলী',
      ne: 'काँसको भाँडामा पकाइने चियाको मिठो सुगन्ध',
      bn: 'কাঁসার চায়ের পাত্রে প্রথম তোলার চায়ের রূপকথা'
    },
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    narrative: {
      en: 'Do you remember waking up to the songbirds on a Jorhat tea estate? The green bushes sparkled with morning dew. The tea pluckers moved rhythmically with their woven cane baskets. At the bungalow veranda, freshly rolled golden orthodox tea leaves were brewed in an antique brass teapot, filling the morning air with rich warmth.',
      as: 'যোৰহাটৰ চাহ বাগিচাত পুৱাৰ পখীৰ মাত শুনি সাৰ পোৱাৰ কথা মনত পৰে নে? সেউজীয়া পাতবোৰত পুৱাৰ নিয়ৰ তিৰবিৰাই আছিল। বাৰান্দাত বহি আমি পুৰণি কাঁহৰ চাহদানীত সতেজ পাতৰ সোণালী চাহ উতলাইছিলোঁ, যাৰ সুবাসে সমগ্ৰ পুৱাটো শান্তিময় কৰি তুলিছিল।',
      ne: 'चिया बगानमा बिहान चराहरूको आवाजसँगै बिउँझिएको सम्झना कति मिठो छ। हरिया पातहरूमा शीतका थोपाहरू टल्किन्थे। पुराना काँसको भाँडामा ताजा चियापत्ती हालेर पकाएको चियाले बिहानीलाई न्यानो र आनन्दमय बनाउँथ्यो।',
      bn: 'চা বাগানে পাখির ডাকে ঘুম ভাঙার সেই মিষ্টি ভোরগুলির কথা মনে পড়ে? সকালের শিশিরবিন্দু সবুজ পাতায় মুক্তোর মতো জ্বলজ্বল করত। বারান্দায় বসে পুরনো কাঁসার চায়ের পাত্রে সদ্য তোলা সোনালী পাতার চা বানানো হতো, যার সুবাসে ভরে উঠত পুরো সকাল।'
    },
    question: {
      en: 'What traditional antique pot was used to brew the fresh morning tea?',
      as: 'পুৱাৰ সতেজ চাহখিনি উতলাবলৈ কি পৰম্পৰাগত পাত্ৰ ব্যৱহাৰ কৰা হৈছিল?',
      ne: 'बिहानको ताजा चिया पकाउन कुन परम्परागत भाँडो प्रयोग गरिएको थियो?',
      bn: 'সকালের তাজা চা বানাতে কোন ঐতিহ্যবাহী পাত্র ব্যবহার করা হয়েছিল?'
    },
    hints: {
      en: [
        'Think of the shining metal vessel with a warm golden hue kept on the veranda table.',
        'It is crafted from bell metal / brass, renowned across Assam for tea.',
        'The answer is the antique brass teapot.'
      ],
      as: [
        'বাৰান্দাৰ মেজত থকা সোণালী উজ্জ্বল কাঁহৰ পাত্ৰটোৰ কথা ভাবক।',
        'অসমৰ ঐতিহ্যবাহী কাঁহ শিল্পৰ এই চাহদানী চাহৰ সোৱাদ বঢ়াই তোলে।',
        'সঠিক উত্তৰ হ’ল পুৰণি কাঁহৰ চাহদানী (Brass Teapot)।'
      ],
      ne: [
        'चिया बगानको पुरानो काँसको भाँडोको सम्झना गर्नुहोस्।',
        'यसमा पकाएको चियाको सुगन्ध चारैतिर फैलिन्थ्यो।',
        'सही उत्तर परम्परागत काँसको भाँडो हो।'
      ],
      bn: [
        'বারান্দায় রাখা সেই ঐতিহ্যবাহী কাঁসার পাত্রটির কথা মনে করুন।',
        'কাঁসার অপূর্ব কাজ করা সোনালী চায়ের পাত্র।',
        'সঠিক উত্তর হলো ঐতিহ্যবাহী কাঁসার চায়ের পাত্র।'
      ]
    },
    choices: {
      en: [
        { id: 'brass', label: 'Antique Brass Teapot', isCorrect: true },
        { id: 'plastic', label: 'Plastic Water Flask', isCorrect: false },
        { id: 'glass', label: 'Plain Glass Tumbler', isCorrect: false }
      ],
      as: [
        { id: 'brass', label: 'পুৰণি কাঁহৰ চাহদানী (Brass Teapot)', isCorrect: true },
        { id: 'plastic', label: 'প্লাষ্টিকৰ ফ্লাস্ক', isCorrect: false },
        { id: 'glass', label: 'কাঁচৰ গিলাচ', isCorrect: false }
      ],
      ne: [
        { id: 'brass', label: 'परम्परागत काँसको भाँडो (Brass Teapot)', isCorrect: true },
        { id: 'plastic', label: 'प्लास्टिकको बोतल', isCorrect: false },
        { id: 'glass', label: 'सिसाको गिलास', isCorrect: false }
      ],
      bn: [
        { id: 'brass', label: 'ঐতিহ্যবাহী কাঁসার চায়ের পাত্র (Brass Teapot)', isCorrect: true },
        { id: 'plastic', label: 'প্লাস্টিকের বোতল', isCorrect: false },
        { id: 'glass', label: 'কাঁচের গ্লাস', isCorrect: false }
      ]
    }
  }
];

export default function StorytellingModule({ onSessionComplete, apiUrl, lang = 'en', selectedLanguage, selectedContentRegion = 'NER', t }) {
  const activeLang = selectedLanguage || lang;
  const sStrings = t?.storytelling || {};
  const ui = GAME_UI[activeLang] || GAME_UI['en'];

  const [currentLevel, setCurrentLevel] = useState(() => adaptiveDifficultyManager.getLevel('storytelling'));
  const [storyIndex, setStoryIndex] = useState(0);
  const [phase, setPhase] = useState('listen'); // 'listen', 'recall', 'success'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeClue, setActiveClue] = useState('');
  const [adaptiveHelp, setAdaptiveHelp] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);
  const [startTime] = useState(Date.now());

  const audioContextRef = useRef(null);
  const oscillatorNodesRef = useRef([]);

  // Subscribe to adaptive difficulty changes
  useEffect(() => {
    const unsub = adaptiveDifficultyManager.subscribe((gameKey, newLvl) => {
      if (gameKey === 'storytelling') {
        setCurrentLevel(newLvl);
      }
    });
    return unsub;
  }, []);

  const currentStory = STORIES[storyIndex];
  const storyTitle = currentStory.title[activeLang] || currentStory.title['en'];
  const storySub = currentStory.subtitle[activeLang] || currentStory.subtitle['en'];
  const storyText = currentStory.narrative[activeLang] || currentStory.narrative['en'];
  const storyQuestion = currentStory.question[activeLang] || currentStory.question['en'];
  const rawChoices = currentStory.choices[activeLang] || currentStory.choices['en'];
  const storyHints = currentStory.hints[activeLang] || currentStory.hints['en'];

  // Adaptive display choices: Level 1 or after adaptiveHelp simplifies to 2 choices
  const displayChoices = useMemo(() => {
    const correct = rawChoices.find(c => c.isCorrect) || rawChoices[0];
    const distractors = rawChoices.filter(c => !c.isCorrect);

    let list;
    if (currentLevel === 1 || adaptiveHelp) {
      list = [correct, distractors[0]].filter(Boolean);
    } else if (currentLevel === 2) {
      list = [correct, ...distractors.slice(0, 2)].filter(Boolean);
    } else {
      list = rawChoices;
    }

    // Stable alternating position based on story index so answer isn't always top button
    if (storyIndex % 2 === 1 && list.length >= 2) {
      return [list[1], list[0], ...list.slice(2)];
    }
    return list;
  }, [rawChoices, currentLevel, adaptiveHelp, storyIndex]);

  // Background ambient sound synthesis (gentle river wave / flute undertone)
  const startAmbience = () => {
    stopAmbience();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const freqs = [330, 440];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorNodesRef.current.push(osc);
      });

      setIsAmbiencePlaying(true);
    } catch (e) {
      console.warn("Ambience error:", e);
    }
  };

  const stopAmbience = () => {
    oscillatorNodesRef.current.forEach(n => {
      try { n.stop(); n.disconnect(); } catch (e) {}
    });
    oscillatorNodesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setIsAmbiencePlaying(false);
  };

  // Stop narration and ambience immediately when language flips
  useEffect(() => {
    speechService.stop();
    stopAmbience();
    setIsSpeaking(false);
  }, [activeLang]);

  useEffect(() => {
    return () => {
      stopAmbience();
      speechService.stop();
    };
  }, []);

  const handleToggleNarrate = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      stopAmbience();
      return;
    }

    speechService.speak(storyText, activeLang, 0.82, {
      onStart: () => {
        setIsSpeaking(true);
        startAmbience();
      },
      onEnd: () => {
        setIsSpeaking(false);
        stopAmbience();
      },
      onError: () => {
        setIsSpeaking(false);
        stopAmbience();
      }
    });
  };

  // 3-Attempt Adaptive Logic
  const handleChoiceClick = (choice) => {
    if (phase !== 'recall') return;
    setSelectedChoiceId(choice.id);

    if (choice.isCorrect) {
      adaptiveDifficultyManager.recordAttempt('storytelling', true, attempts, hintsUsed, false);
      setPhase('success');
      setFeedback(sStrings.successMsg || 'You remembered the details from our story with wonderful clarity.');
      setActiveClue('');
    } else {
      const nextAttempt = attempts + 1;
      const nextHintsUsed = hintsUsed + 1;
      setAttempts(nextAttempt);
      setHintsUsed(nextHintsUsed);

      if (nextAttempt === 2) {
        // Attempt 2: Tier 1 Gentle hint
        const hint = storyHints[0] || (ui.gentleEncouragement || 'That is close, take a slow look again.');
        setActiveClue(hint);
        const encouragement = ui.gentleEncouragement || "That was close! A gentle memory hint is ready above.";
        setFeedback(encouragement);
        speechService.speak(hint || encouragement, activeLang);
      } else if (nextAttempt === 3) {
        // Attempt 3: Tier 2 Contextual clue + simplify options
        const hint = storyHints[1] || storyHints[0] || '';
        setActiveClue(hint);
        setAdaptiveHelp(true);
        const simplifyMsg = ui.adaptiveSimplify || 'Options simplified for your comfort.';
        setFeedback(simplifyMsg);
        speechService.speak(hint || simplifyMsg, activeLang);
      } else {
        // Failed after 3 attempts:
        // Mark for reinforcement, intentionally step down difficulty, queue for delayed recall
        adaptiveDifficultyManager.recordAttempt('storytelling', false, attempts, hintsUsed, true);
        adaptiveDifficultyManager.queueForReinforcement('storytelling', {
          storyId: currentStory.id,
          title: storyTitle,
          failedAttempts: 3,
          hintsGiven: 3
        });

        const finalHint = storyHints[2] || storyHints[1] || '';
        setActiveClue(finalHint);
        const notice = ui.reinforcementNotice || 'Great effort! We will revisit this lovely story warmly later.';
        setFeedback(notice);
        speechService.speak(notice, activeLang);
        // Gracefully allow progression after showing respectful feedback
        setTimeout(() => {
          setPhase('success');
        }, 1600);
      }

      setTimeout(() => {
        setSelectedChoiceId(null);
      }, 1000);
    }
  };

  const handleNextStory = async () => {
    stopAmbience();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const isLast = storyIndex === STORIES.length - 1;
    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'storytelling',
          activityTitle: `Storytelling (${activeLang.toUpperCase()}) — ${storyTitle}`,
          durationSeconds: duration || 220,
          gameLevel: currentLevel,
          attempts: attempts,
          hintsUsed: hintsUsed,
          needsReinforcement: attempts > 3,
          supportiveFeedback: adaptiveHelp ? 'Needs a Gentler Pace' : 'High Recall Day',
          favoriteTopicRevisited: storyTitle,
          itemsEngaged: 1,
          paceObservation: 'Deeply Engaged & Relaxed'
        })
      });
    } catch (err) {
      console.error('Session log err:', err);
    }

    if (!isLast) {
      setStoryIndex(prev => prev + 1);
      setPhase('listen');
      setAttempts(1);
      setHintsUsed(0);
      setActiveClue('');
      setAdaptiveHelp(false);
      setSelectedChoiceId(null);
      setFeedback('');
    } else {
      onSessionComplete();
    }
  };

  const stateNameDisplay = ui.states?.[currentStory.state] || currentStory.state;

  return (
    <div className="focus-card">
      {/* Top Header */}
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
          <BookOpen size={36} color="var(--accent-amber)" />
          <div>
            <h2 style={{ fontSize: '30px', margin: 0 }}>
              {sStrings.title || 'Folk Stories & Travel Diaries'}
            </h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
              {/* Cognitive Level Badge */}
              <span style={{
                background: '#FEF3C7',
                color: '#92400E',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={16} />
                {ui.level} {currentLevel}: {ui.levelDesc[currentLevel]}
              </span>
              {/* Cultural State Badge */}
              <span style={{
                background: '#ECFDF5',
                color: '#065F46',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                {stateNameDisplay} ({selectedContentRegion})
              </span>
            </div>
          </div>
        </div>

        {/* Story Index Carousel Indicator */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STORIES.map((st, idx) => {
            const stState = ui.states?.[st.state] || st.state;
            const isActive = storyIndex === idx;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  stopAmbience();
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setStoryIndex(idx);
                  setPhase('listen');
                  setAttempts(1);
                  setHintsUsed(0);
                  setActiveClue('');
                  setAdaptiveHelp(false);
                  setSelectedChoiceId(null);
                  setFeedback('');
                }}
                style={{
                  background: isActive ? 'var(--accent-amber)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '8px 14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📍 {stState} ({idx + 1})
              </button>
            );
          })}
        </div>
      </div>

      {/* PHASE 1: STORYTELLING & LISTENING */}
      {phase === 'listen' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '2.5rem', alignItems: 'center', marginBottom: '2.5rem' }}>
            {/* Story Artwork */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: '4px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
                height: '340px'
              }}>
                <img
                  src={currentStory.imageUrl}
                  alt={storyTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Story Audio Narration Trigger with Ambient Sound */}
              <div style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={handleToggleNarrate}
                  className="btn-large btn-amber"
                  style={{ width: '100%', minHeight: '64px', fontSize: '20px' }}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX size={24} />
                      <span>Stop Voiceover</span>
                    </>
                  ) : (
                    <>
                      <Music size={24} />
                      <span>{sStrings.listenWithAmbience || 'Listen to Story (With Calming Music)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Story Text */}
            <div>
              <h3 style={{ fontSize: '30px', color: 'var(--text-main)', marginBottom: '6px' }}>
                {storyTitle}
              </h3>
              <p style={{ fontSize: '20px', color: 'var(--accent-amber)', fontWeight: '600', marginBottom: '1.5rem' }}>
                {storySub}
              </p>

              <div style={{
                background: '#FFFDF9',
                border: '2px solid var(--border-subtle)',
                borderRadius: '20px',
                padding: '1.5rem',
                fontSize: '22px',
                lineHeight: '1.7',
                color: 'var(--text-main)',
                marginBottom: '1.5rem'
              }}>
                {storyText}
              </div>

              {/* Enter Memory Recall Game */}
              <button
                type="button"
                className="btn-large btn-sage"
                onClick={() => {
                  stopAmbience();
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setPhase('recall');
                }}
                style={{ width: '100%' }}
              >
                <Sparkles size={24} />
                <span>{sStrings.testRecallBtn || 'Reflect on Story Memories (Memory Game)'}</span>
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: CONNECTED STORY MEMORY RECALL GAME */}
      {phase === 'recall' && (
        <div style={{ padding: '1rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {/* Attempt Counter Display */}
            <span style={{ fontSize: '18px', color: '#64748B', fontWeight: '600' }}>
              {(ui.attemptText || 'Attempt {current} of 3').replace('{current}', String(attempts))}
            </span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '8px 0' }}>
              Story Memory Reflection:
            </h3>
            <p style={{ fontSize: '24px', color: '#92400E', fontWeight: '600' }}>
              "{storyQuestion}"
            </p>
          </div>

          {/* Active Adaptive Clue Box */}
          {activeClue && (
            <div style={{
              background: '#FFFBEB',
              border: '2px dashed #F59E0B',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <HelpCircle size={26} color="#D97706" />
              <span style={{ fontSize: '20px', color: '#92400E', fontWeight: '600' }}>
                {activeClue}
              </span>
            </div>
          )}

          {feedback && (
            <div style={{ textAlign: 'center', fontSize: '20px', color: 'var(--accent-amber-hover)', marginBottom: '1.25rem', fontWeight: '600' }}>
              {feedback}
            </div>
          )}

          {/* Choices Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '680px',
            margin: '0 auto 2rem'
          }}>
            {displayChoices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoiceClick(choice)}
                  className={`choice-card ${isSelected ? 'selected-affirm' : ''}`}
                  style={{ minHeight: '80px', fontSize: '24px' }}
                >
                  <span>{choice.label}</span>
                  {isSelected && <CheckCircle2 size={32} color="#059669" />}
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              className="btn-large btn-outline"
              onClick={() => setPhase('listen')}
              style={{ minHeight: '64px', padding: '12px 24px', fontSize: '20px' }}
            >
              <RotateCcw size={22} />
              <span>{sStrings.backToStory || 'Back to Story'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: SUCCESS CELEBRATION */}
      {phase === 'success' && (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'var(--affirm-green-light)',
          border: '3px solid var(--affirm-green)',
          borderRadius: '24px'
        }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--affirm-green)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Sparkles size={48} />
          </div>

          <h3 style={{ fontSize: '32px', color: '#065F46', marginBottom: '8px' }}>
            {sStrings.successTitle || 'Splendid Story Recall!'}
          </h3>
          <p style={{ fontSize: '22px', color: '#047857', marginBottom: '2rem' }}>
            {feedback}
          </p>

          <button
            className="btn-large btn-sage"
            onClick={handleNextStory}
            style={{ margin: '0 auto' }}
          >
            <span>
              {storyIndex === STORIES.length - 1 ? (sStrings.finish || 'Finish Stories') : (sStrings.nextStory || 'Next Story / Diary')}
            </span>
            <ArrowRight size={26} />
          </button>
        </div>
      )}
    </div>
  );
}
