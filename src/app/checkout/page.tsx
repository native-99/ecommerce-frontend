"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/components/ProductCard";
import type { UserAddressResponse, OrderResponse } from "@/lib/types";

export default function CheckoutPage() {
  const { isLoggedIn } = useAuth();
  const { items, fetchCart } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<UserAddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    const fetchAddresses = async () => {
      try {
        const data = await api.get<UserAddressResponse[]>("/address");
        setAddresses(data);
        const defaultAddr = data.find((a) => a.is_default);
        if (defaultAddr) setSelectedAddressId(defaultAddr.user_address_id);
        else if (data.length > 0) setSelectedAddressId(data[0].user_address_id);
      } catch {
        console.error("Failed to fetch addresses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, [isLoggedIn, router]);

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError("Pilih alamat pengiriman terlebih dahulu");
      return;
    }
    setError("");
    setIsCheckingOut(true);
    try {
      const response = await api.post<OrderResponse>("/orders/checkout", {
        cartItemIds: items.map((item) => item.cart_item_id),
        userAddressId: selectedAddressId,
      });
      await fetchCart();
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        router.push(`/orders/${response.order_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout gagal");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
          <div className="skeleton h-60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-semibold text-text-secondary mb-4">Keranjang kosong</h2>
        <Link href="/" className="btn-primary">Belanja dulu</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Alamat Pengiriman</h2>
              <Link href="/profile/addresses" className="text-sm text-primary-light hover:underline">
                Kelola Alamat
              </Link>
            </div>
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">Belum ada alamat. Tambah alamat dulu.</p>
                <Link href="/profile/addresses" className="btn-primary text-sm">Tambah Alamat</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.user_address_id}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200
                      ${selectedAddressId === addr.user_address_id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.user_address_id}
                      onChange={() => setSelectedAddressId(addr.user_address_id)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary text-sm">{addr.label}</span>
                        {addr.is_default && (
                          <span className="text-[10px] font-medium text-primary-light bg-primary/10 px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{addr.recipient_name} • {addr.phone}</p>
                      <p className="text-sm text-text-muted">{addr.street_address}, {addr.city}, {addr.province} {addr.postal_code}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-4">Produk yang Dipesan</h2>
            <div className="divide-y divide-border/30">
              {items.map((item) => (
                <div key={item.cart_item_id} className="flex items-center gap-4 py-3">
                  <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-text-muted">{item.quantity}x {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-semibold text-text-primary mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal ({items.length} produk)</span>
                <span className="text-text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Ongkir & Pajak</span>
                <span className="text-text-muted italic text-xs">Dihitung saat proses</span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-semibold text-text-primary">Estimasi Total</span>
                <span className="font-bold text-lg text-secondary">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || !selectedAddressId}
              className="btn-primary w-full"
            >
              {isCheckingOut ? "Memproses..." : "Bayar Sekarang"}
            </button>
            <p className="text-xs text-text-muted text-center mt-3">
              Anda akan diarahkan ke halaman pembayaran Xendit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
