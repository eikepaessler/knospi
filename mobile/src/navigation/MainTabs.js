import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from './TabBar';
import { HomeStack } from './HomeStack';
import { RoomsStack } from './RoomsStack';
import { DoctorStack } from './DoctorStack';

const Tab = createBottomTabNavigator();

// Jeder Tab bekommt seinen eigenen Stack (statt eines einzelnen flachen
// Screens), damit Unterseiten wie Pflanzen-Detail innerhalb des Tabs
// aufgerufen werden und die TabBar dabei sichtbar bleibt.
export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Rooms" component={RoomsStack} />
      <Tab.Screen name="Doctor" component={DoctorStack} />
    </Tab.Navigator>
  );
}
