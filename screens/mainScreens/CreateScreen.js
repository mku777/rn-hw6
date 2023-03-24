import { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { fsbase } from "../../firebase/config";
import {
  MaterialIcons,
  Foundation,
  FontAwesome,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Camera, CameraType, FlashMode } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  Text,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  Button,
  ScrollView,
  ImageBackground,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";


//stateSchema
const initialState = {
  title: "",
  location: null,
  region: {},
};

export default function CreateScreen({ navigation }) {
  const { userId, login, avatarImage } = useSelector((state) => state.auth);
  //location
  const [location, setLocation] = useState("denied");

  //camera
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isFocused = useIsFocused();
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);

  //other
  const [loading, setLoading] = useState(false);
  const [loadingText, setloadingText] = useState("Taking photo...");
  const [post, setPost] = useState(initialState);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [dimensions, setdimensions] = useState(
    Dimensions.get("window").width - 16 * 2
  );

  const redyToPost = photo && post.title;
  const redyToDell = photo || post.title;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocation(status);
    })();
    requestPermission;
    const onChangeDimension = () => {
      const width = Dimensions.get("window").width - 20 * 2;
      setdimensions(width);
    };

    const dimensionsHandler = Dimensions.addEventListener(
      "change",
      onChangeDimension
    );

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      dimensionsHandler.remove();
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [photo, loading, post, cameraType]);

  const uploadPhotoToServer = async () => {
    const storage = getStorage();
    const uniquePostId = uuidv4();
    const storageRef = ref(storage, `photos/${uniquePostId}`);

    const response = await fetch(photo);
    const file = await response.blob();

    await uploadBytes(storageRef, file).then(() => {});

    const processedPhoto = await getDownloadURL(
      ref(storage, `photos/${uniquePostId}`)
    )
      .then((url) => {
        return url;
      })
      .catch((error) => {
        console.log(`error.processedPhoto`, error);
      });
    return processedPhoto;
  };

  const uploadPostToServer = async () => {
    try {
      const postPhoto = await uploadPhotoToServer();
      const { title, location, region } = post;

      const date = new Date().toLocaleDateString();
      const time = new Date()
        .toLocaleTimeString()
        .split(":")
        .splice(0, 2)
        .join(":");
      const created = Date.now().toString();
      await addDoc(collection(fsbase, "posts"), {
        photo: postPhoto,
        title,
        latitude: location.latitude,
        longitude: location.longitude,
        country: region.country,
        city: region.city,
        userId,
        login,
        like: 0,
        date,
        time,
        created,
        avatarImage,
        comments: 0,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const keyboardHide = () => {
    setKeyboardVisible(false);
    Keyboard.dismiss();
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const takePicture = async () => {
    const makePhoto = async () => {
      let { uri } = await camera.takePictureAsync();
      return uri;
    };

    const takeLocation = async () => {
      return await Location.getCurrentPositionAsync({});
    };

    const takeRegionData = async (location) => {
      return await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    try {
      setLoading(true);
      const uri = await makePhoto();

      if (location === "granted") {
        setLoading(false);
        setloadingText("Taking location...");
        setLoading(true);
        const location = await takeLocation();
        const regionData = await takeRegionData(location);

        setPost((prevState) => ({ ...prevState, region: regionData[0] }));
        setPost((prevState) => ({
          ...prevState,
          location: location.coords,
        }));
      }

      setPhoto(uri);
    } catch (error) {
      console.log(`takePicture.error`, error);
    } finally {
      setLoading(false);
      setloadingText("Taking photo...");
    }
  };

  const submitForm = async () => {
    try {
      setloadingText("Submiting your post...");
      setLoading(true);
      await uploadPostToServer();

      navigation.navigate("DefaultPostsScreen");
      setLoading(false);
      setPhoto(null);
      setPost(initialState);
    } catch (error) {
      console.log(`submitForm.error`, error);
    } finally {
      setLoading(false);
      setloadingText("Taking photo...");
    }
  };

  const onDell = () => {
    setPhoto(null);
    setPost(initialState);
    navigation.navigate("DefaultPostsScreen");
  };

  if (!permission) {
    // Camera permissions are still loading
    return null;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={keyboardHide}>
      <View style={{ ...styles.container, width: dimensions + 16 * 2 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={{ marginBottom: 8, fontSize: 22 }}>
            {!isKeyboardVisible && (
              <>
                {isFocused && (
                  <>
                    {!photo ? (
                      <Camera
                        skipProcessing={true}
                        flashMode={flashMode}
                        type={cameraType}
                        onCameraReady={onCameraReady}
                        onMountError={(error) => {
                          154;
                          console.log("cammera.error", error);
                          155;
                        }}
                        ratio="1:1"
                        ref={setCamera}
                        style={styles.camera}
                      >
                        <TouchableOpacity
                          activeOpacity={0.6}
                          style={styles.takePhotoBtn}
                          onPress={takePicture}
                        >
                          <FontAwesome name="camera" size={30} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          
                        >
                          <Foundation/>
                        </TouchableOpacity>
                        {cameraType === CameraType.back && (
                          <TouchableOpacity     
                          >
                          </TouchableOpacity>
                        )}
                      </Camera>
                    ) : (
                      <View style={{ position: "relative" }}>
                        <ImageBackground
                          source={{ uri: photo }}
                          style={styles.imageView}
                        >
                          <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.dellPhotoBtn}
                            onPress={() => {
                              setPhoto(null);
                              setPost(initialState);
                            }}
                          >
                            <Foundation name="trash" size={30} color="black" />
                          </TouchableOpacity>
                        </ImageBackground>
                      </View>
                    )}
                  </>
                )}
                <View>
                  <Text style={styles.addTitile}>
                    {photo ? "Delete photo" : "Get photo"}
                  </Text>
                </View>
              </>
            )}
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : ""}
          >
            <View
              style={{
                paddingBottom: isKeyboardVisible ? 10 : 0,
              }}
            >
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  placeholder="Name..."
                  value={post.title}
                  style={styles.input}
                  textAlign={"left"}
                  onFocus={() => setKeyboardVisible(true)}
                  onChangeText={(value) =>
                    setPost((prevState) => ({ ...prevState, title: value }))
                  }
                />
              </View>
              <View style={{ marginBottom: 32, position: "relative" }}>
                {post.region.country !== undefined && (
                  <Text>
                    {post.region.country + ","} {post.region.city}
                  </Text>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>

          {!isKeyboardVisible && (
            <>
              <TouchableOpacity
                disabled={redyToPost ? false : true}
                activeOpacity={0.6}
                style={{
                  ...styles.subBtn,
                  backgroundColor: redyToPost ? "#FF6C00" : "#F6F6F6",
                }}
                onPress={() => submitForm()}
              >
                <Text
                  style={{
                    ...styles.btnTitle,
                    color: redyToPost ? "#FFFFFF" : "#BDBDBD",
                  }}
                >
                  Publish
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={redyToDell ? false : true}
                activeOpacity={0.6}
                style={{
                  ...styles.dellBtn,
                  backgroundColor: redyToDell ? "#FF6C00" : "#F6F6F6",
                }}
                onPress={() => onDell()}
              >
                <MaterialIcons
                  name="delete"
                  size={24}
                  color={redyToDell ? "#FFFFFF" : "#DADADA"}
                />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  camera: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    height: 340,
  },
  takePhotoBtn: {
    opacity: 0.5,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  changeCameraBtn: {
    padding: 3,
    opacity: 0.6,
    position: "absolute",
    right: 7,
    top: 7,
  },
  flashBtn: {
    padding: 3,
    opacity: 0.6,
    position: "absolute",
    left: 7,
    top: 7,
  },
  imageView: {
    height: 340,
    justifyContent: "center",
    alignItems: "center",
  },
  dellPhotoBtn: {
    opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 30,
  },
  addTitile: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
    color: "#BDBDBD",
    fontFamily: "Roboto-Regular",
    marginBottom: 30,
  },
  input: {
    paddingBottom: 16,
    paddingTop: 16,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
    color: "#BDBDBD",
    fontFamily: "Roboto-Regular",
    borderBottomColor: "#E8E8E8",
    borderBottomWidth: 1,
  },
  subBtn: {
    marginBottom: 16,
    paddingBottom: 16,
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    borderWidth: 1,
    fontFamily: "Roboto-Regular",
    backgroundColor: "#F6F6F6",
    ...Platform.select({
      ios: {
        borderColor: "#FF6C00",
        backgroundColor: "transparent",
      },
      android: {
        borderColor: "transparent",
        backgroundColor: "#F6F6F6",
      },
      default: {
        borderColor: "transparent",
        backgroundColor: "#F6F6F6",
      },
    }),
  },
  btnTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: "Roboto-Regular",
    color: "#BDBDBD",
    ...Platform.select({
      ios: {
        color: "#1B4371",
      },
      android: {
        color: "#BDBDBD",
      },
      default: {
        color: "#BDBDBD",
      },
    }),
  },
  dellBtn: {
    marginTop: "auto",
    padding: 12,
    width: 70,
    height: 50,
    marginRight: "auto",
    marginLeft: "auto",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
  },
  spinnerTextStyle: {
    color: "orange",
  },
});

