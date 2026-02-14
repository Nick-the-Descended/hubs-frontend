<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";
    import {getContext} from 'svelte';

    type ProductCardImage = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        imageUrl: string;
        imageAlt: string;
        tall?: boolean;
        class?: string;
    };
    let {
        imageUrl,
        imageAlt,
        tall = false,
        class: className,
        ...restProps
    }:
    ProductCardImage = $props();

    const href = getContext<string | undefined>('product-card-href');

</script>

<!-- Image Container -->
<div
        class={cn(
        'relative w-full overflow-hidden bg-muted',
        tall ? 'h-[190px] lg:h-[360px]' : 'h-[130px] lg:h-[240px]',
        className
    )}
        {...restProps}
>
    {#if href}
        <a href={href} class="block h-full w-full cursor-pointer">
            <img
                    src={imageUrl}
                    alt={imageAlt}
                    class="h-full w-full object-contain"
            />
        </a>
    {:else}
        <img
                src={imageUrl}
                alt={imageAlt}
                class="h-full w-full object-contain"
        />
    {/if}
</div>