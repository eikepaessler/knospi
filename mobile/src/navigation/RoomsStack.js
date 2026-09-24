import { createStackNavigator } from '@react-navigation/stack';
import { RoomsScreen } from '../screens/RoomsScreen';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { PlantDetailScreen } from '../screens/PlantDetailScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export function RoomsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoomsMain" component={RoomsScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
