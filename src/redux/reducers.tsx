import { ADD_PLACE, REMOVE_PLACE, UPDATE_CITY_ORDER, CLEAR_CITIES, ADD_POI, UPDATE_POI_ORDER, CLEAR_POIS, UPDATE_LOADING_STATE, REMOVE_POI } from './actions';

const initialState = {
    selectedCities: [],
    selectedPois: [],
    loading: false,
}

const userReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case ADD_PLACE:
            return {
                ...state,
                selectedCities: [...state.selectedCities, action.city],
            };
        case REMOVE_PLACE:
            return {
                ...state,
                selectedCities: state.selectedCities.filter(
                    (city) => city.id !== action.city.id
                ),
            };
        case UPDATE_CITY_ORDER:
            return {
                ...state,
                selectedCities: [...action.newCityOrder],
            };
        case CLEAR_CITIES:
            return {
                ...state,
                selectedCities: [],
            };
        case ADD_POI:
            return {
                ...state,
                selectedPois: [...state.selectedPois, action.poi],
            };
        case UPDATE_POI_ORDER:
            return {
                ...state,
                selectedPois: [...action.newPoiOrder],
            };
        case CLEAR_POIS:
            return {
                ...state,
                selectedPois: [],
            };
        case REMOVE_POI:
            return {
                ...state,
                selectedPois: state.selectedPois.filter(
                    (poi) => poi.features[0].id !== action.poi.features[0].id
                ),
            };
        case UPDATE_LOADING_STATE:
            return {
                ...state,
                loading: action.loadingState,
            };
        default:
            return state;
    }
}

export default userReducer;
