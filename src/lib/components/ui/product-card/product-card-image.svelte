<script lang="ts">
    import {type WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type ProductCardImage = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        imageUrl: string;
        imageAlt: string;
    };
    let {
        imageUrl,
        imageAlt,
    }:
    ProductCardImage = $props();

</script>

<!-- Image Container -->
<div class="relative h-[190px] w-full overflow-hidden bg-muted lg:h-[360px]">
    <img
            src={imageUrl}
            alt={imageAlt}
            class="h-full w-full object-cover"
    />
</div>