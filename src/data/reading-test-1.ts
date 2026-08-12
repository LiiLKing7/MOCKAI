export type PartTaskType = "short-text-mc" | "matching" | "long-text-mc" | "gapped-text" | "cloze-mc" | "inline-gap-fill" | "matching-headings";

export type BaseReadingPart = {
  id: string;
  partNumber: number;
  taskType: PartTaskType;
  title: string;
  instructions: string;
};

export type ShortTextMC = BaseReadingPart & {
  taskType: "short-text-mc";
  items: {
    id: string;
    text: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    evidenceText: string;
  }[];
};

export type Matching = BaseReadingPart & {
  taskType: "matching";
  people: {
    id: string;
    description: string;
  }[];
  texts: {
    id: string;
    letter: string;
    title: string;
    text: string;
  }[];
  questions: {
    id: string;
    personId: string;
    correctAnswer: string;
    explanation: string;
  }[];
};

export type LongTextMC = BaseReadingPart & {
  taskType: "long-text-mc";
  passage: string;
  questions: {
    id: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    evidenceText: string;
  }[];
};

export type GappedText = BaseReadingPart & {
  taskType: "gapped-text";
  passageWithGaps: string;
  sentences: {
    letter: string;
    text: string;
  }[];
  questions: {
    id: string;
    gapNumber: number;
    correctAnswer: string;
    explanation: string;
    evidenceText: string;
  }[];
};

export type ClozeMC = BaseReadingPart & {
  taskType: "cloze-mc";
  passageWithGaps: string;
  questions: {
    id: string;
    gapNumber: number;
    options: string[];
    correctAnswer: string;
    explanation: string;
    evidenceText: string;
  }[];
};

export type InlineGapFill = BaseReadingPart & {
  taskType: "inline-gap-fill";
  textWithGaps: string;
  questions: {
    id: string;
    gapNumber: number;
    correctAnswer: string;
    explanation: string;
  }[];
};

export type MatchingHeadings = BaseReadingPart & {
  taskType: "matching-headings";
  paragraphs: {
    id: string;
    paragraphNumber: number;
    text: string;
  }[];
  headings: {
    letter: string;
    text: string;
  }[];
  questions: {
    id: string;
    paragraphId: string;
    correctAnswer: string;
    explanation: string;
  }[];
};

export type ReadingPart = ShortTextMC | Matching | LongTextMC | GappedText | ClozeMC | InlineGapFill | MatchingHeadings;

export const readingTest1: ReadingPart[] = [
  {
    id: "part-1",
    partNumber: 1,
    taskType: "inline-gap-fill",
    title: "Reading - Part 1",
    instructions: "Exercise 1: The Mystery of Mars\n\nRead the text. Fill in each gap with ONE word.",
    textWithGaps: "Mars is the fourth planet from the Sun and is often called the Red Planet. The [GAP-1] is covered in iron oxide, which gives it a reddish appearance. Scientists have been studying Mars for many years, hoping to find signs of [GAP-2]. Although no living creatures have been discovered yet, there is evidence that [GAP-3] once flowed on the planet. Several rovers have been sent to explore the [GAP-4] and take photographs. In the future, humans might even build a [GAP-5] on Mars. However, surviving there will be difficult because the [GAP-6] is very thin and composed mostly of carbon dioxide.",
    questions: [
      { id: "q1-1", gapNumber: 1, correctAnswer: "surface", explanation: "The surface of Mars is covered in iron oxide." },
      { id: "q1-2", gapNumber: 2, correctAnswer: "life", explanation: "Scientists look for signs of life on other planets." },
      { id: "q1-3", gapNumber: 3, correctAnswer: "water", explanation: "Evidence shows water once flowed." },
      { id: "q1-4", gapNumber: 4, correctAnswer: "terrain", explanation: "Rovers explore the terrain." },
      { id: "q1-5", gapNumber: 5, correctAnswer: "colony", explanation: "Humans might build a colony." },
      { id: "q1-6", gapNumber: 6, correctAnswer: "atmosphere", explanation: "The atmosphere of Mars is thin." }
    ]
  },
  {
    id: "part-2",
    partNumber: 2,
    taskType: "matching",
    title: "Matching",
    instructions: "Read the descriptions of five people and match them to the correct course (A-H).",
    people: [
      { id: "p1", description: "Maria wants to learn how to prepare healthy meals for her family. She is a beginner and is only free on Tuesday evenings." },
      { id: "p2", description: "David is planning a trip to Italy next year. He wants to learn basic Italian conversation skills. He works on weekdays, so he needs a weekend class." },
      { id: "p3", description: "Sarah loves taking photos with her phone and wants to buy a professional camera. She needs a course that teaches the technical basics of photography." },
      { id: "p4", description: "John is an experienced painter who wants to try a new medium. He is looking for a short course on watercolours during the daytime." },
      { id: "p5", description: "Emma wants to improve her fitness and learn self-defense. She prefers a high-energy class that runs on Thursday evenings." }
    ],
    texts: [
      {
        id: "tA",
        letter: "A",
        title: "Italian for Beginners",
        text: "The Language Institute ***\n$100 PER PERSON FOR 6 WEEKS\n• Essential phrases for traveling\n• Held every Saturday morning\n• Perfect for beginners\nFor reservations call:\nTel: 0264125883"
      },
      {
        id: "tB",
        letter: "B",
        title: "Advanced Photography",
        text: "City Arts Centre\n12-WEEK MASTERCLASS\n• Master studio lighting\n• Advanced editing techniques\n• Monday evenings only\nMust have prior experience.\nEmail: apply@cityarts.edu"
      },
      {
        id: "tC",
        letter: "C",
        title: "Healthy Cooking 101",
        text: "Community Kitchen\n$50 PER SESSION\n• Cook nutritious meals from scratch\n• No experience necessary!\n• Every Tuesday, 7 PM - 9 PM\nAll ingredients provided.\nBook online: www.healthycooks.com"
      },
      {
        id: "tD",
        letter: "D",
        title: "Kickboxing Fitness",
        text: "Downtown Gym & Spa\nONLY $15 PER CLASS!\n• Fast-paced martial arts & cardio\n• Build strength and confidence\n• Thursdays at 6:30 PM\nNo Booking - Just turn up\nTel: 0286141738"
      },
      {
        id: "tE",
        letter: "E",
        title: "Digital Camera Basics",
        text: "Focus Photography Studio\n4-WEEK STARTER COURSE\n• Understand aperture & shutter speed\n• Learn basic composition\n• Wednesday evenings\nBring your own camera!\nCall: 0241523116"
      },
      {
        id: "tF",
        letter: "F",
        title: "Introduction to Watercolours",
        text: "The Royal Art Society\nDAYTIME COURSE - $80\n• Explore watercolour painting\n• Expand your artistic skills\n• Mondays at 10 AM (4 weeks)\nMaterials included in price.\nwww.royalartsociety.org"
      },
      {
        id: "tG",
        letter: "G",
        title: "Yoga and Relaxation",
        text: "Serenity Wellness Center\n1 STAR RATED SPA\n• Gentle yoga sessions\n• Unwind after a long week\n• Suitable for all levels\n• Thursday evenings\nTel: 00679558"
      },
      {
        id: "tH",
        letter: "H",
        title: "Italian Literature",
        text: "University Extension\nADVANCED LEVEL ONLY\n• Explore classic Italian texts\n• Read in the original language\n• Saturday afternoons\nMust pass entrance test.\nContact: admissions@uni-ext.ac.uk"
      }
    ],
    questions: [
      { id: "q2-1", personId: "p1", correctAnswer: "C", explanation: "Maria yangi boshlovchi ('beginner') va seshanba oqshomlari bo'sh. C kursida tajriba talab qilinmaydi va seshanba 19:00 dan 21:00 gacha bo'lib o'tadi." },
      { id: "q2-2", personId: "p2", correctAnswer: "A", explanation: "David Italiyaga sayohat rejalashtirmoqda va faqat dam olish kunlari o'qiy oladi. A kursi aynan sayohatchilar uchun va shanba kunlari o'tkaziladi." },
      { id: "q2-3", personId: "p3", correctAnswer: "E", explanation: "Sarah professional kamera sotib olmoqchi va texnik asoslarni o'rganishi kerak. E kursida apertur, shutter speed kabi kameraning asosiy qoidalari o'rgatiladi." },
      { id: "q2-4", personId: "p4", correctAnswer: "F", explanation: "John tajribali rassom va kunduzi akvarel o'rganmoqchi. F kursi aynan kunduzi (Dushanba 10:00) bo'ladi va akvarel bo'yicha ko'nikmalarni rivojlantirishga qaratilgan." },
      { id: "q2-5", personId: "p5", correctAnswer: "D", explanation: "Emma jismoniy holatini yaxshilash va o'zini himoya qilishni ('self-defense') o'rganmoqchi hamda payshanba oqshomi qulay. D kursi payshanba 18:30 da jang san'ati (kickboxing) bilan shug'ullanishni taklif etadi." }
    ]
  },
  {
    id: "part-3",
    partNumber: 3,
    taskType: "matching-headings",
    title: "Reading - Part 3",
    instructions: "Read the paragraphs and choose the correct heading for each paragraph. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once.",
    paragraphs: [
      { id: "p3-1", paragraphNumber: 1, text: "For centuries, coffee has been one of the world's most popular beverages. Legend has it that the energizing effects of the coffee bean were first discovered by an Ethiopian goat herder named Kaldi. He noticed that his goats became unusually energetic after eating berries from a certain tree. Curious, he tried the berries himself and experienced a similar surge of vitality." },
      { id: "p3-2", paragraphNumber: 2, text: "News of this remarkable discovery quickly spread to the Arabian Peninsula. By the 15th century, coffee was being grown in the Yemeni district of Arabia and by the 16th century it was known in Persia, Egypt, Syria, and Turkey. Public coffee houses, known as qahveh khaneh, began to appear, becoming vibrant centers of social activity and information exchange." },
      { id: "p3-3", paragraphNumber: 3, text: "European travelers returning from the Near East brought back stories of this unusual dark black beverage. By the 17th century, coffee had made its way to Europe and was becoming popular across the continent. However, it met with some resistance. Some people reacted to this new beverage with suspicion or fear, calling it the 'bitter invention of Satan.' It wasn't until Pope Clement VIII tasted it and gave it papal approval that its popularity truly surged in Europe." },
      { id: "p3-4", paragraphNumber: 4, text: "The British brought coffee to New Amsterdam (later called New York) in the mid-17th century. Though coffee houses rapidly began to appear, tea continued to be the favored drink in the New World until 1773. When the colonists revolted against a heavy tax on tea imposed by King George III—an event known as the Boston Tea Party—drinking coffee became a patriotic duty, forever changing American drinking habits." },
      { id: "p3-5", paragraphNumber: 5, text: "As demand for the beverage continued to grow, there was fierce competition to cultivate coffee outside of Arabia. The Dutch finally managed to get seedlings in the latter half of the 17th century. Their first attempts to plant them in India failed, but they were successful with their efforts in Batavia, on the island of Java in what is now Indonesia." },
      { id: "p3-6", paragraphNumber: 6, text: "Today, coffee is a global commodity, second only to oil in terms of total volume traded. It provides a livelihood for millions of people in developing countries. The industry has also seen significant changes, with a growing emphasis on sustainable farming practices and fair trade to ensure that farmers receive a fair price for their crops while protecting the environment." }
    ],
    headings: [
      { letter: "A", text: "The birth of coffee houses in the Arab world" },
      { letter: "B", text: "Coffee reaches the Americas and becomes a symbol" },
      { letter: "C", text: "The environmental impact of modern farming" },
      { letter: "D", text: "A legendary discovery in East Africa" },
      { letter: "E", text: "The modern economic importance of coffee" },
      { letter: "F", text: "Controversy and acceptance in Europe" },
      { letter: "G", text: "The Dutch success in global cultivation" },
      { letter: "H", text: "Medical benefits of drinking coffee daily" }
    ],
    questions: [
      { id: "q3-1", paragraphId: "p3-1", correctAnswer: "D", explanation: "Birinchi paragrafda Efiopiyalik echki boquvchining qahva donalarini qanday tasodifan kashf etgani (legendary discovery) haqida so'z boradi." },
      { id: "q3-2", paragraphId: "p3-2", correctAnswer: "A", explanation: "Ikkinchi paragraf Arabistonda qahva yetishtirilishi va birinchi qahvaxonalar ('qahveh khaneh') paydo bo'lishi haqida." },
      { id: "q3-3", paragraphId: "p3-3", correctAnswer: "F", explanation: "Uchinchi paragraf qahvaning Yevropaga kirib kelishi, dastlabki qarshiliklar (controversy) va oxir-oqibat cherkov tomonidan qabul qilinishi (acceptance) haqida." },
      { id: "q3-4", paragraphId: "p3-4", correctAnswer: "B", explanation: "To'rtinchi paragraf qahvaning Amerikaga kelishi va 'Boston Tea Party' voqeasidan so'ng vatanparvarlik ramziga (symbol) aylangani haqida." },
      { id: "q3-5", paragraphId: "p3-5", correctAnswer: "G", explanation: "Beshinchi paragraf Gollandlarning (The Dutch) qahvani Arabistondan tashqarida, aniqrog'i Indoneziyaning Yava orolida muvaffaqiyatli yetishtira boshlagani haqida." },
      { id: "q3-6", paragraphId: "p3-6", correctAnswer: "E", explanation: "Oltinchi paragraf qahvaning bugungi kundagi iqtisodiy ahamiyati, millionlab odamlarni ish bilan ta'minlashi va global savdodagi o'rni haqida." }
    ]
  },
  {
    id: "part-4",
    partNumber: 4,
    taskType: "long-text-mc",
    title: "THE MYSTERIES OF THE DEEP OCEAN",
    instructions: "Read the following text for questions 21-29. For Q21-24 choose A, B, C, or D. For Q25-29 choose True, False, or Not Given.",
    passage: "For centuries, the ocean has fascinated humanity. While we have explored the highest peaks of the Himalayas and even sent humans to the moon, the deepest parts of our own planet's oceans remain largely unknown. In fact, scientists estimate that more than 80% of the ocean is unmapped, unobserved, and unexplored. The deep sea, characterized by extreme pressure, freezing temperatures, and complete darkness, is one of the most hostile environments on Earth.\n\nDespite these harsh conditions, the deep ocean is teeming with life. Creatures of the deep have evolved extraordinary adaptations to survive. Many deep-sea animals produce their own light through a chemical process called bioluminescence. This natural glow is used to attract prey, confuse predators, or find mates in the pitch-black waters. For example, the anglerfish uses a glowing lure dangling in front of its mouth to draw smaller fish directly into its jaws.\n\nExploring these depths requires highly specialized technology. Traditional submarines cannot withstand the immense pressure found thousands of meters below the surface. Instead, scientists use remotely operated vehicles (ROVs) and autonomous underwater vehicles (AUVs) equipped with high-definition cameras and robotic arms. These machines can collect samples and capture footage of species that have never been seen before by human eyes.\n\nOne of the most significant discoveries in the deep ocean was the identification of hydrothermal vents in the 1970s. These underwater hot springs spew mineral-rich water heated by the Earth's magma. To the astonishment of researchers, these vents support entire ecosystems that do not rely on sunlight. Instead of photosynthesis, bacteria use the chemicals from the vents to produce food, a process known as chemosynthesis. This discovery fundamentally changed our understanding of life, suggesting that organisms could potentially survive in similar extreme environments on other planets.\n\nHowever, the deep ocean is facing unprecedented threats. Deep-sea mining, pollution, and climate change are putting these fragile ecosystems at risk before we even fully understand them. Conservationists argue that we must establish strict regulations to protect these environments, as the deep sea plays a crucial role in regulating the Earth's climate and absorbing carbon dioxide.",
    questions: [
      { id: "q4-1", prompt: "What percentage of the ocean remains unexplored according to scientists?", options: ["Less than 20%", "Exactly 50%", "More than 80%", "Almost 100%"], correctAnswer: "More than 80%", explanation: "The text states: 'scientists estimate that more than 80% of the ocean is unmapped, unobserved, and unexplored.'", evidenceText: "more than 80% of the ocean is unmapped, unobserved, and unexplored." },
      { id: "q4-2", prompt: "How do many deep-sea animals use bioluminescence?", options: ["To stay warm in freezing temperatures", "To communicate with submarines", "To attract prey or confuse predators", "To absorb carbon dioxide"], correctAnswer: "To attract prey or confuse predators", explanation: "The passage mentions: 'This natural glow is used to attract prey, confuse predators, or find mates in the pitch-black waters.'", evidenceText: "This natural glow is used to attract prey, confuse predators, or find mates" },
      { id: "q4-3", prompt: "Why can't traditional submarines be used for deep-sea exploration?", options: ["They are too expensive to build.", "They cannot withstand the extreme pressure.", "They do not have enough battery life.", "They disturb the delicate ecosystems."], correctAnswer: "They cannot withstand the extreme pressure.", explanation: "According to the text, 'Traditional submarines cannot withstand the immense pressure found thousands of meters below the surface.'", evidenceText: "Traditional submarines cannot withstand the immense pressure found thousands of meters below the surface." },
      { id: "q4-4", prompt: "What makes the ecosystems around hydrothermal vents unique?", options: ["They do not rely on sunlight for energy.", "They are the only places where fish can survive.", "They exist closer to the surface than other ecosystems.", "They were discovered before the 1970s."], correctAnswer: "They do not rely on sunlight for energy.", explanation: "The text states: 'these vents support entire ecosystems that do not rely on sunlight.'", evidenceText: "these vents support entire ecosystems that do not rely on sunlight." },
      { id: "q4-5", prompt: "We know more about the deep ocean than we do about the surface of the moon.", options: ["True", "False", "Not Given"], correctAnswer: "False", explanation: "The text contrasts our exploration of the moon with the oceans, implying we know more about the moon since the deepest parts of our oceans 'remain largely unknown'.", evidenceText: "While we have explored the highest peaks of the Himalayas and even sent humans to the moon, the deepest parts of our own planet's oceans remain largely unknown." },
      { id: "q4-6", prompt: "The anglerfish uses a glowing lure to find mates in the dark.", options: ["True", "False", "Not Given"], correctAnswer: "False", explanation: "The text says the anglerfish uses it to 'draw smaller fish directly into its jaws' (prey), not to find mates.", evidenceText: "the anglerfish uses a glowing lure dangling in front of its mouth to draw smaller fish directly into its jaws." },
      { id: "q4-7", prompt: "Scientists believe chemosynthesis could exist on other planets.", options: ["True", "False", "Not Given"], correctAnswer: "True", explanation: "The text notes: 'suggesting that organisms could potentially survive in similar extreme environments on other planets.'", evidenceText: "suggesting that organisms could potentially survive in similar extreme environments on other planets." },
      { id: "q4-8", prompt: "Some deep-sea creatures use sound to navigate in complete darkness.", options: ["True", "False", "Not Given"], correctAnswer: "Not Given", explanation: "The passage discusses bioluminescence but makes no mention of using sound to navigate.", evidenceText: "" },
      { id: "q4-9", prompt: "The deep ocean helps regulate the Earth's climate.", options: ["True", "False", "Not Given"], correctAnswer: "True", explanation: "The final paragraph explicitly states: 'the deep sea plays a crucial role in regulating the Earth's climate...'", evidenceText: "the deep sea plays a crucial role in regulating the Earth's climate" }
    ]
  },
  {
    id: "part-5",
    partNumber: 5,
    taskType: "long-text-mc",
    title: "WHITE STORKS BACK IN BRITAIN AFTER HUNDREDS OF YEARS",
    instructions: "Read the passage. For Q30-33 write ONE WORD or A NUMBER. For Q34-35 choose A, B, C or D.",
    passage: "White storks back in Britain after hundreds of years\n\nThese beautiful birds could be about to become a feature of the British landscape again. The last definitive record of a pair of white storks (a very tall bird) successfully breeding in Britain was in 1416, from a nest on St Giles Cathedral in Edinburgh. No one knows why storks disappeared from our shores. They often featured on the menus of medieval banquets so we might, quite simply, have consumed them all. But there could be a more ominous reason. Storks are migrants arriving after the end of Winter, nesting on rooftops and happily associating with humans, and because of this, they have long been a symbol of hope and new life. Yet their association with rebirth also meant they became a symbol of rebellion. Shortly after the restoration of King Charles II in 1660, while storks were rare but surviving, parliament debated putting greater effort into destroying them entirely for fear they might inspire republicanism. Today, fortunately, that notion has disappeared and the stork retains its association with new life, appearing on cards given to celebrate the arrival of a new child, as a bird carrying a baby in a sling held in its beak.\n\nSo, after such a long absence, there was great excitement when in April of this year a pair of white storks built an untidy nest of sticks in the top branches of a huge oak in the middle of our rewilding project at Knepp Estate in West Sussex. Drone footage, taken before the pair started sitting on them, showed three large eggs. The fact that they were infertile and did not hatch was not too disappointing. The pair are only four years old, and storks can live to over thirty, with their first attempts to breed often failing.\n\nProspects for next year are encouraging. These young storks are part of a project to return the species to Britain, inspired by reintroductions in European countries that more than three hundred have reached their target. Imported from Poland, they have spent the best part of three years in a six-acre pen with a group of other juveniles and several injured, non-flying adults, also from Poland. Other birds have already shown strong loyalty to the site. Two years ago, a young bird from Knepp flew across the Channel to France and, this summer, returned to its companions.\n\nIn the face of reports of unrelenting ecological loss (the UN estimates a million species are on the brink of extinction globally), the white stork's return is refreshing news. As tens of thousands of people demonstrate about the growing climate crisis and ecoanxiety besets us, these glimpses of restoration are important. Featuring the storks in BBC television's Springwatch in June, the ecologist Chris Packham described the project as \"imaginative, intelligent, progressive and practical\".\n\nAnd yet its path to restoration in the UK has not been smooth. Support from conservation bodies has been surprisingly difficult to obtain; some were hard-pressed with their own initiatives, while others were simply reluctant to stick their necks out. In addition, the committee of the Sussex Wildlife Trust raised doubts about the stork ever having been a British bird. They also had concerns that English-bred birds would migrate across the Channel, and feared that their messy nests and closeness to humans would cause a hazard - rubbish falling down people's chimneys.",
    questions: [
      {
        id: "q5-30",
        prompt: "putting (30) _______ together high up in a large oak tree.",
        correctAnswer: "sticks",
        explanation: "The text mentions 'built an untidy nest of sticks in the top branches of a huge oak'.",
        evidenceText: "built an untidy nest of sticks in the top branches of a huge oak"
      },
      {
        id: "q5-31",
        prompt: "eggs unfortunately proved to be (31) _______.",
        correctAnswer: "infertile",
        explanation: "The text says 'The fact that they were infertile and did not hatch...'",
        evidenceText: "The fact that they were infertile and did not hatch"
      },
      {
        id: "q5-32",
        prompt: "These two storks were bred in (32) _______.",
        correctAnswer: "Poland",
        explanation: "The text states 'Imported from Poland...'",
        evidenceText: "Imported from Poland"
      },
      {
        id: "q5-33",
        prompt: "sense of (33) _______ to their new home.",
        correctAnswer: "loyalty",
        explanation: "The text states 'Other birds have already shown strong loyalty to the site.'",
        evidenceText: "Other birds have already shown strong loyalty to the site."
      },
      {
        id: "q5-34",
        prompt: "Q34. According to the passage, why did some conservation bodies hesitate to support the project?",
        options: [
          "They believed storks were never British birds.",
          "They were concerned about rubbish falling down chimneys.",
          "They were already busy with other initiatives.",
          "They thought the birds would migrate to France."
        ],
        correctAnswer: "They were already busy with other initiatives.",
        explanation: "The passage notes that 'some were hard-pressed with their own initiatives, while others were simply reluctant to stick their necks out.'",
        evidenceText: "some were hard-pressed with their own initiatives"
      },
      {
        id: "q5-35",
        prompt: "Q35. What is Chris Packham's attitude towards the project?",
        options: [
          "He thinks it is overly ambitious.",
          "He believes it is a positive and practical step.",
          "He is concerned about its ecological impact.",
          "He doubts it will reach its target."
        ],
        correctAnswer: "He believes it is a positive and practical step.",
        explanation: "The text mentions that Chris Packham described the project as 'imaginative, intelligent, progressive and practical'.",
        evidenceText: "the ecologist Chris Packham described the project as \"imaginative, intelligent, progressive and practical\""
      }
    ]
  }
];
