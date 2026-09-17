const ElderlyProfile = require('./models/ElderlyProfile');
const FamilyMember = require('./models/FamilyMember');
const Routine = require('./models/Routine');
const Reminder = require('./models/Reminder');
const GameSession = require('./models/GameSession');
const Memory = require('./models/Memory');

async function seedData() {
  console.log('[Seed] Checking database collections...');

  const profileCount = await ElderlyProfile.countDocuments();
  let profile = await ElderlyProfile.findOne();
  if (profileCount === 0) {
    console.log('[Seed] Seeding Elderly Profile...');
    profile = await ElderlyProfile.create({
      name: 'Bhaben Baruah',
      age: 76,
      preferredLanguage: 'Assamese / English',
      region: 'Jorhat, Assam',
      interests: [
        'Tea gardens',
        'Bihu folk songs',
        'Brahmaputra boat cruises',
        'Morning strolls'
      ],
      currentLevel: {
        photoRecall: 1,
        nameRecall: 1,
        routineSequencing: 1
      },
      honorific: 'Koka',
      greetingTitle: 'Suprabhat',
      hometown: 'Sivasagar & Jorhat, Assam',
      currentResidence: 'Beltola, Guwahati',
      primaryLanguage: 'Assamese',
      secondaryLanguage: 'English',
      culturalInterests: [
        'Rongali Bihu Celebrations',
        'Brahmaputra Sunset Cruises',
        'Majuli Island Mask Art',
        'Assam Orthodox Golden Tips Tea',
        'Naam-Ghor Spiritual Chants'
      ],
      comfortNotes: 'Responds warmly to memories of the Sivasagar historic tank, Rongali Bihu dhol beats, and childhood tea gardens.',
      emergencyContact: {
        name: 'Deepak Baruah (Son)',
        relation: 'Son',
        phone: '+91 98640 12345'
      },
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'
    });
  } else if (!profile.currentLevel) {
    profile.currentLevel = { photoRecall: 1, nameRecall: 1, routineSequencing: 1 };
    profile.age = profile.age || 76;
    profile.region = profile.region || 'Jorhat, Assam';
    profile.preferredLanguage = profile.preferredLanguage || 'Assamese / English';
    await profile.save();
  }

  const familyCount = await FamilyMember.countDocuments();
  if (familyCount === 0) {
    console.log('[Seed] Seeding Family Members with authentic NER cultural memory hooks...');
    await FamilyMember.insertMany([
      {
        name: 'Maina (Rhea)',
        relation: 'Granddaughter',
        culturalRelation: 'Naati-Suwali',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        memoryHook: 'She lives in Bangalore as a teacher. Whenever she returns for Magh Bihu, she sits beside you on the cane mora making warm Til Pitha and Narikol Laru!',
        voicePrompt: 'Look Koka, this is your granddaughter Maina, who loves making Bihu pitha with you.',
        favoriteMemory: 'Laughing together as the first pitha rolls out warm and fragrant.',
        residence: 'Bangalore / Guwahati',
        recallChoices: ['Maina (Granddaughter)', 'Rupa (Niece)', 'Ananya (Daughter)'],
        orderIndex: 1
      },
      {
        name: 'Rohan',
        relation: 'Grandson',
        culturalRelation: 'Naati-Lora',
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        memoryHook: 'He plays the Bihu dhol with great joy at the Guwahati Latasil field. He always puts on a red Phulam Gamusa and plays the rhythmic beats just for you!',
        voicePrompt: 'Here is your grandson Rohan, who loves playing the Bihu dhol for you.',
        favoriteMemory: 'Teaching him the classic 3-beat rhythm of Bohag Bihu on your veranda.',
        residence: 'Guwahati, Assam',
        recallChoices: ['Rohan (Grandson)', 'Bikash (Neighbor)', 'Deepak (Son)'],
        orderIndex: 2
      },
      {
        name: 'Deepak Baruah',
        relation: 'Son',
        culturalRelation: 'Dangor Lora',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        memoryHook: 'Your eldest son who manages the tea gardens in Golaghat. Every weekend he brings you a box of fresh first-flush Assam orthodox tea leaves.',
        voicePrompt: 'This is Deepak, your caring son who brings the fragrant tea leaves from Golaghat.',
        favoriteMemory: 'Walking together through the morning mist of the tea estate inspecting tender green buds.',
        residence: 'Golaghat / Guwahati',
        recallChoices: ['Deepak (Son)', 'Pradip (Brother)', 'Rohan (Grandson)'],
        orderIndex: 3
      },
      {
        name: 'Dr. Ananya Sarma',
        relation: 'Daughter',
        culturalRelation: 'Maju Suwali',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
        memoryHook: 'A physician at Guwahati Medical College. She visits every Sunday evening in her Muga silk Mekhela Sador to prepare your favorite ginger-cinnamon tea.',
        voicePrompt: 'Look Koka, it is your daughter Dr. Ananya, bringing your warm evening tea.',
        favoriteMemory: 'Sitting together as the evening river breeze sweeps across the garden.',
        residence: 'Guwahati, Assam',
        recallChoices: ['Ananya (Daughter)', 'Maina (Granddaughter)', 'Kalyani (Sister)'],
        orderIndex: 4
      }
    ]);
  }

  const routineCount = await Routine.countDocuments();
  if (routineCount === 0) {
    console.log('[Seed] Seeding Daily Routines...');
    await Routine.insertMany([
      {
        title: 'Morning Refreshment & Jolpan (পুৱাৰ চাহ আৰু জলপান)',
        time: '07:30 AM',
        period: 'Morning',
        culturalNote: 'Traditional Assam morning with warm red tea and delicious Doi-Chira.',
        orderIndex: 1,
        steps: [
          {
            stepNumber: 1,
            title: 'Sip warm lemon water',
            description: 'Drink half a glass of warm soothing water to gently wake up your body.',
            completed: false,
            audioPrompt: 'Take a gentle sip of warm water from your brass tumbler.'
          },
          {
            stepNumber: 2,
            title: 'Enjoy fresh Assam Red Tea (Ronga Saah)',
            description: 'Take your time savoring the warm, fragrant tea brewed with fresh ginger.',
            completed: false,
            audioPrompt: 'Savor your cup of fresh ginger tea, warm and comforting.'
          },
          {
            stepNumber: 3,
            title: 'Taste soft Doi-Chira with Jaggery (Gur)',
            description: 'Enjoy a light bowl of soaked flattened rice with curd and sweet jaggery.',
            completed: false,
            audioPrompt: 'Enjoy your delicious bowl of Doi-Chira at your own peaceful pace.'
          }
        ]
      },
      {
        title: 'Veranda Sun & Garden Walk (বাৰান্দাৰ ৰোদ আৰু খোজ)',
        time: '09:30 AM',
        period: 'Morning',
        culturalNote: 'Fresh gentle sunlight on the veranda amidst blooming orchids.',
        orderIndex: 2,
        steps: [
          {
            stepNumber: 1,
            title: 'Put on soft walking slippers',
            description: 'Ensure your feet are comfortable and secure.',
            completed: false,
            audioPrompt: 'Let us put on your comfortable walking slippers.'
          },
          {
            stepNumber: 2,
            title: 'Take 10 gentle steps along the sunny railing',
            description: 'Feel the morning breeze and watch the birds on the Nahor tree.',
            completed: false,
            audioPrompt: 'Walk gently along the veranda, breathing in the fresh morning air.'
          },
          {
            stepNumber: 3,
            title: 'Gentle hand stretch and deep breath',
            description: 'Raise your hands gently, take three calming deep breaths.',
            completed: false,
            audioPrompt: 'Breathe in slowly, and exhale with a smile.'
          }
        ]
      },
      {
        title: 'Evening Prayer & Calm Relaxation (সন্ধিয়াৰ নাম-প্ৰসংগ)',
        time: '05:30 PM',
        period: 'Evening',
        culturalNote: 'Quiet contemplation with earthen lamp and soothing flute melodies.',
        orderIndex: 3,
        steps: [
          {
            stepNumber: 1,
            title: 'Light the brass Diya at the prayer corner',
            description: 'A calming warm glow for the evening peace.',
            completed: false,
            audioPrompt: 'Light the gentle brass lamp and listen to the evening bells.'
          },
          {
            stepNumber: 2,
            title: 'Listen to soft Naam-Ghor chanting',
            description: 'Rest comfortably on the armchair and let the sacred verses bring peace.',
            completed: false,
            audioPrompt: 'Close your eyes and listen to the peaceful evening prayer.'
          }
        ]
      }
    ]);
  }

  const reminderCount = await Reminder.countDocuments();
  if (reminderCount === 0) {
    console.log('[Seed] Seeding Daily Reminders...');
    await Reminder.insertMany([
      {
        title: 'Morning Wellness Tablet with Warm Water',
        time: '08:15 AM',
        category: 'Medication',
        voiceText: 'Koka, it is time for your morning herbal supplement with warm water.',
        isActive: true,
        isCompletedToday: false
      },
      {
        title: 'Midday Hydration & Coconut Water',
        time: '11:30 AM',
        category: 'Hydration',
        voiceText: 'Koka, please enjoy a cool, refreshing glass of fresh coconut water.',
        isActive: true,
        isCompletedToday: false
      },
      {
        title: 'Afternoon Veranda Relaxation',
        time: '03:30 PM',
        category: 'Gentle Walk',
        voiceText: 'Time to sit on the cane chair and feel the gentle afternoon breeze.',
        isActive: true,
        isCompletedToday: false
      },
      {
        title: 'Evening Call with Deepak & Maina',
        time: '07:00 PM',
        category: 'Family Call',
        voiceText: 'Your granddaughter Maina and son Deepak are looking forward to chatting with you.',
        isActive: true,
        isCompletedToday: false
      }
    ]);
  }

  const sessionCount = await GameSession.countDocuments();
  if (sessionCount === 0) {
    console.log('[Seed] Seeding dignity-first engagement session records...');
    const sampleDates = [
      new Date(Date.now() - 6 * 86400000),
      new Date(Date.now() - 5 * 86400000),
      new Date(Date.now() - 4 * 86400000),
      new Date(Date.now() - 3 * 86400000),
      new Date(Date.now() - 2 * 86400000),
      new Date(Date.now() - 1 * 86400000),
      new Date()
    ];

    await GameSession.insertMany([
      {
        activityType: 'family_recall',
        activityTitle: 'Smriti Ghor (Family Memory Lane)',
        durationSeconds: 320,
        supportiveFeedback: 'Consistent Participation',
        favoriteTopicRevisited: 'Granddaughter Maina & Magh Bihu Pitha',
        itemsEngaged: 4,
        paceObservation: 'Comfortable & Unhurried',
        createdAt: sampleDates[0]
      },
      {
        activityType: 'cultural_reminiscence',
        activityTitle: 'Oxom & NER Heritage Journey',
        durationSeconds: 410,
        supportiveFeedback: 'High Recall Day',
        favoriteTopicRevisited: 'Kaziranga Morning Mist & Rhinos',
        itemsEngaged: 5,
        paceObservation: 'Joyful & Talkative',
        createdAt: sampleDates[1]
      },
      {
        activityType: 'routine_guidance',
        activityTitle: 'Niyomiya Sahay (Morning Tea Routine)',
        durationSeconds: 240,
        supportiveFeedback: 'Consistent Participation',
        favoriteTopicRevisited: 'Doi-Chira Breakfast Steps',
        itemsEngaged: 3,
        paceObservation: 'Comfortable & Unhurried',
        createdAt: sampleDates[2]
      },
      {
        activityType: 'family_recall',
        activityTitle: 'Smriti Ghor (Family Memory Lane)',
        durationSeconds: 360,
        supportiveFeedback: 'High Recall Day',
        favoriteTopicRevisited: 'Grandson Rohan & Bihu Dhol',
        itemsEngaged: 4,
        paceObservation: 'Joyful & Connected',
        createdAt: sampleDates[3]
      },
      {
        activityType: 'sensory_soundscape',
        activityTitle: 'Xanti Baani (Calming Soundscapes)',
        durationSeconds: 480,
        supportiveFeedback: 'Relaxed & Peaceful Interaction',
        favoriteTopicRevisited: 'Brahmaputra Rain & Bamboo Flute',
        itemsEngaged: 2,
        paceObservation: 'Deeply Soothing',
        createdAt: sampleDates[4]
      },
      {
        activityType: 'cultural_reminiscence',
        activityTitle: 'Oxom & NER Heritage Journey',
        durationSeconds: 390,
        supportiveFeedback: 'Consistent Participation',
        favoriteTopicRevisited: 'Majuli Mask Making Tradition',
        itemsEngaged: 4,
        paceObservation: 'Comfortable & Unhurried',
        createdAt: sampleDates[5]
      },
      {
        activityType: 'family_recall',
        activityTitle: 'Smriti Ghor (Family Memory Lane)',
        durationSeconds: 300,
        supportiveFeedback: 'High Recall Day',
        favoriteTopicRevisited: 'Son Deepak & Golaghat Tea Garden',
        itemsEngaged: 4,
        paceObservation: 'Warm & Engaged',
        createdAt: sampleDates[6]
      }
    ]);
  }

  const memoryCount = await Memory.countDocuments();
  if (memoryCount === 0) {
    console.log('[Seed] Seeding Personalized Memory Album & VR Experiences for Bhaben Baruah (NER Scope)...');
    await Memory.insertMany([
      {
        title: 'Family Picnic at Majuli – 2018',
        category: 'Family',
        imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000&auto=format&fit=crop&q=80',
        people: ['Ananya (Granddaughter)', 'Minoti (Daughter)'],
        relationship: 'Granddaughter & Daughter',
        location: 'Majuli River Bank, Brahmaputra',
        details: 'Winter family boat picnic across the Brahmaputra with hot cardamom tea in clay cups and fresh Til Pitha.',
        datePeriod: 'Winter 2018',
        state: 'Assam',
        regionalContext: 'NER',
        questionPrompt: 'Who is smiling beside you with the warm cup of tea?',
        expectedAnswers: ['ananya', 'granddaughter', 'nati', 'minoti', 'daughter'],
        hints: {
          tier1: 'She is your granddaughter who loves visiting you during winter holidays.',
          tier2: 'Her name starts with A — Ananya.'
        },
        isSelectedForSession: true,
        status: 'Selected',
        lastSessionInsights: {
          lastPlayedAt: new Date(Date.now() - 86400000 * 2),
          recallStatus: 'Successful',
          attempts: 1,
          hintsDelivered: 0,
          responseTimeSeconds: 4.8,
          observationalNotes: 'Prompt recall with a joyful smile; recognized Ananya instantly.'
        },
        sessionHistory: [{
          playedAt: new Date(Date.now() - 86400000 * 2),
          recallStatus: 'Successful',
          attempts: 1,
          hintsDelivered: 0,
          responseTimeSeconds: 4.8,
          observationalNotes: 'Prompt recall with a joyful smile; recognized Ananya instantly.'
        }]
      },
      {
        title: "Granddaughter Ananya's Graduation Day",
        category: 'People',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
        people: ['Ananya Baruah'],
        relationship: 'Granddaughter',
        location: 'Guwahati University Auditorium',
        details: 'Ananya dressed in her golden Muga silk mekhela sador holding her university degree with great pride.',
        datePeriod: 'Autumn 2021',
        state: 'Assam',
        regionalContext: 'NER',
        questionPrompt: 'Do you remember what special day we were celebrating here?',
        expectedAnswers: ['graduation', 'college', 'degree', 'ananya', 'university'],
        hints: {
          tier1: 'Think of the proud day when your granddaughter completed her university degree.',
          tier2: 'She was wearing her golden Muga silk graduation sash.'
        },
        isSelectedForSession: true,
        status: 'Selected',
        lastSessionInsights: {
          lastPlayedAt: new Date(Date.now() - 86400000 * 4),
          recallStatus: 'Successful',
          attempts: 1,
          hintsDelivered: 1,
          responseTimeSeconds: 6.4,
          observationalNotes: 'Looked closely at the photo, smiled warmly upon hearing the graduation hint.'
        },
        sessionHistory: [{
          playedAt: new Date(Date.now() - 86400000 * 4),
          recallStatus: 'Successful',
          attempts: 1,
          hintsDelivered: 1,
          responseTimeSeconds: 6.4,
          observationalNotes: 'Looked closely at the photo, smiled warmly upon hearing the graduation hint.'
        }]
      },
      {
        title: 'Old Ancestral Wooden Home in Sivasagar',
        category: 'Places',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
        people: ['Bhaben Baruah', 'Brothers'],
        relationship: 'Childhood Home',
        location: 'Sivasagar, Upper Assam',
        details: 'The wooden front veranda overlooking the betel nut garden where you spent calm mornings with hot tea.',
        datePeriod: '1965 – 1980',
        state: 'Assam',
        regionalContext: 'NER',
        questionPrompt: 'Which peaceful place in Upper Assam is this ancestral veranda?',
        expectedAnswers: ['sivasagar', 'home', 'sibasagar', 'ancestral home', 'ghor'],
        hints: {
          tier1: 'This is the beloved town with the grand historic Borpukhuri tank.',
          tier2: 'The name starts with S — Sivasagar.'
        },
        isSelectedForSession: false,
        status: 'Ready',
        lastSessionInsights: {
          lastPlayedAt: new Date(Date.now() - 86400000 * 7),
          recallStatus: 'Needed assistance',
          attempts: 2,
          hintsDelivered: 2,
          responseTimeSeconds: 11.2,
          observationalNotes: 'Needed gentle assistance; recalled the morning tea ritual warmly after hint 2.'
        },
        sessionHistory: [{
          playedAt: new Date(Date.now() - 86400000 * 7),
          recallStatus: 'Needed assistance',
          attempts: 2,
          hintsDelivered: 2,
          responseTimeSeconds: 11.2,
          observationalNotes: 'Needed gentle assistance; recalled the morning tea ritual warmly after hint 2.'
        }]
      },
      {
        title: 'Bohag Bihu Dhol Utsav with Childhood Friend',
        category: 'Events',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
        people: ['Pranab (Friend)', 'Bhaben Baruah'],
        relationship: 'Childhood Friend',
        location: 'Courtyard, Sivasagar',
        details: 'Playing the wooden Bihu dhol rhythmically on the courtyard on the first day of Bohag.',
        datePeriod: 'April 1974',
        state: 'Assam',
        regionalContext: 'NER',
        questionPrompt: 'What joyful springtime festival were you playing the dhol for?',
        expectedAnswers: ['bihu', 'bohag bihu', 'rongali bihu', 'festival'],
        hints: {
          tier1: 'It is the most beloved springtime New Year festival of Assam.',
          tier2: 'Everyone ties red Phulam Gamusas and plays the dhol — Bohag Bihu.'
        },
        isSelectedForSession: false,
        status: 'Ready'
      },
      {
        title: 'Trip to Shillong Pine Ridge with Late Wife',
        category: 'Places',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
        people: ['Nirmala (Wife)', 'Bhaben Baruah'],
        relationship: 'Wife',
        location: 'Barapani Lake & Shillong Hills, Meghalaya',
        details: 'Cool mountain drive winding past misty pine trees, stopping for hot roasted corn by the sparkling lake.',
        datePeriod: 'Autumn 1985',
        state: 'Meghalaya',
        regionalContext: 'NER',
        questionPrompt: 'Which misty hill station in Meghalaya did you travel to together?',
        expectedAnswers: ['shillong', 'meghalaya', 'barapani', 'hills'],
        hints: {
          tier1: 'The scenic Scotland of the East in Meghalaya with tall fragrant pine trees.',
          tier2: 'The capital of Meghalaya — Shillong.'
        },
        isSelectedForSession: false,
        status: 'Ready'
      },
      {
        title: 'Hornbill Cultural Gathering in Kohima',
        category: 'Culture',
        imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80',
        people: ['Local Village Artisans', 'Bhaben'],
        relationship: 'Cultural Travel',
        location: 'Kisama Heritage Village, Nagaland',
        details: 'Admiring the vibrant handwoven Naga shawls and listening to the traditional log drum beats.',
        datePeriod: 'December 2012',
        state: 'Nagaland',
        regionalContext: 'NER',
        questionPrompt: 'Which vibrant heritage village in Nagaland did we visit for the festival?',
        expectedAnswers: ['kisama', 'kohima', 'nagaland', 'hornbill'],
        hints: {
          tier1: 'It is the famous festival of festivals held at the foot of Mount Japfu.',
          tier2: 'The heritage village name is Kisama in Nagaland.'
        },
        isSelectedForSession: false,
        status: 'Ready'
      }
    ]);
  }

  console.log('[Seed] Database populated successfully with culturally authentic NER data.');
}

module.exports = seedData;

if (require.main === module) {
  const { connectDB, closeDB } = require('./db');
  connectDB()
    .then(() => seedData())
    .then(() => closeDB())
    .then(() => {
      console.log('[Seed] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error:', err);
      process.exit(1);
    });
}
