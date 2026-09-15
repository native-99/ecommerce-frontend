"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/components/ProductCard";

export default function CartPage() {
  const { isLoggedIn } = useAuth();
  const { items, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-semibold text-text-secondary mb-4">Login dulu untuk lihat keranjang</h2>
        <Link href="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title !mb-0">Keranjang Belanja</h1>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-sm text-danger hover:underline">
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card flex gap-4">
              <div className="skeleton w-24 h-24 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-1/2" />
                <div className="skeleton h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-20 h-20 text-text-muted/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="text-xl font-semibold text-text-secondary mb-2">Keranjang kosong</h2>
          <p className="text-text-muted mb-6">Yuk mulai belanja!</p>
          <Link href="/" className="btn-primary">Lihat Produk</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.cart_item_id} className="card flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-surface-light rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`} className="font-semibold text-text-primary hover:text-primary-light transition-colors line-clamp-1">
                    {item.product_name}
                  </Link>
                  <p className="text-sm text-text-muted">{formatPrice(item.price)} / pcs</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1.5 text-text-secondary hover:bg-bg-light transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium bg-bg-light text-text-primary min-w-[40px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="px-3 py-1.5 text-text-secondary hover:bg-bg-light transition-colors text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <p className="font-bold text-secondary min-w-[100px] text-right">
                  {formatPrice(item.total_price)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.cart_item_id)}
                  className="p-2 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-text-primary mb-4">Ringkasan Belanja</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Total ({items.length} produk)</span>
                  <span className="text-text-primary font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between">
                  <span className="font-semibold text-text-primary">Subtotal</span>
                  <span className="font-bold text-lg text-secondary">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="btn-primary w-full"
              >
                Checkout ({items.length} produk)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
