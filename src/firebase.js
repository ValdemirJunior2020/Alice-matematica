import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkTthwGyppE_4V5BkKREMsa_Vgz4WH0Ow",
  authDomain: "agents-name.firebaseapp.com",
  projectId: "agents-name",
  storageBucket: "agents-name.firebasestorage.app",
  messagingSenderId: "880994939187",
  appId: "1:880994939187:web:eadb11e0f0299c58da0e46",
  measurementId: "G-ZDN3HSC82K",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
