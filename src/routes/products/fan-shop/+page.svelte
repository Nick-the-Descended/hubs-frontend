<script lang="ts">
    import type {PageData} from './$types';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';

    let {data}: {data: PageData} = $props();

    const fanShop = $derived(data.fanShop);
</script>

<div class="container">
    {#if fanShop}
        <h1>{fanShop.productListTitle}</h1>

        <!-- Banner Section -->
        {#if fanShop.Banner}
            <div class="banner">
                <img
                    src={PUBLIC_STRAPI_URL + fanShop.Banner.Image.url}
                    alt={fanShop.Banner.Image.name}
                    width={fanShop.Banner.Image.width}
                    height={fanShop.Banner.Image.height}
                />
                <button>{fanShop.Banner.buttonText}</button>
            </div>
        {/if}

        <!-- Products Grid -->
        <div class="products-grid">
            {#each fanShop.productList as product}
                <div class="product-card" data-product-id={product.id}>
                    <img
                        src={PUBLIC_STRAPI_URL + product.productImage.url}
                        alt={product.productName}
                        width={product.productImage.width}
                        height={product.productImage.height}
                    />
                    <h3>{product.productName}</h3>
                    <div class="price">
                        {#if product.discountedPrice}
                            <span class="original-price">{product.price}</span>
                            <span class="discounted-price">{product.discountedPrice}</span>
                            {#if product.discountPercent}
                                <span class="discount-badge">-{product.discountPercent}%</span>
                            {/if}
                        {:else}
                            <span class="current-price">{product.price}</span>
                        {/if}
                    </div>
                    <div class="rating">
                        Rating: {product.averageRating}/5
                    </div>
                    {#if product.isFavourite}
                        <span class="favourite-badge">❤️</span>
                    {/if}
                </div>
            {/each}
        </div>

        <!-- See More Link -->
        {#if fanShop.seeMore}
            <a href="/products/fan-shop" class="see-more">{fanShop.seeMore}</a>
        {/if}
    {:else}
        <p>No fan shop data available</p>
    {/if}
</div>

<style>
    .container {
        padding: 2rem;
    }

    .banner {
        margin: 2rem 0;
    }

    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }

    .product-card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        position: relative;
    }

    .price {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin: 0.5rem 0;
    }

    .original-price {
        text-decoration: line-through;
        color: #999;
    }

    .discounted-price {
        color: #e74c3c;
        font-weight: bold;
    }

    .discount-badge {
        background: #e74c3c;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .favourite-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }

    .see-more {
        display: inline-block;
        margin-top: 2rem;
        padding: 0.75rem 1.5rem;
        background: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
    }
</style>
