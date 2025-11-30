<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ProductCard } from '@/components/ui/product-card';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Components/ProductCard',
		component: ProductCard,
		tags: ['autodocs'],
		argTypes: {
			name: { control: 'text' },
			price: { control: 'text' },
			currency: { control: 'text' },
			rating: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
			imageUrl: { control: 'text' },
			imageAlt: { control: 'text' },
			isFavorite: { control: 'boolean' }
		},
		args: {
			onFavoriteClick: fn(),
			onQuickViewClick: fn(),
			onAddToCartClick: fn()
		}
	});
</script>

<!-- Default Product Card -->
<Story
	name="Default"
	args={{
		name: 'Product Name',
		price: '300.00',
		currency: 'GEL',
		rating: 4.8,
		imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
		imageAlt: 'Sample product',
		isFavorite: false
	}}
/>

<!-- Sports Jersey (matching the design) -->
<Story
	name="Sports Jersey"
	args={{
		name: 'Premium Sports Jersey',
		price: '300.00',
		currency: 'GEL',
		rating: 4.8,
		imageUrl: 'https://images.unsplash.com/photo-1658988492188-14a094c85b0d?w=600&h=600&fit=crop',
		imageAlt: 'Sports jersey',
		isFavorite: false
	}}
/>

<!-- Favorited Product -->
<Story
	name="Favorited"
	args={{
		name: 'Favorite Product',
		price: '150.00',
		currency: 'GEL',
		rating: 4.5,
		imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
		imageAlt: 'Favorite product',
		isFavorite: true
	}}
/>

<!-- High Rating -->
<Story
	name="High Rating"
	args={{
		name: 'Top Rated Product',
		price: '499.99',
		currency: 'GEL',
		rating: 4.9,
		imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
		imageAlt: 'High rated product',
		isFavorite: false
	}}
/>

<!-- Low Rating -->
<Story
	name="Low Rating"
	args={{
		name: 'Budget Product',
		price: '49.99',
		currency: 'GEL',
		rating: 3.2,
		imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
		imageAlt: 'Budget product',
		isFavorite: false
	}}
/>

<!-- No Rating -->
<Story
	name="No Rating"
	args={{
		name: 'New Product',
		price: '79.99',
		currency: 'GEL',
		rating: 0,
		imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop',
		imageAlt: 'New product',
		isFavorite: false
	}}
/>

<!-- Different Currency -->
<Story
	name="USD Currency"
	args={{
		name: 'International Product',
		price: '99.99',
		currency: 'USD',
		rating: 4.3,
		imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop',
		imageAlt: 'International product',
		isFavorite: false
	}}
/>
