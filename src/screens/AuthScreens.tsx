import React from "react";
import { motion } from "motion/react";
import { Mail, Lock, User, Bell, Mic, RotateCw, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ScreenLayout } from "../components/layout/ScreenLayout";
import { YuraMascot } from "../components/brand/YuraMascot";
import { authService } from "../services/authService";
import { NotificationHelpModal } from "../components/profile/NotificationHelpModal";
import { MicrophoneHelpModal } from "../components/promise/MicrophoneHelpModal";
import { showYuraNotification } from "../services/notificationHelper";

// ============================================================================
// 1. LOGIN SCREEN
// ============================================================================
interface LoginScreenProps {
  authEmail: string;
  setAuthEmail: (e: string) => void;
  authPassword: string;
  setAuthPassword: (p: string) => void;
  authError: string;
  setAuthError: (err: string) => void;
  onLoginSuccess: (user: any) => void;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onGoogleSignIn: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  onLoginSuccess,
  onGoToRegister,
  onGoToForgotPassword,
  onGoogleSignIn,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please enter your email and password.");
      return;
    }
    setAuthError("");
    try {
      const user = await authService.loginWithEmail(authEmail, authPassword);
      onLoginSuccess(user);
    } catch (error: any) {
      const code = error?.code;

      if (code === "auth/user-not-found") {
        setAuthError("This email is not registered yet. Please register first.");
      } else if (code === "auth/wrong-password") {
        setAuthError("Incorrect password. Please try again.");
      } else if (code === "auth/invalid-credential") {
        setAuthError("The email address you entered isn't connected to any account.");
      } else if (code === "auth/invalid-email") {
        setAuthError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setAuthError("Too many login attempts. Please wait a moment and try again.");
      } else {
        setAuthError("Login failed. Please try again.");
      }
    }
  };

  return (
    <motion.div
      key="Login"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Login to Promise Yura" }}>
        <div className="space-y-4 pt-0 max-w-sm mx-auto">
          <div className="text-center space-y-1">
            <YuraMascot mood="normal" size="md" src="/yura-ganbatte.png" className="scale-90" />
            <h2 className="text-2xl font-black text-primary">Welcome!</h2>
            <p className="text-xs text-on-surface-variant">Your promises are safe here.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3 pt-3">
            <Input
              label="Email address"
              type="email"
              placeholder="user@example.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5 text-primary" />}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5 text-primary" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="p-1 hover:bg-neutral-creamLight hover:text-primary-variant rounded-full transition-colors focus:outline-none pointer-events-auto cursor-pointer flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-on-surface-variant/70" />
                  ) : (
                    <Eye className="w-5 h-5 text-on-surface-variant/70" />
                  )}
                </button>
              }
              rightIconInteractive={true}
            />

            {authError && <p className="text-xs text-error font-medium px-4">{authError}</p>}

            <div className="text-right px-2">
              <button
                type="button"
                onClick={onGoToForgotPassword}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full text-base py-3.5 mt-2">
              Log In
            </Button>
          </form>

          <div className="relative my-4 text-center select-none">
            <hr className="border-[#eae8e0]" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbff] px-3 text-[10px] font-bold text-neutral-textMuted/60 uppercase">
              OR
            </span>
          </div>

          <div className="space-y-3 animate-none">
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-creamLight text-sm font-semibold text-neutral-text h-12 rounded-full border border-neutral-creamDark/80 shadow-sm active:scale-95 transition-all text-center select-none cursor-pointer relative z-10 pointer-events-auto"
            >
              <svg className="w-5 h-5 shrink-0 pointer-events-none" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="pointer-events-none">Sign in with Google</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-on-surface-variant">Don't have an account? </span>
              <button
                onClick={onGoToRegister}
                className="text-xs font-extrabold text-primary hover:underline select-none cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 2. REGISTER SCREEN
// ============================================================================
interface RegisterScreenProps {
  authEmail: string;
  setAuthEmail: (e: string) => void;
  authPassword: string;
  setAuthPassword: (p: string) => void;
  authName: string;
  setAuthName: (n: string) => void;
  authError: string;
  setAuthError: (err: string) => void;
  onRegisterSuccess: (user: any) => void;
  onGoToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authError,
  setAuthError,
  onRegisterSuccess,
  onGoToLogin,
}) => {
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail);
  const isPasswordLengthValid = authPassword.length >= 6;
  const isPasswordMatching = authPassword !== "" && authPassword === confirmPassword;

  const isFormValid =
    authName.trim().length > 0 &&
    isEmailFormatValid &&
    isPasswordLengthValid &&
    isPasswordMatching;

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName || !confirmPassword) {
      setAuthError("Please fill out all fields.");
      return;
    }
    if (!isEmailFormatValid) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!isPasswordLengthValid) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (!isPasswordMatching) {
      setAuthError("Passwords must match.");
      return;
    }

    setAuthError("");
    try {
      const user = await authService.registerWithEmail(authEmail, authPassword, authName);
      onRegisterSuccess(user);
    } catch (err: any) {
      console.error("[RegisterScreen] Original Firebase registration error object:", err);
      if (err && typeof err === "object") {
        console.error(`[RegisterScreen] Auth Error details -> Code: ${err.code || "unknown"}, Message: ${err.message || String(err)}`);
      } else {
        console.error(`[RegisterScreen] Auth Error details -> ${String(err)}`);
      }

      const errorCode = err?.code;
      let userFriendlyMessage = "Registration failed, please try again.";

      if (errorCode === "auth/email-already-in-use") {
        userFriendlyMessage = "This email is already registered. Try signing in.";
      } else if (errorCode === "auth/invalid-email") {
        userFriendlyMessage = "Please enter a valid email address.";
      } else if (errorCode === "auth/weak-password") {
        userFriendlyMessage = "Password must be at least 6 characters.";
      } else if (errorCode === "auth/operation-not-allowed") {
        userFriendlyMessage = "Email/password sign-in is not enabled yet.";
      } else if (errorCode === "auth/network-request-failed") {
        userFriendlyMessage = "Network error. Please try again.";
      } else if (err?.message) {
        userFriendlyMessage = `Registration failed: ${err.message}`;
      }

      setAuthError(userFriendlyMessage);
    }
  };

  return (
    <motion.div
      key="Register"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Join Promise Yura" }}>
        <div className="space-y-3.5 pt-0 max-w-sm mx-auto">
          <div className="text-center space-y-1">
            <YuraMascot mood="normal" size="md" src="/yura-ganbatte.png" className="scale-90" />
            <h2 className="text-2xl font-black text-primary">Get organized</h2>
            <p className="text-xs text-on-surface-variant">Create your focus-friendly sandbox.</p>
          </div>

          <form onSubmit={handleEmailRegister} className="space-y-2.5 pt-3">
            <Input
              label="What should Yura call you?"
              type="text"
              placeholder="Your Name"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              leftIcon={<User className="w-5 h-5 text-primary" />}
            />

            <div>
              <Input
                label="Email address"
                type="email"
                placeholder="user@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5 text-primary" />}
              />
              {authEmail.length > 0 && !isEmailFormatValid && (
                <p className="text-xs text-error font-medium px-4 mt-1">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <div>
              <Input
                label="Secure Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5 text-primary" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="p-1 hover:bg-neutral-creamLight hover:text-primary-variant rounded-full transition-colors focus:outline-none pointer-events-auto cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-on-surface-variant/70" />
                    ) : (
                      <Eye className="w-5 h-5 text-on-surface-variant/70" />
                    )}
                  </button>
                }
                rightIconInteractive={true}
              />
              {authPassword.length > 0 && !isPasswordLengthValid && (
                <p className="text-xs text-error font-medium px-4 mt-1">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5 text-primary" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="p-1 hover:bg-neutral-creamLight hover:text-primary-variant rounded-full transition-colors focus:outline-none pointer-events-auto cursor-pointer flex items-center justify-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-on-surface-variant/70" />
                    ) : (
                      <Eye className="w-5 h-5 text-on-surface-variant/70" />
                    )}
                  </button>
                }
                rightIconInteractive={true}
              />
              {confirmPassword.length > 0 && !isPasswordMatching && (
                <p className="text-xs text-error font-medium px-4 mt-1">
                  Passwords must match.
                </p>
              )}
            </div>

            {/* PASSWORD CRITERIA CONTAINER */}
            <div className="space-y-1 px-4 py-1.5 border border-[#D8CCFF] rounded-2xl bg-white shadow-sm">
              <p className="text-xs font-bold text-on-surface-variant/80">Password Criteria:</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isPasswordLengthValid ? "bg-[#34A853]" : "bg-on-surface-variant/35"}`} />
                <span className={isPasswordLengthValid ? "text-[#34A853] font-extrabold" : "text-on-surface-variant/70"}>
                  Minimum 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isPasswordMatching ? "bg-[#34A853]" : "bg-on-surface-variant/35"}`} />
                <span className={isPasswordMatching ? "text-[#34A853] font-extrabold" : "text-on-surface-variant/70"}>
                  Passwords must match
                </span>
              </div>
            </div>

            {authError && <p className="text-xs text-error font-medium px-4">{authError}</p>}

            <Button
              type="submit"
              variant="primary"
              className="w-full text-base py-3.5 mt-2"
              disabled={!isFormValid}
            >
              Create Account
            </Button>
          </form>

          <div className="text-center">
            <span className="text-xs text-on-surface-variant">Already have an account? </span>
            <button
              onClick={onGoToLogin}
              className="text-xs font-extrabold text-primary hover:underline select-none cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 3. FORGOT PASSWORD SCREEN
// ============================================================================
interface ForgotPasswordScreenProps {
  authEmail: string;
  setAuthEmail: (e: string) => void;
  showToast: (msg: string) => void;
  onGoToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  authEmail,
  setAuthEmail,
  showToast,
  onGoToLogin,
}) => {
  return (
    <motion.div
      key="ForgotPassword"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Reset Password", onBack: onGoToLogin }}>
        <div className="space-y-4 pt-4 max-w-sm mx-auto">
          <div className="text-center space-y-2 flex flex-col items-center">
            <Lock className="w-8 h-8 text-primary font-bold" />
            <h2 className="text-2xl font-bold text-on-surface mt-1">Forgot Password?</h2>
            <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
              Enter your email. Yura will dispatch a reset configuration securely.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="user@example.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5 text-primary" />}
            />

            <Button
              onClick={async () => {
                if (!authEmail) {
                  showToast("Please write email.");
                  return;
                }
                await authService.forgotPassword(authEmail);
                showToast("Password link dispatched to email!");
                onGoToLogin();
              }}
              variant="primary"
              className="w-full text-base py-3.5"
            >
              Send Recovery Link
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 4. PERMISSIONS SCREEN
// ============================================================================
interface PermissionScreenProps {
  onConfirm: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onConfirm }) => {
  const [micState, setMicState] = React.useState<"granted" | "denied" | "prompt" | "checking" | "default">("checking");
  const [notifState, setNotifState] = React.useState<"granted" | "denied" | "default" | "not-supported" | "checking">("checking");
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isMicHelpOpen, setIsMicHelpOpen] = React.useState(false);
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = React.useState<number>(0);

  React.useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleSendTestNotification = () => {
    try {
      if (typeof Notification === "undefined") {
        console.error("[Test Notification] Notification API is fully unsupported on this browser.");
        setTestResult("Error: Notification API is not supported in this browser.");
        return;
      }
      
      const currentPermission = Notification.permission;
      console.log(`[Test Notification] Button clicked. Current permission state: "${currentPermission}"`);

      if (currentPermission !== "granted") {
        setTestResult(`Error: Permission status is "${currentPermission}". Please grant permission first.`);
        return;
      }

      if (cooldownRemaining > 0) {
        setTestResult(`Please wait ${cooldownRemaining}s before sending another test nudge.`);
        return;
      }
      
      // Fire showYuraNotification synchronously on the gesture tick without preceding async gates
      showYuraNotification("Yura test nudge", {
        body: "Notifications are working!"
      }).then((success) => {
        console.log("[Test Notification] showYuraNotification result:", success);
        if (success) {
          setTestResult("Success: Test notification dispatched.");
          setCooldownRemaining(20); // 20 seconds cooldown to avoid spam issues
        } else {
          setTestResult("Error: Failed to dispatch test notification.");
        }
      }).catch((e: any) => {
        console.error("[Test Notification] Promise rejected:", e);
        setTestResult(`Error: ${e.message || String(e)}`);
      });
    } catch (e: any) {
      console.error("[Test Notification] Synchronous try-catch caught error:", e);
      setTestResult(`Error: ${e.message || String(e)}`);
    }
  };

  const checkNotifPermission = React.useCallback(() => {
    if (!("Notification" in window)) {
      setNotifState("not-supported");
      return;
    }
    setNotifState(Notification.permission as any);
  }, []);

  const checkMicPermission = React.useCallback(async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicState(result.state as any);
        result.onchange = () => {
          setMicState(result.state as any);
        };
        return;
      } catch (e) {
        console.log("[PermissionScreen] Permissions API query error, falling back:", e);
      }
    }
    
    // Fallback check
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setMicState("granted");
      } else {
        setMicState("prompt");
      }
    } catch (err) {
      setMicState("prompt");
    }
  }, []);

  React.useEffect(() => {
    checkMicPermission();
    checkNotifPermission();
  }, [checkMicPermission, checkNotifPermission]);

  const requestMic = async () => {
    try {
      setMicState("checking");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicState("granted");
    } catch (err: any) {
      console.warn("[PermissionScreen] Microphone access denied by user:", err);
      setMicState("denied");
    }
  };

  const requestNotif = async () => {
    if (!("Notification" in window)) {
      setNotifState("not-supported");
      return;
    }
    try {
      setNotifState("checking");
      const consent = await Notification.requestPermission();
      setNotifState(consent as any);
    } catch (err) {
      console.warn("[PermissionScreen] Notification request failed:", err);
      setNotifState(Notification.permission as any);
    }
  };

  return (
    <motion.div
      key="Permission"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Permissions Request" }}>
        <div className="space-y-4 max-w-sm mx-auto flex flex-col items-center pt-1">
          <div className="text-center space-y-1 mb-1 flex flex-col items-center">
            <YuraMascot 
              mood={(micState === "denied" || notifState === "denied") ? "concern" : "supportive"} 
              size="sm" 
              className="mb-1" 
            />
            <h2 className="text-2xl font-black text-primary">Required Permissions</h2>
            <p className="text-xs text-on-surface-variant max-w-[280px] leading-relaxed mx-auto">
              To catch commitments and gently nudge you, Yura needs visual and acoustic authorization.
            </p>
          </div>

          {/* Permissions items checkboxes segment layouts */}
          <div className="w-full space-y-2.5">
            <Card className="glass-card p-3.5 rounded-xl flex flex-col w-full gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 text-left">
                  <Mic className="text-primary w-6 h-6 shrink-0" />
                  <div className="max-w-[180px]">
                    <p className="text-xs font-extrabold text-on-surface">Microphone Access</p>
                    <p className="text-[9px] text-on-surface-variant mt-0.5 leading-snug">
                      {micState === "granted" && "Successfully granted! Yura is ready to listen."}
                      {micState === "denied" && "Blocked by your browser configuration."}
                      {micState === "prompt" && "Access needed to capture your voice dictations."}
                      {micState === "checking" && "Checking microphone permissions..."}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {micState === "granted" && <Badge color="success">Granted</Badge>}
                  {micState === "denied" && <Badge color="danger">Blocked</Badge>}
                  {micState === "prompt" && (
                    <Button size="sm" variant="outline" onClick={requestMic} className="text-[10px] py-1 px-3 h-8">
                      Grant
                    </Button>
                  )}
                  {micState === "checking" && <Badge color="neutral">...</Badge>}
                </div>
              </div>

              {/* Enhanced UX for Denied Microphone Status */}
              {micState === "denied" && (
                <div className="mt-1 pt-3 border-t border-rose-50 space-y-3 text-left">
                  <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col gap-1">
                    <p className="text-xs font-black text-[#ba1a1a]">Yura can't hear you yet.</p>
                    <p className="text-[10px] leading-relaxed text-on-surface-variant font-semibold">
                      You can still type your promise, or enable microphone access from site settings.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => setIsMicHelpOpen(true)}
                      className="text-[10px] h-9 px-2 flex-1 border-neutral-creamDark/40 font-bold active:scale-95"
                    >
                      How to enable
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={checkMicPermission}
                      className="text-[10px] h-9 px-2 flex-1 bg-secondary text-white hover:bg-secondary/90 flex items-center justify-center gap-1 font-extrabold active:scale-95"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Refresh status
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card className="glass-card p-3.5 rounded-xl flex flex-col w-full gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 text-left">
                  <Bell className="text-secondary w-6 h-6 shrink-0" />
                  <div className="max-w-[180px]">
                    <p className="text-xs font-extrabold text-on-surface">System Nudges</p>
                    <p className="text-[9px] text-on-surface-variant mt-0.5 leading-snug">
                      {notifState === "granted" && "Alerts active! Custom Yura reminders enabled."}
                      {notifState === "denied" && "Blocked by your browser configuration."}
                      {notifState === "default" && "Needed to dispatch gentle stress-free check-ins."}
                      {notifState === "not-supported" && "Browser doesn't support system alerts."}
                      {notifState === "checking" && "Checking notification settings..."}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {notifState === "granted" && <Badge color="success">Granted</Badge>}
                  {notifState === "denied" && <Badge color="danger">Blocked</Badge>}
                  {notifState === "default" && (
                    <Button size="sm" variant="outline" onClick={requestNotif} className="text-[10px] py-1 px-3 h-8">
                      Grant
                    </Button>
                  )}
                  {notifState === "not-supported" && <Badge color="neutral">Unavail</Badge>}
                  {notifState === "checking" && <Badge color="neutral">...</Badge>}
                </div>
              </div>

              {notifState === "granted" && (
                <div className="mt-1 pt-3 border-t border-[#b2a4ff]/20 flex flex-col gap-2 text-left">
                  <p className="text-[10px] text-on-surface-variant font-bold leading-normal">
                    Test your system notifications to ensure they are appearing correctly:
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={handleSendTestNotification}
                    className="text-[10px] h-9 px-3 bg-[#5f52a6]/5 border-primary/20 hover:bg-[#5f52a6]/10 text-primary font-bold active:scale-95"
                  >
                    Send test notification
                  </Button>
                  {testResult && (
                    <p className={`text-[9px] font-bold mt-1 px-2.5 py-1.5 rounded-lg border leading-relaxed ${
                      testResult.startsWith("Error:") 
						? "text-error border-rose-100 bg-rose-50/70" 
                        : "text-[#34A853] border-emerald-100 bg-emerald-50/70"
                    }`}>
                      {testResult}
                    </p>
                  )}
                </div>
              )}

              {/* Enhanced UX for Denied Notification Status */}
              {notifState === "denied" && (
                <div className="mt-1 pt-3 border-t border-rose-50 space-y-3 text-left">
                  <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col gap-1">
                    <p className="text-xs font-black text-[#ba1a1a]">Yura can't send nudges yet.</p>
                    <p className="text-[10px] leading-relaxed text-on-surface-variant font-semibold">
                      Notifications are blocked in your browser settings.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => setIsHelpOpen(true)}
                      className="text-[10px] h-9 px-2 flex-1 border-neutral-creamDark/40 font-bold active:scale-95"
                    >
                      How to enable
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={checkNotifPermission}
                      className="text-[10px] h-9 px-2 flex-1 bg-secondary text-white hover:bg-secondary/90 flex items-center justify-center gap-1 font-extrabold active:scale-95"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Refresh status
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="w-full pt-4 space-y-2">
            <Button
              onClick={onConfirm}
              variant="primary"
              className="w-full py-3.5 select-none"
            >
              Confirm & Proceed
            </Button>
            <Button
              onClick={onConfirm}
              variant="ghost"
              className="w-full text-xs text-on-surface-variant font-bold"
            >
              Decide later
            </Button>
          </div>
        </div>
      </ScreenLayout>

      <NotificationHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onRefresh={checkNotifPermission}
      />

      <MicrophoneHelpModal
        isOpen={isMicHelpOpen}
        onClose={() => setIsMicHelpOpen(false)}
      />
    </motion.div>
  );
};
