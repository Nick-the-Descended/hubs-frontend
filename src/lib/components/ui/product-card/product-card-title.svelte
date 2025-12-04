<script lang="ts">
    import type {WithElementRef} from "@/utils";
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

<h3 class="text-lg font-semibold text-foreground">{name}</h3>