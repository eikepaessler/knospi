import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PlantDetailScreen } from '../screens/PlantDetailScreen';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createStackNavigator();

// Eigener Stack je Tab, damit die Fussnavigation (TabBar) beim Aufrufen von
// Unterseiten wie Pflanzen-/Raum-Detail sichtbar bleibt - vorher lagen diese
// Screens direkt im Root-Stack ausserhalb der Tabs und haben die TabBar
// beim Navigieren komplett verdeckt.
export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
