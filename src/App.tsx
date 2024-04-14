import "./App.css"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import Icon from "react-icons-kit";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { droplet } from "react-icons-kit/feather/droplet";
import { wind } from "react-icons-kit/feather/wind";
import { get5DayForecast, getCityData } from "./app/weatherSlice";
import { SphereSpinner } from "react-spinners-kit";
import { useAppDispatch } from "./app/hooks";
import Modal from './modal/modal';

const App = () => {
  // Redux state
  const {
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
  } = useSelector((state: any) => 
    state.weather
  );

  // Main loadings state
  const [loadings, setLoadings] = useState(true);

  const allLoadings = [citySearchLoading, forecastLoading];

  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  // State for city value.
  // Default value for city is New York.
  const [city, setCity] = useState("");

  const [latestCityInputted, setLatestCityInputted] = useState("New York");

  // The city selected from the favorites dropdown menu.
  const [cityFromDropdwn, setCityFromDropdwn] = useState("");

  const [favoriteCityList, addToFavoriteCityList] = useState<string[]>([]);

  const [modal, setModal] = useState(false);

  const [modalMessage, setModalMessage] = useState("");

  // State for unit of temperature measurement.
  // imperial = F and metric = C
  const [unit, setUnit] = useState("imperial");

  const removeFromFavoriteCityList = (cityToRemove: string) => {
    const newFavoriteCityList = favoriteCityList.filter((city) => city !== cityToRemove)
    addToFavoriteCityList(newFavoriteCityList);
  }

  const dispatch = useAppDispatch();

  // Fetch data
  const fetchData = (city: string) => {
    dispatch(
      getCityData({
        city,
        unit,
      })
    ).then((res: any) => {
      if (!res.payload.error) {
        dispatch(
          get5DayForecast({
            lat: res.payload.data.coord.lat,
            lon: res.payload.data.coord.lon,
            unit,
          })
        );
      }
    });
  };

  // Initial render
  useEffect(() => {
    fetchData(latestCityInputted);
  }, [unit]);

  // Handles city search.
  const handleCitySearch = (event: any) => {
    event.preventDefault();
    setLoadings(true);
    fetchData(city);
    setLatestCityInputted(city);
    setCity("");
    setCityFromDropdwn("");
  };

  // Handles city selection from the dropdown.
  const handleCitySelection = (event: any) => {
    event.preventDefault();
    setLoadings(true);
    fetchData(cityFromDropdwn);
    setLatestCityInputted(cityFromDropdwn);
    setCity("");
    setCityFromDropdwn("");
  };

  /*Function to filter forecast data based
    on the time of the first object.*/
  const filterForecastByFirstObjTime = (forecastData: any) => {
    if (!forecastData) {
      return [];
    }

    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data: any) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

  // Capitalizes the first letter of a string of text.
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // Checks the letter cases of the inputted city.
  // const checkLetterCasing = (inputtedCity: string) => {
  //   if(inputtedCity[0] != inputtedCity[0].toUpperCase()) {
  //     inputtedCity[0] = inputtedCity[0].toUpperCase();
  //   }
  // }

  const inFavoritesList = (city: string) => {
    return favoriteCityList.includes(city)
  }

  return (
    <div className="background">
      <div className="left-section">

        <p className="anytime-weather">Anytime Weather</p>

        <p className="enter-city-below">Enter City Below</p>

        {/* City search form. */}
        <form onSubmit={handleCitySearch}>
          <input
            type="text"
            className="city-input-field"
            placeholder="Enter City Name"
            required
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
            }}
            readOnly={loadings}
          />
          <button type="submit">Enter</button>
        </form>

        <div className="unit-choices">
          <input
            id="fahrenheit"
            value="fahrenheit"
            name="platform"
            type="radio"
            onChange={() => {
              setUnit("imperial")
            }}
            defaultChecked
          />
          <p>F</p>
          <input
            id="celsius"
            value="celsius"
            name="platform"
            type="radio"
            onChange={() => {
              setUnit("metric")
            }}
          />
          <p>C</p>
        </div>

        <p className="select-from-favorites">Select From Favorites</p>
        <form onSubmit={handleCitySelection}>
          <select value={cityFromDropdwn} onChange={(event) => setCityFromDropdwn(event.target.value)}>
            {/* <option disabled selected hidden value="">Select From Favorites</option> */}
            <option disabled hidden value="">
              Select From Favorites
            </option>
            {favoriteCityList.map((cityInFavoritesList) => (
              <option key={cityInFavoritesList}>{cityInFavoritesList}</option>
            ))}
          </select>
          <button type="submit">Select</button>
        </form>
      </div>

      <div className="right-section">
        <div className="current-weather-details-box">
          {loadings ? (
            <div className="loader">
              <SphereSpinner loadings={loadings} color="#2fa5ed" size={20} />
            </div>
          ) : (
            <>
              {citySearchData && citySearchData.error ? (
                <div className="error-msg">{citySearchData.error}</div>
              ) : (
                <>
                  {forecastError ? (
                    <div className="error-msg">{forecastError}</div>
                  ) : (
                    <>
                      {citySearchData && citySearchData.data ? (
                        <div className="weather-details-container">
                          <div className="details">
                            <div className="icon-and-temp">
                              <img
                                src={`https://openweathermap.org/img/wn/${citySearchData.data.weather[0].icon}@2x.png`}
                                alt="icon"
                              />
                              <h1>
                                {citySearchData.data.main.temp.toFixed()}
                                {unit === "metric" ? " C" : " F"}
                              </h1>

                              <h4 className="description">
                                {capitalize(citySearchData.data.weather[0].description)}
                              </h4>

                              <h4 className="city-name">
                                {citySearchData.data.name}
                              </h4>
                            </div>

                            <div className="save-as-favorite">
                              <input type="checkbox" checked={inFavoritesList(latestCityInputted)} name="cityToSave" onChange={() => {
                                // Add the city to the favorites list.
                                if(!inFavoritesList(latestCityInputted)) {
                                  addToFavoriteCityList([
                                    ...favoriteCityList,
                                    latestCityInputted
                                  ]);
                                  setModal(true);
                                  setModalMessage(`${latestCityInputted} added to favorites!`);
                                }else{
                                  // Remove the city from the favorites list.
                                  removeFromFavoriteCityList(latestCityInputted);
                                  setModal(true);
                                  setModalMessage(`${latestCityInputted} removed from favorites.`)
                                }
                              }}/>
                              <div className="save-as-favorite-txt">
                                <label> Save As Favorite</label>
                              </div>
                            </div>
                          </div>

                          {/* Feels like */}
                          <div className="metrices">
                            <h4>
                              Feels like {citySearchData.data.main.feels_like.toFixed()}
                              &deg;
                              {unit === "metric" ? " C" : " F"}
                            </h4>

                            {/* Min and max temperature. */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={arrowUp}
                                  size={20}
                                  className="icon"
                                />
                                <span className="value">
                                  {citySearchData.data.main.temp_max.toFixed()}
                                  &deg;
                                  {unit === "metric" ? " C" : " F"}
                                </span>
                              </div>
                              <div className="key">
                                <Icon
                                  icon={arrowDown}
                                  size={20}
                                  className="icon"
                                />
                                <span className="value">
                                  {citySearchData.data.main.temp_min.toFixed()}
                                  &deg;
                                  {unit === "metric" ? " C" : " F"}
                                </span>
                              </div>
                            </div>

                            {/* Humidity */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={droplet}
                                  size={20}
                                  className="icon"
                                />
                                <span>Humidity</span>
                              </div>
                              <div className="value">
                                <span>
                                  {citySearchData.data.main.humidity}%
                                </span>
                              </div>
                            </div>

                            {/* Wind */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={wind} size={20} className="icon" />
                                <span>Wind</span>
                              </div>
                              <div className="value">
                                <span>
                                  {citySearchData.data.wind.speed.toFixed()}
                                  {unit === "metric" ? " km/h" : " mph"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="error-msg">No Data Found</div>
                      )}
                      {/* Extended forecast data. */}
                      <h4 className="extended-forecast-heading">
                        Extended Forecast
                      </h4>
                      {filteredForecast.length > 0 ? (
                        <div className="extended-forecasts-container">
                          {filteredForecast.map((data: any, index: any) => {
                            const date = new Date(data.dt_txt);
                            const day = date.toLocaleDateString("en-US", {
                              weekday: "short",
                            });
                            return (
                              <div className="forecast-box" key={index}>
                                <h5>{day}</h5>
                                <img
                                  src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                                  alt="icon"
                                />
                                <h5>{capitalize(data.weather[0].description)}</h5>
                                <h5 className="min-max-temp">
                                  {data.main.temp_max.toFixed()}&deg; /{" "}
                                  {data.main.temp_min.toFixed()}&deg;
                                </h5>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="error-msg">No Data Found</div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Modal modal={modal} setModal={setModal} modalMessage={modalMessage} />
    </div>
  )
}

export default App