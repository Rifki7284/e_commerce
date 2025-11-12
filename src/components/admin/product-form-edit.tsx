"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Sparkles, Loader2, AlertTriangle } from "lucide-react"

interface Category {
    id: number
    name: string
    slug: string
    iconName: string
}

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    id: string
    data?: ProductFormData | null
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

export default function ProductFormEditModal({ isOpen, onClose, onSuccess, id, data }: ProductFormModalProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        price: "",
        description: "",
        stock: "",
        category: "",
        imageFiles: [],
        imageUrls: [],
    })
    
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // ✅ Pisahkan gambar lama & baru
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
    const [deletedImages, setDeletedImages] = useState<string[]>([])

    useEffect(() => {
        if (isOpen && data) {
            fetchCategories()
            setFormData({
                name: data.name ?? "",
                price: data.price ?? "",
                description: data.description ?? "",
                stock: data.stock ?? "",
                category: data.category ?? "",
                imageFiles: [],
                imageUrls: data.imageUrls ? [...data.imageUrls] : [],
            })
            setExistingImageUrls(data.imageUrls ? [...data.imageUrls] : [])
            setDeletedImages([])
        }
    }, [isOpen, data])

    const fetchCategories = async () => {
        setLoadingCategories(true)
        try {
            const res = await fetch("/api/category?page=1&perPage=100")
            const data = await res.json()
            setCategories(data.category || [])
        } catch (error) {
            setErrorMessage("Failed to load categories")
        } finally {
            setLoadingCategories(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, category: value }))
    }

    // ✅ Tambah file baru tanpa ganggu gambar lama
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length === 0) return

        const newFiles = [...formData.imageFiles, ...files].slice(0, 4)
        const newPreviews = files.map((file) => URL.createObjectURL(file))
        const combinedPreview = [...existingImageUrls, ...newPreviews].slice(0, 4)

        setFormData((prev) => ({ ...prev, imageFiles: newFiles, imageUrls: combinedPreview }))
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
        else if (e.type === "dragleave") setDragActive(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
            const newFiles = [...formData.imageFiles, ...files].slice(0, 4)
            const newPreviews = files.map((file) => URL.createObjectURL(file))
            const combinedPreview = [...existingImageUrls, ...newPreviews].slice(0, 4)
            setFormData((prev) => ({ ...prev, imageFiles: newFiles, imageUrls: combinedPreview }))
        }
    }

    // ✅ Hapus gambar lama/bari & simpan yang dihapus
    const removeImage = (index: number) => {
        const existingCount = existingImageUrls.length
        if (index < existingCount) {
            const removed = existingImageUrls[index]
            setDeletedImages((prev) => [...prev, removed])
            const updatedExisting = existingImageUrls.filter((_, i) => i !== index)
            setExistingImageUrls(updatedExisting)
            const newFilePreviews = formData.imageFiles.map((f) => URL.createObjectURL(f))
            setFormData((prev) => ({ ...prev, imageUrls: [...updatedExisting, ...newFilePreviews].slice(0, 4) }))
        } else {
            const newIndex = index - existingCount
            const updatedFiles = formData.imageFiles.filter((_, i) => i !== newIndex)
            const newFilePreviews = updatedFiles.map((f) => URL.createObjectURL(f))
            setFormData((prev) => ({
                ...prev,
                imageFiles: updatedFiles,
                imageUrls: [...existingImageUrls, ...newFilePreviews].slice(0, 4),
            }))
        }
    }

    const handleClose = () => {
        setFormData({
            name: "",
            price: "",
            description: "",
            stock: "",
            category: "",
            imageFiles: [],
            imageUrls: [],
        })
        setExistingImageUrls([])
        setDeletedImages([])
        setErrorMessage(null)
        onClose()
    }

    // ✅ Submit: kirim semua variabel terpisah
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        if (!formData.name || !formData.price || !formData.stock || !formData.category) {
            setErrorMessage("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const form = new FormData()
            form.append("name", formData.name)
            form.append("price", formData.price)
            form.append("description", formData.description)
            form.append("stock", formData.stock)
            form.append("category", formData.category)

            // 🔹 Gambar lama (masih ada)
            form.append("existingImages", JSON.stringify(existingImageUrls))

            // 🔹 Gambar lama yang dihapus
            form.append("deletedImages", JSON.stringify(deletedImages))

            // 🔹 Gambar baru
            formData.imageFiles.forEach((file) => form.append("newImages[]", file))

            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                body: form,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || "Failed to update product")
            }

            await new Promise((r) => setTimeout(r, 500))
            handleClose()
            onSuccess?.()
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update product. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[95vh] flex flex-col">
                {/* Fixed Header */}
                <DialogHeader className="px-6 py-5 border-b border-border bg-background sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                Edit Product
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Fill in the details to add a new product
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {errorMessage && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 flex items-start gap-3 mb-5">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold">Error</p>
                                <p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                Product Name
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                required
                                className="h-11 border-2"
                                autoFocus
                            />
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                Category
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={handleCategoryChange}
                                disabled={loadingCategories}
                            >
                                <SelectTrigger className="h-11 border-2">
                                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingCategories ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : categories.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            No categories available
                                        </div>
                                    ) : (
                                        categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{category.iconName}</span>
                                                    <span>{category.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Price and Stock in Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    Price
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none">
                                        Rp
                                    </span>
                                    <Input
                                        id="price"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        step="1"
                                        min="0"
                                        required
                                        className="h-11 pl-10 pr-4 border-2"
                                    />
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    Stock
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    step="1"
                                    min="0"
                                    required
                                    className="h-11 border-2"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter product description"
                                rows={4}
                                className="border-2 resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">
                                Product Images
                            </Label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${dragActive
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-border hover:border-muted-foreground bg-muted/30"
                                    }`}
                            >
                                {formData.imageUrls.length === 0 ? (
                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                            <Upload className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-foreground mb-1">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                Click to upload
                                            </span>{" "}
                                            or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB (max 4 images)</p>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {formData.imageUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`preview-${index}`}
                                                    className="w-full h-32 object-cover rounded-lg ring-1 ring-border"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => removeImage(index)}
                                                        className="shadow-lg"
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {formData.imageUrls.length < 4 && (
                                            <div className="relative border-2 border-dashed rounded-lg flex items-center justify-center h-32 hover:border-blue-500 transition">
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50 sticky bottom-0 z-10 flex-row justify-end gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="border-2"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Editing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Edit Product
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
