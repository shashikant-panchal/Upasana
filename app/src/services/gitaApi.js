import axios from "axios";

const RAPID_API_BASE = "https://bhagavad-gita3.p.rapidapi.com/v2";
const RAPID_API_KEY = "62c6cc5821msh5c8d7ba7afd2f5dp1e371fjsn7e80df03e667";
const RAPID_API_HOST = "bhagavad-gita3.p.rapidapi.com";
const RAPID_HEADERS = {
  "x-rapidapi-key": RAPID_API_KEY,
  "x-rapidapi-host": RAPID_API_HOST,
  "Accept": "application/json",
};

const GITHUB_API_BASE = "https://vedicscriptures.github.io/slok";

const verseCache = new Map();
const chapterCache = new Map();
let allChaptersCache = null; 

const chapterVerseCounts = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29,
  6: 47, 7: 30, 8: 28, 9: 34, 10: 42,
  11: 55, 12: 20, 13: 35, 14: 27, 15: 20,
  16: 24, 17: 28, 18: 78,
};

export const CHAPTER_DATA = [
  { chapter: 1, title: "Arjuna Vishada Yoga", totalVerses: 47, sanskritTitle: "अर्जुनविषादयोग" },
  { chapter: 2, title: "Sankhya Yoga", totalVerses: 72, sanskritTitle: "सांख्ययोग" },
  { chapter: 3, title: "Karma Yoga", totalVerses: 43, sanskritTitle: "कर्मयोग" },
  { chapter: 4, title: "Jnana Karma Sanyasa Yoga", totalVerses: 42, sanskritTitle: "ज्ञानकर्मसंन्यासयोग" },
  { chapter: 5, title: "Karma Sanyasa Yoga", totalVerses: 29, sanskritTitle: "कर्मसंन्यासयोग" },
  { chapter: 6, title: "Dhyana Yoga", totalVerses: 47, sanskritTitle: "ध्यानयोग" },
  { chapter: 7, title: "Jnana Vijnana Yoga", totalVerses: 30, sanskritTitle: "ज्ञानविज्ञानयोग" },
  { chapter: 8, title: "Aksara Brahma Yoga", totalVerses: 28, sanskritTitle: "अक्षरब्रह्मयोग" },
  { chapter: 9, title: "Raja Vidya Raja Guhya Yoga", totalVerses: 34, sanskritTitle: "राजविद्याराजगुह्ययोग" },
  { chapter: 10, title: "Vibhuti Yoga", totalVerses: 42, sanskritTitle: "विभूतियोग" },
  { chapter: 11, title: "Vishvarupa Darshana Yoga", totalVerses: 55, sanskritTitle: "विश्वरूपदर्शनयोग" },
  { chapter: 12, title: "Bhakti Yoga", totalVerses: 20, sanskritTitle: "भक्तियोग" },
  { chapter: 13, title: "Kshetra Kshetrajna Vibhaga Yoga", totalVerses: 35, sanskritTitle: "क्षेत्रक्षेत्रज्ञविभागयोग" },
  { chapter: 14, title: "Gunatraya Vibhaga Yoga", totalVerses: 27, sanskritTitle: "गुणत्रयविभागयोग" },
  { chapter: 15, title: "Purushottama Yoga", totalVerses: 20, sanskritTitle: "पुरुषोत्तमयोग" },
  { chapter: 16, title: "Daivasura Sampad Vibhaga Yoga", totalVerses: 24, sanskritTitle: "दैवासुरसम्पद्विभागयोग" },
  { chapter: 17, title: "Shraddhatraya Vibhaga Yoga", totalVerses: 28, sanskritTitle: "श्रद्धात्रयविभागयोग" },
  { chapter: 18, title: "Moksha Sanyasa Yoga", totalVerses: 78, sanskritTitle: "मोक्षसंन्यासयोग" },
];

const famousVerses = {
  2: {
    47: {
      sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||२-४७||",
      transliteration: "karmaṇy evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi ||2-47||",
      translation: "You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
      significance: "This is perhaps the most famous verse of the Bhagavad Gita. It teaches the essence of Karma Yoga - performing one's duty without attachment to results.",
    },
  },
  4: {
    7: {
      sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत |\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ||४-७||",
      transliteration: "yadā yadā hi dharmasya glānir bhavati bhārata |\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham ||4-7||",
      translation: "Whenever there is a decline in righteousness (dharma) and an increase in unrighteousness (adharma), O Arjuna, at that time I manifest Myself on earth.",
      significance: "Lord Krishna explains the divine purpose of His incarnations - to restore dharma whenever it declines and protect the righteous.",
    },
  },
  18: {
    66: {
      sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज |\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ||१८-६६||",
      transliteration: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja |\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ ||18-66||",
      translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
      significance: "This is the final and most confidential instruction of the Bhagavad Gita - complete surrender to the Supreme Lord.",
    },
  },
};

const isHTMLResponse = (data) => {
  if (typeof data === "string") {
    const s = data.trim().toLowerCase();
    return s.startsWith("<!doctype") || s.startsWith("<html");
  }
  return false;
};

const transformRapidVerse = (data, chapterNumber) => {
  const englishTranslations = (data.translations || []).filter(
    (t) => t.language === "english"
  );
  
  const preferred =
    englishTranslations.find((t) =>
      ["Shri Purohit Swami", "Swami Gambirananda"].includes(t.author_name)
    ) || englishTranslations[0];

  const commentary = (data.commentaries || []).find(
    (c) => c.language === "english"
  );

  return {
    verse: data.verse_number,
    verse_number: data.verse_number,
    chapter: chapterNumber || data.chapter_number,
    sanskrit: data.text || "",
    text: data.text || "",
    transliteration: data.transliteration || "",
    word_meanings: data.word_meanings || "",
    translation: preferred?.description || englishTranslations[0]?.description || "Translation not available",
    meaning: preferred?.description || "Translation not available",
    significance: commentary?.description || data.word_meanings || "Commentary not available",
    commentary: commentary?.description || data.word_meanings || "Commentary not available",
    purport: commentary?.description || data.word_meanings || "Commentary not available",
  };
};

const transformGithubVerse = (data, chapterNumber, verseNumber) => {
  const englishTranslation =
    data.purohit?.et || data.adi?.et || data.siva?.et || data.san?.et ||
    data.gambir?.et || data.prabhu?.et || data.spitr?.et || data.raman?.et ||
    "Translation not available";

  const significance =
    data.rams?.hc || data.chinmay?.hc || data.chinmpitr?.hc ||
    data.rams?.ht || data.tej?.ht || "Commentary available in original texts";

  return {
    verse: verseNumber,
    verse_number: verseNumber,
    chapter: chapterNumber,
    sanskrit: data.slok || "",
    text: data.slok || "",
    transliteration: data.transliteration || "",
    word_meanings: "",
    translation: englishTranslation,
    meaning: englishTranslation,
    significance,
    commentary: significance,
    purport: significance,
  };
};

export const fetchAllChapters = async () => {
  if (allChaptersCache) return allChaptersCache;

  try {
    const response = await axios.get(
      `${RAPID_API_BASE}/chapters/?skip=0&limit=18`,
      { headers: RAPID_HEADERS, timeout: 10000 }
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid chapters response");
    }

    const chapters = response.data.map((c) => {
      const staticData = CHAPTER_DATA.find((s) => s.chapter === c.chapter_number) || {};
      return {
        chapter: c.chapter_number,
        id: c.chapter_number,
        title: c.name_translated || staticData.title,
        name_transliterated: c.name_transliterated,
        totalVerses: c.verses_count || staticData.totalVerses,
        verseCount: c.verses_count || staticData.totalVerses,
        sanskritTitle: c.name || staticData.sanskritTitle,
        nameMeaning: c.name_meaning,
        summary: c.chapter_summary,
        summaryHindi: c.chapter_summary_hindi,
        slug: c.slug,
      };
    });

    allChaptersCache = chapters;
    return chapters;
  } catch (error) {
    console.error("fetchAllChapters error:", error.message);
    
    return CHAPTER_DATA.map((c) => ({
      ...c,
      id: c.chapter,
      verseCount: c.totalVerses,
      nameMeaning: "",
      summary: "",
    }));
  }
};

export const fetchSingleVerse = async (chapterNumber, verseNumber) => {
  const cacheKey = `${chapterNumber}-${verseNumber}`;
  if (verseCache.has(cacheKey)) return verseCache.get(cacheKey);

  try {
    const url = `${RAPID_API_BASE}/chapters/${chapterNumber}/verses/${verseNumber}/`;
    console.log(`[Primary] Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: RAPID_HEADERS,
      timeout: 8000,
    });

    if (response.data && typeof response.data === "object" && !isHTMLResponse(response.data)) {
      const verse = transformRapidVerse(response.data, chapterNumber);
      verseCache.set(cacheKey, verse);
      return verse;
    }
  } catch (err) {
    console.warn(`[Primary] Failed for ${chapterNumber}.${verseNumber}:`, err.message);
  }

  try {
    const url = `${GITHUB_API_BASE}/${chapterNumber}/${verseNumber}`;
    console.log(`[Backup] Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: { Accept: "application/json" },
      timeout: 10000,
    });

    if (response.data && !isHTMLResponse(response.data)) {
      const verse = transformGithubVerse(response.data, chapterNumber, verseNumber);
      verseCache.set(cacheKey, verse);
      return verse;
    }
  } catch (err) {
    console.warn(`[Backup] Failed for ${chapterNumber}.${verseNumber}:`, err.message);
  }

  if (famousVerses[chapterNumber]?.[verseNumber]) {
    return {
      verse: verseNumber,
      verse_number: verseNumber,
      chapter: chapterNumber,
      ...famousVerses[chapterNumber][verseNumber],
    };
  }

  return null;
};

export const fetchChapterVerses = async (chapterNumber) => {
  const cacheKey = `chapter-${chapterNumber}`;
  if (chapterCache.has(cacheKey)) return chapterCache.get(cacheKey);

  const totalVerses = chapterVerseCounts[chapterNumber] || 20;

  try {
    const url = `${RAPID_API_BASE}/chapters/${chapterNumber}/verses/?skip=0&limit=${totalVerses}`;
    console.log(`[Primary] Fetching all verses for Chapter ${chapterNumber}: ${url}`);
    const response = await axios.get(url, {
      headers: RAPID_HEADERS,
      timeout: 15000,
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const verses = response.data.map((v) => transformRapidVerse(v, chapterNumber));
      const sorted = verses.sort((a, b) => a.verse - b.verse);
      chapterCache.set(cacheKey, sorted);
      console.log(`[Primary] Loaded ${sorted.length} verses for Chapter ${chapterNumber}`);
      return sorted;
    }
  } catch (err) {
    console.warn(`[Primary] Bulk fetch failed for Chapter ${chapterNumber}:`, err.message);
  }

  console.log(`Falling back to individual fetch for Chapter ${chapterNumber}...`);
  const BATCH_SIZE = 8;
  const allVerses = [];

  for (let start = 1; start <= totalVerses; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, totalVerses);
    const batch = await Promise.all(
      Array.from({ length: end - start + 1 }, (_, i) =>
        fetchSingleVerse(chapterNumber, start + i)
      )
    );
    allVerses.push(...batch.filter((v) => v !== null));
  }

  if (allVerses.length > 0) {
    const sorted = allVerses.sort((a, b) => a.verse - b.verse);
    chapterCache.set(cacheKey, sorted);
    return sorted;
  }

  return generatePlaceholderVerses(chapterNumber, totalVerses);
};

const generatePlaceholderVerses = (chapterNumber, verseCount) => {
  return Array.from({ length: verseCount }, (_, i) => {
    const verseNumber = i + 1;
    if (famousVerses[chapterNumber]?.[verseNumber]) {
      return { verse: verseNumber, chapter: chapterNumber, ...famousVerses[chapterNumber][verseNumber] };
    }
    return {
      verse: verseNumber,
      verse_number: verseNumber,
      chapter: chapterNumber,
      sanskrit: `॥ अध्याय ${chapterNumber} श्लोक ${verseNumber} ॥`,
      text: `॥ अध्याय ${chapterNumber} श्लोक ${verseNumber} ॥`,
      transliteration: `|| adhyāya ${chapterNumber} śloka ${verseNumber} ||`,
      translation: `This is verse ${verseNumber} of Chapter ${chapterNumber} of the Bhagavad Gita. The sacred teachings of Lord Krishna to Arjuna contain profound wisdom.`,
      meaning: `Verse ${verseNumber}, Chapter ${chapterNumber}`,
      significance: `Verse ${verseNumber} of Chapter ${chapterNumber} is part of the eternal dialogue between Lord Krishna and Arjuna on the battlefield of Kurukshetra.`,
      commentary: "",
      purport: "",
      word_meanings: "",
    };
  });
};

export const getChapterInfo = (chapterNumber) =>
  CHAPTER_DATA.find((c) => c.chapter === chapterNumber);

export const getAllChapters = () =>
  CHAPTER_DATA.map((c) => ({ chapter: c.chapter, title: c.title, totalVerses: c.totalVerses }));

export default {
  fetchAllChapters,
  fetchChapterVerses,
  fetchSingleVerse,
  getChapterInfo,
  getAllChapters,
};
