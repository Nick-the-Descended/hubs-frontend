<script lang="ts">
    import {onMount} from 'svelte';
    import {browser} from '$app/environment';
    import {localCartStore, type LocalCartItem} from '$lib/stores/local-cart.svelte';
    import {Minus, Plus, Trash2, Heart, Copy, Share2, Truck, MapPin, TicketPercent, ChevronDown} from '@lucide/svelte';
    import type {PageData} from './$types';

    let {data}: { data: PageData } = $props();

    let activeTab = $state<'my' | 'shared'>('my');
    let discountCode = $state('');
    let agreedTerms = $state(false);
    let agreedData = $state(false);
    let selectedDelivery = $state<'pickup' | 'standard' | 'express'>('standard');

    // Address form
    let country = $state('საქართველო');
    let city = $state('თბილისი');
    let street = $state('');
    let building = $state('');
    let apartment = $state('');
    let floor = $state('');
    let postalCode = $state('');

    // Use server-loaded cart items initially, then switch to reactive local store after hydration
    let hydrated = $state(false);
    onMount(() => { hydrated = true; });

    const cartItems: LocalCartItem[] = $derived(
        hydrated ? localCartStore.items : (data.cartItems ?? [])
    );
    const itemCount = $derived(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    const subtotal = $derived(cartItems.reduce((sum, item) => {
        const price = item.discountPrice ?? item.price;
        return sum + price * item.quantity;
    }, 0));
    const deliveryFee = $derived(selectedDelivery === 'express' ? 10 : 0);
    const total = $derived(subtotal + deliveryFee);
</script>

<!-- Breadcrumbs -->
<nav class="mx-auto max-w-[1440px] px-20 pt-6">
    <div class="flex items-center gap-1 text-base text-black uppercase">
        <a href="/" class="hover:underline">საწყისი გვერდი</a>
        <span class="text-gray-400">&gt;</span>
        <span class="font-semibold">კალათა</span>
    </div>
    <div class="mt-2 h-px bg-gray-300"></div>
</nav>

<div class="mx-auto max-w-[1440px] px-20 py-8">
    <!-- Section title -->
    <h1 class="mb-6 text-base font-normal uppercase text-black">შერჩეული პროდუქცია</h1>

    <div class="flex gap-12 items-start">
        <!-- Left: Cart Items -->
        <div class="flex-1 max-w-[774px]">
            <!-- Cart card -->
            <div class="rounded-2xl border border-black/30 bg-white overflow-hidden">
                <!-- Tabs -->
                <div class="flex">
                    <button
                        class="flex-1 py-5 text-center text-lg uppercase transition-colors {activeTab === 'my' ? 'font-medium text-black/90' : 'font-normal text-black/40 border-b border-l border-black/30'}"
                        class:rounded-tl-2xl={activeTab === 'my'}
                        onclick={() => activeTab = 'my'}
                    >
                        ჩემი კალათა
                    </button>
                    <button
                        class="flex-1 py-5 text-center text-lg uppercase transition-colors {activeTab === 'shared' ? 'font-medium text-black/90' : 'font-normal text-black/40 border-b border-l border-black/30'}"
                        class:rounded-tr-2xl={activeTab === 'shared'}
                        onclick={() => activeTab = 'shared'}
                    >
                        საერთო კალათა
                    </button>
                </div>

                <!-- Product list -->
                <div class="flex flex-col gap-3 p-9">
                    {#if cartItems.length === 0}
                        <p class="py-12 text-center text-gray-500">კალათა ცარიელია</p>
                    {:else}
                        {#each cartItems as item, index (index)}
                            <!-- Product row -->
                            <div class="flex items-start justify-between max-w-[800px] w-full">
                                <!-- Left: Product info -->
                                <div class="flex flex-col gap-6 w-[394px]">
                                    {#if index === 0}
                                        <span class="text-base font-semibold text-black/80">პროდუქტი</span>
                                    {/if}
                                    <div class="flex gap-6 items-center">
                                        <div class="w-[120px] h-[120px] rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                class="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div class="flex flex-col h-[115px] justify-between w-[250px]">
                                            <div class="flex flex-col gap-2 text-base text-black/80">
                                                <span class="max-w-[250px] overflow-hidden text-ellipsis">{item.name}</span>
                                                {#if item.size}
                                                    <span>ზომა: <span class="font-medium">{item.size}</span></span>
                                                {/if}
                                            </div>
                                            {#if item.branding}
                                                <span class="text-base text-black/80">მფლობელი: {item.branding.name}</span>
                                            {/if}
                                            <div class="flex gap-5 text-base text-black/80">
                                                {#if item.color}
                                                    <span>ფერი: <span class="font-medium">{item.color.colorName}</span></span>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right: Quantity + Price + Actions -->
                                <div class="flex flex-col h-[168px] items-end justify-between w-[224px]">
                                    <div class="flex items-start justify-between w-full">
                                        <!-- Quantity -->
                                        <div class="flex flex-col gap-6 items-center w-[103px]">
                                            {#if index === 0}
                                                <span class="text-base font-semibold text-black/80 w-full">რაოდენობა</span>
                                            {/if}
                                            <div class="flex items-center gap-[15px] border border-black/30 rounded px-[9px] py-2 h-10 w-full">
                                                <button
                                                    onclick={() => localCartStore.updateQuantity(index, item.quantity - 1)}
                                                    class="shrink-0 text-black/60 hover:text-black"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span class="text-xs text-black/80 flex-1 text-center">{item.quantity}</span>
                                                <button
                                                    onclick={() => localCartStore.updateQuantity(index, item.quantity + 1)}
                                                    class="shrink-0 text-black/60 hover:text-black"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Price -->
                                        <div class="flex flex-col gap-6 items-end w-[86px] text-base text-black/80">
                                            {#if index === 0}
                                                <span class="font-semibold text-right w-full">ფასი</span>
                                            {/if}
                                            <span class="font-medium uppercase">{((item.discountPrice ?? item.price) * item.quantity)} ₾</span>
                                        </div>
                                    </div>

                                    <!-- Action icons -->
                                    <div class="flex gap-3 items-center">
                                        <button
                                            onclick={() => localCartStore.removeItem(index)}
                                            class="text-black/60 hover:text-black transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button class="text-black/60 hover:text-black transition-colors" aria-label="Add to wishlist">
                                            <Heart size={20} />
                                        </button>
                                        <button class="text-black/60 hover:text-black transition-colors" aria-label="Duplicate item">
                                            <Copy size={20} />
                                        </button>
                                        <button class="text-black/60 hover:text-black transition-colors" aria-label="Share item">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Divider -->
                            {#if index < cartItems.length - 1}
                                <div class="h-px bg-gray-100 w-full"></div>
                            {/if}
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Address Section -->
            <div class="mt-12 flex flex-col gap-6">
                <h2 class="text-base font-normal uppercase text-black">მისამართი</h2>
                <div class="flex flex-col gap-4">
                    <div class="flex gap-2 h-[60px]">
                        <div class="flex-1 flex items-center justify-between border border-black/30 rounded-lg px-6 py-[18px]">
                            <span class="text-base text-black/70">{country}</span>
                            <ChevronDown size={20} class="text-black/50" />
                        </div>
                        <div class="flex-1 flex items-center justify-between border border-black/30 rounded-lg px-6 py-[18px]">
                            <span class="text-base text-black/70">{city}</span>
                            <ChevronDown size={20} class="text-black/50" />
                        </div>
                    </div>
                    <input
                        type="text"
                        bind:value={street}
                        placeholder="ქუჩა"
                        class="h-[60px] border border-black/30 rounded-lg px-6 py-3 text-base text-black/70 placeholder:text-black/70 focus:outline-none focus:border-black/50"
                    />
                    <div class="flex gap-2">
                        <input
                            type="text"
                            bind:value={building}
                            placeholder="კორპუსის ნომერი"
                            class="flex-1 h-[60px] border border-black/30 rounded-lg px-6 py-3 text-[13px] text-black/70 placeholder:text-black/70 focus:outline-none focus:border-black/50"
                        />
                        <input
                            type="text"
                            bind:value={apartment}
                            placeholder="ბინის ნომერი"
                            class="flex-1 h-[60px] border border-black/30 rounded-lg px-6 py-3 text-xs text-black/70 placeholder:text-black/70 focus:outline-none focus:border-black/50"
                        />
                        <input
                            type="text"
                            bind:value={floor}
                            placeholder="სართული"
                            class="flex-1 h-[60px] border border-black/30 rounded-lg px-6 py-3 text-xs text-black/70 placeholder:text-black/70 focus:outline-none focus:border-black/50"
                        />
                        <input
                            type="text"
                            bind:value={postalCode}
                            placeholder="საფოსტო ინდექსი"
                            class="flex-1 h-[60px] border border-black/30 rounded-lg px-6 py-3 text-xs text-black/70 placeholder:text-black/70 focus:outline-none focus:border-black/50"
                        />
                    </div>
                </div>
            </div>

            <!-- Delivery Method -->
            <div class="mt-12 flex flex-col gap-6">
                <h2 class="text-base font-normal uppercase text-black">მიწოდების მეთოდი</h2>
                <div class="flex flex-col gap-6">
                    <!-- Pickup -->
                    <button
                        class="flex items-center p-6 h-[82px] border rounded-lg transition-colors text-left {selectedDelivery === 'pickup' ? 'border-2 border-black/70' : 'border border-black/70'}"
                        onclick={() => selectedDelivery = 'pickup'}
                    >
                        <span class="text-base text-black/70">მაღაზიიდან გატანა - უფასო</span>
                    </button>

                    <!-- Standard -->
                    <button
                        class="flex items-center justify-between p-6 border rounded-lg transition-colors text-left {selectedDelivery === 'standard' ? 'border-2 border-black/70' : 'border border-black/70'}"
                        onclick={() => selectedDelivery = 'standard'}
                    >
                        <div class="flex flex-col gap-0.5 text-black/70">
                            <span class="text-base">სტანდარტული მიწოდება - უფასო</span>
                            <span class="text-xs">(3-5 დღე)</span>
                        </div>
                        {#if selectedDelivery === 'standard'}
                            <div class="w-8 h-8 rounded-full border-[8px] border-black/70"></div>
                        {/if}
                    </button>

                    <!-- Express -->
                    <button
                        class="flex items-center justify-between p-6 border rounded-lg transition-colors text-left {selectedDelivery === 'express' ? 'border-2 border-black/70' : 'border border-black/70'}"
                        onclick={() => selectedDelivery = 'express'}
                    >
                        <div class="flex flex-col gap-0.5 text-black/70">
                            <span class="text-base">ექსპრეს მიწოდება +10₾</span>
                            <span class="text-xs">(1-2 დღე)</span>
                        </div>
                        {#if selectedDelivery === 'express'}
                            <div class="w-8 h-8 rounded-full border-[8px] border-black/70"></div>
                        {/if}
                    </button>
                </div>
            </div>
        </div>

        <!-- Right: Order Summary (sticky) -->
        <div class="w-[422px] shrink-0 sticky top-8">
            <div class="flex flex-col gap-6">
                <!-- Order Review -->
                <div class="flex flex-col gap-6">
                    <div class="flex flex-col gap-4 text-base text-black/70">
                        <h2 class="uppercase">შეკვეთის მიმოხილვა</h2>
                        <div class="flex flex-col gap-6 px-6">
                            {#each cartItems as item}
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-4">
                                        <span class="w-5">x{item.quantity}</span>
                                        <span class="w-[199px]">{item.name}</span>
                                    </div>
                                    <span>{(item.discountPrice ?? item.price) * item.quantity} ₾</span>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <!-- Delivery Service -->
                    <div class="flex flex-col gap-4">
                        <h3 class="text-base text-black/70 uppercase">მიტანის სერვისი</h3>
                        <div class="flex flex-col gap-6 px-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <Truck size={22} class="text-black/70" />
                                    <span class="text-base text-black/70 w-[184px]">მიტანის საფასური</span>
                                </div>
                                <span class="text-base text-black/70">{deliveryFee} ₾</span>
                            </div>
                            <div class="flex items-center gap-3.5">
                                <MapPin size={20} class="text-black/70 shrink-0" />
                                <span class="text-base text-black/70">მიტანის ლოკაცია: {street || 'ქუჩის სახელი'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Divider + Total -->
                <div class="flex flex-col gap-6">
                    <div class="h-px bg-gray-300"></div>
                    <div class="flex items-center justify-between text-xl text-black/70 uppercase">
                        <span>შეკვეთის ღირებულება</span>
                        <span class="font-semibold">{total} ₾</span>
                    </div>
                </div>

                <!-- Discount + Pay -->
                <div class="flex flex-col gap-6">
                    <div class="flex flex-col gap-4">
                        <div class="relative">
                            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-black/50">
                                <TicketPercent size={20} />
                            </div>
                            <input
                                type="text"
                                bind:value={discountCode}
                                placeholder="ფასდაკლების კოდი"
                                class="w-full h-[51px] border border-black/30 rounded-lg pl-12 pr-6 text-base text-black/50 placeholder:text-black/50 focus:outline-none focus:border-black/50"
                            />
                        </div>
                        <button class="w-full bg-black border border-black/70 rounded-lg py-4 text-white text-base font-medium uppercase hover:bg-gray-800 transition-colors">
                            გადახდა
                        </button>
                    </div>

                    <!-- Checkboxes -->
                    <div class="flex flex-col gap-4 w-[318px]">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={agreedTerms}
                                class="w-[22px] h-[22px] rounded border-black/70 text-black focus:ring-0"
                            />
                            <span class="text-xs text-black/70">
                                ვეთანხმები
                                <a href="/ToS" class="font-medium text-[#3e3a88]"> წესებსა და პირობებს</a><span class="text-[#930c0c]">*</span>
                            </span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={agreedData}
                                class="w-[22px] h-[22px] rounded border-black/70 text-black focus:ring-0"
                            />
                            <span class="text-xs text-black/70">ვეთანხმები მონაცემების დამუშავებას</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
