const ProductSkeleton = () => (
    <>
        {Array.from({ length: 4 }).map((_, i) => (
            <div className="group bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden animate-pulse">
                <div className="relative aspect-video bg-slate-700"></div>
                <div className="p-4">
                    <div className="h-3 bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3 mb-3"></div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 bg-slate-700 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-slate-700 rounded w-full"></div>
                </div>
            </div>
        ))}

    </>

)
export default ProductSkeleton