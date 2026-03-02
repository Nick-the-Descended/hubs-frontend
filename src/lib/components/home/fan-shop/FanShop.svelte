<script lang="ts">
    import {Button} from "@/components/ui/button";
    import * as ProductCard from "@/components/ui/product-card";
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import type {ProductCardItem} from '$lib/types/medusa-adapter';
    import {favoritesStore} from '$lib/stores/favorites.svelte';

    type FanShopData = {
        Title: string;
        Heading: string;
        Description: string;
        Collection: string;
        SeeMore: string;
        Image: { url: string };
        FanShopPromotionItem: { Collection: string; Image: { url: string } }[];
        products: ProductCardItem[];
    };

    let {fanshop}: { fanshop: FanShopData | null } = $props();
</script>

{#if fanshop}
    <section class="py-12 mx-16">
        <h2 class="mb-8 text-2xl font-semibold">{fanshop.Title}</h2>
        <div class="grid grid-cols-2 gap-5">
            <div class="flex flex-col justify-center gap-4">
                <div>
                    <h3 class="font-bold text-xl">{fanshop.Heading}</h3>
                    <span>{fanshop.Description}</span>
                </div>
                <div
                        class="min-h-[400px] max-md:min-h-[220px] h-full bg-cover bg-center rounded-md max-md:rounded-sm flex flex-col justify-end items-center"
                        style="background-image: linear-gradient(to top, #000a, #0000 50%), url({PUBLIC_STRAPI_URL}{fanshop.Image.url});"
                >
                    <a href="/products/all?collection={fanshop.Collection}">
                        <Button class="m-6 text-2xl py-6">{fanshop.SeeMore}</Button>
                    </a>
                </div>
            </div>
            <div class="grid grid-rows-2 grid-cols-2 gap-3 max-md:grid-cols-1">
                {#each fanshop.products.slice(0, 4) as product, i}
                    <div class={i >= 2 ? 'max-md:hidden' : ''}>
                        <ProductCard.Root class="h-full w-full" href="/products/all/all/{product.slug}">
                            <ProductCard.Image
                                    class="grow"
                                    imageUrl={product.mainImage?.url ?? '/placeholder-image.png'}
                                    imageAlt={product.name}
                            />
                            <ProductCard.Actions
                                    isFavorite={favoritesStore.isFavorite(product.id)}
                                    onFavoriteClick={() => favoritesStore.toggle(product.id)}
                            />
                            <ProductCard.Description>
                                <ProductCard.Title name={product.name}/>
                                {#if product.discountPercentage}
                                    <ProductCard.DiscountBadge discountPercentage={product.discountPercentage}/>
                                {/if}
                                <ProductCard.Price
                                        price={product.price}
                                        discountedPrice={product.discountPrice ?? null}
                                        currency="₾"
                                />
                            </ProductCard.Description>
                        </ProductCard.Root>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    {#if fanshop.FanShopPromotionItem.length}
        <section class="py-12 px-16 w-full grid grid-cols-2 gap-6">
            {#each fanshop.FanShopPromotionItem as item}
                <a
                        href="/products/all?collection={item.Collection}"
                        aria-label={item.Collection}
                        class="block h-[700px] w-full bg-no-repeat bg-cover bg-center rounded-xl"
                        style="background-image: url({PUBLIC_STRAPI_URL}{item.Image.url});"
                ></a>
            {/each}
        </section>
    {/if}
{/if}
