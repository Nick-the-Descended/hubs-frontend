<script lang="ts">

    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type ProductCardDescription = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        rating?: number;

    };

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps

    }: ProductCardDescription = $props();

</script>

<div
        bind:this={ref}
        data-slot="product-card-description"
        class={cn('flex flex-col gap-3 p-4', className)}
        {...restProps}
>
    {@render children?.()}
</div>