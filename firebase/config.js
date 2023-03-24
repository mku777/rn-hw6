// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import "firebase/storage";
import "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth/react-native";
import { Firestore, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyBCEbZcwEVLEz5Ze7PntbjTlgnfSS1ZVWw",
  authDomain: "react-native-hw-mk777.firebaseapp.com",
  projectId: "react-native-hw-mk777",
  storageBucket: "react-native-hw-mk777.appspot.com",
  messagingSenderId: "110719754965",
  appId: "1:110719754965:web:bd0405395cc80c46c5b85c",
  measurementId: "G-MK1PXY1F4B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const fsbase = getFirestore(app);
