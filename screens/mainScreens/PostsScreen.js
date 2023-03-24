import { createStackNavigator } from "@react-navigation/stack";
import {
  DefaultPostsScreen,
  MapScreen,
  CommentsScreen,
} from "../nestedScreens";
import { TouchableOpacity, Image } from "react-native";
import { useContext } from "react";
import { Context } from "../../context";

const NestedScreen = createStackNavigator();

const backIcon = require("../../assets/icon/arrow-left.png");

export default function PostScreen({ navigation }) {
  const { currentPath, setCurrentPath } = useContext(Context);

  return (
    <NestedScreen.Navigator>
      <NestedScreen.Screen
        options={{ headerShown: false }}
        name="DefaultPostsScreen"
        component={DefaultPostsScreen}
      />
      <NestedScreen.Screen
        name="CommentsScreen"
        options={{
          title: "Comments",
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              activeOpacity={0.6}
              style={{ padding: 10 }}
              onPress={() => {
                setCurrentPath(null);
                navigation.navigate("DefaultPostsScreen");
              }}
            >
              <Image source={backIcon} style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          ),
        }}
        component={CommentsScreen}
      />
      <NestedScreen.Screen
        name="MapScreen"
        options={{
          title: "Map",
          headerTitleAlign: "center",
          // headerShown: false,
          headerLeft: () => (
            <TouchableOpacity
              activeOpacity={0.6}
              style={{ padding: 10 }}
              onPress={() => {
                setCurrentPath(null);
                navigation.navigate("DefaultPostsScreen");
              }}
            >
              <Image source={backIcon} style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          ),
        }}
        component={MapScreen}
      />
    </NestedScreen.Navigator>
  );
}
