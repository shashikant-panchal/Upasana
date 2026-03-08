import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { supabase } from "../utils/supabase";

export const usePanchang = (selectedDate) => {
  const [panchangData, setPanchangData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useSelector((state) => state.location);

  const fetchPanchangData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let latitude = 19.076; 
      let longitude = 72.8777;

      if (location?.latitude && location?.longitude) {
        latitude = location.latitude;
        longitude = location.longitude;
      }

      const targetDate = selectedDate || new Date();

      const dateString = targetDate.toISOString().split('T')[0];

      const { data, error: functionError } = await supabase.functions.invoke(
        "get-panchang",
        {
          body: { latitude, longitude, date: dateString },
        }
      );

      if (functionError) {
        throw new Error(
          functionError.message || "Failed to fetch Panchang data"
        );
      }

      setPanchangData(data);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch Panchang data";
      setError(errorMessage);
      console.error("Panchang API error:", err);
    } finally {
      setLoading(false);
    }
  }, [location?.latitude, location?.longitude, selectedDate]);

  useEffect(() => {
    fetchPanchangData();

    const interval = setInterval(fetchPanchangData, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchPanchangData]);

  const refreshData = useCallback(() => {
    fetchPanchangData();
  }, [fetchPanchangData]);

  return { panchangData, loading, error, refreshData };
};
