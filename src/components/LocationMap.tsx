import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {fetchRouteCoordinates, getWikiPageId} from './api';
import { FAB, Modal, Portal, useTheme, Text } from 'react-native-paper';
import { openMapsApp } from './mapApp';
interface MapScreenProps {
  selectedCities: {
    id: number;
    name: string;
    country: string;
    state: string;
    longitude: number;
    latitude: number;
    bbox: number[];
    route: any[];
    hotels: any[];
  }[];
  selectedPois: any[];
}

const LocationMap: React.FC<MapScreenProps> = ({ selectedCities, selectedPois }) => {
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [routeArrayState, setRouteCoordinates] = useState<any[]>([]);
  const [poiArrayState, setPOIs] = useState<any[]>([]);
  const [cityRoutes, setCityRoutes] = useState<any[]>([]);
  const [cityHotels, setCityHotels] = useState<any[]>([]);
  const [cityPOIs, setCityPOIs] = useState<any[]>([]);
  const [visible, setVisible] = React.useState(false);
  const [visibleHotel, setVisibleHotel] = React.useState(false);
  const [currentPoi, setCurrentPoi] = React.useState(null);
  const [currentHotel, setCurrentHotel] = React.useState(null);
  const [poiDescription, setPoiDescription] = React.useState(null);

  const theme = useTheme();

  let routeCoordinates: any[] = [];
  let cityRouteCoordinates: any[] = [];
  let totalCityRouteCoordinates: any[] = [];
  let totalCityHotels: any[] = [];
  let poiArray: any[] = [];
  let cityPoiArray: any[] = [];
  /* This code is a useEffect hook for the map screen. It is responsible for fetching
  data based on the selectedCities and mapRegion state variables and updating the values of each relevant variable */
  useEffect(() => {
    async function fetchData() {
      if (selectedCities.length > 0) {
        try {

          // Fetch route coordinates
          /* This code is iterating over an array of selected cities. For each city, it adds the
          city's longitude and latitude to a routeCoordinates array. */
          for (let i = 0; i < selectedCities.length - 1; i++) {
            const parentCity = selectedCities[i];
            routeCoordinates.push([parentCity.longitude, parentCity.latitude]);

            if (parentCity.hotels != null && parentCity.hotels.length > 0) {
              for (let j = 0; j < parentCity.hotels.length; j++) {
                const hotel = parentCity.hotels[j];
                totalCityHotels.push(hotel);
              }
            }
            for (let j = 0; j < selectedPois.length; j++) {
              const poi = selectedPois[j];
              if (poi.parentCity === parentCity.id) {
                routeCoordinates.push(poi.features[0].center);
                poiArray.push(poi);
              } else {
                continue;
              }
            }
            if (parentCity.route.length > 0) {
              cityRouteCoordinates = [];
              cityRouteCoordinates.push([parentCity.longitude, parentCity.latitude]);
              for (let i = 0; i < parentCity.route.length; i++) {
                const poi = parentCity.route[i];
                cityRouteCoordinates.push(poi.center);
                cityPoiArray.push(poi);
              }
              cityRouteCoordinates.push([parentCity.longitude, parentCity.latitude]);
              const currRoute = [await fetchRouteCoordinates(cityRouteCoordinates)];
              totalCityRouteCoordinates.push(currRoute);
            }
          }

          const lastCity = selectedCities[selectedCities.length - 1];
          routeCoordinates.push([lastCity.longitude, lastCity.latitude]);
          if (lastCity.hotels != null && lastCity.hotels.length > 0) {
            for (let j = 0; j < lastCity.hotels.length; j++) {
              const hotel = lastCity.hotels[j];
              totalCityHotels.push(hotel);
            }
          }
          if (lastCity.route != null && lastCity.route.length > 0) {
            cityRouteCoordinates = [];
            cityRouteCoordinates.push([lastCity.longitude, lastCity.latitude]);
            for (let i = 0; i < lastCity.route.length; i++) {
              const poi = lastCity.route[i];
              cityRouteCoordinates.push(poi.center);
              cityPoiArray.push(poi);
            }
            cityRouteCoordinates.push([lastCity.longitude, lastCity.latitude]);
            const currRoute = [await fetchRouteCoordinates(cityRouteCoordinates)];
            totalCityRouteCoordinates.push(currRoute);
          }
          const route = [await fetchRouteCoordinates(routeCoordinates)];

          setRouteCoordinates(route);
          setPOIs(poiArray);
          setCityPOIs(cityPoiArray);
          setCityRoutes(totalCityRouteCoordinates);
          setCityHotels(totalCityHotels);

          for (let i = 0; i < route.length; i++) {
            const routeData = route[i];
            if (routeData.bbox.length != 0) {
              const minLongitude = routeData.bbox[0]
              const minLatitude = routeData.bbox[1]
              const maxLongitude = routeData.bbox[2]
              const maxLatitude = routeData.bbox[3]
              const region = {
                latitude: (minLatitude + maxLatitude) / 2,
                longitude: (minLongitude + maxLongitude) / 2,
                latitudeDelta: maxLatitude - minLatitude + 0.1,
                longitudeDelta: maxLongitude - minLongitude + 0.1,
              };

              setMapRegion(region);
            }
          }
        } catch (error) {
          console.error('Error fetching route data:', error);
        }
      }
    }

    if (!mapRegion) {
      fetchData();
    }
  }, [selectedCities, mapRegion]);

  const showHotelModal = (hotel: any) => {
    setCurrentHotel(hotel);
    setVisibleHotel(true);
  }

  const hideHotelModal = () => {
    setVisibleHotel(false)
  };

 /**
  * The function `showModal` sets the current point of interest, retrieves the description of the point
  * of interest from a Wikipedia page using its Wikidata ID, and then sets the visibility of the modal
  * to true.
  * @param item - The `item` parameter is an object that contains a `properties` property, which in
  * turn contains a `wikidata` property. The `wikidata` property is expected to be of type `any`.
  */
  const showModal = async (item: { properties: { wikidata: any; }; }) => {
    setCurrentPoi(item);
    try {
      let wikidataItemId = item.properties.wikidata;
      setPoiDescription(await getWikiPageId(wikidataItemId));
    } catch (error) {
      console.log("Error getting Wiki page ID:", error);
      setPoiDescription('');
    }
    setVisible(true);
  }


  const hideModal = () => {
    setPoiDescription('Loading...');
    setVisible(false)
  };

  return (
    <View style={styles.container}>
      {mapRegion && (
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
        >
          {selectedCities.map((coord, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: coord.latitude,
                longitude: coord.longitude,
              }}
              title={coord.name}
              description={'Point ' + (index + 1)}
            />
          ))}

          {routeArrayState.map((route, index) => (
            route.routeCoordinates.length > 0 && (
              <Polyline
                key={index}
                coordinates={route.routeCoordinates}
                strokeColor="#3498db"
                strokeWidth={4}
              />
            )
          ))}

          {cityRoutes.map((route, index) => (
            route[0]?.routeCoordinates.length > 0 && (
              <Polyline
                key={index}
                coordinates={route[0].routeCoordinates}
                strokeColor="yellow"
                strokeWidth={4}
              />
            )
          ))}

          {cityPOIs.map((poi, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: poi.center[1],
                longitude: poi.center[0],
              }}
              onPress={() => showModal(poi)}
            />
          ))}

          {poiArrayState.map((poi, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: poi.features[0].center[1],
                longitude: poi.features[0].center[0],
              }}
              onPress={() => showModal(poi.features[0])}
            />
          ))}

          {cityHotels.map((hotel, index) => (
            <Marker
              key={index}
              pinColor='forestgreen'
              coordinate={{
                latitude: hotel?.mapMarker.latLong.latitude,
                longitude: hotel?.mapMarker.latLong.longitude,
              }}
              onPress={() => showHotelModal(hotel)}
            />
          ))}
        </MapView>
      )}
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={[styles.containerStyle, { backgroundColor: theme.colors.background }]}>
          <Text variant="headlineLarge">{currentPoi?.text}</Text>
          <Text variant='bodyMedium'>{poiDescription}</Text>
          <FAB icon='map-search' label="Open Directions" onPress={() => openMapsApp(currentPoi?.center[1], currentPoi?.center[0], currentPoi?.text)} />
        </Modal>
      </Portal>
      <Portal>
        <Modal visible={visibleHotel} onDismiss={hideHotelModal} contentContainerStyle={[styles.containerStyle, { backgroundColor: theme.colors.background }]}>
          <Text variant="headlineLarge">{currentHotel?.name}</Text>
          <Text variant='headlineSmall'>{currentHotel?.mapMarker.label}</Text>
          <FAB icon='map-search' label="Open Directions" onPress={() => openMapsApp(currentHotel?.mapMarker?.latLong?.latitude, currentHotel?.mapMarker?.latLong?.longitude, currentHotel?.name)} />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  containerStyle: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
    position: 'absolute',
    width: '90%',
    bottom: 0,
  },
});

export default LocationMap;