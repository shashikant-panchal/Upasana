import { calculateFestivalsForYear } from './hinduFestivals';
import { getFullMoonsInYear, getNewMoonsInYear } from './lunarCalculations';

const hinduMonthNames = [
    'Pausha', 'Magha', 'Phalguna', 'Chaitra', 'Vaishakha', 'Jyeshtha',
    'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha'
];

function getHinduMonthForDate(date) {
    return hinduMonthNames[date.getMonth()] || '';
}

function getFestivalEmoji(name, deity) {
    const emojiMap = {
        'Maha Shivaratri': '🔱',
        'Holi': '🎨',
        'Diwali': '🪔',
        'Dussehra / Vijayadashami': '🏹',
        'Navratri Begins': '🙏',
        'Ganesh Chaturthi': '🐘',
        'Krishna Janmashtami': '🦚',
        'Ram Navami': '🏹',
        'Hanuman Jayanti': '🐒',
        'Raksha Bandhan': '🎀',
        'Karwa Chauth': '🌙',
        'Makar Sankranti': '🪁',
        'Vasant Panchami': '🪷',
        'Guru Purnima': '🙏',
        'Buddha Purnima': '☸️',
        'Akshaya Tritiya': '✨',
        'Ugadi / Gudi Padwa': '🎊',
        'Onam': '🛶',
        'Dhanteras': '💰',
        'Holika Dahan': '🔥',
        'Narak Chaturdashi': '🪔',
        'Govardhan Puja': '⛰️',
        'Bhai Dooj': '👫',
        'Chhath Puja': '🌅',
        'Gita Jayanti': '📖',
        'Kartik Purnima': '🕯️',
        'Vaikuntha Ekadashi': '🙏',
        'Pongal': '🍚'
    };

    if (emojiMap[name]) return emojiMap[name];

    if (deity === 'Shiva') return '🔱';
    if (deity === 'Krishna') return '🦚';
    if (deity === 'Rama') return '🏹';
    if (deity === 'Ganesha') return '🐘';
    if (deity === 'Durga') return '🙏';
    if (deity === 'Lakshmi') return '✨';
    if (deity === 'Saraswati') return '📚';
    if (deity === 'Hanuman') return '🐒';

    return '🎉';
}

function differenceInDays(date1, date2) {
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d1.getTime() - d2.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function generateStoryData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const items = [];

    const festivals = [
        ...calculateFestivalsForYear(currentYear),
        ...calculateFestivalsForYear(currentYear + 1)
    ];

    const fullMoons = [
        ...getFullMoonsInYear(currentYear),
        ...getFullMoonsInYear(currentYear + 1)
    ];

    const newMoons = [
        ...getNewMoonsInYear(currentYear),
        ...getNewMoonsInYear(currentYear + 1)
    ];

    festivals.forEach(festival => {
        const festDate = new Date(festival.date);
        festDate.setHours(0, 0, 0, 0);
        const daysUntil = differenceInDays(festDate, today);

        if (daysUntil >= 0 && daysUntil <= 30) {
            items.push({
                id: `festival-${festival.name}-${festDate.toISOString()}`,
                type: 'festival',
                name: festival.name,
                date: festDate,
                emoji: getFestivalEmoji(festival.name, festival.deity),
                color: festival.color || '#FF6B35',
                gradient: [(festival.color || '#FF6B35') + '40', (festival.color || '#FF6B35') + '20'],
                description: festival.description,
                daysUntil,
                isToday: daysUntil === 0
            });
        }
    });

    fullMoons.forEach(moon => {
        const moonDate = new Date(moon);
        moonDate.setHours(0, 0, 0, 0);
        const daysUntil = differenceInDays(moonDate, today);

        if (daysUntil >= 0 && daysUntil <= 30) {
            const hasFestival = items.some(item =>
                item.date.getTime() === moonDate.getTime() && item.type === 'festival'
            );

            items.push({
                id: `purnima-${moonDate.toISOString()}`,
                type: 'purnima',
                name: hasFestival ? 'Purnima' : `${getHinduMonthForDate(moonDate)} Purnima`,
                date: moonDate,
                emoji: '🌕',
                color: '#FFD700',
                gradient: ['#FFD70050', '#FFA50030'],
                description: 'Full Moon - Auspicious for worship, charity & spiritual practices',
                daysUntil,
                isToday: daysUntil === 0
            });
        }
    });

    newMoons.forEach(moon => {
        const moonDate = new Date(moon);
        moonDate.setHours(0, 0, 0, 0);
        const daysUntil = differenceInDays(moonDate, today);

        if (daysUntil >= 0 && daysUntil <= 30) {
            items.push({
                id: `amavasya-${moonDate.toISOString()}`,
                type: 'amavasya',
                name: `${getHinduMonthForDate(moonDate)} Amavasya`,
                date: moonDate,
                emoji: '🌑',
                color: '#4A5568',
                gradient: ['#4A556850', '#2D374830'],
                description: 'New Moon - Day for ancestral rites (Pitru Tarpan) & introspection',
                daysUntil,
                isToday: daysUntil === 0
            });
        }
    });

    items.sort((a, b) => {
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        return a.daysUntil - b.daysUntil;
    });

    return items;
}
