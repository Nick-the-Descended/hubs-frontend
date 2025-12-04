<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from '@/utils.js';
	import * as ProductCard from './index.js';

	interface ProductCardWrapperProps
		extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		imageUrl: string;
		imageAlt?: string;
		name: string;
		rating?: number;
		price: string;
		currency?: string;
		onFavoriteClick?: () => void;
		onQuickViewClick?: () => void;
		onAddToCartClick?: () => void;
		isFavorite?: boolean;
		showActions?: boolean;
		showRating?: boolean;
	}

	let {
		ref = $bindable(null),
		class: className,
		imageUrl,
		imageAlt = 'Product image',
		name,
		rating = 0,
		price,
		currency = 'GEL',
		onFavoriteClick,
		onQuickViewClick,
		onAddToCartClick,
		isFavorite = false,
		showActions = true,
		showRating = true,
		...restProps
	}: ProductCardWrapperProps = $props();
</script>

<ProductCard.Root bind:ref class={className} {...restProps}>
	<!-- Image Container -->
	<ProductCard.Image {imageUrl} {imageAlt} />

	<!-- Action Buttons Overlay -->
	{#if showActions}
		<ProductCard.Actions
			{onFavoriteClick}
			{onQuickViewClick}
			{onAddToCartClick}
			{isFavorite}
		/>
	{/if}

	<!-- Product Description -->
	<ProductCard.Description>
		<!-- Product Name -->
		<ProductCard.Title {name} />

		<!-- Rating -->
		{#if showRating && rating > 0}
			<ProductCard.Rating {rating} />
		{/if}

		<!-- Price and Add to Cart -->
		<ProductCard.Price {price} {currency} />
	</ProductCard.Description>
</ProductCard.Root>
