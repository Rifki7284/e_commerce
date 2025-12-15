"use client";

import Link from "next/link";

interface PopularCategory {
  id: number;
  name: string;
  slug: string;
  iconName: string;
}

const colorStyles = [
  {
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    hover: "hover:border-blue-500/60",
  },
  {
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    hover: "hover:border-purple-500/60",
  },
  {
    gradient: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
    hover: "hover:border-orange-500/60",
  },
];

export default function PopularCategories({
  categories,
}: {
  categories: PopularCategory[];
}) {
  let gridColsClass = "";
  const count = categories.length;

  if (count === 1) {
    gridColsClass = "grid-cols-1 max-w-sm";
  } else if (count === 2) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 max-w-xl";
  } else {
    gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }
  return (
    <div className={`grid gap-6 mx-auto ${gridColsClass}`}>
      {categories.map((category, index) => {
        const style = colorStyles[index % colorStyles.length]; // cycle warna

        return (
          <Link
            key={category.id}
            href={`/product?category=${category.slug}`}
            className={`
              bg-linear-to-br ${style.gradient}
              backdrop-blur-sm border ${style.border} ${style.hover}
              rounded-xl p-8 text-center
              hover:shadow-xl transition-all duration-300
              group cursor-pointer
              // Atur lebar agar memenuhi container penuh pada grid, kecuali count <= 2
              ${count <= 2 ? "w-full" : ""} 
            `}
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.iconName || "📦"}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {category.name}
            </h3>
            <p className="text-slate-400 text-sm">Browse collection →</p>
          </Link>
        );
      })}
    </div>
  );
}
