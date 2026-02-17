<script lang="ts">
    import HeroSlider from '@/components/slider/Slider.svelte';
    import ProductCardSlider from '@/components/slider/ProductCardSlider.svelte';
    import * as ProductCard from '@/components/ui/product-card';
    import FanShop from "@/components/home/fan-shop/FanShop.svelte";
    import {Button} from "@/components/ui/button";
    import Features from "@/components/home/features/Features.svelte";
    import {localCartStore} from '$lib/stores/local-cart.svelte';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import type {ComponentFanShopProductItem} from '@/types/strapi-generated';

    let hero_images = [
        '/hero-images/Image%201.png',
        '/hero-images/Image%202.png',
        '/hero-images/Image%203.png',
        '/hero-images/Image%204.png',
        '/hero-images/Image%205.png',
        '/hero-images/Image%206.png',
        '/hero-images/Image%207.png',
        '/hero-images/Image%208.png',
        '/hero-images/Image%209.png',
        '/hero-images/Image%2010.png',
        '/hero-images/Image%2011.png',
        '/hero-images/Image%2012.png',
        '/hero-images/Image%2013.png',
        '/hero-images/Image%2014.png',
        '/hero-images/Image%2015.png',
        '/hero-images/Image%2016.png',
        '/hero-images/Image%2017.png'
    ];

    let products: ComponentFanShopProductItem[] = [
        {
            id: '1',
            slug: 'premium-wireless-headphones',
            productName: 'Premium Wireless Headphones',
            averageRating: 4.5,
            price: 299.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', alternativeText: 'Sample product 1'} as any
        },
        {
            id: '2',
            slug: 'smart-watch-pro',
            productName: 'Smart Watch Pro',
            averageRating: 4.8,
            price: 449.99,
            isFavourite: true,
            productImage: {url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', alternativeText: 'Sample product 2'} as any
        },
        {
            id: '3',
            slug: 'designer-sunglasses',
            productName: 'Designer Sunglasses',
            averageRating: 4.2,
            price: 189.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop', alternativeText: 'Sample product 3'} as any
        },
        {
            id: '4',
            slug: 'running-shoes-elite',
            productName: 'Running Shoes Elite',
            averageRating: 4.7,
            price: 159.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', alternativeText: 'Sample product 4'} as any
        },
        {
            id: '5',
            slug: 'leather-backpack',
            productName: 'Leather Backpack',
            averageRating: 4.6,
            price: 129.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', alternativeText: 'Sample product 5'} as any
        },
        {
            id: '6',
            slug: 'vintage-camera',
            productName: 'Vintage Camera',
            averageRating: 4.9,
            price: 599.99,
            isFavourite: true,
            productImage: {url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', alternativeText: 'Sample product 6'} as any
        },
        {
            id: '7',
            slug: 'premium-wireless-headphones-2',
            productName: 'Premium Wireless Headphones',
            averageRating: 4.5,
            price: 299.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', alternativeText: 'Sample product 1'} as any
        },
        {
            id: '8',
            slug: 'smart-watch-pro-2',
            productName: 'Smart Watch Pro',
            averageRating: 4.8,
            price: 449.99,
            isFavourite: true,
            productImage: {url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', alternativeText: 'Sample product 2'} as any
        },
        {
            id: '9',
            slug: 'designer-sunglasses-2',
            productName: 'Designer Sunglasses',
            averageRating: 4.2,
            price: 189.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop', alternativeText: 'Sample product 3'} as any
        },
        {
            id: '10',
            slug: 'running-shoes-elite-2',
            productName: 'Running Shoes Elite',
            averageRating: 4.7,
            price: 159.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', alternativeText: 'Sample product 4'} as any
        },
        {
            id: '11',
            slug: 'leather-backpack-2',
            productName: 'Leather Backpack',
            averageRating: 4.6,
            price: 129.99,
            isFavourite: false,
            productImage: {url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', alternativeText: 'Sample product 5'} as any
        },
        {
            id: '12',
            slug: 'vintage-camera-2',
            productName: 'Vintage Camera',
            averageRating: 4.9,
            price: 599.99,
            isFavourite: true,
            productImage: {url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', alternativeText: 'Sample product 6'} as any
        }
    ];

    function handleFavorite(productId: string): void {
        console.log('Favorited product:', productId);
        // Update favorite status in your state management
    }

    function handleQuickView(productId: string): void {
        console.log('Quick view product:', productId);
        // Open quick view modal
    }

    function handleAddToCart(product: ComponentFanShopProductItem): void {
        const rawUrl = product.productImage?.url;
        const imageUrl = rawUrl
            ? (rawUrl.startsWith('http') ? rawUrl : `${PUBLIC_STRAPI_URL}${rawUrl}`)
            : '/placeholder-image.png';
        localCartStore.addItem({
            productSlug: product.slug,
            name: product.productName,
            price: product.price,
            discountPrice: product.discountedPrice ?? null,
            imageUrl,
            size: null,
            color: null,
            branding: null
        });
    }
</script>

<HeroSlider images={hero_images}/>

<section class="py-12 max-w-full">
    <h2 class="mx-12 mb-8 text-2xl font-semibold">Featured Products</h2>
    <ProductCardSlider
            {products}
            onFavoriteClick={handleFavorite}
            onQuickViewClick={handleQuickView}
            onAddToCartClick={handleAddToCart}
    />
</section>

<section class="py-12 mx-auto">
    <h2 class="mx-12 mb-8 text-2xl font-semibold">სეზონური შეთავაზებები</h2>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:rounded-xl mx-12 overflow-clip">
        <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                class="relative flex flex-col justify-end items-center max-h-[75svh] bg-gray-100 overflow-hidden bg-cover bg-center"
                style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/seasonal/ball.png);"
        >
            <span class="text-white text-2xl font-semibold text-center px-2 py-6">
                შემოდგომის ფასდაკლებები
            </span>
        </a>
        <div class="relative max-h-[75svh] bg-gray-100 overflow-hidden">
            <img src="/seasonal/ball.png" alt="ball" class="h-full w-full object-cover">
        </div>
        <div class="relative max-h-[75svh] bg-gray-100 overflow-hidden">
            <img src="/seasonal/ball.png" alt="ball" class="h-full w-full object-cover">
        </div>
    </div>
</section>

<section class="py-12 max-w-full">
    <h2 class="mx-16 mb-8 text-2xl font-semibold">Featured Products</h2>
    <ProductCardSlider
            {products}
            onFavoriteClick={handleFavorite}
            onQuickViewClick={handleQuickView}
            onAddToCartClick={handleAddToCart}
    />
</section>

<FanShop/>

<section class="py-12 px-16 w-full grid grid-cols-2 gap-6">
    <div
            class="flex flex-col items-center justify-end h-[700px] w-full bg-no-repeat bg-cover bg-center rounded-xl p-6"
            style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/more/left.png);"
    >
        <span class="text-white text-2xl font-semibold text-center px-2 py-6">
            სპორტული ფეხსაცმელი
        </span>
        <Button>
            ყველას ნახვა
        </Button>
    </div>
    <div
            class="flex flex-col items-center justify-end h-[700px] w-full bg-no-repeat bg-cover bg-center rounded-xl p-6"
            style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/more/left.png);"
    >
        <span class="text-white text-2xl font-semibold text-center px-2 py-6">
            სპორტული ფეხსაცმელი
        </span>
        <Button>
            ყველას ნახვა
        </Button>
    </div>
</section>

<section class="py-12 max-w-full">
    <Features/>
</section>