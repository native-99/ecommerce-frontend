"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/components/ProductCard";
import type { OrderResponse, OrderItemResponse, OrderStatus } from "@/lib/types";

function statusBadge(status: OrderStatus) {
  const map: Record<OrderStatus, { class: string; label: string }> = {
    PENDING: { class: "badge-pending", label: "Menunggu Pembayaran" },
    PAID: { class: "badge-paid", label: "Dibayar" },
    SHIPPED: { class: "badge-shipped", label: "Dikirim" },
    CANCELLED: { class: "badge-cancelled", label: "Dibatalkan" },
    PAYMENT_FAILED: { class: "badge-failed", label: "Gagal Bayar" },
  };
  const s = map[status] || { class: "badge", label: status };
  return <span className={s.class}>{s.label}</span>;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [items, setItems] = useState<OrderItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    const fetchOrder = async () => {
      try {
        const [orderData, itemsData] = await Promise.all([
          api.get<OrderResponse>(`/orders/${id}`),
          api.get<OrderItemResponse[]>(`/orders/${id}/items`),
        ]);
        setOrder(orderData);
        setItems(itemsData);
      } catch {
        console.error("Failed to fetch order");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id, isLoggedIn, router]);

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><div className="skeleton h-60 rounded-2xl" /></div>
          <div className="skeleton h-60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-semibold text-text-secondary">Pesanan tidak ditemukan</h2>
        <Link href="/orders" className="btn-primary mt-4 inline-block">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link href="/orders" className="hover:text-primary-light transition-colors">Pesanan</Link>
        <span>/</span>
        <span className="text-text-secondary">#{order.order_id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Order #{order.order_id}</h1>
          <p className="text-sm text-text-muted mt-1">
            {new Date(order.order_date).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        {statusBadge(order.status)}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-4">Produk</h2>
            <div className="divide-y divide-border/30">
              {items.map((item) => (
                <div key={item.order_item_id} className="flex items-center gap-4 py-4">
                  <div className="w-14 h-14 bg-surface-light rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.product_id}`} className="font-medium text-text-primary hover:text-primary-light transition-colors">
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-text-muted">{item.quantity}x {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold text-text-primary">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">Rincian Pembayaran</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text-primary">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Ongkir</span>
                <span className="text-text-primary">{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Pajak</span>
                <span className="text-text-primary">{formatPrice(order.tax_fee)}</span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-semibold text-text-primary">Total</span>
                <span className="font-bold text-lg text-secondary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {order.xendit_payment_method && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3">Info Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Metode</span>
                  <span className="text-text-primary">{order.xendit_payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span className="text-text-primary">{order.xendit_payment_status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {order.status === "PENDING" && (
            <div className="space-y-3">
              {order.payment_url && (
                <a href={order.payment_url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full block text-center">
                  Bayar Sekarang
                </a>
              )}
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-danger w-full"
              >
                {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
