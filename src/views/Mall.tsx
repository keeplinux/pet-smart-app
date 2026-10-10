import { useApp } from '../appContext'
import { TopBar } from '../components/TopBar'
import { products } from '../catalog'
import type { Product } from '../nav'

export function Mall() {
  const { navigate } = useApp()

  return (
    <>
      <TopBar title="商城" onBack={() => navigate({ name: 'home' })} />
      <main className="flex flex-1 flex-col overflow-y-auto p-4">
        <p className="m-0 mb-3 text-xs text-[#171717]/45">选择要购买的宠物用品</p>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onPurchase={() => navigate({ name: 'purchase', productId: product.id })}
            />
          ))}
        </ul>
      </main>
    </>
  )
}

function ProductRow({
  product,
  onPurchase,
}: {
  product: Product
  onPurchase: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onPurchase}
        className="grid w-full grid-cols-[30%_1fr] overflow-hidden rounded-lg border border-[#171717]/10 bg-white text-left"
      >
        <div className="z-10 flex min-w-0 flex-col justify-center p-4">
          <p className="m-0 text-sm font-semibold leading-tight">{product.name}</p>
          <p className="m-0 mt-1 text-xs leading-snug text-[#171717]/55">
            {product.description}
          </p>
        </div>
        <div className="relative min-w-0 overflow-hidden">
          <img
            src={product.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-white to-transparent" />
        </div>
      </button>
    </li>
  )
}
