<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";
    import {getContext} from 'svelte';

    type ProductCardImage = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        imageUrl: string;
        imageAlt: string;
        class?: string;
    };
    let {
        imageUrl,
        imageAlt,
        class: className,
        ...restProps
    }:
    ProductCardImage = $props();

    const href = getContext<string | undefined>('product-card-href');

</script>

<!-- Image Container -->
<div
        class={cn(
        'relative h-[190px] w-full overflow-hidden bg-muted lg:h-[360px]',
        className
    )}
        {...restProps}
>
    {#if href}
        <a href={href} class="block h-full w-full cursor-pointer">
            <img
                    src={imageUrl}
                    alt={imageAlt}
                    class="h-full w-full object-cover"
            />
        </a>
    {:else}
        <img
                src={imageUrl}
                alt={imageAlt}
                class="h-full w-full object-cover"
        />
    {/if}
</div>