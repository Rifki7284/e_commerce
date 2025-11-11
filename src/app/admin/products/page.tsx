"use client"

import { useEffect, useState } from "react"
import AdminLayout from "@/components/admin/admin-layout"
import ProductForm from "@/components/admin/product-form"
import ProductTable from "@/components/admin/product-table"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import ProductFormModal from "@/components/admin/product-form"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
interface Product {
  id: number
  name: string
  price: number
  description: string
  stock: string
  images: ProductImage[]
}
interface ProductImage {
  url: string
}
export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>()
  const [perPage, setPerPage] = useState<string>("5")
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPage) {
      setCurrentPage(page)
      // di sini kamu bisa panggil API atau ubah data
    }
  }

  // buat daftar halaman yang akan ditampilkan (misal 1 ... 4 5 6 ... 10)
  const getVisiblePages = () => {
    const pages: (number | string)[] = []

    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPage)
      } else if (currentPage >= totalPage - 2) {
        pages.push(1, "...", totalPage - 3, totalPage - 2, totalPage - 1, totalPage)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPage)
      }
    }
    return pages
  }
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })
      getProduct()
      if (!res.ok) throw new Error("Failed to delete product")

    } catch (error: any) {
      alert(error.message)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState<string>("")
  useEffect(() => {
    getProduct()
  }, [currentPage, search, perPage]);
  const getProduct = async () => {
    setLoading(true)
    const res = await fetch(`/api/products?page=${currentPage}&perPage=${perPage}&search=${search}`)
    const data = await res.json()
    setProducts(data.product)
    setTotalPage(Math.ceil(data.count / Number(perPage)))
    setLoading(false)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products Management</h1>
            <p className="mt-1 text-muted-foreground">Add, edit, or remove products from your inventory</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </div>

        {/* Form Section */}

        {/* Modal ProductForm */}
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={getProduct}
        />

        <div className='w-full flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-3'>
          {/* Show entries section */}
          <div className='flex items-center gap-2 sm:gap-3'>
            <p className='text-sm text-muted-foreground whitespace-nowrap'>Show</p>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className='w-[70px] h-9'>
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Value</SelectLabel>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className='text-sm text-muted-foreground whitespace-nowrap'>entries</p>
          </div>

          {/* Search section */}
          <div className='w-full sm:w-auto sm:max-w-xs'>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
                className="pl-9 h-9 w-full"
              />
            </div>
          </div>
        </div>
        <ProductTable products={products ?? []} page={currentPage} onDelete={handleDeleteProduct} loading={loading} />
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage - 1)
                }}
              />
            </PaginationItem>

            {getVisiblePages().map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(page as number)
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        {/* Empty State */}
      </div>
    </>
  )
}
