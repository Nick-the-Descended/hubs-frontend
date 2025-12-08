<script lang="ts">
    import {cn} from '@/utils.js';

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    } = $props();
</script>

<div
        bind:this={ref}
        class={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
    )}
        {...restProps}
>
    {@render children?.()}
</div>

