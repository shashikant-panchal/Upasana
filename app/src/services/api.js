import axios from "axios";
import moment from "moment";
import { ekadashiData2025, ekadashiData2026 } from "../data/ekadashiData";
import { supabase } from "../utils/supabase";

const BASE_URL = "https://panchang-api.herokuapp.com/api/v1";

export const getPanchangData = async (date = null, location = null) => {
  try {
    
    let latitude = 12.321013816545548; 
    let longitude = 76.61585829991184;

    if (location?.latitude && location?.longitude) {
      latitude = location.latitude;
      longitude = location.longitude;
    }

    const { data, error: functionError } = await supabase.functions.invoke(
      "get-panchang",
      {
        body: { latitude, longitude },
      }
    );

    if (functionError) {
      throw new Error(functionError.message || "Failed to fetch Panchang data");
    }

    return data;
  } catch (error) {
    console.error("Error fetching panchang data:", error);

    const fallbackDate = date ? moment(date) : moment();
    const latitude = location?.latitude ?? 19.076;
    const longitude = location?.longitude ?? 72.8777;
    const locationStr =
      location?.latitude && location?.longitude
        ? `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
        : "Mumbai, India";

    return {
      tithi: "Ekadashi",
      sunrise: "06:09",
      sunset: "18:30",
      moonrise: "12:00",
      moonset: "00:00",
      location: locationStr,
      nakshatra: "Rohini",
      yoga: "Vishkumbha",
      karana: "Bava",
      date: fallbackDate.format("DD MMMM YYYY"),
    };
  }
};

export const getEkadashiList = async (year) => {
  try {
    const response = await axios.get(`${BASE_URL}/ekadashi`, {
      params: {
        year: year,
      },
    });
    return response.data;
  } catch (error) {
    console.log("API unavailable, using static data for Ekadashi list");

    const ekadashiList = getEkadashiListFromStaticData(year);

    if (ekadashiList.length > 0) {
      return ekadashiList;
    }

    throw new Error(`No Ekadashi data available for year ${year}`);
  }
};

const getEkadashiListFromStaticData = (year) => {
  if (year === 2025) {
    return ekadashiData2025.map((ekadashi) => ({
      name: ekadashi.name,
      ekadashi_name: ekadashi.name,
      date: moment(ekadashi.date).format("YYYY-MM-DD"),
      ekadashi_date: moment(ekadashi.date).format("YYYY-MM-DD"),
      paksha: ekadashi.paksha,
      month: ekadashi.month,
      significance: ekadashi.significance,
      description: ekadashi.vrataKatha || ekadashi.significance, 
      fastingRules: ekadashi.fastingRules,
      benefits: ekadashi.benefits,
      moonPhase: ekadashi.moonPhase,
      vrataKatha: ekadashi.vrataKatha,
      fastingStartTime: ekadashi.fastingStartTime,
      paranaWindow: ekadashi.paranaWindow,
    }));
  }
  if (year === 2026) {
    return ekadashiData2026.map((ekadashi) => ({
      name: ekadashi.name,
      ekadashi_name: ekadashi.name,
      date: moment(ekadashi.date).format("YYYY-MM-DD"),
      ekadashi_date: moment(ekadashi.date).format("YYYY-MM-DD"),
      paksha: ekadashi.paksha,
      month: ekadashi.month,
      significance: ekadashi.significance,
      description: ekadashi.vrataKatha || ekadashi.significance, 
      fastingRules: ekadashi.fastingRules,
      benefits: ekadashi.benefits,
      moonPhase: ekadashi.moonPhase,
      vrataKatha: ekadashi.vrataKatha,
      fastingStartTime: ekadashi.fastingStartTime,
      paranaWindow: ekadashi.paranaWindow,
    }));
  }
  return [];
};

export const getNextEkadashi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/next-ekadashi`);
    const data = response.data;
    const today = moment();
    const ekadashiDate = moment(data.date || data.ekadashi_date);

    if (ekadashiDate.isSame(today, "day")) {
      const currentYear = moment().year();
      const ekadashiList = getEkadashiListFromStaticData(currentYear);
      const nextEkadashi = ekadashiList.find((e) => {
        const date = moment(e.date);
        return date.isAfter(today, "day");
      });

      if (nextEkadashi) {
        return nextEkadashi;
      }

      const nextYearList = getEkadashiListFromStaticData(currentYear + 1);
      if (nextYearList.length > 0) {
        return nextYearList[0];
      }
    }

    return data;
  } catch (error) {
    console.log("API unavailable, using static data for next Ekadashi");

    const currentYear = moment().year();
    const ekadashiList = getEkadashiListFromStaticData(currentYear);
    const today = moment();

    const nextEkadashi = ekadashiList.find((e) => {
      const ekadashiDate = moment(e.date);
      return ekadashiDate.isAfter(today, "day");
    });

    if (nextEkadashi) {
      return nextEkadashi;
    }

    const nextYearList = getEkadashiListFromStaticData(currentYear + 1);
    if (nextYearList.length > 0) {
      return nextYearList[0];
    }

    throw new Error("No upcoming Ekadashi found");
  }
};

export const getTodayEkadashi = async () => {
  try {
    const currentYear = moment().year();
    const ekadashiList = getEkadashiListFromStaticData(currentYear);
    const today = moment();

    const todayEkadashi = ekadashiList.find((e) => {
      const ekadashiDate = moment(e.date);
      return ekadashiDate.isSame(today, "day");
    });

    return todayEkadashi || null;
  } catch (error) {
    console.error("Error fetching today's Ekadashi:", error);
    return null;
  }
};

export const getTithiDetails = async (date) => {
  try {
    const response = await axios.get(`${BASE_URL}/tithi`, {
      params: {
        date: date,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tithi details:", error);
    throw error;
  }
};
