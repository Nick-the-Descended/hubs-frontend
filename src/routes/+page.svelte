<script lang="ts">
    import HeroSlider from '@/components/slider/Slider.svelte';
    import ProductCardSlider from '@/components/slider/ProductCardSlider.svelte';
    import FanShop from "@/components/home/fan-shop/FanShop.svelte";
    import {Button} from "@/components/ui/button";
    import Features from "@/components/home/features/Features.svelte";
    import { cartStore } from '$lib/stores/cart.svelte';
    import type { ProductCardItem } from '$lib/types/medusa-adapter';
    import type {PageData} from './$types';

    type ProductSection = NonNullable<PageData['featuredSection']>;

    let {data}: { data: PageData } = $props();

    function handleAddToCart(product: ProductCardItem): void {
        if (product.firstVariantId) {
            cartStore.addItem(product.firstVariantId, 1);
        }
    }
</script>

{#snippet productSection(section: ProductSection)}
    {@const link = "/products/all?collection=" + section.collection}
    <section class="py-12 max-w-full">
        <div class="mx-12 mb-8 flex justify-between">
            <span class="text-2xl font-semibold">
                {section.title}
            </span>
            <a href={link} class="text-md font-semibold underline underline-offset-8">
                {section.seeMore}
            </a>
        </div>
        <ProductCardSlider
                products={section.products}
                onAddToCartClick={handleAddToCart}
                baseUrl={"/products/all/all"}
        />
    </section>
{/snippet}

<HeroSlider slides={data.slides}/>

{#if data.featuredSection}{@render productSection(data.featuredSection)}{/if}

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

{#if data.discountSection}{@render productSection(data.discountSection)}{/if}

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