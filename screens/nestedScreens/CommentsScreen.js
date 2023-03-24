import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useContext } from "react";
import { Context } from "../../context";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  Text,
} from "react-native";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  getFirestore,
  updateDoc,
  increment,
} from "firebase/firestore";

import { fsbase } from "../../firebase/config";

import Comment from "../../components/Comment/Comment";
import ProfileDetails from "../../components/ProfileDetails/ProfileDetails";

export default function CommentsScreen({ navigation, route }) {
  const scrollRef = useRef(null);

  const { postId, image, postCountry, postAvatarImage, postLogin } =
    route.params;
  const { login, userId, avatarImage } = useSelector((state) => state.auth);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [allComments, setAllcomments] = useState([]);
  const [dimensions, setdimensions] = useState(
    Dimensions.get("window").width - 16 * 2
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );

  const { currentPath, setCurrentPath } = useContext(Context);

  useEffect(() => {
    fetchComents();
  }, []);

  useEffect(() => {
    setCurrentPath(route.name);
    const onChange = () => {
      const height = Dimensions.get("window").height;
      const width = Dimensions.get("window").width - 16 * 2;
      setdimensions(width);
      setScreenHeight(height);
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
      setCurrentPath(null);
      dimensionsHandler.remove();
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const fetchComents = async () => {
    try {
      const dbRef = doc(fsbase, "posts", postId);
      onSnapshot(collection(dbRef, "comments"), (docSnap) => {
        const currentComments = docSnap.docs.map((doc) => ({ ...doc.data() }));
        const sortedComments = currentComments.sort(
          (a, b) => b.created < a.created
        );
        setAllcomments(sortedComments);
      });
    } catch (error) {
      console.log(`getAllComents.error`, error);
    }
  };

  const updateCommentCounter = async () => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "posts", postId), {
        comments: increment(1),
      });
    } catch (error) {
      console.log("updateCommentCounter.error", error.message);
    }
  };

  const sendCommentToServer = async () => {
    const date = new Date().toLocaleDateString();
    const time = new Date()
      .toLocaleTimeString()
      .split(":")
      .splice(0, 2)
      .join(":");
    const created = Date.now().toString();
    const uniqueCommentId = uuidv4();
    try {
      const dbRef = doc(fsbase, "posts", postId);
      await addDoc(collection(dbRef, "comments"), {
        login,
        userId,
        avatarImage,
        date,
        time,
        commentId: uniqueCommentId,
        created,
        comment,
      });
    } catch (error) {
      console.log("sendCommentToServer.error", error.message);
    }
  };

  const submitForm = async () => {
    if (!comment) {
      return;
    }
    await sendCommentToServer();
    await updateCommentCounter();
    setComment("");
    Keyboard.dismiss();
    setKeyboardVisible(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          width: dimensions,
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        {!isKeyboardVisible && (
          <>
            <ProfileDetails
              image={image}
              postCountry={postCountry}
              postAvatarImage={postAvatarImage}
              postLogin={postLogin}
            />
            <View style={styles.postImgThmb}>
              <Image
                source={{ uri: route.params.image, height: 300, width: "100%" }}
                style={styles.postImg}
              />
            </View>
          </>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          ref={scrollRef}
          onContentSizeChange={() =>
            scrollRef.current.scrollToEnd({ animated: true })
          }
          style={{ ...styles.commentsList, height: screenHeight - 500 }}
        >
          {allComments &&
            allComments.map(
              ({
                comment,
                login,
                date,
                time,
                commentId,
                userId,
                avatarImage,
              }) => (
                <Comment
                  key={commentId}
                  avatarImage={avatarImage}
                  userId={userId}
                  comment={comment}
                  login={login}
                  date={date}
                  time={time}
                />
              )
            )}
        </ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : ""}>
          <View
            style={{
              ...styles.form,
              paddingBottom: isKeyboardVisible ? 10 : 0,
              width: "100%",
            }}
          >
            <View style={{ ...styles.inputThmb, marginTop: "auto" }}>
              <TextInput
                placeholder="Comment..."
                value={comment}
                style={styles.input}
                textAlign={"left"}
                onFocus={() => setKeyboardVisible(true)}
                onChangeText={(value) => setComment(value)}
              />
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.subBtn}
                onPress={() => submitForm()}
              >
                <AntDesign name="arrowup" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  postImgThmb: {
    width: "100%",
  },
  postImg: {
    width: "100%",
    marginBottom: 8,
  },
  commentsList: {
    paddingBottom: 10,
    paddingTop: 10,
    // marginBottom: 31,
  },
  inputThmb: {
    marginTop: "auto",
    position: "relative",
  },
  input: {
    padding: 8,
    paddingLeft: 16,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "400",
    backgroundColor: "#F6F6F6",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    color: "#BDBDBD",
    fontFamily: "Roboto-Regular",
  },
  subBtn: {
    position: "absolute",
    right: 8,
    bottom: 6,

    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 50,
    backgroundColor: "#FF6C00",
    borderColor: "transparent",
  },
});
