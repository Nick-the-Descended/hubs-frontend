<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type ProductCardDiscount = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        discountPercentage: number;
    };

    let {
        ref = $bindable(null),
        class: className,
        discountPercentage,
        ...restProps
    }: ProductCardDiscount = $props();

</script>

<div
        bind:this={ref}
        data-slot="product-card-discount"
        class={cn('absolute top-0 left-0 w-fit h-fit px-2 py-1 font-bold text-white text-nowrap bg-red-700 rounded-[0_0_12px_0]', className)}
        {...restProps}
>
    -{discountPercentage}%
</div>