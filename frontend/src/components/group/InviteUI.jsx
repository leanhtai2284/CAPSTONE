import React, { useState } from "react";
import { X, Mail, Copy, Check } from "lucide-react";
import { useGroup } from "../../hooks/useGroup";
import { toast } from "sonner";

export default function InviteUI({ groupId, isOpen, onClose, groupName }) {
  const { sendInvite, loading } = useGroup();
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState([]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error("❌ Vui lòng nhập email");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error("❌ Email không hợp lệ");
      return;
    }

    if (emails.includes(trimmedEmail)) {
      toast.error("⚠️ Email này đã được thêm");
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmail("");
    setErrors(errors.filter((e) => e !== trimmedEmail));
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
    setErrors(errors.filter((e) => e !== emailToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) {
      toast.error("❌ Vui lòng thêm ít nhất một email");
      return;
    }

    try {
      const failedEmails = [];
      let successCount = 0;

      for (const recipientEmail of emails) {
        try {
          await sendInvite(groupId, recipientEmail);
          successCount++;
        } catch (error) {
          failedEmails.push(recipientEmail);
        }
      }

      if (successCount > 0) {
        toast.success(
          `✅ Đã gửi ${successCount}/${emails.length} lời mời thành công!`
        );
      }

      if (failedEmails.length > 0) {
        setErrors(failedEmails);
        toast.error(
          `❌ Không thể gửi lời mời cho ${failedEmails.length} email`
        );
      } else {
        setEmails([]);
        onClose();
      }
    } catch (error) {
      toast.error("❌ Lỗi khi gửi lời mời");
    }
  };

  const getInviteLink = () => {
    // Copy invite link to clipboard (you can generate this from backend)
    return `${window.location.origin}/join-group/${groupId}`;
  };

  const copyInviteLink = () => {
    const link = getInviteLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("✅ Đã sao chép liên kết!"); setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mời thành viên
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {groupName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email Input Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📧 Mời theo email
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập email người dùng"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleAddEmail}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Thêm
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Nhấn Enter hoặc click nút "Thêm" để thêm email
            </p>
          </div>

          {/* Added Emails */}
          {emails.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                📋 Email được thêm ({emails.length})
              </h4>
              <div className="space-y-2">
                {emails.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                    <button
                      onClick={() => handleRemoveEmail(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Emails */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                ⚠️ Không thể gửi lời mời cho:
              </p>
              <ul className="space-y-1">
                {errors.map((email) => (
                  <li key={email} className="text-sm text-red-700 dark:text-red-400">
                    • {email}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          <div className="border-t dark:border-gray-700"></div>

          {/* Invite Link Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              🔗 Hoặc chia sẻ liên kết mời
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={getInviteLink()}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSendInvites}
            disabled={loading || emails.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Đang gửi..."
              : `Gửi ${emails.length} lời mời`}
          </button>
        </div>
      </div>
    </div>
  );
}
