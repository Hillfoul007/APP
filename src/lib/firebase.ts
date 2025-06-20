// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCskrUKP5NQTrAE3PLSZv5qh-MYQpL5hJ4",
  authDomain: "taskapp-d8200.firebaseapp.com",
  projectId: "taskapp-d8200",
  storageBucket: "taskapp-d8200.firebasestorage.app",
  messagingSenderId: "336406578207",
  appId: "1:336406578207:web:9bfcb2b9bb57ec3c1f012a",
  measurementId: "G-JFG35S9N5J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };

// Firebase phone auth helpers
export const setupRecaptcha = (containerId: string) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: (response: any) => {
        console.log("reCAPTCHA solved");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired");
      },
    });
  }
  return window.recaptchaVerifier;
};

export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier,
) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier,
    );
    return { success: true, confirmationResult };
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (confirmationResult: any, otpCode: string) => {
  try {
    const result = await confirmationResult.confirm(otpCode);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: error.message };
  }
};

// Global type declaration for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
