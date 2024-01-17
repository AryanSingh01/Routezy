import Constants from 'expo-constants';
import axios from 'axios';

/**
 * The `getWikiPageId` function fetches data from the Wikidata API based on a given Wikidata item ID
 * and returns the title of the English Wikipedia page associated with that item ID, or the title of
 * the Simple English Wikipedia page if the English page is not available.
 * @param {string} wikidataItemId - The `wikidataItemId` parameter is a string that represents the
 * unique identifier of an item in Wikidata. It is used to fetch information about the item from the
 * Wikidata API.
 * @returns The function `getWikiPageId` returns a promise that resolves to the result of the
 * `getWikiDescription` function.
 */
export const getWikiPageId = (wikidataItemId: string) => {
    return fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataItemId}&format=json`)
        .then(response => response.json())
        .then(data => {
            let description = data.entities[`${wikidataItemId}`].sitelinks?.enwiki?.title;
            if (description === undefined) {
                description = data.entities[`${wikidataItemId}`].sitelinks?.simplewiki?.title;
            }
            return getWikiDescription(description); // Return the promise from getWikiDescription
        })
        .catch(error => {
            console.log('Error fetching wiki item data:', error);
            return ('');
        });
}

/**
 * The `getWikiDescription` function fetches the Wikipedia description of a page using its page ID and
 * returns the extracted description.
 * @param {string} pageId - The `pageId` parameter is a string that represents the unique identifier of
 * a Wikipedia page. It is used to fetch the description or extract of the page from the Wikipedia API.
 * @returns The function `getWikiDescription` returns a Promise that resolves to a string representing
 * the extracted description from the Wikipedia page with the given `pageId`.
 */
const getWikiDescription = (pageId: string) => {
    return fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${pageId}`)
        .then(response => response.json())
        .then(data => {
            const page = data.query.pages[Object.keys(data.query.pages)[0]];
            const match = page.extract.match(/<p><b>.*?<\/p>/s);
            const extract = match ? match[0].replace(/<[^>]*>/g, '') : '';
            console.log(extract);
            return extract;
        })
        .catch(error => {
            console.log('Error fetching wiki description:', error);
            return ('');
        });
};

/**
 * The function fetches a route using the OpenRouteService API by sending a POST request with
 * coordinates and an API key, and returns the response data if the request is successful.
 * @param {string | any[]} coordArray - The `coordArray` parameter is an array of coordinates that
 * represent the waypoints of the route. Each coordinate should be in the format `[longitude,
 * latitude]`. For example, `coordArray` could be `[[12.34, 56.78], [23.45, 67.
 * @returns the response data if the request is successful and the status code is 200. If there is an
 * error or the status code is not 200, the function returns null.
 */
export async function fetchRoute(coordArray: string | any[]) {
    const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
    const apiKey = Constants.expoConfig.extra.openRouteService;

    try {
        const request = await axios.post(apiUrl, { coordinates: coordArray }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (request.status === 200) {
            const response = request.data;
            return response;
        }
    } catch (error) {
        console.log('Error fetching route coordinates:', error);
    }

    return null;
}

/**
 * The function fetches a route matrix using the OpenRouteService API, given a set of points of
 * interest coordinates.
 * @param {string | any[]} poiCoords - poiCoords is a parameter that can be either a string or an array
 * of coordinates. These coordinates represent the points of interest (POIs) for which you want to
 * calculate the route matrix.
 * @returns the response data if the request is successful (status code 200). If there is an error or
 * the request is not successful, it returns null.
 */
export async function fetchRouteMatrix(poiCoords: string | any[]) {
    const apiUrl = 'https://api.openrouteservice.org/v2/matrix/driving-car';
    const apiKey = Constants.expoConfig.extra.openRouteService;
    try {
        const request = await axios.post(apiUrl, { locations: poiCoords, metrics: ['distance'] }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (request.status === 200) {
            const response = request.data;
            return response;
        }
    } catch (error) {
        console.log('Error fetching route matrix:', error);
    }
    return null;
}

/**
 * The function fetchRouteCoordinates takes an array of coordinates, fetches the route data using those
 * coordinates, and returns an object containing the route time, route coordinates, and bounding box.
 * @param {string | any[]} coordArray - The `coordArray` parameter is expected to be a string or an
 * array of coordinates. These coordinates can be in any format that is compatible with the
 * `fetchRoute` function.
 * @returns an object containing the route time, route coordinates, and bounding box of the route. If
 * the response is null or does not contain any features, the function returns null.
 */
export async function fetchRouteCoordinates(coordArray: string | any[]) {
    const response = await fetchRoute(coordArray);
    if (response && response.features && response.features.length > 0) {
        const route = response.features[0].geometry.coordinates;
        const routeCoordinates = route.map((coord: any[]) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));
        const routeTime = response.features[0].properties.summary.duration / 60;
        //Return an object containing routeTime and routeCoordinates
        const routeData = {
            routeTime: routeTime,
            routeCoordinates: routeCoordinates,
            bbox: response.features[0].bbox,
        }
        return routeData;
    }
    return null;
}