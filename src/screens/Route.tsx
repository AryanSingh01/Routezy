import { useFonts } from 'expo-font';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useCallback } from 'react';
import { FAB, PaperProvider, useTheme } from "react-native-paper";
import * as SplashScreen from 'expo-splash-screen';
import { connect } from "react-redux";
import RouteGenerator from '../components/RouteGenerator';


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

/* The `Route` component is a functional component that renders a view for displaying a route. It takes
in three props: `navigation`, `selectedCities`, and `selectedPois`. */
const Route = ({ navigation, selectedCities, selectedPois }: { navigation: any; selectedCities: City[]; selectedPois: any[] }) => {
    const colorScheme = useColorScheme();
    const theme = useTheme();

    const noGivenPlaces = (selectedCities === undefined || selectedCities.length < 2) ? true : false;
    const themeSubTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
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

    const navigateToRoute = () => {
        navigation.navigate('Home');
    }

    const navigateToMap = () => {
        navigation.navigate('Map');
    }

    return (
        <PaperProvider>
            <SafeAreaProvider>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}
                    onLayout={onLayoutRootView}
                >
                    <View style={styles.footerContainer} />
                    <View style={[styles.buttonContainer, { justifyContent: 'center' }]}>
                        {noGivenPlaces ?
                            <Text style={[styles.text, themeSubTextStyle]}>Please go to the home page and select at least 2 destinations to visit!</Text>
                            :
                            <RouteGenerator selectedCities={selectedCities} selectedPs={selectedPois} />
                        }

                    </View>
                    <View style={styles.footerContainer}>
                        {noGivenPlaces ?
                            <FAB style={styles.fab} icon='home' label="Go Home" onPress={navigateToRoute} />
                            :
                            <FAB style={styles.fab} icon='map-search' label="View Map" onPress={navigateToMap} />
                        }
                    </View>

                </View>
            </SafeAreaProvider>
        </PaperProvider>
    );
}

const mapStateToProps = (state: any) => ({
    selectedCities: state.city.selectedCities,
    selectedPois: state.city.selectedPois,
});

export default connect(mapStateToProps)(Route);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    listItem: {
        margin: 3,
    },
    button: {
        height: 100,
    },
    imageContainer: {
        flex: 1 / 4,
        alignItems: 'center',
    },
    draggableItem: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    activeItem: {
        backgroundColor: 'lightblue',
    },
    fab: {
        margin: 16,
    },
    lightContainer: {
        backgroundColor: '#5c623b',
    },
    darkContainer: {
        backgroundColor: '#242c40',
    },
    buttonContainer: {
        flex: 3,
        alignItems: 'stretch',
    },
    footerContainer: {
        flex: 0.5,
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
    item: {
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        margin: 10,
        textAlign: 'center',
    },
});