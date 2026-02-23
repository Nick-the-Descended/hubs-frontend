<script lang="ts">
    import { cartStore } from '$lib/stores/cart.svelte';
    import { customerStore } from '$lib/stores/customer.svelte';
    import { sdk } from '$lib/sdk';
    import { goto } from '$app/navigation';

    let step = $state<'email' | 'address' | 'shipping' | 'review'>('email');
    let loading = $state(false);
    let error = $state<string | null>(null);

    let email = $state(customerStore.customer?.email ?? '');
    let firstName = $state(customerStore.customer?.first_name ?? '');
    let lastName = $state(customerStore.customer?.last_name ?? '');
    let address1 = $state('');
    let city = $state('');
    let countryCode = $state('ge');
    let postalCode = $state('');
    let phone = $state('');

    let shippingOptions = $state<Array<{ id: string; name: string; amount: number }>>([]);
    let selectedShippingOptionId = $state<string | null>(null);

    const cartItems = $derived(cartStore.cart?.items ?? []);
    const subtotal = $derived(cartStore.subtotal);

    async function submitEmail() {
        if (!email || !cartStore.cart) return;
        loading = true;
        error = null;
        try {
            await cartStore.updateEmail(email);
            step = 'address';
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function submitAddress() {
        if (!cartStore.cart) return;
        loading = true;
        error = null;
        try {
            await cartStore.setShippingAddress({
                first_name: firstName,
                last_name: lastName,
                address_1: address1,
                city,
                country_code: countryCode,
                postal_code: postalCode,
                phone: phone || undefined,
            });

            const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
                cart_id: cartStore.cart.id,
            } as any);
            shippingOptions = (shipping_options ?? []).map((opt: any) => ({
                id: opt.id,
                name: opt.name,
                amount: (opt.amount ?? 0) / 100,
            }));
            if (shippingOptions.length > 0) {
                selectedShippingOptionId = shippingOptions[0].id;
            }

            step = 'shipping';
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function submitShipping() {
        if (!selectedShippingOptionId || !cartStore.cart) return;
        loading = true;
        error = null;
        try {
            await cartStore.addShippingMethod(selectedShippingOptionId);

            try {
                await sdk.store.payment.initiatePaymentSession(cartStore.cart, {
                    provider_id: 'pp_system_default',
                });
            } catch {
                // Payment provider may not be configured — proceed to review anyway
            }

            step = 'review';
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function placeOrder() {
        loading = true;
        error = null;
        try {
            const order = await cartStore.complete();
            if (order) {
                goto(`/orders/${order.id}`);
            }
        } catch (err: any) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="mx-auto max-w-2xl px-4 py-12">
    <h1 class="mb-8 text-2xl font-semibold uppercase">Checkout</h1>

    {#if error}
        <div class="mb-4 rounded border border-red-400 bg-red-50 px-4 py-3 text-red-700">{error}</div>
    {/if}

    <!-- Step indicator -->
    <div class="mb-8 flex items-center gap-2 text-sm">
        {#each (['email', 'address', 'shipping', 'review'] as const) as s, i}
            <span class="{step === s ? 'font-semibold text-black' : 'text-gray-400'}">{s}</span>
            {#if i < 3}<span class="text-gray-300">/</span>{/if}
        {/each}
    </div>

    {#if step === 'email'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Contact</h2>
            <input
                type="email"
                bind:value={email}
                placeholder="Email address"
                class="mb-4 w-full rounded border px-3 py-2"
            />
            <button
                onclick={submitEmail}
                disabled={loading || !email}
                class="w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Continue to Address'}
            </button>
        </section>

    {:else if step === 'address'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Shipping Address</h2>
            <div class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" bind:value={firstName} placeholder="First name" class="rounded border px-3 py-2" />
                    <input type="text" bind:value={lastName} placeholder="Last name" class="rounded border px-3 py-2" />
                </div>
                <input type="text" bind:value={address1} placeholder="Address" class="rounded border px-3 py-2" />
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" bind:value={city} placeholder="City" class="rounded border px-3 py-2" />
                    <input type="text" bind:value={postalCode} placeholder="Postal code" class="rounded border px-3 py-2" />
                </div>
                <input type="tel" bind:value={phone} placeholder="Phone (optional)" class="rounded border px-3 py-2" />
                <button
                    onclick={submitAddress}
                    disabled={loading || !firstName || !lastName || !address1 || !city}
                    class="mt-2 w-full rounded bg-black py-3 text-white disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Continue to Shipping'}
                </button>
            </div>
        </section>

    {:else if step === 'shipping'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Shipping Method</h2>
            {#if shippingOptions.length === 0}
                <p class="text-gray-500 mb-4">No shipping options available.</p>
            {:else}
                <div class="flex flex-col gap-3 mb-4">
                    {#each shippingOptions as option (option.id)}
                        <label class="flex items-center gap-3 rounded border p-4 cursor-pointer {selectedShippingOptionId === option.id ? 'border-black' : 'border-gray-300'}">
                            <input type="radio" bind:group={selectedShippingOptionId} value={option.id} />
                            <span class="flex-1">{option.name}</span>
                            <span class="font-medium">{option.amount === 0 ? 'Free' : `${option.amount} ₾`}</span>
                        </label>
                    {/each}
                </div>
            {/if}
            <button
                onclick={submitShipping}
                disabled={loading || !selectedShippingOptionId}
                class="w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Continue to Review'}
            </button>
        </section>

    {:else if step === 'review'}
        <section>
            <h2 class="mb-4 text-lg font-medium">Order Review</h2>
            <div class="mb-6 rounded border border-gray-200 p-4">
                {#each cartItems as item (item.id)}
                    <div class="flex items-center justify-between py-2">
                        <span>{item.title} × {item.quantity}</span>
                        <span>{((item.subtotal ?? 0) / 100).toFixed(2)} ₾</span>
                    </div>
                {/each}
                <div class="mt-4 border-t pt-4 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{subtotal.toFixed(2)} ₾</span>
                </div>
            </div>
            <button
                onclick={placeOrder}
                disabled={loading}
                class="w-full rounded bg-black py-3 text-white disabled:opacity-50"
            >
                {loading ? 'Placing order...' : 'Place Order'}
            </button>
        </section>
    {/if}
</div>
