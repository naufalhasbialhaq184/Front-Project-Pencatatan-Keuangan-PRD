import { Stack } from "expo-router";
import { useEffect } from "react";
import { initLocalDb } from "../database/localDb";
export default function RootLayout() {
  useEffect(() => {
    initLocalDb();
  }, []);
  return (
    <Stack>
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen
        name="category"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen name="debugger" />
    </Stack>
  );
  // Bhap 2
}
