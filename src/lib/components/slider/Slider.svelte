<script lang="ts">
    import { cn } from "@/utils";
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';
    import AutoPlay from "embla-carousel-autoplay";

    let { images }: { images: string[] } = $props();

    let emblaApi: EmblaCarouselType | undefined = $state();
    let selected = $state(0);

    const options = { align: 'start' as const, loop: true };
    let plugins = [AutoPlay()]

    function onInit(event: CustomEvent<EmblaCarouselType>) {
        emblaApi = event.detail;

        emblaApi.on('select', () => {
            selected = emblaApi?.selectedScrollSnap() ?? 0;
        });
    }

    const onLeft = () => emblaApi?.canScrollPrev() && emblaApi?.scrollPrev();
    const onRight = () => emblaApi?.canScrollNext() && emblaApi?.scrollNext();
    const select = (index: number) => () => emblaApi?.scrollTo(index);
</script>

<div class="relative bg-embla-carousel overflow-hidden">
    <div
            class="overflow-hidden flex w-full"
            use:emblaCarouselSvelte={{ options, plugins }}
            onemblaInit={onInit}
    >
        <div class="grid grid-flow-col auto-cols-[min(100%,460px)] grid-rows-[700px] w-full">
            {#each images as src, index (index)}
                <div class="relative overflow-hidden sm:mx-1">
<!--                    <p class="absolute top-[8px] right-[9px] grid place-items-center text-svelte w-12 h-12 bg-embla-carousel rounded-full">-->
<!--                        {index + 1}-->
<!--                    </p>-->
                    <img class="w-full h-full object-cover" {src} alt="" />
                </div>
            {/each}
        </div>
    </div>

    <button
            class="absolute top-1/2 left-4 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!emblaApi?.canScrollPrev()}
            onclick={onLeft}
    >
        <img class="w-[26px] h-[26px] rotate-180" src="/carousel-arrow.svg" alt="<" />
    </button>
    <button
            class="absolute top-1/2 right-4 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!emblaApi?.canScrollNext()}
            onclick={onRight}
    >
        <img class="w-[26px] h-[26px]" src="/carousel-arrow.svg" alt=">" />
    </button>

    <div class="absolute bottom-4 left-0 w-full flex justify-center gap-4">
        {#each images as _, index (index)}
            <button
                    class="w-[30px] h-[30px] grid place-items-center"
                    onclick={select(index)}
                    aria-label="Select slide"
            >
                <span
                        class={cn(
                        "w-full h-[3px] bg-black rounded-[.25rem]",
                        selected === index ? "bg-white" : "[background:linear-gradient(45deg,#ff9500,#ffcc00)]"
                    )}
                ></span>
            </button>
        {/each}
    </div>
</div>