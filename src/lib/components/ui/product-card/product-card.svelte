<script lang="ts">
    import {cn} from '@/utils.js';
    import {setContext} from 'svelte';

    let {
        ref = $bindable(null),
        class: className,
        href,
        children,
        ...restProps
    } = $props();

    // Provide href to child components via context
    setContext('product-card-href', href);
</script>

<div
        bind:this={ref}
        class={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
    )}
        {...restProps}
>
    {@render children?.()}
</div>

