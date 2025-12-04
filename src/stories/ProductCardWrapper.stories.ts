import type { Meta, StoryObj } from '@storybook/svelte';
import ProductCardWrapper from '@/components/ui/product-card/product-card-wrapper.svelte';

// Meta configuration for ProductCard stories
const meta = {
	title: 'Components/ProductCard/Wrapper',
	component: ProductCardWrapper,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		name: {
			control: 'text',
			description: 'Product name'
		},
		price: {
			control: 'text',
			description: 'Product price'
		},
		currency: {
			control: 'select',
			options: ['GEL', 'USD', 'EUR', 'GBP'],
			description: 'Price currency'
		},
		rating: {
			control: { type: 'number', min: 0, max: 5, step: 0.1 },
			description: 'Product rating (0-5)'
		},
		imageUrl: {
			control: 'text',
			description: 'Product image URL'
		},
		imageAlt: {
			control: 'text',
			description: 'Image alt text'
		},
		isFavorite: {
			control: 'boolean',
			description: 'Whether the product is favorited'
		},
		showActions: {
			control: 'boolean',
			description: 'Show action buttons (favorite, quick view, add to cart)'
		},
		showRating: {
			control: 'boolean',
			description: 'Show rating stars'
		},
		onFavoriteClick: {
			action: 'favorite-clicked',
			description: 'Callback when favorite button is clicked'
		},
		onQuickViewClick: {
			action: 'quick-view-clicked',
			description: 'Callback when quick view button is clicked'
		},
		onAddToCartClick: {
			action: 'add-to-cart-clicked',
			description: 'Callback when add to cart button is clicked'
		}
	}
} satisfies Meta<ProductCardWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
	args: {
		name: 'Premium Product',
		price: '300.00',
		currency: 'GEL',
		rating: 4.8,
		imageUrl:
			'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
		imageAlt: 'Sample product',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// Sports Jersey - matching the design
export const SportsJersey: Story = {
	args: {
		name: 'Premium Sports Jersey',
		price: '300.00',
		currency: 'GEL',
		rating: 4.8,
		imageUrl:
			'https://images.unsplash.com/photo-1658988492188-14a094c85b0d?w=600&h=600&fit=crop',
		imageAlt: 'Sports jersey',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// Favorited product
export const Favorited: Story = {
	args: {
		name: 'Favorite Product',
		price: '150.00',
		currency: 'GEL',
		rating: 4.5,
		imageUrl:
			'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
		imageAlt: 'Favorite product',
		isFavorite: true,
		showActions: true,
		showRating: true
	}
};

// High rating
export const HighRating: Story = {
	args: {
		name: 'Top Rated Product',
		price: '499.99',
		currency: 'GEL',
		rating: 4.9,
		imageUrl:
			'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
		imageAlt: 'High rated product',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// Low rating
export const LowRating: Story = {
	args: {
		name: 'Budget Product',
		price: '49.99',
		currency: 'GEL',
		rating: 3.2,
		imageUrl:
			'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
		imageAlt: 'Budget product',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// No rating
export const NoRating: Story = {
	args: {
		name: 'New Product',
		price: '79.99',
		currency: 'GEL',
		rating: 0,
		imageUrl:
			'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop',
		imageAlt: 'New product',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// Without actions
export const WithoutActions: Story = {
	args: {
		name: 'Simple Product',
		price: '199.99',
		currency: 'GEL',
		rating: 4.2,
		imageUrl:
			'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
		imageAlt: 'Simple product',
		isFavorite: false,
		showActions: false,
		showRating: true
	}
};

// Without rating
export const WithoutRating: Story = {
	args: {
		name: 'Product Without Rating',
		price: '129.99',
		currency: 'GEL',
		rating: 0,
		imageUrl:
			'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
		imageAlt: 'Product without rating',
		isFavorite: false,
		showActions: true,
		showRating: false
	}
};

// Different currency - USD
export const USDCurrency: Story = {
	args: {
		name: 'International Product',
		price: '99.99',
		currency: 'USD',
		rating: 4.3,
		imageUrl:
			'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop',
		imageAlt: 'International product',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// Different currency - EUR
export const EURCurrency: Story = {
	args: {
		name: 'European Product',
		price: '89.99',
		currency: 'EUR',
		rating: 4.6,
		imageUrl:
			'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
		imageAlt: 'European product',
		isFavorite: false,
		showActions: true,
		showRating: true
	}
};

// Minimal - no actions, no rating
export const Minimal: Story = {
	args: {
		name: 'Minimal Product Card',
		price: '59.99',
		currency: 'GEL',
		rating: 0,
		imageUrl:
			'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop',
		imageAlt: 'Minimal product',
		isFavorite: false,
		showActions: false,
		showRating: false
	}
};
