import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes/scan"
        options={{
          title: 'Scan NFC',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="nfc" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes/write"
        options={{
          title: 'Write NFC',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="pencil" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes/settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
