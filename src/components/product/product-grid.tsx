import ProductCard from "./product-card"


interface ProductCardProps {
    product: Product[]
}
export interface Product {
    id: number
    name: string
    price: number
    slug: string
    description: string
    stock: number
    categories: Category
    images: ProductImage[]
    reviews?: Review[]
}

interface Category {
    name: string
    slug: string
}

interface ProductImage {
    url: string
}

export interface ReviewUser {
    id: number
    name: string
    email: string
}

export interface Review {
    id: number
    star: number
    review: string
    productId: number
    userId: number
    user: ReviewUser
}
const ProductGrid = ({ product }: ProductCardProps) => {
    return (
        <>
            {product.length != 0 ? product.map((item: Product, idx) => {
                return (
                    <ProductCard key={idx} product={item} />
                )
            }) :
                <div className="col-span-full">
                    <div className="text-center flex flex-col py-20 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
                        <div className="text-6xl mb-4">🎮</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
                        <p className="text-slate-400">Check back later for amazing deals!</p>
                    </div>
                </div>
            }
        </>
    )
}
export default ProductGrid