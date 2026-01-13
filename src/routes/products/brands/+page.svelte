<script lang="ts">
    import type {PageData} from './$types';
    import {PUBLIC_STRAPI_URL} from '$env/static/public';
    import * as Breadcrumb from '@/components/ui/breadcrumb';
    import {Button} from '@/components/ui/button';

    let {data}: { data: PageData } = $props();

    const brandPage = $derived(data.brandPage);
    const brands = $derived(data.brands);
    const brandItems = $derived(brandPage?.brand_items || []);

    $inspect(brandPage);
    $inspect(brands);
    $inspect(brandItems);

    // Alphabet filter
    const alphabet = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let selectedLetter = $state<string>('#');

    // Filter brands based on selected letter
    const filteredBrands = $derived(() => {
        if (selectedLetter === '#') {
            return brands;
        }
        return brands.filter(brand => brand.name.toUpperCase().startsWith(selectedLetter));
    });

    function selectLetter(letter: string) {
        selectedLetter = letter;
    }
</script>

<div class="container mx-auto px-4 py-6">
    {#if brandPage}
        <div class="mx-auto">
            <!-- Breadcrumb -->
            <div class="mb-6">
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator/>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="/products">Products</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator/>
                        <Breadcrumb.Item>
                            <Breadcrumb.Page>Brands</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            <!-- Title -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900">{brandPage.title}</h1>
            </div>

            <!-- Brand Items Grid: 3 columns, first and last span 2 columns -->
            {#if brandItems.length > 0}
                <div class="grid grid-cols-3 grid-rows-2 gap-4 mb-8 min-h-[60svh]">
                    {#each brandItems as brand, index (brand.UID)}
                        <a
                                href={`/products/brands/${brand.UID}`}
                                class="group relative overflow-hidden rounded-xl md:rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow max-h-[200px] md:max-h-[450px] {index === 0 || index === 3 ? 'col-span-2' : ''}"
                        >
                            <img
                                    src={`${PUBLIC_STRAPI_URL}${brand.image.url}`}
                                    alt={brand.image.alternativeText || brand.name}
                                    width={brand.image.width}
                                    height={brand.image.height}
                                    class="h-full max-h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div class="absolute bottom-3 right-3">
                                <p class="text-sm font-medium text-white">{brandPage.viewMore}</p>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="flex items-center justify-center py-16">
                    <p class="text-gray-500">No brands available</p>
                </div>
            {/if}
        </div>
    {:else}
        <div class="flex items-center justify-center py-16">
            <p class="text-gray-500">No brand data available</p>
        </div>
    {/if}
</div>

<!-- All Brands List Section -->
<div class="container mx-auto px-4 py-6">
    <div class="mb-6">
        <h2 class="text-xl font-medium text-start uppercase">{brandPage.allBrands}</h2>
    </div>

    <!-- Alphabet Filter -->
    <div class="border-b border-black mb-8">
        <div class="flex justify-between items-center pb-4">
            {#each alphabet as letter}
                <button
                    onclick={() => selectLetter(letter)}
                    class="text-base transition-all {selectedLetter === letter ? 'font-bold text-black' : 'font-medium text-black/70'}"
                >
                    {letter}
                </button>
            {/each}
        </div>
    </div>

    <!-- Brands Grid -->
    {#if filteredBrands().length > 0}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6">
            {#each filteredBrands() as brand (brand.UID)}
                <a
                    href={`/products/brands/${brand.UID}`}
                    class="text-base font-normal text-black hover:underline"
                >
                    {brand.name}
                </a>
            {/each}
        </div>
    {:else}
        <div class="text-center py-8">
            <p class="text-gray-500">No brands found for "{selectedLetter}"</p>
        </div>
    {/if}
</div>
