"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { UserAddressResponse, UserAddressRequest } from "@/lib/types";

const emptyForm: UserAddressRequest = {
  label: "", recipientName: "", phone: "", streetAddress: "", city: "", province: "", postalCode: "",
};

export default function AddressesPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<UserAddressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<UserAddressRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAddresses = async () => {
    try {
      const data = await api.get<UserAddressResponse[]>("/address");
      setAddresses(data);
    } catch { /* empty */ } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    fetchAddresses();
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await api.put(`/address/${editId}`, form);
      } else {
        await api.post("/address", form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleEdit = (addr: UserAddressResponse) => {
    setEditId(addr.user_address_id);
    setForm({
      label: addr.label, recipientName: addr.recipient_name, phone: addr.phone,
      streetAddress: addr.street_address, city: addr.city, province: addr.province, postalCode: addr.postal_code,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus alamat ini?")) return;
    try {
      await api.delete(`/address/${id}`);
      await fetchAddresses();
    } catch { /* empty */ }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put(`/address/${id}/set-default`);
      await fetchAddresses();
    } catch { /* empty */ }
  };

  const updateField = (field: keyof UserAddressRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="page-container max-w-2xl mx-auto">
        <div className="skeleton h-8 w-48 mb-8" />
        {[1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-2xl mb-4" />)}
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title !mb-0">Alamat Saya</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-primary text-sm"
        >
          + Tambah Alamat
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-text-primary mb-4">{editId ? "Edit Alamat" : "Alamat Baru"}</h2>
          {error && <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-xl text-sm text-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Label</label>
                <input value={form.label} onChange={(e) => updateField("label", e.target.value)} className="input-field !py-2 text-sm" placeholder="Rumah / Kantor" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Nama Penerima</label>
                <input value={form.recipientName} onChange={(e) => updateField("recipientName", e.target.value)} className="input-field !py-2 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">No. Telepon</label>
              <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="input-field !py-2 text-sm" placeholder="08xxxxxxxxxx" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Alamat Lengkap</label>
              <input value={form.streetAddress} onChange={(e) => updateField("streetAddress", e.target.value)} className="input-field !py-2 text-sm" required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Kota</label>
                <input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Provinsi</label>
                <input value={form.province} onChange={(e) => updateField("province", e.target.value)} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Kode Pos</label>
                <input value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} className="input-field !py-2 text-sm" required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Menyimpan..." : "Simpan"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary text-sm">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-text-secondary mb-2">Belum ada alamat</h2>
          <p className="text-text-muted">Tambah alamat untuk mulai checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.user_address_id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary">{addr.label}</span>
                    {addr.is_default && <span className="text-[10px] font-medium text-primary-light bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-text-secondary">{addr.recipient_name} • {addr.phone}</p>
                  <p className="text-sm text-text-muted mt-1">{addr.street_address}</p>
                  <p className="text-sm text-text-muted">{addr.city}, {addr.province} {addr.postal_code}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.user_address_id)}
                      className="text-xs text-primary-light hover:underline px-2 py-1">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => handleEdit(addr)}
                    className="p-2 text-text-muted hover:text-primary-light hover:bg-primary/10 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(addr.user_address_id)}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
