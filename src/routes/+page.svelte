<script>
    import Slider from '@/components/slider/Slider.svelte';
    import * as ProductCard from '@/components/ui/product-card';

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
</script>

<Slider images={hero_images} />

<ul class="m-4 flex h-[460px] w-full gap-4">
    <ProductCard.Root
        name="Product Name"
        price="300.00"
        currency="GEL"
        rating={3.6}
        imageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
        imageAlt="Sample product"
        isFavorite={false}
    />
    <ProductCard.Root
        name="Product Name"
        price="300.00"
        currency="GEL"
        rating={4.8}
        imageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
        imageAlt="Sample product"
        isFavorite={false}
    />
    <ProductCard.Root
        name="Product Name"
        price="300.00"
        currency="GEL"
        rating={4.8}
        imageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
        imageAlt="Sample product"
        isFavorite={false}
    />
</ul>
