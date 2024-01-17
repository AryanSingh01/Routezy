import 'react-native-gesture-handler';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import Home from './screens/Home';
import Route from './screens/Route';
import HelpScreen from './screens/HelpScreen';
import React from 'react';
import { Provider } from 'react-redux';
import { BottomNavigation, PaperProvider } from 'react-native-paper';
import { Store } from './redux/store';
import MapScreen from './screens/MapScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={Store}>
        <PaperProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
              }}
              tabBar={({ navigation, state, descriptors, insets }) => (
                <BottomNavigation.Bar
                  navigationState={state}
                  safeAreaInsets={insets}
                  onTabPress={({ route, preventDefault }) => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (event.defaultPrevented) {
                      preventDefault();
                    } else {
                      navigation.dispatch({
                        ...CommonActions.navigate(route.name, route.params),
                        target: state.key,
                      });
                    }
                  }}
                  renderIcon={({ route, focused, color }) => {
                    const { options } = descriptors[route.key];
                    if (options.tabBarIcon) {
                      return options.tabBarIcon({ focused, color, size: 24 });
                    }
                    return null;
                  }}
                />
              )}
            >
              <Tab.Screen
                name="Home"
                component={Home}
                options={{
                  tabBarIcon: ({ color, size }) => {
                    return <Icon name="home" size={size} color={color} />;
                  },
                }}
              />
              <Tab.Screen
                name="Route"
                component={Route}
                options={{
                  tabBarIcon: ({ color, size }) => {
                    return <Icon name="routes" size={size} color={color} />;
                  },
                }}
              />
              <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                  tabBarIcon: ({ color, size }) => {
                    return <Icon name="map" size={size} color={color} />;
                  },
                }}
              />
              <Tab.Screen
                name="Help"
                component={HelpScreen}
                options={{
                  tabBarIcon: ({ color, size }) => {
                    return <Icon name="help" size={size} color={color} />;
                  },
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}