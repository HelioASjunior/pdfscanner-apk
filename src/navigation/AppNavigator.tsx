import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, TouchableOpacity } from 'react-native';
import { Colors, FontSize } from '../utils/theme';

import HomeScreen from '../screens/HomeScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import CameraScreen from '../screens/CameraScreen';
import EditorScreen from '../screens/EditorScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import CropAdjustmentScreen from '../screens/CropAdjustmentScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      {focused && (
        <View style={{
          width: 4, height: 4, borderRadius: 2,
          backgroundColor: Colors.accent,
          position: 'absolute', top: -8,
        }} />
      )}
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{
        fontSize: 10, fontWeight: '600',
        color: focused ? Colors.accent2 : Colors.text3,
      }}>{label}</Text>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.surface3,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Início" icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Docs" icon="📁" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginTop: -8, color: Colors.accent2 }}>⊕</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: focused ? Colors.accent2 : Colors.text3 }}>
                Escanear
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Config." icon="⚙️" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="CropAdjustment"
          component={CropAdjustmentScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
