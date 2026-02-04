"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "@/lib/AuthContext";
import { LogIn, LogOut, User, Lock } from "lucide-react";

export default function LoginManager() {
  const { isAdmin, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await login(username, password);
    if (success) {
      setIsOpen(false);
      setUsername("");
      setPassword("");
    } else {
      setError("主号或密码错误，请重试");
    }
    setLoading(false);
  };

  if (isAdmin) {
    return (
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all text-sm font-medium"
      >
        <LogOut size={16} />
        退出登录
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
      >
        <LogIn size={16} />
        管理登录
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="管理员登录"
        className="max-w-md"
      >
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              管理账号
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="请输入账号"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              登录密码
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="请输入管理密码"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {loading ? "正在登录..." : "立即登录"}
          </button>
        </form>
      </Modal>
    </>
  );
}
