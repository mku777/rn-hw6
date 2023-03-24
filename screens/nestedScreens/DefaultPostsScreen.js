import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
} from "react-native";

import { collection, onSnapshot, addDoc, doc } from "firebase/firestore";
import { fsbase } from "../../firebase/config";

//components
import Post from "../../components/Post/Post";

//images
const avaLOgo = require("../../assets/images/avatarLogo.png");

export default function DefaultPostsScreen({ navigation, route }) {
  const { login, email, avatarImage } = useSelector((state) => state.auth);

  const [posts, setPosts] = useState([]);
  const [numberOfComments, setnumberOfComments] = useState(null);
  const [dimensions, setdimensions] = useState(
    Dimensions.get("window").width - 16 * 2
  );

  useEffect(() => {
    fetchPosts();
    const onChange = () => {
      const width = Dimensions.get("window").width - 16 * 2;

      setdimensions(width);
    };
    const dimensionsHandler = Dimensions.addEventListener("change", onChange);

    return () => {
      dimensionsHandler.remove();
    };
  }, []);

  const fetchPosts = async () => {
    onSnapshot(collection(fsbase, "posts"), (docSnap) => {
      const currentPosts = docSnap.docs.map((doc) => {
        return { ...doc.data(), id: doc.id };
      });
      const sortedPosts = currentPosts.sort((a, b) => a.created < b.created);

      setPosts(sortedPosts);
    });
  };

  const countComments = async (postId) => {
    const dbRef = doc(fsbase, "posts", postId);
    onSnapshot(collection(dbRef, "comments"), (docSnap) => {
      const currentComments = docSnap.docs.map((doc) => ({ ...doc.data() }));
      console.log(`docSnap.docs.length`, docSnap.docs.length);
    });
  };

  const fetchNumbersOfComments = async (postId) => {
    let result = null;
    const dbRef = doc(fsbase, "posts", postId);
    onSnapshot(
      collection(dbRef, "comments"),
      (docSnap) => (result = docSnap.docs.length)
    );
    return result;
  };

  const keyExtractor = (item) => item?.id;
  const userHasAvatar = avatarImage !== undefined && avatarImage !== null;
  return (
    <View style={{ ...styles.container, width: dimensions + 16 * 2 }}>
      <View style={styles.userThmb}>
        <Image
          style={styles.avatar}
          source={
            userHasAvatar
              ? { uri: avatarImage, height: 60, width: 60 }
              : avaLOgo
          }
        />
        <View style={{ justifyContent: "center" }}>
          <Text style={styles.name}>{login}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      {posts.length > 0 && (
        <FlatList
          data={posts}
          // initialNumToRender={4}
          showsVerticalScrollIndicator={false}
          // keyExtractor={(item, indx) => indx.toString()}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => {
            const {
              id,
              photo,
              title,
              country,
              city,
              latitude,
              comments,
              longitude,
              avatarImage,
              login,
            } = item;

            return (
              <Post
                navigation={navigation}
                title={title}
                image={photo}
                comments={comments}
                city={city}
                country={country}
                latitude={latitude}
                longitude={longitude}
                postId={id}
                avatarImage={avatarImage}
                login={login}
              />
            );
          }}
        />
      )}
      {/* <ScrollView showsVerticalScrollIndicator={false}>
        {posts &&
          posts.map(({ id, image, title, comments, location }) => (
            <Post
              navigation={navigation}
              key={id}
              title={title}
              image={image}
              comments={comments}
              location={location}
            />
          ))}
      </ScrollView> */}
    </View>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: "flex-start",
    // alignItems: "flex-start",
  },
  userThmb: {
    flexDirection: "row",
    marginBottom: 32,
  },
  name: {
    fontSize: 17,
    lineHeight: 19,
    color: "black",
    fontFamily: "Roboto-Bold",
  },
  email: {
    fontSize: 13,
    lineHeight: 19,
    color: "black",
    fontFamily: "Roboto-Regular",
  },
  avatar: {
    marginRight: 8,
    width: 60,
    height: 60,
    borderRadius: 16,
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
    justifyContent: "space-between",
  },
  postCommentThmb: {
    flexDirection: "row",
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
  postLocationThmb: {
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
