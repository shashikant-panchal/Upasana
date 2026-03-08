
const TITHI_SCORES = {
    
    'Shukla Pratipada': 70,
    'Shukla Dwitiya': 85,
    'Shukla Tritiya': 90,
    'Shukla Chaturthi': 40, 
    'Shukla Panchami': 90,
    'Shukla Shashthi': 75,
    'Shukla Saptami': 85,
    'Shukla Ashtami': 50, 
    'Shukla Navami': 40, 
    'Shukla Dashami': 85,
    'Shukla Ekadashi': 95, 
    'Shukla Dwadashi': 80,
    'Shukla Trayodashi': 85,
    'Shukla Chaturdashi': 45, 
    'Purnima': 90, 

    'Krishna Pratipada': 65,
    'Krishna Dwitiya': 75,
    'Krishna Tritiya': 80,
    'Krishna Chaturthi': 35, 
    'Krishna Panchami': 80,
    'Krishna Shashthi': 70,
    'Krishna Saptami': 75,
    'Krishna Ashtami': 45, 
    'Krishna Navami': 35, 
    'Krishna Dashami': 75,
    'Krishna Ekadashi': 90, 
    'Krishna Dwadashi': 70,
    'Krishna Trayodashi': 75,
    'Krishna Chaturdashi': 40, 
    'Amavasya': 30, 
};

const NAKSHATRA_SCORES = {
    'Ashwini': { score: 90, quality: 'Swift, healing, new beginnings' },
    'Bharani': { score: 50, quality: 'Transformation, restraint needed' },
    'Krittika': { score: 70, quality: 'Purification, courage' },
    'Rohini': { score: 95, quality: 'Growth, prosperity, creation' },
    'Mrigashira': { score: 85, quality: 'Searching, gentle activities' },
    'Ardra': { score: 45, quality: 'Destruction, avoid important work' },
    'Punarvasu': { score: 90, quality: 'Renewal, restoration' },
    'Pushya': { score: 98, quality: 'Most auspicious, nourishment' },
    'Ashlesha': { score: 40, quality: 'Caution, serpent energy' },
    'Magha': { score: 75, quality: 'Authority, ancestral blessings' },
    'Purva Phalguni': { score: 85, quality: 'Creativity, romance' },
    'Uttara Phalguni': { score: 90, quality: 'Stability, partnerships' },
    'Hasta': { score: 92, quality: 'Skill, craftsmanship, deals' },
    'Chitra': { score: 80, quality: 'Beauty, architecture' },
    'Swati': { score: 88, quality: 'Independence, business' },
    'Vishakha': { score: 75, quality: 'Achievement, determination' },
    'Anuradha': { score: 90, quality: 'Friendship, success' },
    'Jyeshtha': { score: 55, quality: 'Seniority, caution advised' },
    'Mula': { score: 35, quality: 'Destruction, avoid beginnings' },
    'Purva Ashadha': { score: 80, quality: 'Invincibility, enthusiasm' },
    'Uttara Ashadha': { score: 88, quality: 'Final victory, permanence' },
    'Shravana': { score: 92, quality: 'Learning, hearing good news' },
    'Dhanishta': { score: 85, quality: 'Wealth, music, prosperity' },
    'Shatabhisha': { score: 65, quality: 'Healing, secretive matters' },
    'Purva Bhadrapada': { score: 60, quality: 'Spiritual fire, intensity' },
    'Uttara Bhadrapada': { score: 85, quality: 'Deep wisdom, stability' },
    'Revati': { score: 90, quality: 'Nourishment, journeys, completion' },
};

const YOGA_SCORES = {
    'Vishkumbha': { score: 40, quality: 'Obstacles, avoid important work' },
    'Preeti': { score: 90, quality: 'Love, affection, happiness' },
    'Ayushman': { score: 95, quality: 'Longevity, health, vitality' },
    'Saubhagya': { score: 95, quality: 'Good fortune, prosperity' },
    'Shobhana': { score: 90, quality: 'Beauty, splendor' },
    'Atiganda': { score: 35, quality: 'Danger, obstacles' },
    'Sukarma': { score: 88, quality: 'Good deeds, virtuous acts' },
    'Dhriti': { score: 85, quality: 'Steadfastness, patience' },
    'Shoola': { score: 40, quality: 'Pain, suffering, avoid' },
    'Ganda': { score: 35, quality: 'Obstacles, difficulties' },
    'Vriddhi': { score: 92, quality: 'Growth, increase, expansion' },
    'Dhruva': { score: 88, quality: 'Stability, permanence' },
    'Vyaghata': { score: 45, quality: 'Destruction, conflicts' },
    'Harshana': { score: 90, quality: 'Joy, happiness, celebration' },
    'Vajra': { score: 50, quality: 'Hardness, strength needed' },
    'Siddhi': { score: 95, quality: 'Accomplishment, success' },
    'Vyatipata': { score: 30, quality: 'Calamity, strictly avoid' },
    'Variyan': { score: 80, quality: 'Excellence, superiority' },
    'Parigha': { score: 45, quality: 'Obstacles, barriers' },
    'Shiva': { score: 92, quality: 'Auspiciousness, blessings' },
    'Siddha': { score: 95, quality: 'Accomplishment, achievement' },
    'Sadhya': { score: 88, quality: 'Achievable goals' },
    'Shubha': { score: 92, quality: 'Auspicious, good' },
    'Shukla': { score: 88, quality: 'Brightness, purity' },
    'Brahma': { score: 85, quality: 'Creation, knowledge' },
    'Indra': { score: 90, quality: 'Power, leadership' },
    'Vaidhriti': { score: 30, quality: 'Separation, strictly avoid' },
};

const KARANA_SCORES = {
    'Bava': { score: 85, quality: 'Movable, good for actions' },
    'Balava': { score: 80, quality: 'Strength, physical work' },
    'Kaulava': { score: 85, quality: 'Good for relationships' },
    'Taitila': { score: 80, quality: 'Good for celebrations' },
    'Gara': { score: 75, quality: 'Agriculture, earth work' },
    'Vanija': { score: 88, quality: 'Excellent for business' },
    'Vishti': { score: 30, quality: 'Bhadra - avoid all activities' }, 
    'Shakuni': { score: 50, quality: 'Fixed, disputes possible' },
    'Chatushpada': { score: 55, quality: 'Fixed, animal care' },
    'Naga': { score: 45, quality: 'Fixed, delays possible' },
    'Kimstughna': { score: 70, quality: 'Fixed, good for routines' },
};

const VARA_SCORES = {
    0: { name: 'Sunday', score: 80, quality: 'Authority, government, father' },
    1: { name: 'Monday', score: 85, quality: 'Mind, emotions, travel, mother' },
    2: { name: 'Tuesday', score: 60, quality: 'Courage, avoid starting new' },
    3: { name: 'Wednesday', score: 90, quality: 'Communication, learning, business' },
    4: { name: 'Thursday', score: 95, quality: 'Most auspicious, wisdom, growth' },
    5: { name: 'Friday', score: 90, quality: 'Love, luxury, arts, pleasure' },
    6: { name: 'Saturday', score: 50, quality: 'Discipline, avoid major starts' },
};

export const calculateMuhurta = (tithi, nakshatra, yoga, karana, date) => {
    const factors = [];

    const dayOfWeek = date.getDay();
    const vara = VARA_SCORES[dayOfWeek];

    const tithiScore = TITHI_SCORES[tithi] ?? 60;
    factors.push({
        name: 'Tithi',
        value: tithi,
        impact: tithiScore >= 75 ? 'positive' : tithiScore >= 50 ? 'neutral' : 'negative',
        description: getTithiDescription(tithi, tithiScore),
    });

    const nakshatraInfo = NAKSHATRA_SCORES[nakshatra] ?? { score: 60, quality: 'General' };
    factors.push({
        name: 'Nakshatra',
        value: nakshatra,
        impact: nakshatraInfo.score >= 75 ? 'positive' : nakshatraInfo.score >= 50 ? 'neutral' : 'negative',
        description: nakshatraInfo.quality,
    });

    const yogaInfo = YOGA_SCORES[yoga] ?? { score: 60, quality: 'General' };
    factors.push({
        name: 'Yoga',
        value: yoga,
        impact: yogaInfo.score >= 75 ? 'positive' : yogaInfo.score >= 50 ? 'neutral' : 'negative',
        description: yogaInfo.quality,
    });

    const karanaInfo = KARANA_SCORES[karana] ?? { score: 60, quality: 'General' };
    factors.push({
        name: 'Karana',
        value: karana,
        impact: karanaInfo.score >= 75 ? 'positive' : karanaInfo.score >= 50 ? 'neutral' : 'negative',
        description: karanaInfo.quality,
    });

    factors.push({
        name: 'Day',
        value: vara.name,
        impact: vara.score >= 75 ? 'positive' : vara.score >= 50 ? 'neutral' : 'negative',
        description: vara.quality,
    });

    const weightedScore =
        tithiScore * 0.25 +
        nakshatraInfo.score * 0.25 +
        yogaInfo.score * 0.20 +
        karanaInfo.score * 0.15 +
        vara.score * 0.15;

    let finalScore = weightedScore;
    if (karana === 'Vishti') {
        finalScore = Math.min(finalScore, 40); 
    }
    if (yoga === 'Vyatipata' || yoga === 'Vaidhriti') {
        finalScore = Math.min(finalScore, 35); 
    }

    return getAuspiciousnessResult(finalScore, factors);
};

const getTithiDescription = (tithi, score) => {
    if (tithi === 'Purnima') return 'Full Moon - Highly auspicious for ceremonies';
    if (tithi === 'Amavasya') return 'New Moon - Best for introspection, avoid new starts';
    if (tithi.includes('Ekadashi')) return 'Sacred fasting day, excellent for spiritual activities';
    if (tithi.includes('Chaturthi') || tithi.includes('Navami') || tithi.includes('Chaturdashi')) {
        return 'Rikta Tithi - Avoid major new beginnings';
    }
    if (tithi.includes('Shukla')) return 'Waxing moon phase - Good for growth and beginnings';
    return 'Waning moon phase - Better for completion and reflection';
};

const getAuspiciousnessResult = (score, factors) => {
    const roundedScore = Math.round(score);
    if (score >= 85) {
        return {
            level: 'excellent',
            score: roundedScore,
            label: 'Highly Auspicious',
            color: 'emerald',
            summary: 'An excellent day for important activities, new beginnings, and ceremonies. The cosmic energies are aligned in your favor.',
            factors,
        };
    } else if (score >= 70) {
        return {
            level: 'good',
            score: roundedScore,
            label: 'Auspicious',
            color: 'green',
            summary: 'A good day for most activities. You can proceed with confidence for general matters and routine work.',
            factors,
        };
    } else if (score >= 50) {
        return {
            level: 'neutral',
            score: roundedScore,
            label: 'Moderate',
            color: 'amber',
            summary: 'A neutral day. Routine activities are fine, but consider postponing very important new ventures.',
            factors,
        };
    } else if (score >= 35) {
        return {
            level: 'challenging',
            score: roundedScore,
            label: 'Challenging',
            color: 'orange',
            summary: 'Some challenging energies present. Avoid starting major new projects. Focus on ongoing work and spiritual practices.',
            factors,
        };
    } else {
        return {
            level: 'avoid',
            score: roundedScore,
            label: 'Not Recommended',
            color: 'red',
            summary: 'Inauspicious cosmic combinations today. Best to avoid important decisions and new beginnings. Good for meditation and reflection.',
            factors,
        };
    }
};
