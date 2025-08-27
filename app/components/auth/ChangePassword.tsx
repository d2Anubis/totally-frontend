"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Swal from "sweetalert2";

const ChangePassword = () => {
  const { user, updatePassword, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === "oldPassword") {
      setOldPassword(value);
      if (errors.oldPassword) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.oldPassword;
          return newErrors;
        });
      }
    } else if (id === "newPassword") {
      setNewPassword(value);
      if (errors.newPassword) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.newPassword;
          return newErrors;
        });
      }
    } else if (id === "confirmPassword") {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Swal.fire({
        title: "Error",
        text: "User information is missing. Please log in again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return;
    }

    setLoading(true);

    try {
      const { success, message } = await updatePassword(
        user.id.toString(),
        oldPassword,
        newPassword
      );

      if (success) {
        await Swal.fire({
          title: "Password Updated Successfully",
          text: "Your password has been changed. You will be logged out for security reasons.",
          icon: "success",
          confirmButtonColor: "#00478f",
          timer: 3000,
          timerProgressBar: true,
        });

        // Clear form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Logout user and redirect to home page
        logout();
        router.push("/");
      } else {
        Swal.fire({
          title: "Password Update Failed",
          text: message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm max-w-2xl mx-auto">
      <h1 className="title-1-semibold text-blue-00 mb-4">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="oldPassword"
            className="block body-large-semibold mb-2"
          >
            Current Password
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={handleChange}
            className={`w-full bg-transparent border ${
              errors.oldPassword ? "border-red-500" : "border-blue-00"
            } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 body-medium`}
            placeholder="Enter your current password"
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block body-large-semibold mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={handleChange}
            className={`w-full bg-transparent border ${
              errors.newPassword ? "border-red-500" : "border-blue-00"
            } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 body-medium`}
            placeholder="Enter your new password"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block body-large-semibold mb-2"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            className={`w-full bg-transparent border ${
              errors.confirmPassword ? "border-red-500" : "border-blue-00"
            } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 body-medium`}
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-00 text-white button py-2 px-6 rounded-md hover:bg-blue-10 transition-colors disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
