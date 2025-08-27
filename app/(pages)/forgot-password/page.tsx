"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { forgotPassword, resetPassword } from "@/app/lib/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter your email address",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Swal.fire({
        title: "Error",
        text: "Please enter a valid email address",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        Swal.fire({
          title: "Reset Link Sent",
          text: "Please check your email for password reset instructions",
          icon: "success",
          confirmButtonColor: "#00478f",
        }).then(() => {
          setStep("reset");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter the reset token from your email",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      Swal.fire({
        title: "Error",
        text: "Password must be at least 6 characters long",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "Passwords do not match",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(resetToken, newPassword);

      if (result.success) {
        Swal.fire({
          title: "Password Reset Successful",
          text: "Your password has been reset successfully. Please login with your new password.",
          icon: "success",
          confirmButtonColor: "#00478f",
        }).then(() => {
          router.push("/login");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto min-h-[calc(100vh-300px)]">
      <div className="text-center mb-8">
        <h1 className="title-1 text-blue-00 mb-4">
          {step === "email" ? "Forgot Password" : "Reset Password"}
        </h1>
        <p className="body-text text-gray-600">
          {step === "email"
            ? "Enter your email address and we'll send you a link to reset your password."
            : "Enter the reset token from your email and your new password."}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="email" className="block title-1-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              className="w-full bg-transparent border border-blue-00 rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-blue-00 text-white button py-3 rounded-md hover:bg-blue-10 transition-colors disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="body-medium text-blue-00 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="resetToken" className="block title-1-semibold mb-2">
              Reset Token
            </label>
            <input
              type="text"
              id="resetToken"
              placeholder="Enter the token from your email"
              className="w-full bg-transparent border border-blue-00 rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block title-1-semibold mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                placeholder="Enter your new password"
                className="w-full bg-transparent border border-blue-00 rounded-md p-3 pr-12 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <i className="fas fa-eye-slash w-5 h-5 text-blue-00"></i>
                ) : (
                  <i className="fas fa-eye w-5 h-5 text-blue-00"></i>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block title-1-semibold mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your new password"
                className="w-full bg-transparent border border-blue-00 rounded-md p-3 pr-12 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <i className="fas fa-eye-slash w-5 h-5 text-blue-00"></i>
                ) : (
                  <i className="fas fa-eye w-5 h-5 text-blue-00"></i>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-blue-00 text-white button py-3 rounded-md hover:bg-blue-10 transition-colors disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="body-medium text-blue-00 hover:underline block mx-auto"
              >
                Send Another Reset Link
              </button>
              <Link
                href="/login"
                className="body-medium text-blue-00 hover:underline block"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
