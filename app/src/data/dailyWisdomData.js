
export const dailyWisdoms = [
  {
    sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे",
    transliteration: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare",
    english: "Chanting the holy names purifies the heart and connects us with the divine consciousness",
    verse: "Bhagavad Gita 7.7",
    type: "mantra",
    mood: "devotional"
  },
  {
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज",
    transliteration: "Sarva-dharman parityajya mam ekam saranam vraja",
    english: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions.",
    verse: "Bhagavad Gita 18.66",
    type: "shloka",
    mood: "surrender"
  },
  {
    sanskrit: "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु",
    transliteration: "Man-mana bhava mad-bhakto mad-yaji mam namaskuru",
    english: "Engage your mind always in thinking of Me, become My devotee, offer obeisances to Me and worship Me.",
    verse: "Bhagavad Gita 9.34",
    type: "shloka",
    mood: "devotional"
  }
];

export const morningWisdoms = [
  "Begin your day with the holy names on your lips and Krishna in your heart",
  "Every sunrise is Krishna's reminder that He brings new mercies each day",
  "The soul that chants early in the morning attracts divine blessings throughout the day"
];

export const eveningWisdoms = [
  "As the day ends, offer gratitude to Krishna for His constant protection",
  "Evening is the perfect time to reflect on Krishna's presence in every moment",
  "Let the sunset remind you of Krishna's beautiful form and divine pastimes"
];

export function getTimeBasedWisdom(timeOfDay) {
  if (timeOfDay === 'morning') {
    return morningWisdoms[Math.floor(Math.random() * morningWisdoms.length)];
  }
  return eveningWisdoms[Math.floor(Math.random() * eveningWisdoms.length)];
}

export function getTodaysWisdom() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return dailyWisdoms[dayOfYear % dailyWisdoms.length];
}

export function getRandomWisdom() {
  return dailyWisdoms[Math.floor(Math.random() * dailyWisdoms.length)];
}
