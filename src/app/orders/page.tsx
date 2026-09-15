"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/components/ProductCard";
import type { PaginatedOrderResponse, OrderStatus } from "@/lib/types";

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

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<PaginatedOrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<PaginatedOrderResponse>(`/orders?page=${page}&size=10`);
        setOrders(data);
      } catch {
        console.error("Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn, router, page]);

  return (
    <div className="page-container">
      <h1 className="section-title">Pesanan Saya</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : orders && orders.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {orders.data.map((order) => (
              <Link
                key={order.order_id}
                href={`/orders/${order.order_id}`}
                className="card-hover flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-text-secondary">
                      Order #{order.order_id}
                    </span>
                    {statusBadge(order.status)}
                  </div>
                  <p className="text-xs text-text-muted">
                    {new Date(order.order_date).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary">{formatPrice(order.total_amount)}</p>
                  <svg className="w-4 h-4 text-text-muted ml-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {orders.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-30">
                ← Sebelumnya
              </button>
              <span className="text-sm text-text-muted px-4">Halaman {page + 1} / {orders.total_pages}</span>
              <button onClick={() => setPage(page + 1)} disabled={orders.last} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-30">
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-text-secondary mb-2">Belum ada pesanan</h2>
          <p className="text-text-muted mb-6">Yuk mulai belanja!</p>
          <Link href="/" className="btn-primary">Lihat Produk</Link>
        </div>
      )}
    </div>
  );
}
