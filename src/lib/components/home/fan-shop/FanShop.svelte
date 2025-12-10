<script>
import {Button} from "@/components/ui/button/index.ts";
</script>

<section class="py-12 mx-16">
    <h2 class="mb-8 text-2xl font-semibold">Fan Shop</h2>
    <div class="grid grid-cols-2 shop-grid gap-5">
        <div class="main flex flex-col justify-center items-between gap-4">
            <div>
                <h3 class="font-bold text-xl">
                    HUBS.GE X SPORT CLUBS
                </h3>
                <span>
                    დაბრენდე მაისური ფან-შოპში ტექსტი დროებით არის განთავსებული ვიზუალური სტრუქტურისთვის.
                </span>
            </div>
            <div
                    class="min-h-[400px] max-md:min-h-[220px] h-full bg-cover bg-center rounded-md max-md:rounded-sm flex flex-col justify-end items-center"
                    style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/fan-shop/main.png);"
            >
                <Button
                        class="m-6 text-2xl py-6"
                        onclick={() => alert('clicked')}
                >
                    What's in the box?
                </Button>
            </div>
        </div>
        <div class="side grid grid-rows-2 grid-cols-2 gap-3 max-md:grid-cols-1">
            <div
                    class="min-h-[400px] max-md:min-h-[220px] h-full bg-cover bg-center rounded-md max-md:rounded-sm"
                    style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/seasonal/ball.png);"
            >
                <!-- product name on the bottom left, price on bottom right-->
            </div>
            <div
                    class="min-h-[400px] max-md:min-h-[220px] h-full bg-cover bg-center rounded-md max-md:rounded-sm"
                    style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/seasonal/ball.png);"
            >
                <!-- product name on the bottom left, price on bottom right-->
            </div>
            <!-- hidden on small screens -->
            <div
                    class="min-h-[400px] max-md:min-h-[220px] h-full bg-cover bg-center rounded-md max-md:hidden"
                    style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/seasonal/ball.png);"
            >
                <!-- product name on the bottom left, price on bottom right-->
            </div>
            <div
                    class="min-h-[400px] max-md:min-h-[220px] h-full bg-cover bg-center rounded-md max-md:hidden"
                    style="background-image: linear-gradient(to top, #000a, #0000 50%), url(/seasonal/ball.png);"
            >
                <!-- product name on the bottom left, price on bottom right-->
            </div>
        </div>
    </div>
</section>


<style>
    .shop-grid {

    }
</style>