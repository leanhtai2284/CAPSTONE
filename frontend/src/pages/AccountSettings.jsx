// src/pages/AccountSettings.jsx
import React, { useState } from "react";

function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu mới không khớp.");
      return;
    }
    //Gọi API đổi mật khẩu
    setMessage("Đổi mật khẩu thành công!");
  };

  return (
    <div>
      <h2>Cài đặt tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mật khẩu hiện tại:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đổi mật khẩu</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AccountSettings;