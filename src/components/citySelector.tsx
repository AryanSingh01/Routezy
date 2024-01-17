import React, { Component } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import CityItem from './CityItem';
import { addPlace, removePlace } from '../redux/actions';
import { connect } from 'react-redux';
import { TextInput, Button } from 'react-native-paper';

interface CitySelectorProps {
  selectedCities: City[];
  addPlace: (city: City) => void;
  removePlace: (city: City) => void;
}

interface CitySelectorState {
  userInput: string;
  selectedCities: City[];
  cities: City[];
}

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

class CitySelector extends Component<CitySelectorProps, CitySelectorState> {
  constructor(props: CitySelectorProps) {
    super(props);
    this.state = {
      userInput: '',
      selectedCities: [],
      cities: [],
    };
  }

  /* The `handleInputChange` function is an event handler that is called when the user types into the
  TextInput component. It takes the input text as a parameter and updates the `userInput` state with
  the new text. */
  handleInputChange = (text: string) => {
    this.setState({ userInput: text });

    const apiEndpoint = `https://wanderlog.com/api/geo/autocomplete/${text}`;

    axios
      .get(apiEndpoint)
      .then((response) => {
        const cities = response.data.data.map((cityData: any) => ({
          id: cityData.id,
          name: cityData.name,
          country: cityData.countryName || '',
          state: cityData.stateName || '',
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          bbox: cityData.bounds,
          route: [],
          hotels: [],
        }));
        this.setState({ cities });
      })
      .catch((error) => {
        console.error('Error fetching cities:', error);
      });
  };

  /* The `handleCitySelect` function is called when a city is selected from the list of cities. It
  takes the selected city as a parameter. */
  handleCitySelect = (city: City) => {
    const cityId = city.id;
    if (!this.props.selectedCities.some((selectedCity) => selectedCity.id === cityId)) {
      this.props.addPlace(city);
      this.setState({ userInput: '' });
      this.handleInputChange('');
    }
  };

  removeSelectedCity = (cityToRemove: City) => {
    this.props.removePlace(cityToRemove);
  };

  renderCityItem = ({ item }: { item: City }) => (
    <CityItem
      city={item}
    />
  );

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          onChangeText={this.handleInputChange}
          value={this.state.userInput}
          placeholder="Type a city..."
          mode='outlined'
          label={'Select a City'}
        />
        <View style={styles.apiContainer}>
          <FlatList
            data={this.props.selectedCities}
            renderItem={this.renderCityItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
          />
          <FlatList
            data={this.state.cities}
            renderItem={({ item }: { item: City }) => (
              <Button mode='elevated' onPress={() => this.handleCitySelect(item)} style={styles.listItem}>
                {item.state
                  ? `${item.name}, ${item.state}, ${item.country}`
                  : `${item.name}, ${item.country}`}
              </Button>
            )}
            keyExtractor={(item, index) => `${item.id}-${index}`}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: { city: { selectedCities: City[] } }) => ({
  selectedCities: state.city.selectedCities,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  apiContainer: {
    flex: 1,
  },
  selectedCitiesContainer: {
    flex: 1,
    padding: 16,
  },
  listItem: {
    padding: 10,
    margin: 3,
  },
  cityText: {
    fontSize: 16,
  },
  selectedCitiesLabel: {
    fontSize: 18,
    marginTop: 16,
  },
  selectedCityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
  },
  selectedCityText: {
    fontSize: 16,
  },
});

export default connect(mapStateToProps, { addPlace, removePlace })(CitySelector);
