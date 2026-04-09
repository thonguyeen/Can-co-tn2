'use client'

import { useState } from 'react'
import { ShoppingBag, Search, MapPin, Heart, MessageCircle, Filter, Grid3X3, List } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Category = 'all' | 'electronics' | 'vehicles' | 'furniture' | 'fashion' | 'others'

const categoriesData = [
  { id: 'all' as Category, label: 'Tất cả' },
  { id: 'electronics' as Category, label: 'Điện tử' },
  { id: 'vehicles' as Category, label: 'Xe cộ' },
  { id: 'furniture' as Category, label: 'Nội thất' },
  { id: 'fashion' as Category, label: 'Thời trang' },
  { id: 'others' as Category, label: 'Khác' },
]

const products = [
  { id: '1', category: 'electronics' as Category, title: 'MacBook Pro M3 14" - Như mới', price: '32.000.000₫', location: 'Quận 1, TP.HCM', seller: 'Minh Tuấn', sellerColor: '#2D6A4F', time: '2 giờ trước', color: '#1B4D3E' },
  { id: '2', category: 'electronics' as Category, title: 'iPhone 15 Pro Max 256GB', price: '25.500.000₫', location: 'Quận 7, TP.HCM', seller: 'Hương Trần', sellerColor: '#40916C', time: '3 giờ trước', color: '#2D6A4F' },
  { id: '3', category: 'vehicles' as Category, title: 'Honda Vision 2024 - 800km', price: '35.000.000₫', location: 'Bình Thạnh, TP.HCM', seller: 'Nam Lê', sellerColor: '#52B788', time: '5 giờ trước', color: '#40916C' },
  { id: '4', category: 'furniture' as Category, title: 'Bàn làm việc gỗ thông 120x60', price: '1.800.000₫', location: 'Quận 3, TP.HCM', seller: 'Mai Phạm', sellerColor: '#74C69D', time: '6 giờ trước', color: '#52B788' },
  { id: '5', category: 'fashion' as Category, title: 'Áo khoác Nike chính hãng size L', price: '890.000₫', location: 'Tân Bình, TP.HCM', seller: 'Đức Hoàng', sellerColor: '#2D6A4F', time: '8 giờ trước', color: '#74C69D' },
  { id: '6', category: 'electronics' as Category, title: 'Tai nghe Sony WH-1000XM5', price: '5.900.000₫', location: 'Quận 10, TP.HCM', seller: 'Lan Vũ', sellerColor: '#1B4D3E', time: '10 giờ trước', color: '#1B4D3E' },
  { id: '7', category: 'vehicles' as Category, title: 'Xe đạp Giant ATX 830 2024', price: '8.500.000₫', location: 'Thủ Đức, TP.HCM', seller: 'Bảo Đặng', sellerColor: '#40916C', time: '12 giờ trước', color: '#2D6A4F' },
  { id: '8', category: 'furniture' as Category, title: 'Ghế công thái học Ergonomic', price: '3.200.000₫', location: 'Quận 2, TP.HCM', seller: 'Ngọc Bùi', sellerColor: '#52B788', time: '1 ngày trước', color: '#40916C' },
  { id: '9', category: 'others' as Category, title: 'Bộ dụng cụ vẽ chuyên nghiệp', price: '450.000₫', location: 'Gò Vấp, TP.HCM', seller: 'Tùng Ngô', sellerColor: '#74C69D', time: '1 ngày trước', color: '#52B788' },
  { id: '10', category: 'fashion' as Category, title: 'Giày Adidas Ultraboost size 42', price: '1.200.000₫', location: 'Phú Nhuận, TP.HCM', seller: 'Yến Phan', sellerColor: '#2D6A4F', time: '2 ngày trước', color: '#74C69D' },
]

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    }
    return true
  })

  const toggleSave = (id: string) => {
    setSavedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-[900px] mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
      </div>

      {/* Search + View Toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
        </Button>
        <Button variant="secondary" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {categoriesData.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              activeCategory === cat.id
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Không tìm thấy sản phẩm nào
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: product.color }}>
                <ShoppingBag className="w-12 h-12 text-white/60" />
              </div>
              <CardContent className="p-3">
                <p className="font-bold text-[15px] text-[#2D6A4F]">{product.price}</p>
                <p className="text-sm line-clamp-2 mt-1">{product.title}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{product.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{product.time}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={(e) => { e.stopPropagation(); toggleSave(product.id) }}
                  >
                    <Heart className={cn('w-4 h-4', savedItems.has(product.id) && 'fill-red-500 text-red-500')} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex gap-4">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: product.color }}>
                  <ShoppingBag className="w-8 h-8 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-[#2D6A4F]">{product.price}</p>
                  <p className="text-[15px] mt-0.5">{product.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{product.location}</span>
                    <span>·</span>
                    <span>{product.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-white text-[8px]" style={{ backgroundColor: product.sellerColor }}>
                        {product.seller[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{product.seller}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={(e) => { e.stopPropagation(); toggleSave(product.id) }}
                  >
                    <Heart className={cn('w-4 h-4', savedItems.has(product.id) && 'fill-red-500 text-red-500')} />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
