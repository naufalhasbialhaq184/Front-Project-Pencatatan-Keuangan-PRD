import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <Tabs initialRouteName="index">
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          headerShown: false,
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Expense",
          tabBarLabel: () => null, 
          tabBarIcon: () => (
            <View style={{
              top: -15, 
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#2196F3", 
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 5,
            }}>
              <Ionicons name="add" color="#fff" size={36} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: "Planning",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          )
        }}
      />
    </Tabs>
  )
}

