<script lang="ts">
import {Button} from "@/components/ui/button/index";
import {Heart, Eye, ShoppingCart} from '@lucide/svelte';
import {cn, type WithElementRef} from "@/utils";
import type {HTMLAttributes} from "svelte/elements";
type ProductCardActions = WithElementRef<
    HTMLAttributes<HTMLDivElement>
> & {
    onFavoriteClick?: () => void;
    onQuickViewClick?: () => void;
    onAddToCartClick?: () => void;
    isFavorite?: boolean;
};

let {
    ref = $bindable(null),
    class: className,
    onFavoriteClick,
    onQuickViewClick,
    onAddToCartClick,
    isFavorite = false,
    ...restProps
}: ProductCardActions = $props();
</script>

<!-- Action Buttons Overlay -->
        <div class="absolute top-3 right-3 flex flex-col gap-2">
            <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                onclick={onFavoriteClick}
                aria-label="Add to favorites"
            >
                <Heart
                    class={cn(
                        'h-5 w-5 transition-colors',
                        isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-700'
                    )}
                />
            </Button>
            <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                onclick={onQuickViewClick}
                aria-label="Quick view"
            >
                <Eye class="h-5 w-5 text-gray-700" />
            </Button>
            <Button
                    variant="outline"
                    size="icon-lg"
                    class="rounded-full transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground"
                    onclick={onAddToCartClick}
                    aria-label="Add to cart"
            >
                <ShoppingCart class="h-6 w-6" />
            </Button>
        </div>
