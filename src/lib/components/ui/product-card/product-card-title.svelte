<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type ProductCardTitle = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        name: string;
    };

    let {
        ref = $bindable(null),
        class: className,
        name,
        ...restProps
    }: ProductCardTitle = $props();

</script>

<h3
        class={cn(
        'text-lg font-semibold text-foreground',
        className
    )}
        {...restProps}
>{name}</h3>