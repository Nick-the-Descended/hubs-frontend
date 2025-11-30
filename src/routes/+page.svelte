<script>
    import AutoPlay from "embla-carousel-autoplay"
    import Slider from "@/components/slider/Slider.svelte";

    let options = {loop: true}
    let plugins = [AutoPlay()]

    let hero_images = [
        "/hero-images/Image%201.png",
        "/hero-images/Image%202.png",
        "/hero-images/Image%203.png",
        "/hero-images/Image%204.png",
        "/hero-images/Image%205.png",
        "/hero-images/Image%206.png",
        "/hero-images/Image%207.png",
        "/hero-images/Image%208.png",
        "/hero-images/Image%209.png",
        "/hero-images/Image%2010.png",
        "/hero-images/Image%2011.png",
        "/hero-images/Image%2012.png",
        "/hero-images/Image%2013.png",
        "/hero-images/Image%2014.png",
        "/hero-images/Image%2015.png",
        "/hero-images/Image%2016.png",
        "/hero-images/Image%2017.png",
    ]

    let scrollPrev = () => {}
    let scrollNext = () => {}

</script>

<Slider images={hero_images} />
