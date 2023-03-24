import { useState, useEffect, useLayoutEffect } from "react";
import { NavigationContainer } from "@react-navigation/native"; // как провайдер в реакте обвертка BrowserRouter
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./redux/store";
import { Context } from "./context";
import { authStateChangeUsers } from "./redux/auth/authOperation";

import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

import useRoute from "./router";
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [currentPath, setCurrentPath] = useState(null);
  const [fontIsLoaded, setFontIsLoaded] = useState(false);
  const routing = useRoute(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        await Font.loadAsync({
          "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
          "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
        });

        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontIsLoaded(true);
      }
    }
    prepare();
  }, []);

  if (!fontIsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <Context.Provider value={{ setCurrentPath, currentPath }}>
        <RouteSwitcher />
      </Context.Provider>
    </Provider>
  );
}

function RouteSwitcher() {
  const { stateChange } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authStateChangeUsers());
  }, [stateChange]);

  const routing = useRoute(stateChange);

  return <NavigationContainer>{routing}</NavigationContainer>;
}
