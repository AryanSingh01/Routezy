import { Linking, Platform } from "react-native";

/**
   * The function `openMapsApp` opens the maps app on a device and displays a specific location using
   * latitude, longitude, and a label.
   * @param {any} latitude - The latitude parameter is the numerical value that represents the
   * north-south position of a location on the Earth's surface. It is used to specify the latitude of
   * the destination location in the maps app.
   * @param {any} longitude - The `longitude` parameter represents the longitude coordinate of a
   * location on the Earth's surface. It is a numerical value that specifies the east-west position of
   * the location.
   * @param {any} label - The `label` parameter is a string that represents the label or name of the
   * location on the map. It is used to provide additional information or context about the location.
   */
export const openMapsApp = (latitude: any, longitude: any, label: any) => {
    const coordinates = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `maps://app?daddr=${coordinates}&label=${label}`,
      android: `google.navigation:q=${coordinates}&label=${label}`,
    });

    Linking.openURL(url).catch(err => console.log('Error opening maps app', err));
  };