<script lang="ts">
    import {cn} from '@/utils';
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type {EmblaCarouselType} from 'embla-carousel';
    import AutoPlay from 'embla-carousel-autoplay';

    let {images}: { images: string[] } = $props();

    let emblaApi: EmblaCarouselType | undefined = $state();
    let selected = $state(0);

    const options = {align: 'start' as const, loop: true};
    let plugins = [AutoPlay()];

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
        <div
                class="grid w-full auto-cols-[min(100%,460px)] grid-flow-col grid-rows-[700px]"
        >
            {#each images as src, index (index)}
                <div class="relative overflow-hidden sm:mx-0.5">
                    <img class="h-full w-full object-cover" {src} alt=""/>
                </div>
            {/each}
        </div>
    </div>

    <button
            class="absolute z-2 bg-white p-2 rounded-full top-1/2 left-4 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!emblaApi?.canScrollPrev()}
            onclick={onLeft}
    >
        <img class="h-[26px] w-[26px]" src="/icons/arrow-left.svg" alt="<"/>
    </button>
    <button
            class="absolute z-2 bg-white p-2 rounded-full top-1/2 right-4 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!emblaApi?.canScrollNext()}
            onclick={onRight}
    >
        <img class="h-[26px] w-[26px]" src="/icons/arrow-right.svg" alt=">"/>
    </button>

    <div class="absolute z-2 bottom-4 left-0 flex w-full justify-center gap-4">
        {#each images as _, index (index)}
            <button
                    class="grid h-[30px] w-[30px] place-items-center"
                    onclick={select(index)}
                    aria-label="Select slide"
            >
                <span
                        class={cn(
                        'h-[3px] w-full rounded-[.25rem] bg-black',
                        selected === index
                            ? 'bg-black h-[5px]'
                            : '[background:linear-gradient(45deg,#FFF,#FFF)]'
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
        z-index: 1;
    }
</style>