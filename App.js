
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import SearchScreen from './screens/SearchScreen';
import BookTransactionScreen from './screens/BookTransactionScreen';

export default class App extends React.Component{
  render(){
    return (
      <AppContainer/>
    );
}
}

const TabNavigator = createBottomTabNavigator({
  Transaction:{screen:BookTransactionScreen},
  SearchSCreen:{screen:SearchScreen}
});

const AppContainer = createAppContainer(TabNavigator);