import { Stack, Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs initialRouteName="index">
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="index" options={{ headerShown: false, title: "Expense" }} />
      <Tabs.Screen name="planning" options={{ title: "Planning" }} />
      <Tabs.Screen name="setting" options={{ title: "Setting" }} />
    </Tabs>
  )
  
}

