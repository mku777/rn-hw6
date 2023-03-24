import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useContext } from "react";
import { Context } from "../../context";
import { useEffect } from "react";

export default function MapScreen({ route }) {
  const { setCurrentPath } = useContext(Context);
  const { latitude, longitude } = route.params;

  useEffect(() => {
    setCurrentPath(route.name);

    return () => {
      setCurrentPath(null);
    };
  }, []);
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.006,
        }}
      >
        <Marker
          key={new Date()}
          coordinate={{ latitude, longitude }}
          title="photo"
          description={"marker.description"}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
