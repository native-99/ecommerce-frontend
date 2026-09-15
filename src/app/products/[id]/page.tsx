"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/components/ProductCard";
import type { ProductResponse } from "@/lib/types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get<ProductResponse>(`/products/${id}`);
        setProduct(data);
      } catch {
        console.error("Product not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.product_id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-10 w-1/3" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-xl font-semibold text-text-secondary">Produk tidak ditemukan</h2>
        <Link href="/" className="btn-primary mt-4 inline-block">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary-light transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-text-secondary">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-surface-light to-bg-light rounded-2xl flex items-center justify-center border border-border/30">
          <svg className="w-32 h-32 text-text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        {/* Product Info */}
        <div>
          {/* Categories */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.categories.map((cat) => (
                <Link
                  key={cat.category_id}
                  href={`/?category=${encodeURIComponent(cat.name)}`}
                  className="text-xs font-medium text-primary-light bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {product.name}
          </h1>

          <p className="text-3xl font-extrabold bg-gradient-to-r from-secondary to-amber-300 bg-clip-text text-transparent mb-6">
            {formatPrice(product.price)}
          </p>

          {/* Details */}
          <div className="card !p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Stok</span>
              <span className={product.stock_quantity > 0 ? "text-success font-medium" : "text-danger font-medium"}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} tersedia` : "Habis"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Berat</span>
              <span className="text-text-secondary">{product.weight} gram</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">Deskripsi</h3>
              <p className="text-text-muted leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Add to Cart */}
          {product.stock_quantity > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-text-secondary hover:bg-bg-light transition-colors"
                >
                  −
                </button>
                <span className="px-5 py-3 text-text-primary font-medium bg-bg-light min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-4 py-3 text-text-secondary hover:bg-bg-light transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 ${added ? "!bg-success" : ""}`}
              >
                {added ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ditambahkan!
                  </>
                ) : addingToCart ? (
                  "Menambahkan..."
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Tambah ke Keranjang
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
