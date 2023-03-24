import { Text, View, StyleSheet, Image } from "react-native";
import { useSelector } from "react-redux";

//images
const avaLOgo = require("../../assets/images/avatarLogo.png");

function Comment({ comment, login, date, time, userId, avatarImage }) {
  const currentUserId = useSelector((state) => state.auth.userId);
  const currentUser = userId === currentUserId;
  return (
    <View
      style={{
        ...styles.wrapper,
        flexDirection: !currentUser ? "row" : "row-reverse",
      }}
    >
      <View
        style={{
          marginLeft: currentUser ? 10 : 0,
          marginRight: currentUser ? 0 : 10,
        }}
      >
        <Image
          source={
            !avatarImage ? avaLOgo : { uri: avatarImage, height: 30, width: 30 }
          }
          style={styles.img}
        />
      </View>
      <View style={styles.comment}>
        <Text style={styles.login}>{login}</Text>
        <Text style={styles.text}>{comment}</Text>
        <Text
          style={{
            ...styles.date,
            textAlign: !currentUser ? "right" : "left",
          }}
        >
          {date} | {time}
        </Text>
      </View>
    </View>
  );
}

export default Comment;

//styles
const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-start",
    // marginTop: 20,
    marginBottom: 16,
  },
  img: {
    borderRadius: 20,
    height: 30,
    width: 30,
  },
  login: {
    marginBottom: 6,
    fontSize: 8,
    color: "grey",
    fontFamily: "Roboto-Bold",
  },
  comment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    borderColor: "rgba(0, 0, 0, 0.03)",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    fontFamily: "Roboto-Regular",
  },
  text: { marginBottom: 6, fontFamily: "Roboto-Regular" },
  date: {
    fontSize: 12,
    color: "grey",
    fontFamily: "Roboto-Regular",
  },
});
