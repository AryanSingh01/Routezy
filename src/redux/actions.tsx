export const ADD_PLACE = 'ADD_PLACE';
export const REMOVE_PLACE = 'REMOVE_PLACE';
export const UPDATE_CITY_ORDER = 'UPDATE_CITY_ORDER';
export const CLEAR_CITIES = 'CLEAR_CITIES';
export const ADD_POI = 'ADD_POI';
export const UPDATE_POI_ORDER = 'UPDATE_POI_ORDER';
export const CLEAR_POIS = 'CLEAR_POIS';
export const UPDATE_LOADING_STATE = 'UPDATE_LOADING_STATE';
export const REMOVE_POI = 'REMOVE_POI';
export const addPlace = (city: any) => ({
  type: ADD_PLACE,
  city,
});

export const removePlace = (city: any) => ({
  type: REMOVE_PLACE,
  city,
});

export const updateCityOrder = (newCityOrder: any) => {
  return {
    type: 'UPDATE_CITY_ORDER',
    newCityOrder,
  };
};

export const clearCities = () => {
  return {
    type: 'CLEAR_CITIES',
  };
}

export const addPoi = (poi: any) => {
  return {
    type: 'ADD_POI',
    poi,
  };
}

export const updatePoiOrder = (newPoiOrder: any) => {
  return {
    type: 'UPDATE_POI_ORDER',
    newPoiOrder,
  };
}

export const clearPois = () => {
  return {
    type: 'CLEAR_POIS',
  };
}

export const removePoi = (poi: any) => {
  return {
    type: 'REMOVE_POI',
    poi,
  };
}

export const updateLoadingState = (loadingState: any) => {
  return {
    type: 'UPDATE_LOADING_STATE',
    loadingState,
  };
}