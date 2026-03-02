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
    $inspect(data)

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

{#if data.seasonalOffers.items.length === 3}
<section class="py-12 mx-auto">
    <h2 class="mx-12 mb-8 text-2xl font-semibold">{data.seasonalOffers.title}</h2>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:rounded-xl mx-12 overflow-clip">
        {#each data.seasonalOffers.items as item}
            <a href={item.href} class="relative max-h-[75svh] overflow-hidden">
                <img src={item.imageUrl} alt="seasonal offer" class="h-full w-full object-cover">
            </a>
        {/each}
    </div>
</section>
{/if}

{#if data.discountSection}{@render productSection(data.discountSection)}{/if}

<FanShop fanshop={data.fanshop}/>

<section class="py-12 max-w-full">
    <Features services={data.services}/>
</section>