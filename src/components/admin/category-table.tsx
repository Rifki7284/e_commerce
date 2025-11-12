"use client"

import { MoreVertical, Edit2, Trash2, Package } from 'lucide-react'
import { useState } from 'react'
import { Spinner } from '../ui/spinner'
import CategoryFormEditModal from './category-form-edit'
import { number } from 'zod'

interface Category {
    id: number
    name: string
    slug: string
    iconName: string
}

interface CategoryTableProps {
    category: Category[]
    onDelete: (id: string) => void
    loading: boolean
    page: number
    getCategory: () => void
}
interface EditProps {
    id: string
    isOpen: boolean
    data: Category
}

export default function CategoryTable({ category, onDelete, loading, page, getCategory }: CategoryTableProps) {
    const [activeMenu, setActiveMenu] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [id, setId] = useState<string>("")
    const [data, setData] = useState<Category>()
    const handleEdit = ({ id, isOpen, data }: EditProps) => {
        setId(id)
        setIsModalOpen(isOpen)
        // pastikan data dikonversi ke categoryFormData
        const convertedData: Category = {
            name: data.name,
            iconName: data.iconName,
            id: Number(id),
            slug: ''
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
                                <th className="w-16 px-4 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Icon
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center">
                                        <Spinner className="size-6 text-primary inline-block" />
                                    </td>
                                </tr>
                            )}
                            {!loading && category.map((category, idx) => (
                                <tr
                                    key={category.id}
                                    className="transition-colors hover:bg-muted/50"
                                >
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {idx + 1 + (page - 1) * 2}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-foreground truncate">
                                                    {category.name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-2xl">
                                            {category.iconName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground font-mono">
                                            {category.slug}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    handleEdit({ id: category.id.toString(), isOpen: true, data: category })
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 transition-all hover:bg-blue-200 dark:hover:bg-blue-950 active:scale-95"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(category.id.toString())}
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

                {!loading && category.length === 0 && (
                    <div className="text-center py-12">
                        <svg
                            className="h-12 w-12 mx-auto text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-foreground mb-1 mt-3">
                            No category yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Get started by adding your first category
                        </p>
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
                {!loading && category.map((category) => (
                    <div
                        key={category.id}
                        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                    >
                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    <span className="text-2xl">{category.iconName}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground text-base mb-1">
                                        {category.name}
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
                                        Active
                                    </span>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === category.id ? null : category.id)}
                                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                    </button>

                                    {activeMenu === category.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setActiveMenu(null)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-popover rounded-lg shadow-lg border border-border py-1 z-20">
                                                <button onClick={() => {
                                                    handleEdit({ id: category.id.toString(), isOpen: true, data: category })
                                                }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDelete(category.id.toString())
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

                            {/* Slug */}
                            <div className="flex items-center gap-2 pt-3 border-t border-border">
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    Slug:
                                </span>
                                <span className="text-xs text-foreground font-mono bg-muted px-2 py-1 rounded">
                                    {category.slug}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && category.length === 0 && (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            No category yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Get started by adding your first category
                        </p>
                    </div>
                )}
            </div>
            <CategoryFormEditModal
                id={id ?? ""}
                data={data!}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={getCategory}
            />
        </>
    )
}