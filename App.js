import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import WelcomeScreen    from './src/screens/WelcomeScreen';
import NavigationScreen from './src/screens/NavigationScreen';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  return (
    <View style={styles.root}>
      {screen === 'welcome'
        ? <WelcomeScreen    onStart={() => setScreen('navigate')} />
        : <NavigationScreen onBack={()  => setScreen('welcome')}  />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A2544',
    ...(Platform.OS === 'web' && { height: '100vh', overflow: 'hidden' }),
  },
});