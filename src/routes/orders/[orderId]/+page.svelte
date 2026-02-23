<script lang="ts">
    import { page } from '$app/stores';

    const orderId = $derived($page.params.orderId);
</script>

<div class="mx-auto max-w-2xl px-4 py-16 text-center">
    <div class="mb-6 flex justify-center">
        <svg class="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    </div>
    <h1 class="mb-3 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
    <p class="mb-2 text-gray-600">Thank you for your purchase.</p>
    <p class="mb-8 text-sm text-gray-400">Order ID: <span class="font-mono">{orderId}</span></p>
    <a
        href="/"
        class="inline-block rounded bg-black px-8 py-3 text-white hover:bg-gray-800 transition-colors"
    >
        Continue Shopping
    </a>
</div>
