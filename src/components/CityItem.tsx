import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { removePlace } from '../redux/actions';
import { Chip } from 'react-native-paper';

interface CityItemProps {
  city: {
    id: number;
    name: string;
    country: string;
    state: string;
    longitude: number;
    latitude: number;
  };
  removePlace: (city:any) => void;
}

/**
 * The CityItem component renders a Chip component with the name
 * of a city and an icon, and handles the deletion of the city when the close icon is clicked.
 * @param  - - `city`: The city object that contains information about the city (e.g., name,
 * population, etc.).
 * @returns The CityItem component is returning a View component that contains a Chip component. The
 * Chip component displays the name of the city and has an icon and a close button. When the close
 * button is clicked, the handleDelete function is called, which dispatches the removePlace action with
 * the city as an argument.
 */
const CityItem: React.FC<CityItemProps> = ({ city, removePlace }) => {

  const handleDelete = () => {
    removePlace(city); // Dispatch the removePlace action
  };

  return (
      <View style={styles.cityItemContainer}>
        <Chip icon="city-variant-outline" onClose={handleDelete} closeIcon="close" >
          {city.name}
        </Chip>
      </View>
  );
};

const styles = StyleSheet.create({
  cityItemContainer: {
    padding: 1,
    marginBottom: 1,
  },
});

export default connect(null, { removePlace })(CityItem); // Connect to Redux and pass null for mapStateToProps