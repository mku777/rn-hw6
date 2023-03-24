import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../firebase/config";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

import { authSignUpUser } from "../../redux/auth/authOperation";

//stateSchema
const initialState = {
  login: "",
  email: "",
  password: "",
  avatarImage: null,
};

//images
const image = require("../../assets/images/screenBg.jpg");
const avaLOgo = require("../../assets/images/avatarLogo.png");

export default function RegistrationScreen({ navigation }) {
  const [state, setState] = useState(initialState);
  const [showPass, setShowPass] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [dimensions, setdimensions] = useState(
    Dimensions.get("window").width - 20 * 2
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const onChange = () => {
      const width = Dimensions.get("window").width - 20 * 2;
      setdimensions(width);
    };
    const dimensionsHandler = Dimensions.addEventListener("change", onChange);

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
  }, [state]);

  const imageHander = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setState((prevstate) => ({
          ...prevstate,
          avatarImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.log("error.imageHander", error.message);
    }
  };

  const uploadAvatarToServer = async () => {
    try {
      const storage = getStorage();
      const uniquePostId = Date.now().toString();
      const storageRef = ref(storage, `avatarImage/${uniquePostId}`);

      const response = await fetch(state.avatarImage);
      const file = await response.blob();

      const uploadPhoto = await uploadBytes(storageRef, file).then(() => {});

      const photoUri = await getDownloadURL(
        ref(storage, `avatarImage/${uniquePostId}`)
      )
        .then((url) => {
          return url;
        })
        .catch((error) => {
          console.log(`error.photoUri`, error);
        });
      return photoUri;
    } catch (error) {
      console.log(`uploadAvatarToServer.error`, error);
    }
  };
  const submitForm = async () => {
    try {
      const imageRef = await uploadAvatarToServer();

      setState((prevState) => ({ ...prevState, avatarImage: imageRef }));
      const newUser = {
        avatarImage: imageRef,
        login: state.login,
        email: state.email,
        password: state.password,
      };

      // console.log(`newUser`, newUser);
      dispatch(authSignUpUser(newUser));
    } catch (error) {
      console.log(`submitForm.error`, error);
    }
  };

  const keyboardHide = () => {
    setKeyboardVisible(false);
    Keyboard.dismiss();
  };

  const toglePass = () => {
    setShowPass(!showPass);
  };

  return (
    <TouchableWithoutFeedback onPress={keyboardHide}>
      <View style={styles.container}>
        <ImageBackground source={image} style={styles.image}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : ""}
          >
            <View
              style={{
                ...styles.form,
                paddingBottom: isKeyboardVisible ? 32 : 78,
                width: dimensions + 20 * 2,
              }}
            >
              <View style={styles.avatarThmb}>
                <TouchableOpacity activeOpacity={0.6} onPress={imageHander}>
                  <ImageBackground
                    source={
                      !state.avatarImage ? avaLOgo : { uri: state.avatarImage }
                    }
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                    }}
                    imageStyle={{ borderRadius: 6 }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.6}
                      style={styles.avatarBtn}
                      onPress={imageHander}
                    >
                      <Text style={styles.avatarTitle}>+</Text>
                    </TouchableOpacity>
                  </ImageBackground>
                </TouchableOpacity>
              </View>

              <View style={styles.header}>
                <Text style={styles.headerTitle}>Registration</Text>
              </View>
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  placeholder="Login"
                  value={state.login}
                  style={styles.input}
                  textAlign={"left"}
                  onFocus={() => setKeyboardVisible(true)}
                  onChangeText={(value) =>
                    setState((prevState) => ({ ...prevState, login: value }))
                  }
                />
              </View>
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  placeholder="E-mail"
                  value={state.email}
                  style={styles.input}
                  textAlign={"left"}
                  onFocus={() => setKeyboardVisible(true)}
                  onChangeText={(value) =>
                    setState((prevState) => ({ ...prevState, email: value }))
                  }
                />
              </View>
              <View
                style={{
                  ...styles.passThmb,
                  marginBottom: !isKeyboardVisible ? 43 : 32,
                }}
              >
                <View style={styles.showPassThmb}>
                  <TouchableOpacity activeOpacity={0.6} onPress={toglePass}>
                    <Text style={styles.showPass}>
                      {!showPass ? "show" : "hide"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="Password"
                  value={state.password}
                  style={styles.input}
                  textAlign={"left"}
                  secureTextEntry={!showPass ? true : false}
                  onFocus={() => setKeyboardVisible(true)}
                  onChangeText={(value) =>
                    setState((prevState) => ({ ...prevState, password: value }))
                  }
                />
              </View>
              {!isKeyboardVisible && (
                <>
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.btn}
                    onPress={() => submitForm()}
                  >
                    <Text style={styles.btnTitle}>Sign Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => navigation.navigate({ name: "Login" })}
                  >
                    <Text style={styles.regTitle}>
                      Already have an account? Log in
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 36,

    fontWeight: "500",
    color: "#212121",
    fontFamily: "Roboto-Regular",
  },
  form: {
    paddingTop: 92,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    position: "relative",
  },
  avatarThmb: {
    position: "absolute",
    top: -60,
    left: "50%",
    transform: [{ translateX: -50 }],
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
  },
  avatarBtn: {
    position: "absolute",
    right: -10,
    bottom: 14,
    width: 21,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#FF6C00",
  },
  avatarTitle: {
    color: "#FF6C00",
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    height: 50,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 0.8,
    fontFamily: "Roboto-Regular",
    backgroundColor: "#F6F6F6",
    borderColor: "#E8E8E8",
    color: "#212121",
  },
  passThmb: {
    position: "relative",
  },
  showPassThmb: {
    position: "absolute",
    top: 14,
    right: 16,

    zIndex: 99,
  },
  showPass: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: "Roboto-Regular",
    color: "#1B4371",
  },
  btn: {
    marginBottom: 16,
    paddingBottom: 16,
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    borderWidth: 1,
    fontFamily: "Roboto-Regular",
    ...Platform.select({
      ios: {
        borderColor: "#FF6C00",
        backgroundColor: "transparent",
      },
      android: {
        borderColor: "transparent",
        backgroundColor: "#FF6C00",
      },
      default: {
        borderColor: "transparent",
        backgroundColor: "#FF6C00",
      },
    }),
  },
  btnTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: "Roboto-Regular",
    ...Platform.select({
      ios: {
        color: "#1B4371",
      },
      android: {
        color: "#FFFFFF",
      },
      default: {
        color: "#FFFFFF",
      },
    }),
  },
  regTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    color: "#1B4371",
  },
});
