import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ Замени със собствените си Firebase данни
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
