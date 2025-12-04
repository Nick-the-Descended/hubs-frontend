<script lang="ts">
    import type {WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type ProductCardPrice = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        currency?: string;
        price: string;

    };

    let {
        ref = $bindable(null),
        currency = 'GEL',
        class: className,
        price,
        ...restProps
    }: ProductCardPrice = $props();
</script>

<div class="flex items-center justify-between">
    <div class="flex items-baseline gap-0.5">
                <span class="text-3xl font-bold text-foreground"
                >{price}</span
                >
        <span class="text-base font-normal text-foreground"
        >{currency}</span
        >
    </div>
</div>