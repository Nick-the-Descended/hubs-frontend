<script lang="ts">
    import { customerStore } from '$lib/stores/customer.svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let email = $state('');
    let password = $state('');
    let error = $state('');

    // Check if redirected from verification
    const verified = $derived(
        page.url.searchParams.get('verified') === 'true'
    );

    async function handleLogin(e: Event) {
        e.preventDefault();
        error = '';

        try {
            await customerStore.login(email, password);
            goto('/profile');
        } catch (err: any) {
            error =
                err.message ||
                'Login failed. Please check your credentials.';
        }
    }
</script>

<div
    class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
>
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 class="mb-6 text-center text-3xl font-bold text-gray-900">
            Login
        </h1>

        {#if verified}
            <div
                class="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
                role="alert"
            >
                <p class="font-medium">
                    Phone verified successfully! Please log in to continue.
                </p>
                <p class="mt-1 text-sm">
                    Use your email (or phone@placeholder.com) and password
                    to log in.
                </p>
            </div>
        {/if}

        {#if error}
            <div
                class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                role="alert"
            >
                <p>{error}</p>
            </div>
        {/if}

        <form onsubmit={handleLogin} class="space-y-6">
            <div>
                <label
                    for="email"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label
                    for="password"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                />
            </div>

            <button
                type="submit"
                disabled={customerStore.loading}
                class="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
                {customerStore.loading ? 'Logging in...' : 'Login'}
            </button>
        </form>

        <p class="mt-6 text-center text-gray-600">
            Don't have an account?
            <a
                href="/auth/register"
                class="font-medium text-blue-600 hover:text-blue-800"
            >
                Register here
            </a>
        </p>
    </div>
</div>
