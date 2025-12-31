import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpTTyQViTvVpcNoWuHsHBCT-OYceNDvcU",
    authDomain: "linkedin-strategies-v1.firebaseapp.com",
    projectId: "linkedin-strategies-v1",
    storageBucket: "linkedin-strategies-v1.firebasestorage.app",
    messagingSenderId: "319848864258",
    appId: "1:319848864258:web:c3f0598b31f1004bfa251b",
    measurementId: "G-6V1WE2FHCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Optional: Analytics
let analytics;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn("Analytics failed to initialize", e);
}
export { analytics };

export default app;
