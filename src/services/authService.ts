import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  signOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

// Convert Firebase user structure to our local model
export const mapToUserSession = (user: any): UserSession | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "User",
    avatarUrl: user.photoURL || undefined
  };
};

export const authService = {
  /**
   * Check if user is currently logged in
   */
  getCurrentUser: (): UserSession | null => {
    return mapToUserSession(auth.currentUser);
  },

  /**
   * Log in with Email and Password
   */
  loginWithEmail: async (email: string, password: string): Promise<UserSession> => {
    console.log(`[AuthService] Running Firebase email login for: ${email}`);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const mapped = mapToUserSession(credential.user);
    if (!mapped) throw new Error("Could not map user session");
    return mapped;
  },

  /**
   * Register with Email and Password
   */
  registerWithEmail: async (email: string, password: string, displayName: string): Promise<UserSession> => {
    console.log(`[AuthService] Running Firebase sign up for: ${email}`);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    const mapped = mapToUserSession(credential.user);
    if (!mapped) throw new Error("Could not map user session");
    return mapped;
  },

  /**
   * Google Sign-In helper integration
   */
  loginWithGoogle: async (): Promise<UserSession> => {
    console.log("[AuthService] Triggering real Google Sign-In pop-up with select_account custom parameter...");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });
    const credential = await signInWithPopup(auth, provider);
    const mapped = mapToUserSession(credential.user);
    if (!mapped) throw new Error("Could not map user session via Google provider");
    return mapped;
  },

  /**
   * Reset/Forgot password
   */
  forgotPassword: async (email: string): Promise<boolean> => {
    console.log(`[AuthService] Sending real password reset link to ${email}`);
    await sendPasswordResetEmail(auth, email);
    return true;
  },

  /**
   * Update the user's custom profile displayName in both Firebase Auth and Firestore DB
   */
  updateProfileName: async (displayName: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user session found");

    console.log(`[AuthService] Updating Firebase Auth profile displayName to "${displayName}"`);
    await updateProfile(user, { displayName });

    console.log(`[AuthService] Saving updated profile displayName to Firestore document: "users/${user.uid}"`);
    await setDoc(doc(db, "users", user.uid), { 
      displayName, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  },

  /**
   * Sign out the user
   */
  logout: async (): Promise<void> => {
    console.log("[AuthService] Running real logout...");
    await signOut(auth);
  }
};
