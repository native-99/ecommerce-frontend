"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { PaginatedProductResponse } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "";

  const [products, setProducts] = useState<PaginatedProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let endpoint = `/products?page=${page}&size=12`;
        if (searchQuery) endpoint += `&name=${encodeURIComponent(searchQuery)}`;
        if (categoryQuery) endpoint += `&categoryName=${encodeURIComponent(categoryQuery)}`;
        const data = await api.get<PaginatedProductResponse>(endpoint);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, searchQuery, categoryQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    window.location.href = `/${params.toString() ? "?" + params.toString() : ""}`;
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-surface to-secondary/10 border border-border/30 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_50%)] opacity-10" />
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-text-primary via-primary-light to-secondary bg-clip-text text-transparent">
            Temukan Produk Terbaik
          </h1>
          <p className="text-text-secondary text-lg mb-6 max-w-xl">
            Belanja mudah dengan harga terjangkau dan pengiriman cepat ke seluruh Indonesia.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
            <input
              type="text"
              placeholder="Cari produk yang kamu butuhkan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field flex-1 !rounded-full"
            />
            <button type="submit" className="btn-primary !rounded-full !px-8">
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || categoryQuery) && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-text-muted">Filter:</span>
          {searchQuery && (
            <span className="badge bg-primary/15 text-primary-light">
              &quot;{searchQuery}&quot;
              <a href="/" className="ml-2 hover:text-white">&times;</a>
            </span>
          )}
          {categoryQuery && (
            <span className="badge bg-secondary/15 text-secondary">
              {categoryQuery}
              <a href="/" className="ml-2 hover:text-white">&times;</a>
            </span>
          )}
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton aspect-square rounded-xl mb-4" />
              <div className="skeleton h-4 w-2/3 mb-2" />
              <div className="skeleton h-5 w-1/3" />
            </div>
          ))}
        </div>
      ) : products && products.data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.data.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          {products.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-30">
                ← Sebelumnya
              </button>
              <span className="text-sm text-text-muted px-4">Halaman {page + 1} dari {products.total_pages}</span>
              <button onClick={() => setPage(page + 1)} disabled={products.last} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-30">
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <svg className="w-20 h-20 text-text-muted/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-xl font-semibold text-text-secondary mb-2">Produk tidak ditemukan</h2>
          <p className="text-text-muted">Coba kata kunci lain atau hapus filter.</p>
        </div>
      )}
    </div>
  );
}
