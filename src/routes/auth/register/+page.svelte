<script lang="ts">
    import { customerStore } from '$lib/stores/customer.svelte';
    import { registerWithCart } from '$lib/stores/cart-auth.svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let email = $state('');
    let password = $state('');
    let firstName = $state('');
    let lastName = $state('');
    let confirmPassword = $state('');
    let formError = $state('');

    const redirectTo = $derived(
        page.url.searchParams.get('redirect') || '/profile'
    );

    async function handleRegister(e: Event) {
        e.preventDefault();
        formError = '';

        if (password !== confirmPassword) {
            formError = 'Passwords do not match';
            return;
        }

        try {
            await registerWithCart(email, password, firstName, lastName);
            goto(redirectTo);
        } catch (err: any) {
            formError = err.message || 'Registration failed. Please try again.';
        }
    }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 class="mb-6 text-center text-3xl font-bold text-gray-900">Create Account</h1>

        {#if formError || customerStore.error}
            <div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
                <p>{formError || customerStore.error}</p>
            </div>
        {/if}

        <form onsubmit={handleRegister} class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="firstName" class="mb-2 block text-sm font-medium text-gray-700">
                        First Name <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        bind:value={firstName}
                        required
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label for="lastName" class="mb-2 block text-sm font-medium text-gray-700">
                        Last Name <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        bind:value={lastName}
                        required
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
                    Email <span class="text-red-500">*</span>
                </label>
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                />
            </div>

            <div>
                <label for="password" class="mb-2 block text-sm font-medium text-gray-700">
                    Password <span class="text-red-500">*</span>
                </label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    required
                    minlength="8"
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="At least 8 characters"
                />
            </div>

            <div>
                <label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password <span class="text-red-500">*</span>
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    bind:value={confirmPassword}
                    required
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter your password"
                />
            </div>

            <button
                type="submit"
                disabled={customerStore.loading}
                class="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
                {customerStore.loading ? 'Creating Account...' : 'Register'}
            </button>
        </form>

        <p class="mt-6 text-center text-gray-600">
            Already have an account?
            <a href="/auth/login" class="font-medium text-blue-600 hover:text-blue-800">Login here</a>
        </p>
    </div>
</div>
