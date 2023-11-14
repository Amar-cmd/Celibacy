
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import HomeScreen from './src/screens/HomeScreen';

function App(): JSX.Element {


  return (
    <SafeAreaView style={{flex:1}}>
     <HomeScreen/>
    </SafeAreaView>
  );
}

export default App;
