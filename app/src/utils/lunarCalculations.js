
const FULL_MOON_DATES_2024 = [
    new Date(2024, 0, 25),   
    new Date(2024, 1, 24),   
    new Date(2024, 2, 25),   
    new Date(2024, 3, 23),   
    new Date(2024, 4, 23),   
    new Date(2024, 5, 22),   
    new Date(2024, 6, 21),   
    new Date(2024, 7, 19),   
    new Date(2024, 8, 18),   
    new Date(2024, 9, 17),   
    new Date(2024, 10, 15),  
    new Date(2024, 11, 15),  
];

const FULL_MOON_DATES_2025 = [
    new Date(2025, 0, 13),   
    new Date(2025, 1, 12),   
    new Date(2025, 2, 14),   
    new Date(2025, 3, 13),   
    new Date(2025, 4, 12),   
    new Date(2025, 5, 11),   
    new Date(2025, 6, 10),   
    new Date(2025, 7, 9),    
    new Date(2025, 8, 7),    
    new Date(2025, 9, 7),    
    new Date(2025, 10, 5),   
    new Date(2025, 11, 4),   
];

const FULL_MOON_DATES_2026 = [
    new Date(2026, 0, 3),    
    new Date(2026, 1, 1),    
    new Date(2026, 2, 3),    
    new Date(2026, 3, 2),    
    new Date(2026, 4, 1),    
    new Date(2026, 4, 31),   
    new Date(2026, 5, 29),   
    new Date(2026, 6, 29),   
    new Date(2026, 7, 28),   
    new Date(2026, 8, 26),   
    new Date(2026, 9, 26),   
    new Date(2026, 10, 24),  
    new Date(2026, 11, 24),  
];

const NEW_MOON_DATES_2024 = [
    new Date(2024, 0, 11),   
    new Date(2024, 1, 9),    
    new Date(2024, 2, 10),   
    new Date(2024, 3, 8),    
    new Date(2024, 4, 8),    
    new Date(2024, 5, 6),    
    new Date(2024, 6, 5),    
    new Date(2024, 7, 4),    
    new Date(2024, 8, 3),    
    new Date(2024, 9, 2),    
    new Date(2024, 10, 1),   
    new Date(2024, 11, 1),   
    new Date(2024, 11, 30),  
];

const NEW_MOON_DATES_2025 = [
    new Date(2025, 0, 29),   
    new Date(2025, 1, 28),   
    new Date(2025, 2, 29),   
    new Date(2025, 3, 27),   
    new Date(2025, 4, 27),   
    new Date(2025, 5, 25),   
    new Date(2025, 6, 24),   
    new Date(2025, 7, 23),   
    new Date(2025, 8, 21),   
    new Date(2025, 9, 21),   
    new Date(2025, 10, 20),  
    new Date(2025, 11, 20),  
];

const NEW_MOON_DATES_2026 = [
    new Date(2026, 0, 18),   
    new Date(2026, 1, 17),   
    new Date(2026, 2, 19),   
    new Date(2026, 3, 17),   
    new Date(2026, 4, 16),   
    new Date(2026, 5, 15),   
    new Date(2026, 6, 14),   
    new Date(2026, 7, 12),   
    new Date(2026, 8, 11),   
    new Date(2026, 9, 10),   
    new Date(2026, 10, 9),   
    new Date(2026, 11, 9),   
];

const hinduMonthNames = [
    'Pausha', 'Magha', 'Phalguna', 'Chaitra', 'Vaishakha', 'Jyeshtha',
    'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha'
];

function getHinduMonthName(month) {
    
    return hinduMonthNames[(month + 10) % 12];
}

function getFullMoonsForYear(year) {
    switch (year) {
        case 2024: return FULL_MOON_DATES_2024;
        case 2025: return FULL_MOON_DATES_2025;
        case 2026: return FULL_MOON_DATES_2026;
        default:
            
            const baseYear = 2025;
            const baseMoons = FULL_MOON_DATES_2025;
            const yearDiff = year - baseYear;
            return baseMoons.map(d => {
                const newDate = new Date(d);
                newDate.setFullYear(newDate.getFullYear() + yearDiff);
                return newDate;
            });
    }
}

function getNewMoonsForYear(year) {
    switch (year) {
        case 2024: return NEW_MOON_DATES_2024;
        case 2025: return NEW_MOON_DATES_2025;
        case 2026: return NEW_MOON_DATES_2026;
        default:
            const baseYear = 2025;
            const baseMoons = NEW_MOON_DATES_2025;
            const yearDiff = year - baseYear;
            return baseMoons.map(d => {
                const newDate = new Date(d);
                newDate.setFullYear(newDate.getFullYear() + yearDiff);
                return newDate;
            });
    }
}

export function getFullMoonsInYear(year) {
    return getFullMoonsForYear(year);
}

export function getNewMoonsInYear(year) {
    return getNewMoonsForYear(year);
}

export function getLunarDaysInMonth(month, year) {
    const lunarDays = [];
    
    const fullMoons = getFullMoonsForYear(year);
    const newMoons = getNewMoonsForYear(year);
    
    fullMoons.filter(d => d.getMonth() === month).forEach(d => {
        lunarDays.push({
            date: d,
            type: 'purnima',
            name: `${getHinduMonthName(d.getMonth())} Purnima`
        });
    });
    
    newMoons.filter(d => d.getMonth() === month).forEach(d => {
        lunarDays.push({
            date: d,
            type: 'amavasya',
            name: `${getHinduMonthName(d.getMonth())} Amavasya`
        });
    });
    
    return lunarDays.sort((a, b) => a.date.getTime() - b.date.getTime());
}
