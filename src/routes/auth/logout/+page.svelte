<script lang="ts">
    import { onMount } from 'svelte';
    import { customerStore } from '$lib/stores/customer.svelte';
    import { goto } from '$app/navigation';

    let loggingOut = $state(true);

    onMount(async () => {
        try {
            await customerStore.logout();
            // Redirect to home page after logout
            setTimeout(() => {
                goto('/');
            }, 1500);
        } catch (err) {
            console.error('Logout error:', err);
            goto('/');
        }
    });
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div
        class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
    >
        <h1 class="mb-4 text-3xl font-bold text-gray-900">Logging Out</h1>
        <div class="mb-4 flex justify-center">
            <div
                class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
            ></div>
        </div>
        <p class="text-gray-600">
            You are being logged out. Redirecting to home page...
        </p>
    </div>
</div>
