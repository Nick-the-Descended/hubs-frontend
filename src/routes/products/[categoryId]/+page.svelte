<script lang="ts">
    import type {PageData} from './$types';
    import ProductsGrid from '@/components/products-grid/ProductsGrid.svelte';

    let {data}: { data: PageData } = $props();

    const breadcrumbs = $derived(
        data.categorySlug
            ? [
                {label: 'Home', href: '/'},
                {label: 'Products', href: '/products/all'},
                {label: data.categoryName || ''}
            ]
            : [
                {label: 'Home', href: '/'},
                {label: 'Products'}
            ]
    );
</script>

<ProductsGrid
    products={data.products}
    pagination={data.pagination}
    categories={data.categories}
    activeCategory={data.categorySlug}
    {breadcrumbs}
/>
