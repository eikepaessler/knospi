import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs } from './MainTabs';
import { AddPlantScreen } from '../screens/AddPlantScreen';
import { DoctorFlowScreen } from '../screens/DoctorFlowScreen';
import { SensorOnboardingScreen } from '../screens/SensorOnboardingScreen';

const Stack = createStackNavigator();

// RoomDetail/PlantDetail/Shop/Profile leben jetzt in den einzelnen Tab-
// Stacks (siehe HomeStack/RoomsStack/DoctorStack), damit die TabBar dort
// sichtbar bleibt. Hier oben bleiben nur noch die vollflaechigen Modal-
// Assistenten, bei denen ein Verdecken der TabBar wie erwartet wirkt.
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="DoctorFlow" component={DoctorFlowScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SensorOnboarding" component={SensorOnboardingScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
