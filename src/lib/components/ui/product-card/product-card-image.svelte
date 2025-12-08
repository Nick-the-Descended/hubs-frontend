<script lang="ts">
    import {cn, type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

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

</script>

<!-- Image Container -->
<div
        class={cn(
        'relative h-[190px] w-full overflow-hidden bg-muted lg:h-[360px]',
        className
    )}
        {...restProps}
>
    <img
            src={imageUrl}
            alt={imageAlt}
            class="h-full w-full object-cover"
    />
</div>