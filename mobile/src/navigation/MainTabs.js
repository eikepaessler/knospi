import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from './TabBar';
import { HomeScreen } from '../screens/HomeScreen';
import { RoomsScreen } from '../screens/RoomsScreen';
import { DoctorHubScreen } from '../screens/DoctorHubScreen';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rooms" component={RoomsScreen} />
      <Tab.Screen name="Doctor" component={DoctorHubScreen} />
    </Tab.Navigator>
  );
}
