import Link from "next/link";
import type { ProductResponse } from "@/lib/types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product }: { product: ProductResponse }) {
  return (
    <Link href={`/products/${product.product_id}`} className="card-hover group cursor-pointer">
      {/* Placeholder Image */}
      <div className="aspect-square bg-gradient-to-br from-surface-light to-bg-light rounded-xl mb-4 overflow-hidden flex items-center justify-center group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300">
        <svg className="w-16 h-16 text-text-muted/30 group-hover:text-primary/40 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      {/* Categories */}
      {product.categories && product.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {product.categories.slice(0, 2).map((cat) => (
            <span
              key={cat.category_id}
              className="text-[10px] font-medium text-primary-light bg-primary/10 px-2 py-0.5 rounded-full"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Name */}
      <h3 className="font-semibold text-text-primary group-hover:text-primary-light transition-colors line-clamp-2 mb-1">
        {product.name}
      </h3>

      {/* Price */}
      <p className="text-lg font-bold bg-gradient-to-r from-secondary to-amber-300 bg-clip-text text-transparent">
        {formatPrice(product.price)}
      </p>

      {/* Stock */}
      <p className="text-xs text-text-muted mt-1">
        {product.stock_quantity > 0 ? (
          <span className="text-success">Stok: {product.stock_quantity}</span>
        ) : (
          <span className="text-danger">Habis</span>
        )}
      </p>
    </Link>
  );
}

export { formatPrice };
