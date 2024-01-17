import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { StyleSheet, View, Alert, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FAB, useTheme, Text, Chip } from 'react-native-paper';
import React, { useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import ImageViewer from '../components/ImageViewer';
import CitySelector from "../components/citySelector";
import { connect, useDispatch } from "react-redux";
import { updateLoadingState, clearPois, updatePoiOrder, addPlace, removePlace } from "../redux/actions";
import Constants from 'expo-constants';
import { fetchRouteCoordinates, fetchRouteMatrix } from '../components/api';
import axios from 'axios';

SplashScreen.preventAutoHideAsync();

interface City {
    id: number;
    name: string;
    country: string;
    state: string;
    longitude: number;
    latitude: number;
    bbox: number[];
    route: any[];
    hotels: any[];
}

const Home = ({ navigation, selectedCities }) => {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const dispatch = useDispatch();
    let poiArray: any[] = [];
    let routeArray: any[] = [];
    let unusablePOIArray: any[] = [];
    let unusableRouteArray: any[] = [];
    let finalRouteArray: any[] = [];
    let finalPOIArray: any[] = [];
    let isValidRoute = true;
    const [routeType, setRouteType] = useState('tourism');
    const PlaceholderImage = colorScheme === 'light'
        ? require('./../../assets/RoutezyLogo.png')
        : require('./../../assets/RoutezyDarkLogo.png');
    const noGivenPlaces = (selectedCities === undefined || selectedCities.length < 2) ? true : false;
    const [foodChipSelected, setFoodChipSelected] = useState(false);
    const [sightseeingChipSelected, setSightseeingChipSelected] = useState(false);
    const [museumChipSelected, setmuseumChipSelected] = useState(false);
    const [generalChipSelected, setGeneralChipSelected] = useState(true);
    const [fontsLoaded, fontError] = useFonts({
        'Inter-Black': require('./../../assets/fonts/Inter-Black.otf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);


    if (!fontsLoaded && !fontError) {
        return null;
    }


    /**
     * The function fetchData is an asynchronous function that fetches route coordinates and generates
     * routes and points of interest based on selected cities.
     */
    async function fetchData() {
        if (selectedCities.length > 0) {
            try {
                // Fetch route coordinates
                finalRouteArray = [];
                finalPOIArray = [];

                const coordArray = selectedCities.map((coord: { longitude: any; latitude: any; }) => [coord.longitude, coord.latitude]);
                await generateAllRoutes(coordArray);

                dispatch(clearPois());
                dispatch(updatePoiOrder(finalPOIArray));

                for (let i = 0; i < selectedCities.length; i++) {
                    const city = selectedCities[i];
                    await generateCityRoute(city);
                }

            } catch (error) {
                console.log('Error fetching data:', error);
            }
        }
    }

    /**
     * The function `getCityHotels` fetches hotel data for a given city using the Hotels.com API and
     * returns the top recommended hotels, including the cheapest, middle-priced, and most expensive
     * options.
     * @param {City} city - The `city` parameter is an object that represents a city. It has the
     * following properties:
     * @returns an array of hotel objects. If there are more than 2 hotels, it returns the cheapest,
     * middle, and most expensive hotels. If there are less than or equal to 2 hotels, it returns all
     * the hotels. If there are no hotels found, it returns null.
     */
    async function getCityHotels(city: City) {
        const cityName = (city.name);
        const searchTerm = cityName.replace('.', '')
        const countryName = city.country;
        const regionAPI = {
            method: 'GET',
            url: 'https://hotels-com-provider.p.rapidapi.com/v2/regions',
            params: {
                query: searchTerm,
                domain: 'GB',
                locale: 'en_GB'
            },
            headers: {
                'X-RapidAPI-Key': Constants.expoConfig.extra.hotelApiKey,
                'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
            }
        };
        try {
            const regionResponse = await axios.request(regionAPI);
            const regionData = regionResponse.data.data as any[];

            for (let i = 0; i < regionData.length; i++) {
                const item = regionData[i];
                if (item.type === 'CITY' && item.regionNames.shortName === cityName && item.hierarchyInfo.country.name === countryName) {
                    const regionID = (item.gaiaId).toString();
                    const currentDate = new Date();
                    const formattedDate = currentDate.toISOString().split('T')[0].toString();
                    const checkoutDate = new Date(currentDate);
                    checkoutDate.setDate(currentDate.getDate() + 1);

                    const formattedcheckoutDate = checkoutDate.toISOString().split('T')[0].toString();

                    const hotelAPI = {
                        method: 'GET',
                        url: 'https://hotels-com-provider.p.rapidapi.com/v2/hotels/search',
                        params: {
                            region_id: regionID,
                            locale: 'en_GB',
                            checkin_date: formattedDate,
                            sort_order: 'RECOMMENDED',
                            adults_number: '1',
                            domain: 'GB',
                            checkout_date: formattedcheckoutDate,
                            lodging_type: 'HOSTAL,APARTMENT,APART_HOTEL,CHALET,HOTEL,RYOKAN,BED_AND_BREAKFAST,HOSTEL',
                            amenities: 'PARKING',
                            available_filter: 'SHOW_AVAILABLE_ONLY'
                        },
                        headers: {
                            'X-RapidAPI-Key': Constants.expoConfig.extra.hotelApiKey,
                            'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
                        }
                    };
                    const hotelResponse = await axios.request(hotelAPI) as any;
                    let topRecommendedHotels = null;
                    if (hotelResponse.data.properties.length > 10) {
                        topRecommendedHotels = hotelResponse.data.properties.slice(0, 10);
                    } else if (hotelResponse.data.properties.length > 0) {
                        topRecommendedHotels = hotelResponse.data.properties;
                    }

                    if (topRecommendedHotels.length > 2) {
                        const prices = topRecommendedHotels.map((hotel: { mapMarker: { label: string; }; }) => parseFloat(hotel.mapMarker.label.replace('£', '')));

                        // Sort the prices in ascending order
                        const sortedPrices = prices.slice().sort((a: number, b: number) => a - b); // Use slice to avoid modifying the original array

                        // Find the indices of the cheapest, middle, and most expensive hotels
                        const cheapestIndex = prices.findIndex((price: any) => price === sortedPrices[0]);
                        const middleIndex = prices.findIndex((price: any) => price === sortedPrices[Math.floor(sortedPrices.length / 2)]);
                        const mostExpensiveIndex = prices.findIndex((price: any) => price === sortedPrices[sortedPrices.length - 1]);

                        // Get the associated hotel objects
                        const cheapestHotel = topRecommendedHotels[cheapestIndex];
                        const middleHotel = topRecommendedHotels[middleIndex];
                        const mostExpensiveHotel = topRecommendedHotels[mostExpensiveIndex];
                        return [cheapestHotel, middleHotel, mostExpensiveHotel];
                    }
                    return topRecommendedHotels;
                }
            }
            console.log('Error fetching hotels');
        } catch (error) {
            console.log('Error fetching hotels:', error);
        }
        return null;
    }


    /**
     * The function generates a city route by making requests to Mapbox API to fetch points of interest
     * (POIs) and then orders and sorts them.
     * @param {City} city - The `city` parameter is an object that represents a city. It contains the
     * following properties:
     */
    async function generateCityRoute(city: City) {
        try {
            const minimumUniquePOIs = 5; // Minimum required unique POIs
            const limit = 10;
            let places = [];

            // Continues making requests until the minimum required unique POIs is reached 
            while (places.length < minimumUniquePOIs) {
                const apiUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + routeType + '.json';
                const apiKey = Constants.expoConfig.extra.mapboxToken;
                let proximity = `${city.longitude},${city.latitude}`;
                let bbox = city.bbox;
                if (bbox) {
                    proximity = null;
                }

                const placesResponse = await axios.get(apiUrl, {
                    params: {
                        access_token: apiKey,
                        limit: limit,
                        bbox: bbox,
                        proximity: proximity,
                        radius: 15000,
                        types: 'poi',
                    },
                });

                // Filter out POIs that are already in poiArray
                const newPlaces = placesResponse.data.features.filter((poi: { properties: { category: string | string[]; }; center: any; }) => {
                    const poiCenter = poi.center;
                    // Check if poiCenter exists in any item of poiArray
                    return !unusablePOIArray.some((existingPoi: { features: [{ center: any; }] }) => {
                        return existingPoi.features.some((feature: { center: any; }) => {
                            return feature.center[0] === poiCenter[0] && feature.center[1] === poiCenter[1];
                        });
                    });
                });

                // Add the new unique POIs to the places array
                places.push(...newPlaces);
                // If all available POIs been fetched and still have less than the minimum required,
                // break out of the loop to avoid an infinite loop.
                if (newPlaces.length === 0) {
                    break;
                }
            }

            if (places.length > minimumUniquePOIs) {
                places = places.slice(0, minimumUniquePOIs);
            }
            let poiCoords = places.map((poi: { center: any; }) => poi.center);
            poiCoords = await orderPOIs(poiCoords);
            places = sortPOIs(poiCoords, places, false);
            let hotels = await getCityHotels(city);
            dispatch(removePlace(city));
            const updatedCity = {
                id: city.id,
                name: city.name,
                country: city.country,
                state: city.state,
                latitude: city.latitude,
                longitude: city.longitude,
                bbox: city.bbox,
                route: places,
                hotels: hotels,
            };
            dispatch(addPlace(updatedCity));
        } catch (error) {
            console.log('Error generating cyclic route:', error.message);
        }
    }
    /**
     * The function generates a route by fetching route coordinates and nearby points of interest, and
     * then calculates the total route time.
     * @param {string | any[]} coordArray - The `coordArray` parameter is an array of coordinates. It
     * can either be a string or an array of any type.
     * @returns the value of the variable `currentRoute`.
     */
    async function generateRoute(coordArray: string | any[]) {
        const currentRoute = await fetchRouteCoordinates([coordArray[0], coordArray[1]]);
        if (currentRoute != null) {
            routeArray.push(currentRoute);
            let totalRouteTime = routeArray.reduce((acc, route) => acc + route.routeTime, 0) + (poiArray.length * 60);
            while (totalRouteTime <= 720 && poiArray.length < 5) {
                if (routeArray.filter((route) => !unusableRouteArray.some((unusableRoute) => unusableRoute.routeTime === route.routeTime)).length == 0) {
                    break;
                }
                const longestRoute = routeArray
                    .filter((route) => !unusableRouteArray.some((unusableRoute) => unusableRoute.routeTime === route.routeTime))
                    .reduce((acc, route) => (route.routeTime > acc.routeTime ? route : acc));

                const startCoordinates = longestRoute.routeCoordinates[0] as {
                    latitude: number;
                    longitude: number;
                };
                const endCoordinates = longestRoute.routeCoordinates[longestRoute.routeCoordinates.length - 1] as {
                    latitude: number;
                    longitude: number;
                };
                const poi = await fetchNearByPOIs(startCoordinates, endCoordinates);
                const formattedCoordinates = [startCoordinates, endCoordinates]
                    .map(({ latitude, longitude }) => [longitude, latitude])
                if (poi.features.length > 0) {
                    const route1 = await fetchRouteCoordinates([formattedCoordinates[0], poi.features[0].center]);
                    const route2 = await fetchRouteCoordinates([poi.features[0].center, formattedCoordinates[1]]);
                    if (route1 != null && route2 != null) {
                        poiArray.push(poi);
                        unusablePOIArray.push(poi);
                        const indexToRemove = routeArray.findIndex((route) => route === longestRoute);
                        if (indexToRemove !== -1) {
                            routeArray.splice(indexToRemove, 1, route1, route2);
                        } else {
                            console.log('Route not found in the array');
                        }
                    } else {
                        unusablePOIArray.push(poi);
                    }
                } else {
                    unusableRouteArray.push(longestRoute);
                }
                totalRouteTime = routeArray.reduce((acc, route) => acc + route.routeTime, 0) + (poiArray.length * 60);
            }
        }
        return currentRoute;
    }

    /**
     * The function generates routes between coordinates in an array and updates the points of interest
     * accordingly.
     * @param {string | any[]} coordArray - The `coordArray` parameter is an array of coordinates. Each
     * element in the array represents a pair of coordinates [longitude, latitude]. The function
     * generates routes between each pair of coordinates in the array.
     */
    async function generateAllRoutes(coordArray: string | any[]) {
        for (let i = 0; i < coordArray.length - 1; i++) {
            let route = await generateRoute([coordArray[i], coordArray[i + 1]]);
            if (route != null) {
                let updatedPOIs = poiArray.map((poi) => {
                    return {
                        features: poi.features,
                        parentCity: selectedCities[i].id,
                    };
                });
                let poiCoords = updatedPOIs.map((poi) => poi.features[0].center);
                poiCoords.unshift([selectedCities[i].longitude, selectedCities[i].latitude])

                poiCoords = await orderPOIs(poiCoords);
                poiCoords.shift();

                updatedPOIs = sortPOIs(poiCoords, updatedPOIs, true);

                finalRouteArray = [...finalRouteArray, ...routeArray];
                finalPOIArray = [...finalPOIArray, ...updatedPOIs];
                poiArray = [];
                routeArray = [];
            } else {
                isValidRoute = false;
            }
        }
    }

    /**
     * The function `sortPOIs` takes in an array of coordinates, an array of updated points of interest,
     * and a boolean flag indicating whether the points of interest are features or not, and returns an
     * array of matching objects based on the coordinates.
     * @param {any[]} poiCoords - An array of coordinates representing points of interest (POIs).
     * @param {any[]} updatedPOIs - An array of objects representing points of interest (POIs). Each
     * object should have a `center` property that contains an array of coordinates [longitude,
     * latitude].
     * @param {boolean} isFeature - The `isFeature` parameter is a boolean value that indicates whether
     * the `updatedPOIs` array contains objects with a `features` property or not. If `isFeature` is
     * `true`, it means that each object in `updatedPOIs` has a `features` property, and the
     * @returns The function `sortPOIs` is returning an array of objects. Each object in the array is
     * found by matching the coordinates of `poiCoords` with the coordinates of `updatedPOIs`.
     */
    const sortPOIs = (poiCoords: any[], updatedPOIs: any[], isFeature: boolean) => {
        return poiCoords.map((center) => {
            const foundObject = updatedPOIs.find((obj) => {
                let objCenter = null;
                if (isFeature) {
                    objCenter = obj.features[0].center;
                } else {
                    objCenter = obj.center;
                }
                return objCenter[0] === center[0] && objCenter[1] === center[1];
            });

            return foundObject;
        });
    }

    /**
     * The function "orderPOIs" takes an array of coordinates and returns an efficient route by solving
     * the Traveling Salesman Problem.
     * @param {any[]} poiCoords - poiCoords is an array of coordinates representing points of interest
     * (POIs). Each coordinate is an object with latitude and longitude values.
     * @returns an array of coordinates representing the points of interest (POIs) in an efficient
     * order. If the matrix is not available, it will return the original array of POI coordinates.
     */
    async function orderPOIs(poiCoords: any[]) {
        const matrix = await fetchRouteMatrix(poiCoords);
        if (matrix != null) {
            let durationMatrix = matrix.distances
            let efficientRoute = solveTSP(durationMatrix);
            efficientRoute.unshift(0);
            return efficientRoute.map((index) => poiCoords[index]);
        }
        return poiCoords;
    }

    // Function to find the nearest neighbour
    const findNearestneighbour = (currentNode: number, remainingNodes: number[], durationMatrix: any[][]): number | undefined => {
        let nearestNode: number | undefined;
        let minDuration = Infinity;

        for (const node of remainingNodes) {
            const duration = durationMatrix[currentNode][node];
            if (duration < minDuration) {
                minDuration = duration;
                nearestNode = node;
            }
        }

        return nearestNode;
    };

    // Function to solve TSP using nearest neighbour algorithm
    function solveTSP(durationMatrix: any[][]) {
        const initialNode = 0; // Starting from the first node
        const remainingNodes = [...Array(durationMatrix.length).keys()].slice(1); // Exclude the starting node
        const route = [];

        let currentNode = initialNode;
        while (remainingNodes.length > 0) {
            const nearestneighbour = findNearestneighbour(currentNode, remainingNodes, durationMatrix);
            if (nearestneighbour != undefined) {
                route.push(nearestneighbour);
                currentNode = nearestneighbour;
                remainingNodes.splice(remainingNodes.indexOf(nearestneighbour), 1);
            }
        }
        return route;
    };

    /**
     * The function fetches nearby points of interest (POIs) along a given route by dividing the route
     * into sections and fetching POIs for each section.
     * @param {any} startCoordinates - The `startCoordinates` parameter represents the starting
     * coordinates of a route. It is an object with `latitude` and `longitude` properties, indicating
     * the latitude and longitude values of the starting point.
     * @param {any} endCoordinates - The `endCoordinates` parameter represents the latitude and
     * longitude coordinates of the end point of a route.
     * @returns an object with a property "features" that contains an array of Points of Interest
     * (POIs).
     */
    async function fetchNearByPOIs(startCoordinates: any, endCoordinates: any) {
        const limit = 1; // Minumum the number of POIs
        const desiredPOICount = 1; // The max number of POIs 
        const apiUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + routeType + '.json';
        const apiKey = Constants.expoConfig.extra.mapboxToken;

        // Array to store multiple proximity points along the route
        const proximityPoints = [];

        // The number of sections the route is divided into
        const numSections = 10;

        // Calculate the step size for dividing the route into sections
        const stepSize = {
            latitude: (endCoordinates.latitude - startCoordinates.latitude) / numSections,
            longitude: (endCoordinates.longitude - startCoordinates.longitude) / numSections,
        };

        // Create proximity points along the route
        for (let i = 1; i < numSections - 1; i++) {
            const sectionStart = {
                latitude: startCoordinates.latitude + i * stepSize.latitude,
                longitude: startCoordinates.longitude + i * stepSize.longitude,
            };

            // Add each section's proximity point to the array
            proximityPoints.push(`${sectionStart.longitude},${sectionStart.latitude}`);
        }

        try {
            // Fetch POIs for each proximity point
            const poiResponses = await Promise.all(
                proximityPoints.map(proximity => {
                    return axios.get(apiUrl, {
                        params: {
                            access_token: apiKey,
                            limit: limit,
                            proximity,
                            radius: 5000,
                            types: 'poi',
                        },
                    });
                })
            );

            const allPOIs = poiResponses
                .filter(response => response.status === 200 && response.data && response.data.features)
                .map(response => response.data.features)
                .flat(); // Flatten the array of features

            let duplicatesFilteredPOIs = allPOIs.filter(poi => !poi.properties.category.includes('hotel'));
            const startCenterAsString = JSON.stringify([startCoordinates.longitude, startCoordinates.latitude]);
            const endCenterAsString = JSON.stringify([endCoordinates.longitude, endCoordinates.latitude]);
            const centersToRemove = new Set(poiArray.map((obj) => JSON.stringify(obj.features[0].center)));
            centersToRemove.add(startCenterAsString);
            centersToRemove.add(endCenterAsString);
            const unusablePOICenters = new Set(unusablePOIArray.map((obj) => JSON.stringify(obj.features[0].center)));
            let filteredPOIs = [];

            for (const obj of duplicatesFilteredPOIs) {
                if (obj && obj.center) {
                    const centerAsString = JSON.stringify(obj.center);
                    if (!centersToRemove.has(centerAsString) && !unusablePOICenters.has(centerAsString)) {
                        centersToRemove.add(centerAsString);
                        filteredPOIs.push(obj);
                    }
                }
            }

            if (filteredPOIs.length <= desiredPOICount) {
                // If there are fewer or equal to desired POIs, return them all
                return { features: filteredPOIs };
            } else {
                // Shuffle the array and return the number of POIs you want
                const shuffledPOIs = shuffleArray(filteredPOIs);
                return { features: shuffledPOIs.slice(0, desiredPOICount) };
            }
        } catch (error) {
            console.log('Error fetching POIs:', error);
        }

        return { features: [] }; // Return an empty array to avoid destructuring issues
    }

   /**
    * The function shuffles an array by randomly swapping elements.
    * @param {any[]} array - The `array` parameter is an array of any type of elements.
    * @returns a shuffled version of the input array.
    */
    function shuffleArray(array: any[]) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
   /**
    * The function `navigateToRoute` checks if there are at least 2 selected cities, and if so, it
    * navigates to the 'Route' screen, updates the loading state, fetches data, checks if the route is
    * valid, and updates the loading state again.
    */
    const navigateToRoute = async () => {
        if (selectedCities.length < 2) {
            Alert.alert('No Route Available!', 'Please enter at least 2 names of a places to start planning.')
        } else {
            navigation.navigate('Route');
            dispatch(updateLoadingState(true));
            await fetchData();
            if (!isValidRoute) {
                Alert.alert('No Route Available!', 'Please choose places closer to each other.')
                navigation.navigate('Home');
            }
            dispatch(updateLoadingState(false));
        }
    }

    /**
     * The function `chipSelect` sets the selected chip and updates the route type based on the
     * selected chip.
     * @param {string} chip - The `chip` parameter is a string that represents the type of chip
     * selected. It can have one of the following values: 'food', 'sightseeing', 'museum', or
     * 'general'.
     */
    const chipSelect = (chip: string) => {
        if (chip === 'food') {
            setFoodChipSelected(true);
            setSightseeingChipSelected(false);
            setmuseumChipSelected(false);
            setGeneralChipSelected(false);
            setRouteType('food')
        } else if (chip === 'sightseeing') {
            setSightseeingChipSelected(true);
            setFoodChipSelected(false);
            setmuseumChipSelected(false);
            setGeneralChipSelected(false);
            setRouteType('outdoors')
        } else if (chip === 'museum') {
            setmuseumChipSelected(true);
            setFoodChipSelected(false);
            setSightseeingChipSelected(false);
            setGeneralChipSelected(false);
            setRouteType('museum')
        } else if (chip === 'general') {
            setGeneralChipSelected(true);
            setFoodChipSelected(false);
            setSightseeingChipSelected(false);
            setmuseumChipSelected(false);
            setRouteType('tourism')
        }
    }

    return (
        <SafeAreaProvider>
            <View
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                onLayout={onLayoutRootView}
            >
                <View style={styles.imageContainer}>
                    <ImageViewer placeholderImageSource={PlaceholderImage} />
                </View>
                <View style={styles.buttonContainer}>
                    <CitySelector />
                    {!noGivenPlaces &&
                        <View>
                            <Text>What kind of trip would you like to go on!</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 }}>
                                <Chip icon="car-hatchback" selected={generalChipSelected} showSelectedOverlay={true} onPress={() => chipSelect('general')}>General</Chip>
                                <Chip icon="warehouse" selected={museumChipSelected} showSelectedOverlay={true} onPress={() => chipSelect('museum')}>Museums</Chip>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 }}>
                                <Chip icon="food" selected={foodChipSelected} showSelectedOverlay={true} onPress={() => chipSelect('food')}>Food</Chip>
                                <Chip icon="camera" selected={sightseeingChipSelected} showSelectedOverlay={true} onPress={() => chipSelect('sightseeing')}>Sightseeing</Chip>
                            </View>
                        </View>
                    }
                </View>
                <View style={styles.footerContainer}>
                    <FAB icon='map-search' label="Start Route" onPress={navigateToRoute} />
                </View>
                <StatusBar style="auto" />
            </View>
        </SafeAreaProvider>
    );
}

const mapStateToProps = (state: { city: { selectedCities: any; }; }) => ({
    selectedCities: state.city.selectedCities,
});

export default connect(mapStateToProps)(Home);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 3,
        alignItems: 'center',
        width: 320,
    },
    footerContainer: {
        flex: 1,
        alignItems: 'center',
        width: 320,
    },
    lightContainer: {
        backgroundColor: '#5c623b',
    },
    darkContainer: {
        backgroundColor: '#242c40',
    },
});