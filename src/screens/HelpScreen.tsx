import React from "react";
import { ScrollView, useColorScheme, Linking } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { FAB, useTheme } from "react-native-paper";

SplashScreen.preventAutoHideAsync();

/* The `HelpScreen` component is a functional component in a TypeScript React application. It is
responsible for rendering a help and support screen with frequently asked questions and a contact
support section. */
const HelpScreen = ({ navigation }) => {
    const colorScheme = useColorScheme();
    const theme = useTheme();

    const themeSubTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;

    const openEmail = (email) => {
        const url = `mailto:${email}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    console.log('Can\'t handle url: ' + url);
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.log('An error occurred', err));
    };

    return (
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background, justifyContent: 'center' }}>
            <View style={[styles.footerContainer, { backgroundColor: theme.colors.background }]} />
            <ScrollView style={styles.container}>
                <Text style={[styles.header, themeSubTextStyle]}>Help & Support</Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, themeSubTextStyle]}>Frequently Asked Questions</Text>
                    <Text style={[styles.question, themeSubTextStyle]}>How to create a route?</Text>
                    <Text style={[styles.answer, themeSubTextStyle]}>On the home page use the text box to search up a city you wish to visit. Click on the desired cities. Once a minimum of two cities have been selected the type of road trip you wish to enbark on can be chosen by selecting one of the category tags. Finally in order to generate your own route click on the Start Route button!</Text>
                    <Text style={[styles.question, themeSubTextStyle]}>How to edit the order of your route?</Text>
                    <Text style={[styles.answer, themeSubTextStyle]}>Go onto the route page which displays the overview of the route. If there are any POIs displayed here the order of them can be adjusted by holding and dragging them up and down in order to change the order.</Text>
                    <Text style={[styles.question, themeSubTextStyle]}>How to delete a POI?</Text>
                    <Text style={[styles.answer, themeSubTextStyle]}>Go onto the route page which displays the overview of the route. If there are any POIs displayed here the POI can be removed from the route by swiping left and pressing the red delete button.</Text>
                    <Text style={[styles.question, themeSubTextStyle]}>How to edit the order of cities?</Text>
                    <Text style={[styles.answer, themeSubTextStyle]}>Go on the home page and remove the cities by pressing the 'x' on the cities tags and re-select and regenerate the route.</Text>
                    <Text style={[styles.question, themeSubTextStyle]}>How to open directions to a POI?</Text>
                    <Text style={[styles.answer, themeSubTextStyle]}>On the route page click on the POI you wish to open directions to. This will open up a modal with a description of the POI if it exists and a button which will open the directions to the POI.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, themeSubTextStyle]}>Need More Help?</Text>
                    <Text style={[styles.paragraph, themeSubTextStyle]}>If you have more questions or need further assistance, please contact us.</Text>
                    <FAB icon='email' label="Contact Support" onPress={() => openEmail('as510@st-andrews.ac.uk')} />
                </View>
            </ScrollView>
        </SafeAreaProvider>
    );
}

export default HelpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
        padding: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    video: {
        width: '100%',
        height: 300,
    },
    question: {
        fontWeight: 'bold',
    },
    answer: {
        marginBottom: 10,
    },
    paragraph: {
        marginBottom: 10,
    },
    button: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
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
        flex: 0.1,
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