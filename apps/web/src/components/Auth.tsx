import React, { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Leaf, LogIn, Mail, Lock, Phone, User, Chrome, CheckCircle2 } from "lucide-react";

type AuthTab = "signin" | "signup" | "phone";

export function Auth() {
  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth || tab !== "phone") {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing recaptcha", e);
        }
        recaptchaVerifierRef.current = null;
        setRecaptchaVerifier(null);
      }
      return;
    }

    try {
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.innerHTML = "";
      }

      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        }
      });
      recaptchaVerifierRef.current = verifier;
      setRecaptchaVerifier(verifier);
    } catch (err: any) {
      console.error("Failed to initialize reCAPTCHA on tab change:", err);
      setError("Failed to initialize reCAPTCHA: " + err.message);
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing recaptcha on unmount/cleanup", e);
        }
        recaptchaVerifierRef.current = null;
        setRecaptchaVerifier(null);
      }
    };
  }, [tab]);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-[#0c1813] via-[#12231b] to-[#173b2c]">
        <div className="w-full max-w-md bg-[#12231b]/80 border border-red-800/40 rounded-[2rem] p-8 text-center backdrop-blur-xl shadow-2xl">
          <Leaf className="text-red-500 mx-auto mb-4 animate-pulse" size={40} />
          <h2 className="text-2xl font-extrabold text-[#eff8f0] mb-3">Configuration Error</h2>
          <p className="text-sm text-[#afc4b5] leading-relaxed">
            Firebase has not been initialized. Please check that your environment variables are configured correctly in the `.env` file inside the <code className="bg-[#0c1813] px-1.5 py-0.5 rounded text-red-300">apps/web/</code> directory.
          </p>
        </div>
      </div>
    );
  }

  const syncUser = async (firebaseUser: any) => {
    if (!db) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || null,
          displayName: firebaseUser.displayName || null,
          phoneNumber: firebaseUser.phoneNumber || null,
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error("Error syncing user to Firestore:", err);
    }
  };

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (typeof window === "undefined" || !(window as any).grecaptcha?.enterprise) {
      console.warn("reCAPTCHA Enterprise not loaded yet.");
      return null;
    }
    return new Promise((resolve) => {
      (window as any).grecaptcha.enterprise.ready(async () => {
        try {
          const token = await (window as any).grecaptcha.enterprise.execute(
            "6Ldbfx8tAAAAAM3JAt9oC0ttn8C8WDAgyDh-xC8j",
            { action }
          );
          resolve(token);
        } catch (err) {
          console.error("reCAPTCHA execution failed:", err);
          resolve(null);
        }
      });
    });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await executeRecaptcha("LOGIN");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await syncUser(cred.user);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await executeRecaptcha("SIGNUP");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await syncUser({ ...cred.user, displayName: name });
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await executeRecaptcha("GOOGLE_SIGNIN");
      const cred = await signInWithPopup(auth, googleProvider);
      await syncUser(cred.user);
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await executeRecaptcha("SEND_OTP");
      let verifier = recaptchaVerifierRef.current;
      if (!verifier) {
        const container = document.getElementById("recaptcha-container");
        if (container) {
          container.innerHTML = "";
        }
        verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          }
        });
        recaptchaVerifierRef.current = verifier;
        setRecaptchaVerifier(verifier);
      }
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
      setSuccess("OTP sent successfully to " + phoneNumber);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Make sure phone number format is correct (e.g. +11234567890).");
      // Keep the recaptchaVerifierRef.current instance alive for retries to prevent duplicate rendering errors.
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      const cred = await confirmationResult.confirm(otp);
      await syncUser(cred.user);
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-[#0c1813] via-[#12231b] to-[#173b2c]">
      <div id="recaptcha-container"></div>
      
      <div className="w-full max-w-md bg-[#12231b]/80 border border-[#294537] rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#2d7656] text-white flex items-center justify-center rounded-2xl rotate-[-4deg] mb-3 shadow-lg">
            <Leaf size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#eff8f0] tracking-tight">EcoTrack <span className="text-[#74b98a]">AI</span></h1>
          <p className="text-sm text-[#afc4b5] mt-1 text-center">Climate clarity for everyday life.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#0c1813] p-1 rounded-xl mb-6 border border-[#294537]/50">
          {(["signin", "signup", "phone"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError(null);
                setSuccess(null);
                setConfirmationResult(null);
                if (recaptchaVerifierRef.current) {
                  recaptchaVerifierRef.current.clear();
                  recaptchaVerifierRef.current = null;
                }
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === t
                  ? "bg-[#2d7656] text-[#eff8f0] shadow-sm"
                  : "text-[#afc4b5] hover:text-[#eff8f0]"
              }`}
            >
              {t === "signin" ? "Sign In" : t === "signup" ? "Sign Up" : "Phone OTP"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-200 text-xs text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-200 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            {success}
          </div>
        )}

        {/* Tab Contents */}
        {tab === "signin" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#afc4b5]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 pl-10 pr-4 text-[#eff8f0] placeholder-[#596b62] text-sm focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#afc4b5]">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 pl-10 pr-4 text-[#eff8f0] placeholder-[#596b62] text-sm focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-[#74b98a] hover:bg-[#86c89c] text-[#0c1813] font-bold py-3 rounded-xl shadow-lg shadow-[#74b98a]/10 hover:shadow-[#74b98a]/20 transition-all"
            >
              {loading ? "Signing In..." : "Sign In"}
              <LogIn size={16} />
            </Button>
          </form>
        )}

        {tab === "signup" && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#afc4b5]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 pl-10 pr-4 text-[#eff8f0] placeholder-[#596b62] text-sm focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#afc4b5]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 pl-10 pr-4 text-[#eff8f0] placeholder-[#596b62] text-sm focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#afc4b5]">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 pl-10 pr-4 text-[#eff8f0] placeholder-[#596b62] text-sm focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-[#74b98a] hover:bg-[#86c89c] text-[#0c1813] font-bold py-3 rounded-xl shadow-lg transition-all"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}

        {tab === "phone" && (
          <div className="space-y-4">
            {!confirmationResult ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#afc4b5]">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+11234567890"
                      className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 pl-10 pr-4 text-[#eff8f0] placeholder-[#596b62] text-sm focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center bg-[#74b98a] hover:bg-[#86c89c] text-[#0c1813] font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#afc4b5] mb-1.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#0c1813] border border-[#294537] rounded-xl py-2.5 px-4 text-[#eff8f0] placeholder-[#596b62] text-center text-lg tracking-widest focus:outline-none focus:border-[#74b98a] focus:ring-1 focus:ring-[#74b98a] transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setConfirmationResult(null);
                      setOtp("");
                      setSuccess(null);
                    }}
                    className="flex-1 text-[#eff8f0] bg-[#1a3528] hover:bg-[#254d39] border-none py-3 rounded-xl font-bold transition-all"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#74b98a] hover:bg-[#86c89c] text-[#0c1813] font-bold py-3 rounded-xl shadow-lg transition-all"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#294537]/50" />
          </div>
          <span className="relative px-3 bg-[#12231b] text-xs text-[#596b62] font-semibold">OR CONTINUE WITH</span>
        </div>

        {/* Federated Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="secondary"
          className="w-full justify-center bg-[#173b2c]/40 hover:bg-[#173b2c]/80 text-[#eff8f0] border border-[#294537] py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-md transition-all duration-200"
        >
          <Chrome size={16} className="text-[#a8d89a]" />
          Google Sign-In
        </Button>
      </div>
    </div>
  );
}
