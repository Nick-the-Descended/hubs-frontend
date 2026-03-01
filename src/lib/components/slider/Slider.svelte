<script lang="ts">
    import {cn} from '@/utils';
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type {EmblaCarouselType} from 'embla-carousel';
    type Slide = { imageUrl: string; href: string };
    let {slides}: { slides: Slide[] } = $props();

    let emblaApi: EmblaCarouselType | undefined = $state();
    let selected = $state(0);

    const options = {align: 'start' as const, loop: true};
    let plugins = [];

    function onInit(event: CustomEvent<EmblaCarouselType>) {
        emblaApi = event.detail;

        emblaApi.on('select', () => {
            selected = emblaApi?.selectedScrollSnap() ?? 0;
        });
    }

    const onLeft = () =>
        emblaApi?.canScrollPrev() && emblaApi?.scrollPrev();
    const onRight = () =>
        emblaApi?.canScrollNext() && emblaApi?.scrollNext();
    const select = (index: number) => () => emblaApi?.scrollTo(index);
</script>

<div class="carousel-cont bg-embla-carousel relative overflow-hidden">
    <div
            class="flex w-full overflow-hidden"
            use:emblaCarouselSvelte={{ options, plugins }}
            onemblaInit={onInit}
    >
        <div class="flex">
            {#each slides as slide, index (index)}
                <a class="relative h-[700px] w-full flex-[0_0_100%] overflow-hidden" href={slide.href}>
                    <img class="h-full w-full object-cover" src={slide.imageUrl} alt=""/>
                </a>
            {/each}
        </div>
    </div>

<!--    <button-->
<!--            class="absolute z-2 bg-white p-2 rounded-full top-1/2 left-4 disabled:cursor-not-allowed disabled:opacity-30"-->
<!--            disabled={!emblaApi?.canScrollPrev()}-->
<!--            onclick={onLeft}-->
<!--    >-->
<!--        <img class="h-[26px] w-[26px]" src="/icons/arrow-left.svg" alt="<"/>-->
<!--    </button>-->
<!--    <button-->
<!--            class="absolute z-2 bg-white p-2 rounded-full top-1/2 right-4 disabled:cursor-not-allowed disabled:opacity-30"-->
<!--            disabled={!emblaApi?.canScrollNext()}-->
<!--            onclick={onRight}-->
<!--    >-->
<!--        <img class="h-[26px] w-[26px]" src="/icons/arrow-right.svg" alt=">"/>-->
<!--    </button>-->

    <div class="absolute z-2 bottom-4 left-0 flex w-full justify-center gap-4">
        {#each slides as _, index (index)}
            <button
                    class="grid h-[30px] w-[30px] md:w-[120px] place-items-center cursor-pointer"
                    onclick={select(index)}
                    aria-label="Select slide"
            >
                <span
                        class={cn(
                        'h-[3px] w-full rounded-lg',
                        selected === index
                            ? 'bg-white'
                            : 'bg-white/60'
                    )}
                ></span>
            </button>
        {/each}
    </div>
</div>

<style>
    .carousel-cont::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
        pointer-events: none;
        z-index: 1;
    }
</style>