<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";
    import {getContext} from 'svelte';

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

    const href = getContext<string | undefined>('product-card-href');

</script>

{#if href}
    <a href={href} class="cursor-pointer">
        <h3
                class={cn(
                'text-lg font-semibold text-foreground transition-colors hover:text-primary',
                className
            )}
                {...restProps}
        >{name}</h3>
    </a>
{:else}
    <h3
            class={cn(
            'text-lg font-semibold text-foreground',
            className
        )}
            {...restProps}
    >{name}</h3>
{/if}