//This screen will display a map using react leaflet and the selected cities from the home screen

import React, { useState } from "react";
import { connect } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "react-native";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import LocationMap from "../components/LocationMap";
import { FAB, useTheme } from "react-native-paper";

SplashScreen.preventAutoHideAsync();

/* The `MapScreen` shows the map with the route on it. It receives
several props: `navigation`, `selectedCities`, `routeCoords`, and `selectedPois`. */
const MapScreen = ({ navigation, selectedCities, routeCoords, selectedPois }) => {
    const colorScheme = useColorScheme();
    const [isScreenFocused, setScreenFocused] = useState(true);
    const theme = useTheme();

    useFocusEffect(
        React.useCallback(() => {
            setScreenFocused(true);

            return () => {
                setScreenFocused(false);
            };
        }, [])
    );
    const noGivenPlaces = (selectedCities === undefined || selectedCities.length < 2) ? true : false;
    const themeSubTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
    const [fontsLoaded, fontError] = useFonts({
        'Inter-Black': require('./../../assets/fonts/Inter-Black.otf'),
    });

    if (!fontsLoaded && !fontError) {
        return null;
    }

    const navigateToRoute = () => {
        navigation.navigate('Home');
    }

    return (
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background, justifyContent: 'center' }}>
            {isScreenFocused && !noGivenPlaces && (<LocationMap selectedCities={selectedCities} selectedPois={selectedPois} />)}
            {noGivenPlaces && (<Text style={[styles.text, themeSubTextStyle]}>Please go to the home page and select at least 2 destinations to visit!</Text>)}
            {noGivenPlaces && <FAB icon='home' label="Go Home" onPress={navigateToRoute} />}
        </SafeAreaProvider>
    );
}

const mapStateToProps = (state: any) => ({
    selectedCities: state.city.selectedCities,
    selectedPois: state.city.selectedPois,
});

export default connect(mapStateToProps)(MapScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    lightContainer: {
        backgroundColor: '#5c623b',
    },
    darkContainer: {
        backgroundColor: '#242c40',
    },
    buttonContainer: {
        flex: 3,
        alignItems: 'center',
    },
    footerContainer: {
        flex: 1,
        alignItems: 'center',
    },
    lightThemeText: {
        color: '#000',
    },
    darkThemeText: {
        color: '#d0d0c0',
    },

    darkHeaderTextStyle: {
        color: '#d0d0c0',
        fontFamily: 'Inter-Black',
        fontSize: 30,
    },
    lightHeaderTextStyle: {
        color: '#000',
        fontFamily: 'Inter-Black',
        fontSize: 30,
    },
    text: {
        fontSize: 16,
        margin: 10,
        textAlign: 'center',
        justifyContent: 'center',
    },
});