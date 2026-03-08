import moment from 'moment';
import { getLunarDaysInMonth } from '../utils/lunarCalculations';

export const getMoonPhasesByMonth = (month, year = null) => {
    const currentYear = year || new Date().getFullYear();
    const lunarDays = getLunarDaysInMonth(month, currentYear);
    
    return lunarDays.map(day => ({
        name: day.name,
        date: moment(day.date),
        type: day.type === 'purnima' ? 'Purnima' : 'Amavasya',
        phase: day.type === 'purnima' ? 'full' : 'new'
    }));
};
