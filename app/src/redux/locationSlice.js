import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

export const detectLocation = createAsyncThunk(
    'location/detectLocation',
    async (_, { rejectWithValue }) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return rejectWithValue('Permission to access location was denied');
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            let city = 'Unknown';
            let country = 'Unknown';

            const address = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (address && address.length > 0) {
                const loc = address[0];
                city = loc.city || loc.subregion || loc.region || 'Unknown';
                country = loc.country || 'Unknown';
            }

            return {
                latitude,
                longitude,
                city,
                country
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const locationSlice = createSlice({
    name: 'location',
    initialState: {
        latitude: null,
        longitude: null,
        city: null,
        country: null,
        autoDetect: false,
        loading: false,
        error: null,
    },
    reducers: {
        setAutoDetect: (state, action) => {
            state.autoDetect = action.payload;
        },
        setManualLocation: (state, action) => {
            const { latitude, longitude, city, country } = action.payload;
            state.latitude = latitude;
            state.longitude = longitude;
            state.city = city;
            state.country = country;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(detectLocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(detectLocation.fulfilled, (state, action) => {
                state.loading = false;
                state.latitude = action.payload.latitude;
                state.longitude = action.payload.longitude;
                state.city = action.payload.city;
                state.country = action.payload.country;
            })
            .addCase(detectLocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.autoDetect = false;
            });
    },
});

export const { setAutoDetect, setManualLocation } = locationSlice.actions;
export default locationSlice.reducer;
