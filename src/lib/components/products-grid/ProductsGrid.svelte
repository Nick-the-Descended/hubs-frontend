<script lang="ts">
    import * as Breadcrumb from '@/components/ui/breadcrumb';
    import * as ProductCard from '@/components/ui/product-card';
    import {Button} from '@/components/ui/button';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import {ChevronLeft, ChevronRight, ArrowUpDown} from '@lucide/svelte';

    type StrapiImage = {
        name: string;
        alternativeText: string | null;
        width: number;
        height: number;
        url: string;
        previewUrl: string | null;
    };

    type ProductItem = {
        name: string;
        slug: string;
        shortDescription: string | null;
        averageRating: number | null;
        price: number;
        discountPrice: number | null;
        discountPercentage: number | null;
        isFavourite: boolean | null;
        category: { name: string; slug: string } | null;
        gallery: StrapiImage[];
        mainImage: StrapiImage | null;
    };

    type PaginationInfo = {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };

    type CategoryItem = {
        name: string;
        slug: string;
    };

    type BreadcrumbItem = {
        label: string;
        href?: string;
    };

    type Props = {
        products: ProductItem[];
        pagination: PaginationInfo;
        categories: CategoryItem[];
        activeCategory: string | null;
        breadcrumbs: BreadcrumbItem[];
    };

    let {products, pagination, categories, activeCategory, breadcrumbs}: Props = $props();

    function getImageUrl(image: StrapiImage | null): string {
        if (!image?.url) return '/placeholder-image.png';
        return `${PUBLIC_STRAPI_URL}${image.url}`;
    }

    function getProductUrl(product: ProductItem): string {
        const categorySlug = product.category?.slug || 'all';
        return `/products/${categorySlug}/all/${product.slug}`;
    }

    function getPageUrl(page: number): string {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        params.set('page', String(page));
        return `?${params.toString()}`;
    }

    // Hardcoded filter data (non-functional placeholders)
    const colorOptions = [
        {name: 'Black', hex: '#000000'},
        {name: 'White', hex: '#FFFFFF'},
        {name: 'Red', hex: '#EF4444'},
        {name: 'Blue', hex: '#3B82F6'},
        {name: 'Green', hex: '#22C55E'},
        {name: 'Gray', hex: '#6B7280'},
    ];

    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // Generate page numbers for pagination
    const pageNumbers = $derived(() => {
        const pages: number[] = [];
        const current = pagination.page;
        const total = pagination.pageCount;

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push(-1); // ellipsis
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            if (current < total - 2) pages.push(-1); // ellipsis
            pages.push(total);
        }
        return pages;
    });
</script>

<div class="container mx-auto px-4 py-6">
    <!-- Top Bar: Breadcrumbs + Sort -->
    <div class="mb-6 flex items-center justify-between">
        <Breadcrumb.Root>
            <Breadcrumb.List>
                {#each breadcrumbs as crumb, i (i)}
                    {#if i > 0}
                        <Breadcrumb.Separator/>
                    {/if}
                    <Breadcrumb.Item>
                        {#if crumb.href}
                            <Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
                        {:else}
                            <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
                        {/if}
                    </Breadcrumb.Item>
                {/each}
            </Breadcrumb.List>
        </Breadcrumb.Root>

        <!-- Sort Button (non-functional) -->
        <Button variant="outline" class="gap-2">
            <ArrowUpDown class="h-4 w-4"/>
            Sort
        </Button>
    </div>

    <!-- Main Content: Sidebar + Grid -->
    <div class="flex gap-8">
        <!-- Sidebar Filters -->
        <aside class="hidden w-64 shrink-0 lg:block">
            <!-- Categories -->
            <div class="mb-8">
                <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Categories</h3>
                <ul class="space-y-2">
                    <li>
                        <a
                            href="/products/all"
                            class="text-sm transition-colors hover:text-primary {activeCategory === null ? 'font-semibold text-primary' : 'text-foreground'}"
                        >
                            All Products
                        </a>
                    </li>
                    {#each categories as category (category.slug)}
                        <li>
                            <a
                                href="/products/{category.slug}"
                                class="text-sm transition-colors hover:text-primary {activeCategory === category.slug ? 'font-semibold text-primary' : 'text-foreground'}"
                            >
                                {category.name}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- Colors (static placeholder) -->
            <div class="mb-8">
                <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Colors</h3>
                <div class="flex flex-wrap gap-2">
                    {#each colorOptions as color (color.name)}
                        <button
                            class="h-7 w-7 rounded-full border-2 border-gray-200 transition-all hover:scale-110 hover:border-gray-400"
                            style="background-color: {color.hex}"
                            title={color.name}
                        ></button>
                    {/each}
                </div>
            </div>

            <!-- Sizes (static placeholder) -->
            <div class="mb-8">
                <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Sizes</h3>
                <div class="flex flex-wrap gap-2">
                    {#each sizeOptions as size (size)}
                        <button
                            class="rounded-md border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:border-gray-400 hover:bg-gray-50"
                        >
                            {size}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Price Range (static placeholder) -->
            <div class="mb-8">
                <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Price Range</h3>
                <div class="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        class="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm"
                        disabled
                    />
                    <span class="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        class="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm"
                        disabled
                    />
                </div>
            </div>
        </aside>

        <!-- Product Grid + Pagination -->
        <div class="flex-1">
            {#if products.length > 0}
                <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {#each products as product (product.slug)}
                        <ProductCard.Root class="h-full w-full" href={getProductUrl(product)}>
                            <ProductCard.Image
                                class="grow"
                                imageUrl={getImageUrl(product.mainImage)}
                                imageAlt={product.mainImage?.alternativeText ?? product.name}
                            />

                            <ProductCard.Actions
                                isFavorite={product.isFavourite ?? false}
                            />

                            <ProductCard.Description>
                                <ProductCard.Title name={product.name}/>

                                {#if product.averageRating && product.averageRating > 0}
                                    <ProductCard.Rating rating={product.averageRating}/>
                                {/if}

                                <div class="flex items-baseline gap-2">
                                    {#if product.discountPrice != null}
                                        <ProductCard.Price
                                            price={product.discountPrice.toString()}
                                            currency="₾"
                                        />
                                        <span class="text-sm text-gray-400 line-through">{product.price}₾</span>
                                        {#if product.discountPercentage}
                                            <span class="text-sm font-medium text-red-500">-{product.discountPercentage}%</span>
                                        {/if}
                                    {:else}
                                        <ProductCard.Price
                                            price={product.price.toString()}
                                            currency="₾"
                                        />
                                    {/if}
                                </div>
                            </ProductCard.Description>
                        </ProductCard.Root>
                    {/each}
                </div>

                <!-- Pagination -->
                {#if pagination.pageCount > 1}
                    <nav class="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
                        <a
                            href={pagination.page > 1 ? getPageUrl(pagination.page - 1) : undefined}
                            class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors {pagination.page <= 1 ? 'pointer-events-none text-gray-300' : 'hover:bg-gray-100 text-gray-700'}"
                            aria-label="Previous page"
                            aria-disabled={pagination.page <= 1}
                        >
                            <ChevronLeft class="h-4 w-4"/>
                        </a>

                        {#each pageNumbers() as pageNum (pageNum)}
                            {#if pageNum === -1}
                                <span class="inline-flex h-9 w-9 items-center justify-center text-gray-400">...</span>
                            {:else}
                                <a
                                    href={getPageUrl(pageNum)}
                                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors {pageNum === pagination.page ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100 text-gray-700'}"
                                    aria-current={pageNum === pagination.page ? 'page' : undefined}
                                >
                                    {pageNum}
                                </a>
                            {/if}
                        {/each}

                        <a
                            href={pagination.page < pagination.pageCount ? getPageUrl(pagination.page + 1) : undefined}
                            class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors {pagination.page >= pagination.pageCount ? 'pointer-events-none text-gray-300' : 'hover:bg-gray-100 text-gray-700'}"
                            aria-label="Next page"
                            aria-disabled={pagination.page >= pagination.pageCount}
                        >
                            <ChevronRight class="h-4 w-4"/>
                        </a>
                    </nav>
                {/if}
            {:else}
                <div class="flex items-center justify-center py-16">
                    <p class="text-gray-500">No products found</p>
                </div>
            {/if}
        </div>
    </div>
</div>
