import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen';
import FormFlowScreen from './src/screens/FormFlowScreen';

export type RootStackParamList = {
  Home: undefined;
  FormFlow: { situation?: string; pdfUri?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FormFlow" component={FormFlowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
