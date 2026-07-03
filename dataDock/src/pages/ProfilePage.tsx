import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { changePassword } from "../services/authService";

export default function ProfilePage() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "";

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword) {
      //   alert("Please enter current password.");
      toast.info("Please enter current password.");
      return;
    }

    if (!newPassword) {
      //   alert("Please enter new password.");
      toast.info("Please enter new password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.info("Password must be at least 8 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.info("New password must be different from current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and Confirm password do not match.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      localStorage.clear();
      toast.success("Password updated successfully. Please login again.");
      navigate("/login");
    } catch (error: any) {
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);

      alert(error.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-[450px] rounded bg-white p-6 shadow">
        <h2 className="mb-6 text-2xl font-bold">My Profile</h2>

        <label className="mb-1 block font-medium">Username</label>

        <input
          type="text"
          value={userName}
          readOnly
          className="mb-4 w-full rounded border bg-gray-100 p-2"
        />

        <label className="mb-1 block font-medium">Current Password</label>

        <input
          type="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        <label className="mb-1 block font-medium">New Password</label>

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        <label className="mb-1 block font-medium">Confirm Password</label>

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-6 w-full rounded border p-2"
        />

        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="rounded bg-gray-500 px-6 py-2 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleChangePassword}
            className="rounded bg-blue-600 px-6 py-2 text-white"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
