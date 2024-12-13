import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import OrderScreen from './screens/OrderScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import FormScreen from './screens/FormScreen';
import Chatbot from './screens/Chatbot';
import BeerDetails from './screens/BeerDetails';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Order" component={OrderScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Form" component={FormScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }}/>
        <Stack.Screen name="BeerDetails" component={BeerDetails} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
