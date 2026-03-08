import moment from 'moment';
import { useEffect, useState } from 'react';
import { getEkadashiList, getNextEkadashi, getTodayEkadashi } from '../services/api';

export const useNextEkadashi = () => {
  const [data, setData] = useState({
    todayEkadashi: null,
    nextEkadashi: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      
      const [today, next] = await Promise.all([
        getTodayEkadashi().catch((e) => {
          console.error("Error fetching today's Ekadashi:", e);
          return null;
        }),
        getNextEkadashi().catch((e) => {
          const msg = e.message || "";
          
          if (
            msg.includes("No upcoming Ekadashi") ||
            msg.includes("API unavailable")
          ) {
            console.log("Next Ekadashi info not available (End of Calendar).");
          } else {
            console.error("Error fetching next Ekadashi:", e);
          }
          return null;
        }),
      ]);

      if (!today && !next) {
        throw new Error("Failed to fetch both Today and Next Ekadashi data");
      }

      setData({
        todayEkadashi: today,
        nextEkadashi: next,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching ekadashi data:", err);
      
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch Ekadashi data. Please try again.",
      }));
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { ...data, refresh: fetchData };
};

export const useEkadashiList = (year = null) => {
  const [ekadashiList, setEkadashiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEkadashiList = async () => {
      setLoading(true);
      setError(null);

      try {
        const yearToFetch = year || moment().year();
        const data = await getEkadashiList(yearToFetch);

        const ekadashis = Array.isArray(data) ? data : (data.ekadashis || data.data || []);
        setEkadashiList(ekadashis);
      } catch (err) {
        console.error('Error fetching ekadashi list:', err);
        setError('Failed to fetch Ekadashi list. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEkadashiList();

    return () => { };
  }, [year]);

  return { ekadashiList, loading, error };
};
