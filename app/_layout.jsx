import { Stack } from 'expo-router';
import { initLocalDb } from "../database/localDb"
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    initLocalDb();
  }, [])
  return (
    <Stack>
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen name="category" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="debugger" />
    </Stack>
  );
  
}
