import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { connect, useDispatch } from "react-redux";
import { Button, Modal, Portal, PaperProvider, useTheme, ActivityIndicator, Text, FAB } from "react-native-paper";
import { updatePoiOrder, clearPois, removePoi } from '../redux/actions';
import { ScaleDecorator, NestableDraggableFlatList, NestableScrollContainer } from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { getWikiPageId } from './api';
import { openMapsApp } from './mapApp';


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

const RouteGenerator = ({ selectedCities, selectedPs, loading }: { selectedCities: City[]; selectedPs: any[], loading: boolean }) => {
    const dispatch = useDispatch();
    const isEffectFinished = loading;
    const theme = useTheme();
    const [visible, setVisible] = React.useState(false);
    const [cityModalVisible, setCityModalVisible] = React.useState(false);
    const [selectedCity, setSelectedCity] = React.useState(null);
    const [selectedPois, setSelectedPois] = React.useState(null);
    const [visitText, setVisitText] = React.useState('Places we suggest to visit!');
    const [hotelText, setHotelText] = React.useState('Places we suggest to stay!');
    const swipeableRefs = {};
    const [currentPoi, setCurrentPoi] = React.useState(null);
    const [poiDescription, setPoiDescription] = React.useState(null);
    const [sections, setSections] = React.useState(null);

    type Section = {
        parentCity: number;
        title: string;
        data: any[];
    }
    React.useEffect(() => {
        // This block will run once after the initial render
        setSections(getSections(selectedPs));
    }, [selectedPs]);

    /**
     * The function "getSections" takes an array of data and returns an array of sections, where each
     * section contains a parent city, a title, and associated data items.
     * @param {any[]} data - The `data` parameter is an array of objects. Each object represents a city
     * and has a property `parentCity` which represents the ID of the parent city.
     * @returns The function `getSections` returns an array of objects. Each object in the array
     * represents a section and has the following properties:
     * - `parentCity`: the ID of the parent city
     * - `title`: the name of the parent city
     * - `data`: an array of associated items (objects from the `data` array that have a `parentCity`
     * property matching the ID of the parent
     */
    const getSections = (data: any[]) => {
        let s = selectedCities.map((city) => {
            const associatedPs = data.filter((item: { parentCity: number; }) => item.parentCity === city.id);
            return {
                parentCity: city.id,
                title: city.name,
                data: associatedPs.length > 0 ? associatedPs : [],
            };
        });
        return s;
    }

    /**
     * The handleDelete function removes a point of interest (poi) from a list and closes the swipeable
     * item.
     * @param {any[]} poi - The `poi` parameter is an array that represents a list of points of
     * interest (POIs). It is likely that each element in the array is an object that contains
     * information about a specific POI, such as its name, location, and other details.
     * @param {any} listIndex - The `listIndex` parameter represents the index of the list that
     * contains the item to be deleted.
     * @param {number} itemIndex - The `itemIndex` parameter is the index of the item within the `poi`
     * array that you want to delete.
     */
    const handleDelete = (poi: any[], listIndex: any, itemIndex: number) => {
        dispatch(removePoi(poi));
        closeSwipeable(listIndex, itemIndex);
    };

    /**
     * The function `closeSwipeable` closes a swipeable item at a specific list index and item index.
     * @param {any} listIndex - The `listIndex` parameter represents the index of the list that
     * contains the swipeable item. It is used to identify the specific list in which the swipeable
     * item is located.
     * @param {any} itemIndex - The `itemIndex` parameter represents the index of the item within a
     * list.
     */
    const closeSwipeable = (listIndex: any, itemIndex: any) => {
        const key = `${listIndex}-${itemIndex}`;
        if (swipeableRefs[key]) {
            swipeableRefs[key].current.close();
        }
    };

    /**
     * The function `showModal` sets the current point of interest, retrieves the description of the
     * point of interest from Wikidata, and sets the visibility of the modal to true.
     * @param item - The `item` parameter is an object that has a `features` property, which is an
     * array of objects. Each object in the `features` array has a `properties` property, which in turn
     * has a `wikidata` property.
     */
    const showModal = async (item: { features: { properties: { wikidata: any; }; }[]; }) => {
        setCurrentPoi(item);
        try {
            let wikidataItemId = item.features[0].properties.wikidata;
            setPoiDescription(await getWikiPageId(wikidataItemId));
        } catch (error) {
            console.log("Error getting Wiki page ID:", error);
            setPoiDescription('');
        }
        setVisible(true);
    }

    /**
     * The function `hideModal` sets the `poiDescription` state to 'Loading...' and sets the `visible`
     * state to false.
     */
    const hideModal = () => {
        setPoiDescription('Loading...');
        setVisible(false)
    };

    let finalPOIOrder = selectedPs;
   /**
    * The function "showCityModal" sets the selected city, filters the selected cities based on the
    * parent city, and updates the state variables for visitText, hotelText, and cityModalVisible.
    * @param {any} parentCity - The `parentCity` parameter is the ID of the city for which the modal is
    * being shown.
    */
    const showCityModal = (parentCity: any) => {
        setSelectedCity(parentCity);
        let cityRoute = selectedCities.filter((item: { id: number; }) => item.id === parentCity);
        if (cityRoute[0]?.route.length === 0) {
            setVisitText('We don\'t have any recommendations for this city yet!\n--------------------------------');
        }
        if (!cityRoute[0]?.hotels) {
            setHotelText('We don\'t have any hotel recommendations for this city yet!');
        }
        setCityModalVisible(true);
    };

    /**
     * The function `hideCityModal` sets the visibility of a city modal to false and updates the text
     * for suggested places to visit and stay.
     */
    const hideCityModal = () => {
        setCityModalVisible(false);
        setVisitText('Places we suggest to visit!')
        setHotelText('Places we suggest to stay!')
    }

   /**
    * The function `getCityRoute` filters the `selectedCities` array to find the city with the selected
    * ID, and returns its route if it exists, otherwise an empty array.
    * @returns The function `getCityRoute` returns the route of the selected city if it exists,
    * otherwise it returns an empty array.
    */
    const getCityRoute = () => {
        let cityRoute = selectedCities.filter((item: { id: number; }) => item.id === selectedCity);
        if (cityRoute[0]?.route) {
            return cityRoute[0]?.route;
        }
        return [];
    }

    /**
     * The function `getCityHotels` filters the `selectedCities` array to find the city with the
     * matching `selectedCity` id, and returns the hotels array of that city if it exists, otherwise it
     * returns an empty array.
     * @returns The function `getCityHotels` returns an array of hotels for the selected city. If the
     * selected city has hotels, it returns the array of hotels. Otherwise, it returns an empty array.
     */
    const getCityHotels = () => {
        let cityHotels = selectedCities.filter((item: { id: number; }) => item.id === selectedCity);
        if (cityHotels[0]?.hotels) {
            return cityHotels[0]?.hotels;
        }
        return [];
    }

    /**
     * The function updates the order of cities in the Redux store and performs some additional
     * actions.
     * @param  - - `data`: The updated order of cities after the move operation.
     */
    const onMoveEnd = ({ data }) => {
        // Update the order of cities in your Redux store
        setSelectedPois(data);
        setFinalPOIOrder(data);
        setSections(getSections(finalPOIOrder));
        dispatch(clearPois());
        dispatch(updatePoiOrder(finalPOIOrder));
    };

   /**
    * The function `setFinalPOIOrder` takes an array of data, creates a copy of it, and then rearranges
    * the elements based on a condition involving another array called `selectedPs`.
    * @param {any[]} data - The `data` parameter is an array of objects. Each object represents a point
    * of interest (POI) in a city.
    */
    const setFinalPOIOrder = (data: any[]) => {
        const cityPois = data.map((item) => item);
        finalPOIOrder = [];
        for (let i = 0; i < selectedPs.length; i++) {
            const element = selectedPs[i];
            if (element.parentCity === cityPois[0]?.parentCity) {
                finalPOIOrder.push(cityPois[0]);
                cityPois.shift();
            } else {
                finalPOIOrder.push(element);
            }
        }
    }


    const renderRightActions = (poi: any[], listIndex: any, itemIndex: number) => (
        <TouchableOpacity onPress={() => handleDelete(poi, listIndex, itemIndex)}>
            <View style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <PaperProvider>
            <View style={styles.container}>
                {isEffectFinished ? (
                    // Display the loading spinner while the effect is running
                    <ActivityIndicator animating={true} color="#3498db" size="large" />
                ) : (
                    <View>
                        <Portal>
                            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={[styles.containerStyle, { backgroundColor: theme.colors.background }]}>
                                <Text style={{ textAlign: 'center' }} variant='headlineSmall' >{currentPoi?.features[0].text}</Text>
                                <Text>{poiDescription}</Text>
                                <FAB icon='map-search' label="Open Directions" onPress={() => openMapsApp(currentPoi?.features[0].center[1], currentPoi?.features[0].center[0], currentPoi?.features[0].text)} />
                            </Modal>
                        </Portal>
                        <Portal>
                            <Modal visible={cityModalVisible} onDismiss={hideCityModal} contentContainerStyle={[styles.containerStyle, { backgroundColor: theme.colors.background }]}>
                                <NestableScrollContainer>
                                    <Text style={{ textAlign: 'center' }} variant='headlineSmall' >{visitText}</Text>
                                    <NestableDraggableFlatList
                                        data={getCityRoute()}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({ item }) => (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                                                <Text style={{ flex: 1, fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">{item.text}</Text>
                                                <FAB icon='map-search' onPress={() => openMapsApp(item.center[1], item.center[0], item.text)} />
                                            </View>
                                        )}
                                    />
                                    <Text style={{ textAlign: 'center' }} variant='headlineSmall' >{hotelText}</Text>
                                    <NestableDraggableFlatList
                                        data={getCityHotels()}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({ item }) => (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                                                    <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">{item.mapMarker.label}</Text>
                                                </View>
                                                <FAB icon='map-search' onPress={() => openMapsApp(item.mapMarker.latLong.latitude, item.mapMarker.latLong.longitude, item.name)} />
                                            </View>
                                        )}
                                    />
                                </NestableScrollContainer>
                            </Modal>
                        </Portal>
                        <NestableScrollContainer>
                            {sections?.map((list: Section, listIndex: any) => (
                                <View key={listIndex}>
                                    <Button icon='menu' style={styles.listItem} labelStyle={styles.cityText} contentStyle={styles.cityButton} mode='contained' onPress={() => showCityModal(list.parentCity)}>
                                        {list.title}
                                    </Button>
                                    <NestableDraggableFlatList
                                        data={list.data}
                                        renderItem={({ item, drag, isActive }) => {
                                            const index = list.data.indexOf(item);
                                            const key = `${listIndex}-${index}`;

                                            if (!swipeableRefs[key]) {
                                                swipeableRefs[key] = React.createRef();
                                            }

                                            return (
                                                <ScaleDecorator>
                                                    <Swipeable ref={swipeableRefs[key]} renderRightActions={() => renderRightActions(item, listIndex, index)}>
                                                        <Button style={styles.listItem} labelStyle={styles.text} contentStyle={styles.button} mode='elevated' onLongPress={drag} onPress={() => showModal(item)} disabled={isActive}>
                                                            Place: {item.features[0].text}
                                                        </Button>
                                                    </Swipeable>
                                                </ScaleDecorator>
                                            )
                                        }}
                                        keyExtractor={(item, index) => index.toString()}
                                        onDragEnd={onMoveEnd}
                                    />
                                </View>
                            ))}
                        </NestableScrollContainer>
                    </View>
                )}
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        backgroundColor: '#ff6961',
        padding: 10,
        height: 75,
        borderRadius: 8,
        margin: 3,

    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        margin: 10,
        textAlign: 'center',
    },
    listItem: {
        margin: 3,
        borderRadius: 8,
    },
    button: {
        height: 75,
    },
    cityButton: {
        height: 75,
        justifyContent: 'flex-start',
    },
    cityText: {
        fontSize: 20,
        margin: 10,
        textAlign: 'left',
    },
    text: {
        fontSize: 16,
        margin: 10,
        textAlign: 'center',
    },
    map: {
        flex: 1,
    },
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    lightThemeText: {
        color: '#000',
    },
    darkThemeText: {
        color: '#d0d0c0',
    },
    lightContainer: {
        backgroundColor: '#5c623b',
    },
    darkContainer: {
        backgroundColor: '#242c40',
    },
});

const mapStateToProps = (state: any) => ({
    selectedPois: state.city.selectedPois,
    routeCoords: state.city.routeCoords,
    loading: state.city.loading,
});

export default connect(mapStateToProps)(RouteGenerator);
