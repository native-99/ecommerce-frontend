"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { UserResponse } from "@/lib/types";

export default function ProfilePage() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    const fetchProfile = async () => {
      try {
        const data = await api.get<UserResponse>("/users/me");
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
      } catch {
        console.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [isLoggedIn, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await api.put<UserResponse>("/users/me", { username, email });
      setUser(updated);
      setIsEditing(false);
      setMessage("Profile berhasil diupdate");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal update");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container max-w-2xl mx-auto">
        <div className="skeleton h-8 w-32 mb-8" />
        <div className="skeleton h-60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="section-title">Profile Saya</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm ${message.includes("berhasil") ? "bg-success/10 border border-success/30 text-success" : "bg-danger/10 border border-danger/30 text-danger"}`}>
          {message}
        </div>
      )}

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/30">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{user?.username}</h2>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Menyimpan..." : "Simpan"}</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Username</p>
                <p className="text-text-primary font-medium">{user?.username}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Email</p>
              <p className="text-text-primary font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Bergabung sejak</p>
              <p className="text-text-primary font-medium">
                {user?.created_at && new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Role</p>
              <div className="flex gap-2 mt-1">
                {user?.roles.map((role) => (
                  <span key={role} className="badge bg-primary/15 text-primary-light">{role}</span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
              <Link href="/profile/addresses" className="btn-secondary">Kelola Alamat</Link>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card mt-6 !border-danger/20">
        <h3 className="font-semibold text-danger mb-2">Zona Berbahaya</h3>
        <p className="text-sm text-text-muted mb-4">Logout dari akun anda.</p>
        <button onClick={() => { logout(); router.push("/"); }} className="btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}
