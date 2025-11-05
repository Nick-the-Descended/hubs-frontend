<script lang="ts">
    import { customerStore } from '$lib/stores/customer.svelte';
    import { goto } from '$app/navigation';

    let email = $state('');
    let password = $state('');
    let firstName = $state('');
    let lastName = $state('');
    let confirmPassword = $state('');

    async function handleRegister(e: Event) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await customerStore.register(email, password, firstName, lastName);
            goto('/account');
        } catch (err: any) {
            alert(`Registration failed: ${err.message || 'Unknown error'}`);
        }
    }
</script>

<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6">Create Account</h1>

    {#if customerStore.error}
        <div class="bg-red-100 text-red-700 p-3 rounded mb-4">
            {customerStore.error}
        </div>
    {/if}

    <form onsubmit={handleRegister}>
        <div class="mb-4">
            <label class="block text-sm font-medium mb-2">First Name</label>
            <input
                    type="text"
                    bind:value={firstName}
                    required
                    class="w-full border rounded-lg px-4 py-2"
            />
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Last Name</label>
            <input
                    type="text"
                    bind:value={lastName}
                    required
                    class="w-full border rounded-lg px-4 py-2"
            />
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Email</label>
            <input
                    type="email"
                    bind:value={email}
                    required
                    class="w-full border rounded-lg px-4 py-2"
            />
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Password</label>
            <input
                    type="password"
                    bind:value={password}
                    required
                    minlength="8"
                    class="w-full border rounded-lg px-4 py-2"
            />
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Confirm Password</label>
            <input
                    type="password"
                    bind:value={confirmPassword}
                    required
                    class="w-full border rounded-lg px-4 py-2"
            />
        </div>

        <button
                type="submit"
                disabled={customerStore.loading}
                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
            {customerStore.loading ? 'Creating Account...' : 'Register'}
        </button>
    </form>

    <p class="mt-4 text-center">
        Already have an account?
        <a href="/login" class="text-blue-600 hover:underline">Login</a>
    </p>
</div>