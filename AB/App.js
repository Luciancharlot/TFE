import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import OrderScreen from './screens/OrderScreen';
import ProAnalytics from './screens/ProAnalytics';
import FormScreen from './screens/FormScreen';
import Chatbot from './screens/Chatbot';
import BeerDetails from './screens/BeerDetails';
import Cart from './screens/Cart';
import Login from './screens/Login';
import ProfessionalHome from './screens/ProfessionalHome';
import OrdersInProgress from './screens/OrdersInProgress';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Order" component={OrderScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ProAnalytics" component={ProAnalytics} options={{ headerShown: false }}/>
        <Stack.Screen name="Form" component={FormScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }}/>
        <Stack.Screen name="BeerDetails" component={BeerDetails} options={{ headerShown: false }}/>
        <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/> 
        <Stack.Screen name="ProfessionalHome" component={ProfessionalHome} options={{ headerShown: false }}/>
        <Stack.Screen name="OrdersInProgress" component={OrdersInProgress} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
