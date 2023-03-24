import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";

import { fsbase } from "../../firebase/config";
import { collection, onSnapshot, where, query } from "firebase/firestore";

import { authSignOutUser } from "../../redux/auth/authOperation";

//components
import Post from "../../components/Post/Post";

//images

const imageBG = require("../../assets/images/screenBg.jpg");
const avaLOgo = require("../../assets/images/avatarLogo.png");

//icons
const LogOutIcon = require("../../assets/icon/log-out.png");

export default function ProfileScreen({ navigation }) {
  const { login, email, avatarImage, userId } = useSelector(
    (state) => state.auth
  );
  const [posts, setPosts] = useState([]);

  const dispatch = useDispatch();
  const [dimensions, setdimensions] = useState(
    Dimensions.get("window").width - 16 * 2
  );

  const handlePosts = async () => {
    try {
      onSnapshot(
        query(collection(fsbase, "posts"), where("userId", "==", userId)),
        (docSnap) => {
          const currentPosts = docSnap.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          const sortedPosts = currentPosts.sort(
            (a, b) => a.created < b.created
          );
          setPosts(sortedPosts);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handlePosts();
    const onChange = () => {
      const width = Dimensions.get("window").width - 16 * 2;
      setdimensions(width);
    };
    const dimensionsHandler = Dimensions.addEventListener("change", onChange);

    return () => {
      dimensionsHandler.remove();
    };
  }, []);

  const userHasAvatar = avatarImage !== undefined && avatarImage !== null;

  return (
    <ImageBackground source={imageBG} style={styles.image}>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={{ position: "absolute", top: 22, right: 16 }}
          onPress={() => dispatch(authSignOutUser())}
        >
          <Image source={LogOutIcon} style={{}} />
        </TouchableOpacity>
        <View style={{ position: "absolute", top: -60 }}>
          <View>
            <Image
              source={
                userHasAvatar
                  ? { uri: avatarImage, height: 120, width: 120 }
                  : avaLOgo
              }
              style={{
                height: 120,
                width: 120,
                objectFit: "cover",
                borderRadius: 16,
              }}
            ></Image>
            <TouchableOpacity
              activeOpacity={0.6}
              style={{
                position: "absolute",

                transform: [{ rotate: "40deg" }],
                top: 80,
                right: -12,
                borderWidth: 1,
                borderColor: "#E8E8E8",
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                width: 25,
                height: 25,
                borderRadius: 50,
              }}
              // onPress={}
            >
              <Text style={{ color: "#E8E8E8" }} >+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text
            style={{
              marginBottom: 33,
              fontSize: 30,
              lineHeight: 35,
              fontWeight: "500",
              color: "#212121",
              fontFamily: "Roboto-Bold",
            }}
          >
            {email}
          </Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: dimensions }}
        >
          {posts &&
            posts.map(
              ({
                id,
                photo,
                title,
                comments,
                country,
                city,
                latitude,
                longitude,
                login,
                avatarImage,
              }) => (
                <Post
                  navigation={navigation}
                  avatarImage={avatarImage}
                  login={login}
                  key={id}
                  title={title}
                  image={photo}
                  comments={comments}
                  city={city}
                  country={country}
                  latitude={latitude}
                  longitude={longitude}
                />
              )
            )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: "relative",
    paddingTop: 92,
    paddingBottom: 43,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  image: {
    flex: 1,
    paddingTop: 147,
    resizeMode: "cover",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  post: {
    marginBottom: 32,
  },
  postImg: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    marginBottom: 9,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "400",
    color: "#212121",
    fontFamily: "Roboto-Regular",
  },
  postFooter: {
    flexDirection: "row",
    // justifyContent: "space-between",
  },
  postCommentThmb: {
    flexDirection: "row",
    marginRight: 24,
  },
  postCommentIcon: {
    marginRight: 9,
  },
  postCommentNumber: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "400",
    color: "#BDBDBD",
    fontFamily: "Roboto-Regular",
  },
  postLikeThmb: {
    flexDirection: "row",
  },
  postLikeIcon: {
    marginRight: 9,
  },
  postLikeNumber: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "400",
    color: "#BDBDBD",
    fontFamily: "Roboto-Regular",
  },
  postLocationThmb: {
    marginLeft: "auto",
    flexDirection: "row",
  },
  postLocationIcon: {
    marginRight: 9,
  },
  postLocationTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "400",
    color: "#212121",
    fontFamily: "Roboto-Regular",
    textDecoration: "underlin",
  },
});
