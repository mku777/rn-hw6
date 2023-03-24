import { StyleSheet, View, Image, Text } from "react-native";

export default function ProfileDetails({
  postLogin,
  postCountry,
  postAvatarImage,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: postAvatarImage, height: 35, width: 35 }}
          style={styles.avatar}
        />
      </View>
      <View>
        <Text style={styles.login}>{postLogin}</Text>
        <Text style={styles.country}>{postCountry}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarWrapper: { marginRight: 10 },
  avatar: { borderRadius: 20 },
  post: {
    marginBottom: 32,
  },
  login: { fontSize: 12, fontFamily: "Roboto-Bold" },
  country: { fontSize: 12, color: "grey" },
});
