import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface/50 border-t border-border/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent mb-4">
              IZI Store
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Platform e-commerce terpercaya dengan produk berkualitas dan pengiriman cepat.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Menu</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-text-muted hover:text-primary-light transition-colors">Produk</Link></li>
              <li><Link href="/cart" className="text-sm text-text-muted hover:text-primary-light transition-colors">Keranjang</Link></li>
              <li><Link href="/orders" className="text-sm text-text-muted hover:text-primary-light transition-colors">Pesanan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Akun</h4>
            <ul className="space-y-2">
              <li><Link href="/profile" className="text-sm text-text-muted hover:text-primary-light transition-colors">Profile</Link></li>
              <li><Link href="/profile/addresses" className="text-sm text-text-muted hover:text-primary-light transition-colors">Alamat</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 mt-8 pt-8 text-center">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} IZI Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
