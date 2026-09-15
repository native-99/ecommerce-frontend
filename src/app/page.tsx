import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="page-container">
        <div className="skeleton h-48 rounded-3xl mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton aspect-square rounded-xl mb-4" />
              <div className="skeleton h-4 w-2/3 mb-2" />
              <div className="skeleton h-5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
