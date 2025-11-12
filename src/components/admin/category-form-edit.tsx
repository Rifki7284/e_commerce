"use client";

import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, Sparkles, Check } from "lucide-react";
import { id } from "zod/v4/locales";

// 🧩 Zod Schema
const CategorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
    iconName: z.string().min(1, "Please select an icon"),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

interface EditCategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; 
    id: string
    data?: CategoryFormData | null
}

// Helper function to generate slug
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function CategoryFormEditModal({
    isOpen,
    onClose,
    onSuccess,
    data,
    id
}: EditCategoryDialogProps) {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<string>("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(CategorySchema),
        defaultValues: { name: "", iconName: "" },
    });

    useEffect(() => {
        if (isOpen && data) {
            setValue("name", data.name)
            setValue("iconName", data.iconName)
            setSelectedIcon(data.iconName)
        }
    }, [isOpen, data])

    // ✨ Daftar emoji icon kategori dengan kategori
    const emojiCategories = [
        {
            title: "TECH & ELECTRONICS",
            emojis: ["📱", "💻", "⌚", "🎧", "📷", "🖥️"]
        },
        {
            title: "FASHION & BEAUTY",
            emojis: ["👕", "👗", "👠", "💄", "💅", "👜"]
        },
        {
            title: "HOME & LIVING",
            emojis: ["🏠", "🪑", "🛋️", "🛏️", "📦", "🪴"]
        },
        {
            title: "FOOD & DRINKS",
            emojis: ["🍔", "🍕", "☕", "🍰", "🍜", "🥗"]
        },
        {
            title: "ENTERTAINMENT",
            emojis: ["🎮", "🎬", "🎵", "🎨", "📚", "🎭"]
        },
        {
            title: "SPORTS & FITNESS",
            emojis: ["⚽", "🏋️", "🏃", "🚴", "⛹️", "🧘"]
        },
        {
            title: "OTHERS",
            emojis: ["🐶", "🚗", "🧸", "🌿", "✈️", "🎁"]
        }
    ];

    const handleClose = useCallback(() => {
        reset();
        setSelectedIcon("");
        setErrorMessage(null);
        onClose();
    }, [onClose, reset]);

    const handleIconSelect = (emoji: string) => {
        setSelectedIcon(emoji);
        setValue("iconName", emoji, { shouldValidate: true });
    };

    const onSubmit = async (data: CategoryFormData) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("iconName", data.iconName);
            formData.append("slug", generateSlug(data.name));

            const res = await fetch(`/api/category/${id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const errorBody = await res.json();
                throw new Error(errorBody.message || "Failed to create category");
            }

            await new Promise((r) => setTimeout(r, 500));
            reset();
            setSelectedIcon("");
            onSuccess?.();
            handleClose();
        } catch (err) {
            console.error(err);
            setErrorMessage(err instanceof Error ? err.message : "Failed to create category. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                                Create New Category
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Choose an icon and enter category name
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {errorMessage && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold">Error</p>
                                <p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Category Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                            Category Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., Electronics, Fashion, Home Decor"
                            {...register("name")}
                            className={cn(
                                "h-11 border-2 transition-all",
                                errors.name ? "border-red-400 dark:border-red-600" : "border-input"
                            )}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-foreground">
                            Select Icon
                        </Label>

                        <div className="space-y-5">
                            {emojiCategories.map((category) => (
                                <div key={category.title} className="space-y-2.5">
                                    <h4 className="text-xs font-bold text-muted-foreground tracking-wide">
                                        {category.title}
                                    </h4>
                                    <div className="grid grid-cols-6 gap-2">
                                        {category.emojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => handleIconSelect(emoji)}
                                                className={cn(
                                                    "relative text-3xl aspect-square rounded-xl transition-all duration-200",
                                                    "hover:scale-105 active:scale-95",
                                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-background",
                                                    selectedIcon === emoji
                                                        ? "bg-linear-to-br from-blue-500 to-purple-600 shadow-lg scale-105"
                                                        : "bg-muted hover:bg-accent border-2 border-border"
                                                )}
                                                title={emoji}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {emoji}
                                                </div>
                                                {selectedIcon === emoji && (
                                                    <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 shadow-md border border-border">
                                                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.iconName && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {errors.iconName.message}
                            </p>
                        )}
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
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Create Category
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}