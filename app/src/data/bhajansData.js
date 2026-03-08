
export const bhajansList = [
  {
    id: 1,
    name: "Hare Krishna Mahamantra",
    sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे\nहरे राम हरे राम राम राम हरे हरे",
    transliteration: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare\nHare Rama Hare Rama Rama Rama Hare Hare",
    description: "The most powerful mantra for spiritual purification and divine connection",
    url: "https://soundcloud.com/thebhaktas/hare-krishna",
    type: "mantra",
    duration: "10:00",
    artist: "Various Artists"
  },
  {
    id: 2,
    name: "Ekadashi Vrata Katha",
    sanskrit: "",
    transliteration: "",
    description: "Sacred stories and kirtans dedicated to Ekadashi observance",
    url: "https://soundcloud.com/aindra-das-497468581/10-01-10-ekadasi-kirtan_1",
    type: "kirtan",
    duration: "15:30",
    artist: "Aindra Das"
  },
  {
    id: 3,
    name: "Om Namo Bhagavate Vasudevaya",
    sanskrit: "ॐ नमो भगवते वासुदेवाय",
    transliteration: "Om Namo Bhagavate Vasudevaya",
    description: "A powerful mantra for surrendering to Lord Krishna",
    url: "https://soundcloud.com/krishna-bhakti-network/om-namo-bhagavate-vasudevaya-atmarama-dasa",
    type: "mantra",
    duration: "12:45",
    artist: "Atmarama Das"
  }
];

export const mantrasList = [
  {
    id: 1,
    name: "Hare Krishna Mahamantra",
    sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे\nहरे राम हरे राम राम राम हरे हरे",
    transliteration: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare\nHare Rama Hare Rama Rama Rama Hare Hare",
    meaning: "O Lord, O Energy of the Lord, please engage me in Your service",
    benefits: "Purifies consciousness, removes material desires, brings spiritual happiness"
  },
  {
    id: 2,
    name: "Om Namo Bhagavate Vasudevaya",
    sanskrit: "ॐ नमो भगवते वासुदेवाय",
    transliteration: "Om Namo Bhagavate Vasudevaya",
    meaning: "I offer my respectful obeisances unto Lord Krishna, the son of Vasudeva",
    benefits: "Surrenders to the Supreme Lord, removes obstacles, grants protection"
  },
  {
    id: 3,
    name: "Om Namah Shivaya",
    sanskrit: "ॐ नमः शिवाय",
    transliteration: "Om Namah Shivaya",
    meaning: "I bow to Shiva",
    benefits: "Peace, inner strength, and removal of fear"
  },
  {
    id: 4,
    name: "Gayatri Mantra",
    sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
    transliteration: "Om Bhur Bhuva Swaha Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyoyonah Prachodayat",
    meaning: "We meditate on the glory of the Creator; Who has created the Universe; Who is worthy of Worship; Who is the embodiment of Knowledge and Light; Who is the remover of all Sin and Ignorance; May He enlighten our Intellect.",
    benefits: "Wisdom, intellect, and spiritual awakening"
  },
  {
    id: 5,
    name: "Om Namo Narayanaya",
    sanskrit: "ॐ नमो नारायणाय",
    transliteration: "Om Namo Narayanaya",
    meaning: "I offer my respectful obeisances to Lord Narayana",
    benefits: "Attains peace, spiritual advancement, divine protection"
  },
  {
    id: 6,
    name: "Sri Rama Jaya Rama",
    sanskrit: "श्री राम जय राम जय जय राम",
    transliteration: "Sri Rama Jaya Rama Jaya Jaya Rama",
    meaning: "Victory to Lord Rama",
    benefits: "Protection, courage, and victory over obstacles"
  },
  {
    id: 7,
    name: "Ganesha Mantra",
    sanskrit: "ॐ गं गणपतये नमः",
    transliteration: "Om Gan Ganapataye Namah",
    meaning: "I bow to Lord Ganesha",
    benefits: "Removes obstacles and brings success"
  }
];

export function getBhajanById(id) {
  return bhajansList.find(bhajan => bhajan.id === id);
}

export function getBhajansByType(type) {
  return bhajansList.filter(bhajan => bhajan.type === type);
}

export function getAllBhajans() {
  return bhajansList;
}
