<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type ProductCardPrice = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        currency?: string;
        price: number;
        discountedPrice: number | null;
    };

    let {
        ref = $bindable(null),
        currency = 'GEL',
        class: className,
        price,
        discountedPrice,
        ...restProps
    }: ProductCardPrice = $props();
</script>

<div
        class={cn(
        'flex items-center justify-between',
        className
    )}
        {...restProps}
>
    <div class="flex items-baseline gap-0.5">
                <span class="text-3xl font-bold text-foreground"
                >{price}</span
                >
        <span class="text-base font-normal text-foreground"
        >{currency}</span
        >
    </div>
    {#if discountedPrice != null && discountedPrice < price}
        <span class="text-sm text-gray-400 line-through">{discountedPrice}₾</span>
    {/if}
</div>