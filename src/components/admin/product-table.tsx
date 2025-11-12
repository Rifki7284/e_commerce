"use client"

import { MoreVertical, Edit2, Trash2, Package } from 'lucide-react'
import { useState } from 'react'
import { Spinner } from '../ui/spinner'
import ProductFormEditModal from './product-form-edit'

interface Category {
  id: number
  name: string
  slug: string
  iconName: string
}

interface ProductImage {
  url: string
}

interface Product {
  id: number
  name: string
  price: number
  description: string
  stock: string
  categories?: Category
  images: ProductImage[]
}

interface ProductFormData {
  name: string
  price: string
  description: string
  stock: string
  category: string
  imageFiles: File[]
  imageUrls: string[]
}
interface ProductTableProps {
  products: Product[]
  onDelete: (id: string) => void
  getProduct: () => void
  loading: boolean
  page: number
}

interface EditProps {
  id: string
  isOpen: boolean
  data: Product | ProductFormData
}

export default function ProductTable({ products, onDelete, loading, page, getProduct }: ProductTableProps) {
  const [id, setId] = useState<string>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [data, setData] = useState<ProductFormData | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleEdit = ({ id, isOpen, data }: EditProps) => {
    setId(id)
    setIsModalOpen(isOpen)
    // pastikan data dikonversi ke ProductFormData
    const convertedData: ProductFormData = {
      name: data.name,
      price: data.price.toString(),
      description: data.description,
      stock: data.stock,
      category: (data as any).category ?? (data as any).categories?.id?.toString() ?? "",
      imageFiles: [],
      imageUrls: (data as any).images?.map((img: any) => img.url) ?? [],
    }
    setData(convertedData)
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-16 px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center">
                    <Spinner className="size-6 text-primary inline-block" />
                  </td>
                </tr>
              )}
              {!loading && products.map((product, idx) => (
                <tr key={product.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-muted-foreground font-medium">
                      {idx + 1 + (page - 1) * 2}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {product.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.categories ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{product.categories.iconName}</span>
                        <span className="text-sm text-foreground font-medium">{product.categories.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No category</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/50 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit({ id: product.id.toString(), isOpen: true, data: product })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 transition-all hover:bg-blue-200 dark:hover:bg-blue-950 active:scale-95"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product.id.toString())}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition-all hover:bg-red-200 dark:hover:bg-red-950 active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No products yet</h3>
            <p className="text-sm text-muted-foreground">Get started by adding your first product</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Spinner className="size-8 text-primary mx-auto" />
          </div>
        )}
        {!loading && products.map((product) => (
          <div
            key={product.id}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-base mb-1">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {product.categories && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                        <span className="mr-1">{product.categories.iconName}</span>
                        {product.categories.name}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </button>

                  {activeMenu === product.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveMenu(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-popover rounded-lg shadow-lg border border-border py-1 z-20">
                        <button onClick={() => handleEdit({ id: product.id.toString(), isOpen: true, data: product })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(product.id.toString())
                            setActiveMenu(null)
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Price
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No products yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Get started by adding your first product
            </p>
          </div>
        )}
      </div>
      <ProductFormEditModal
        isOpen={isModalOpen}
        id={id ?? ""}
        data={data!}
        onClose={() => setIsModalOpen(false)}
        onSuccess={getProduct}
      />
    </>
  )
}
