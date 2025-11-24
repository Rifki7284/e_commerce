"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
  productsGrowth: number
  customersGrowth: number
}

interface RecentOrder {
  id: number
  customerName: string
  total: number
  status: string
  date: string
}

interface TopProduct {
  id: number
  name: string
  sales: number
  revenue: number
  image: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-orders'),
        fetch('/api/dashboard/top-products')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setTopProducts(productsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    iconColor 
  }: { 
    title: string
    value: string
    growth: number
    icon: any
    iconColor: string
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1 text-xs">
          {growth >= 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{growth}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-500 font-medium">{growth}%</span>
            </>
          )}
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2" />
                <div className="h-3 bg-muted rounded w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Button className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
          <Eye className="h-4 w-4" />
          View Store
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          growth={stats.ordersGrowth}
          icon={ShoppingCart}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          growth={stats.productsGrowth}
          icon={Package}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toString()}
          growth={stats.customersGrowth}
          icon={Users}
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your store</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/products">
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-muted overflow-hidden">
                      <img 
                        src={product.image || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatPrice(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No product sales yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/admin/products">
                <Package className="h-5 w-5" />
                <span className="font-medium">Add Product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">View Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/admin/customers">
                <Users className="h-5 w-5" />
                <span className="font-medium">Manage Customers</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/admin/reports">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">View Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}