<script lang="ts">

    import type {WithElementRef} from "@/utils";
    import type {HTMLAttributes} from "svelte/elements";

    type RatingProps = WithElementRef<
        HTMLAttributes<HTMLDivElement>
    > & {
        rating?: number;
    };

    let {
        ref = $bindable(null),
        rating = 0,
        class: className,

    }: RatingProps = $props();

    const filledStars = $derived(Math.floor(rating));
    const hasHalfStar = $derived(rating % 1 >= 0.5);
    const emptyStars = $derived(5 - filledStars - (hasHalfStar ? 1 : 0));
    const filledStarsArray = $derived(Array.from({ length: filledStars }));
    const emptyStarsArray = $derived(Array.from({ length: emptyStars }));
</script>

{#if rating > 0}
    <div class="flex items-center gap-2">
                <span class="text-base font-medium text-foreground"
                >{rating.toFixed(1)}</span
                >
        <div class="flex items-center gap-0.5">
            {#each filledStarsArray as _, i (i)}
                <svg
                        class="h-5 w-5 fill-orange-400 text-orange-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                >
                    <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                </svg>
            {/each}
            {#if hasHalfStar}
                <svg
                        class="h-5 w-5 text-orange-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                >
                    <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                </svg>
            {/if}
            {#each emptyStarsArray as _, i (i)}
                <svg
                        class="h-5 w-5 text-orange-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                >
                    <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                </svg>
            {/each}
        </div>
    </div>
{/if}