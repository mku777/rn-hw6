import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { Alert } from "react-native";

import { auth } from "../../firebase/config";

import { authSlice } from "./authReducer";
const { updateUserProfile, authStateChange, authSignOut } = authSlice.actions;

export const authSignUpUser =
  ({ login, email, password, avatarImage }) =>
  async (dispatch) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(auth.currentUser, {
        displayName: login,
        photoURL: avatarImage,
      });

      const { uid, displayName, photoURL } = auth.currentUser;

      dispatch(
        updateUserProfile({
          userId: uid,
          login: displayName,
          email,
          logoImage: photoURL,
        })
      );
    } catch (error) {
      console.log("error.message.sign-up:", error.message);
    }
  };

export const authSignInUser =
  ({ email, password }) =>
  async (dispatch, getState) => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      const { uid, displayName, photoURL } = auth.currentUser;
      dispatch(
        updateUserProfile({
          userId: uid,
          login: displayName,
          email,
          logoImage: photoURL,
        })
      );
    } catch (error) {
      Alert.alert("Error! Email or password doesn't match!");
    }
  };

export const authSignOutUser = () => async (dispatch, getState) => {
  try {
    await signOut(auth);
    dispatch(authSignOut());
  } catch (error) {
    console.log("error.message.sign-out:", error.message);
  }
};

export const authStateChangeUsers = () => async (dispatch) => {
  onAuthStateChanged(auth, (user) => {
    try {
      if (user) {
        const userUpdateProfile = {
          email: user.email,
          logoImage: user.photoURL,
          login: user.displayName,
          userId: user.uid,
        };

        dispatch(updateUserProfile(userUpdateProfile));
        dispatch(authStateChange({ stateChange: true }));
      }
    } catch (error) {
      console.log("error.message.state-change:", error.message);
    }
  });
};
