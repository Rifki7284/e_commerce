"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Key,
  Search,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { maskKey } from "@/lib/mashKey";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "../ui/spinner";

interface ProductKey {
  id: number;
  code: string;
  status: "Available" | "Sold";
  createdAt: string;
}

interface ProductKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export default function ProductKeyManager({
  isOpen,
  onClose,
  productId,
  productName,
}: ProductKeyManagerProps) {
  const [keys, setKeys] = useState<ProductKey[]>([]);
  const schema = z.object({
    key: z
      .string()
      .regex(
        /^[A-Za-z0-9]{4}(-[A-Za-z0-9]{4}){3}$/,
        "Format key harus XXXX-XXXX-XXXX-XXXX"
      ),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      key: "",
    },
  });
  const [cursor, setCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCount, setAvaibleCount] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [soldCount, setSoldCount] = useState<number>(0);
  const [allCount, setAllCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadData, setLoadData] = useState<boolean>(false);
  const getKeys = async () => {
    setLoadData(true);
    const res = await fetch(
      `/api/keys?productId=${productId}&status=${filterStatus}&search=${searchQuery}`
    );

    const data = await res.json();
    setKeys(data.keys);
    setAvaibleCount(data.available);
    setSoldCount(data.sold);
    setAllCount(data.all);
    setCursor(data.nextCursor);
    setLoadData(false);
  };

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);

    try {
      const res = await fetch(
        `/api/keys?productId=${productId}&cursor=${cursor}&status=${filterStatus}&search=${searchQuery}`
      );

      const data = await res.json();

      setKeys((prev) => [...prev, ...data.keys]);
      setCursor(data.nextCursor);
    } catch (e) {
      console.error(e);
    }

    setLoadingMore(false);
  };

  const handleAddKey = async ({ key }: { key: string }) => {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("keys", key);
      form.append("productId", String(productId));

      await fetch("/api/keys", {
        method: "POST",
        body: form,
      });

      setLoading(false);
      reset();
      setIsAdding(false);
      getKeys();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Are you sure you want to delete this key?")) return;

    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete key");
        return;
      }
      setKeys((prev) => prev.filter((key) => key.id !== id));
      setAvaibleCount((prev) => (prev ? prev - 1 : prev));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyKey = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      getKeys();
    } else {
      setAvaibleCount(0);
      setSoldCount(0);
      setKeys([]);
      setSearchQuery("");
      setFilterStatus("all");
      setIsAdding(false);
    }
  }, [isOpen, filterStatus, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] max-h-[800px] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header dengan gradient */}
        <DialogHeader className="shrink-0 px-6 py-5 border-b bg-linear-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 rounded-xl p-2.5 shadow-sm shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <DialogTitle className="text-xl font-bold text-foreground mb-1">
                Manage Product Keys
              </DialogTitle>
              <p className="text-muted-foreground text-sm line-clamp-2 wrap-break-word">
                {productName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Stats Cards - Improved */}
          <div className="shrink-0 px-6 py-5 bg-linear-to-b from-muted/30 to-background border-b">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-emerald-200 dark:border-emerald-900/50 bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-950/10 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Available
                    </p>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {availableCount}
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                    Ready to sell
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-900/10 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wide">
                      Sold
                    </p>
                    <Check className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                    {soldCount}
                  </p>
                  <p className="text-xs text-slate-600/70 dark:text-slate-400/70 mt-1">
                    Total sold
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add Key Form - Improved */}
          <div className="shrink-0 px-6 py-4 border-b bg-muted/20">
            {!isAdding ? (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product Key
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="space-y-3">
                  <div>
                    <Input
                      type="text"
                      {...register("key")}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="h-11 text-sm font-mono"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit(handleAddKey)();
                        }
                      }}
                    />
                    {errors.key && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                        {errors.key.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={loading}
                      onClick={handleSubmit(handleAddKey)}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Adding..." : "Add Key"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        reset();
                      }}
                      type="button"
                      variant="outline"
                      className="flex-1 h-10 text-sm font-semibold"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search and Filter - Improved */}
          <div className="shrink-0 px-6 py-4 border-b space-y-3 bg-background">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by key code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-sm"
              />
            </div>

            <Tabs
              value={filterStatus}
              onValueChange={(v) => {
                setCursor(null);
                setFilterStatus(v);
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 h-11 bg-muted/50">
                <TabsTrigger
                  value="all"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  All <span className="ml-1.5 text-xs">({allCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="Available"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Available{" "}
                  <span className="ml-1.5 text-xs">({availableCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="Sold"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Sold <span className="ml-1.5 text-xs">({soldCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Keys List - Scrollable with improved design */}
          <div className="flex-1 overflow-hidden bg-muted/10">
            <ScrollArea className="h-full">
              {loadData ? (
                <div className="text-center py-16 px-4">
                  <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Spinner />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Loading keys...
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Please wait while we fetch your product keys
                  </p>
                </div>
              ) : keys.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Key className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery || filterStatus !== "all"
                      ? "No keys found"
                      : "No keys yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add your first product key to get started with inventory management"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="px-6 py-4 hover:bg-muted/40 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Key Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="font-mono text-sm font-bold bg-muted/50 px-3 py-1.5 rounded-md border">
                              {maskKey(key.code)}
                            </code>

                            <Badge
                              variant={
                                key.status === "Available"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`text-xs font-semibold px-2.5 py-1 ${
                                key.status === "Available"
                                  ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {key.status === "Available"
                                ? "● Available"
                                : "✓ Sold"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                            Added on{" "}
                            {new Date(key.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleCopyKey(key.id, key.code)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-primary/10"
                            title="Copy key"
                          >
                            {copiedId === key.id ? (
                              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          {key.status === "Available" && (
                            <Button
                              onClick={() => handleDeleteKey(key.id)}
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete key"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cursor && (
                <div className="text-center py-6 border-t">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="h-10 px-8 font-semibold"
                  >
                    {loadingMore ? (
                      <>
                        <Spinner />
                        <span className="ml-2">Loading...</span>
                      </>
                    ) : (
                      "Load More Keys"
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t bg-muted/20">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-11 text-sm font-semibold hover:bg-background"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
