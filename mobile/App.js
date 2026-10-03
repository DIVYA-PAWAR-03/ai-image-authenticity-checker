/**
 * App.js
 * ──────
 * Root component — sets up navigation stack for the app.
 *
 * Screens:
 *   Home    → Pick an image
 *   Loading → Upload + analyze (calls backend)
 *   Result  → Show verdict
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import HomeScreen    from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen  from './src/screens/ResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0f0f1a" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0f0f1a',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            cardStyle: { backgroundColor: '#0f0f1a' },
            animationEnabled: true,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{
              headerShown: false,
              gestureEnabled: false, // Prevent swipe-back during analysis
            }}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{
              title: 'Analysis Result',
              headerLeft: () => null, // No back button on result
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});
