import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { appId, hostName } from "../config/config";

// Get city weather data.
export const getCityData = createAsyncThunk("city", async (obj: any) => {
    try {
        console.log('obj:', obj);
        console.log('obj.city:', obj.city);
        console.log('obj.unit:', obj.unit);
        const request = await axios.get(
            `${hostName}/data/2.5/weather?q=${obj.city}&units=${obj.unit}&APPID=${appId}`
        );

        const response = await request.data;

        console.log("response:", response);

        return {
            data: response,
            error: null,
        };
    } catch (error: any) {
        error.response.data.message = "The city you searched for was not found.";

        return {
            data: null,
            error: error.response.data.message,
        };
    }
});

// Get a five day forecast of the inputted city.
export const get5DayForecast = createAsyncThunk("5days", async (obj: any) => {
    const request = await axios.get(
        `${hostName}/data/2.5/forecast?lat=${obj.lat}&lon=${obj.lon}&units=${obj.unit}&APPID=${appId}`
    );
    const response = await request.data;
    return response;
});

export const weatherSlice = createSlice({
    name: "weather",
    initialState: {
        citySearchLoading: false,
        citySearchData: null,
        forecastLoading: false,
        forecastData: null,
        forecastError: null,
    },
    reducers: {},
    extraReducers: (builder: any) => {
        builder
            // City search
            .addCase(getCityData.pending, (state: any) => {
                state.citySearchLoading = true;
                state.citySearchData = null;
            })
            .addCase(getCityData.fulfilled, (state: any, action: any) => {
                state.citySearchLoading = false;
                state.citySearchData = action.payload;
            })
            // Forecast
            .addCase(get5DayForecast.pending, (state: any) => {
                state.forecastLoading = true;
                state.forecastData = null;
                state.forecastError = null;
            })
            .addCase(get5DayForecast.fulfilled, (state: any, action: any) => {
                state.forecastLoading = false;
                state.forecastData = action.payload;
                state.forecastError = null;
            })
            .addCase(get5DayForecast.rejected, (state: any, action: any) => {
                state.forecastLoading = false;
                state.forecastData = null;
                state.forecastError = action.error.message;
            });
    },
});