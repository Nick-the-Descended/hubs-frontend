<script lang="ts">
    import HeroSlider from '@/components/slider/Slider.svelte';
    import ProductCardSlider from '@/components/slider/ProductCardSlider.svelte';
    import * as ProductCard from '@/components/ui/product-card';
    import FanShop from "@/components/home/fan-shop/FanShop.svelte";
    import {Button} from "@/components/ui/button";
    import Features from "@/components/home/features/Features.svelte";

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

    let products = [
        {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 1',
            name: 'Premium Wireless Headphones',
            rating: 4.5,
            price: '299.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 2',
            name: 'Smart Watch Pro',
            rating: 4.8,
            price: '449.99',
            currency: 'GEL',
            isFavorite: true
        },
        {
            id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 3',
            name: 'Designer Sunglasses',
            rating: 4.2,
            price: '189.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '4',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 4',
            name: 'Running Shoes Elite',
            rating: 4.7,
            price: '159.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '5',
            imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 5',
            name: 'Leather Backpack',
            rating: 4.6,
            price: '129.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '6',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 6',
            name: 'Vintage Camera',
            rating: 4.9,
            price: '599.99',
            currency: 'GEL',
            isFavorite: true
        },
        {
            id: '7',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 1',
            name: 'Premium Wireless Headphones',
            rating: 4.5,
            price: '299.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '8',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 2',
            name: 'Smart Watch Pro',
            rating: 4.8,
            price: '449.99',
            currency: 'GEL',
            isFavorite: true
        },
        {
            id: '9',
            imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 3',
            name: 'Designer Sunglasses',
            rating: 4.2,
            price: '189.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '10',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 4',
            name: 'Running Shoes Elite',
            rating: 4.7,
            price: '159.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '11',
            imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 5',
            name: 'Leather Backpack',
            rating: 4.6,
            price: '129.99',
            currency: 'GEL',
            isFavorite: false
        },
        {
            id: '12',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
            imageAlt: 'Sample product 6',
            name: 'Vintage Camera',
            rating: 4.9,
            price: '599.99',
            currency: 'GEL',
            isFavorite: true
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

    function handleAddToCart(productId: string): void {
        console.log('Add to cart product:', productId);
        // Add product to cart
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