"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";

const PhoneAuthVerification = ({ phone, onVerificationComplete }) => {
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyAa2ypCdwLJfp88i1e0w-9GJE8iFnk6CuY",
      authDomain: "camargosworld-38371.firebaseapp.com",
      projectId: "camargosworld-38371",
      storageBucket: "camargosworld-38371.appspot.com",
      messagingSenderId: "641311677825",
      appId: "1:641311677825:web:097da69d25ce455fec1c80",
    };

    try {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      // Important: Use actual DOM element here
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        console.error("Recaptcha container not found in DOM.");
        setError("Failed to initialize verification. Please refresh the page.");
        return;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  size: 'normal',
  callback: () => {
    setRecaptchaVerified(true);
  },
  'expired-callback': () => {
    setRecaptchaVerified(false);
    setError("reCAPTCHA expired. Please solve it again.");
  },
});


      window.recaptchaVerifier
        .render()
        .then((widgetId) => {
          window.recaptchaWidgetId = widgetId;
          setRecaptchaReady(true);
        })
        .catch((err) => {
          console.error("Error rendering reCAPTCHA:", err);
          setError("Failed to load verification. Please refresh the page.");
        });
    } catch (error) {
      console.error("Error initializing Firebase or reCAPTCHA:", error);
      setError("Failed to initialize verification. Please refresh the page.");
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const sendVerificationCode = async () => {
    try {
      setError(null);
      setLoading(true);

      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith("+")) {
        if (!/^1/.test(formattedPhone.replace(/\D/g, ""))) {
          formattedPhone = "+1" + formattedPhone.replace(/\D/g, "");
        } else {
          formattedPhone = "+" + formattedPhone.replace(/\D/g, "");
        }
      } else {
        formattedPhone = "+" + formattedPhone.replace(/\D/g, "").slice(formattedPhone.startsWith("+") ? 0 : 1);
      }

      const auth = getAuth();
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setIsCodeSent(true);
      setLoading(false);
    } catch (err) {
      console.error("Error sending verification code:", err);
      let errorMessage = "Failed to send verification code";
      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "The phone number is invalid. Please enter a valid phone number.";
      } else if (err.code === "auth/quota-exceeded") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.code === "auth/configuration-not-found") {
        errorMessage = "Phone authentication isn't properly configured.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setError(null);
      setLoading(true);

      const auth = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);

      await signInWithCredential(auth, credential);
      setLoading(false);
      onVerificationComplete(true);
    } catch (err) {
      console.error("Error verifying code:", err);
      let errorMessage = "Invalid verification code";
      if (err.code === "auth/code-expired") {
        errorMessage = "The verification code has expired. Please request a new one.";
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {!isCodeSent ? (
        <>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              We'll send a verification code to this phone number:
            </div>
            <div className="font-medium">{phone}</div>
          </div>

          <div id="recaptcha-container" className="mb-4"></div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={sendVerificationCode}
            disabled={loading || !recaptchaReady || !recaptchaVerified}
            className={`w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              recaptchaReady && recaptchaVerified
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>

          {!recaptchaReady && (
            <div className="text-sm text-gray-600 mt-2 text-center">Loading verification system...</div>
          )}

          {recaptchaReady && !recaptchaVerified && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              Please complete the reCAPTCHA above
            </div>
          )}
        </>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-2">
            Enter the 6-digit verification code sent to {phone}
          </div>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            type="text"
            placeholder="6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsCodeSent(false);
                setVerificationCode("");
                setError(null);
              }}
              className="py-2 px-4 border border-gray-300 rounded focus:outline-none hover:bg-gray-100"
            >
              Change Number
            </button>

            <button
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className={`flex-1 py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                verificationCode.length === 6
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneAuthVerification;
