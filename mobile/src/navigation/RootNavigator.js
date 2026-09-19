import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs } from './MainTabs';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { PlantDetailScreen } from '../screens/PlantDetailScreen';
import { AddPlantScreen } from '../screens/AddPlantScreen';
import { DoctorFlowScreen } from '../screens/DoctorFlowScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SensorOnboardingScreen } from '../screens/SensorOnboardingScreen';

const Stack = createStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="DoctorFlow" component={DoctorFlowScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SensorOnboarding" component={SensorOnboardingScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
