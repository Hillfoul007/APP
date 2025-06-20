import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  MessageSquare,
  User,
  CheckCircle,
  Loader2,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { setupRecaptcha, sendOTP, verifyOTP } from "@/lib/firebase";

interface MobileFirebaseAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type AuthStep = "phone" | "otp" | "name" | "success";

const MobileFirebaseAuth: React.FC<MobileFirebaseAuthProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen && step === "phone") {
      // Setup reCAPTCHA when modal opens
      const timer = setTimeout(() => {
        setupRecaptcha("recaptcha-container");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");
    if (phoneNumber.length <= 10) {
      return phoneNumber;
    }
    return phoneNumber.slice(0, 10);
  };

  const validatePhone = (phoneNumber: string) => {
    return phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePhone(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const recaptchaVerifier = setupRecaptcha("recaptcha-container");
      const formattedPhone = `+91${phone}`;

      const result = await sendOTP(formattedPhone, recaptchaVerifier);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep("otp");
      } else {
        setError(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(confirmationResult, otp);

      if (result.success) {
        setStep("name");
      } else {
        setError(result.error || "Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      // Store user data in MongoDB after Firebase auth
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://auth-back-ula7.onrender.com/api";

      const response = await fetch(`${API_BASE_URL}/auth/firebase-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: confirmationResult.user?.uid,
          phone: `+91${phone}`,
          name: name.trim(),
          userType: "customer",
          verified: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("current_user", JSON.stringify(data.user));

        setStep("success");

        // Call success callback after showing success message
        setTimeout(() => {
          onSuccess(data.user);
          resetForm();
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err: any) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setName("");
    setError("");
    setLoading(false);
    setConfirmationResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const goBack = () => {
    setError("");
    if (step === "otp") setStep("phone");
    if (step === "name") setStep("otp");
  };

  const renderStepContent = () => {
    switch (step) {
      case "phone":
        return (
          <div className="px-4 pb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome!
              </h3>
              <p className="text-gray-600">
                Enter your phone number to get started
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="phone"
                  className="text-lg font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="flex mt-2">
                  <div className="flex items-center px-4 bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl">
                    <span className="text-gray-700 font-medium">🇮🇳 +91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(formatPhoneNumber(e.target.value))
                    }
                    className="rounded-l-none rounded-r-xl text-lg py-6 font-medium"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
                disabled={loading || !validatePhone(phone)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Send OTP
                  </>
                )}
              </Button>
            </form>

            {/* reCAPTCHA container */}
            <div id="recaptcha-container"></div>
          </div>
        );

      case "otp":
        return (
          <div className="px-4 pb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Verify OTP
              </h3>
              <p className="text-gray-600">
                We sent a 6-digit code to
                <br />
                <span className="font-semibold text-gray-900">+91 {phone}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="otp"
                  className="text-lg font-medium text-gray-700"
                >
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-2xl tracking-widest py-6 rounded-xl font-bold"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 py-6 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => setStep("phone")}
                >
                  Change phone number?
                </button>
              </div>
            </form>
          </div>
        );

      case "name":
        return (
          <div className="px-4 pb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Almost Done!
              </h3>
              <p className="text-gray-600">
                Tell us your name to personalize your experience
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="name"
                  className="text-lg font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="py-6 text-lg rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 py-6 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </form>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-12 px-4">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to HomeServices!
            </h3>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Phone:</strong> +91{phone}
                <br />
                <strong className="text-gray-900">Name:</strong> {name}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-6 pb-4">
          <DialogTitle className="text-center text-xl font-bold">
            {step === "success" ? "🎉 Success!" : "🔐 Secure Login"}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white">
          {error && (
            <div className="px-4 pt-4">
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {renderStepContent()}
        </div>

        {step !== "success" && (
          <div className="text-center text-xs text-gray-500 p-4 bg-gray-50">
            🔒 Secured by Firebase • Protected by reCAPTCHA
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileFirebaseAuth;
