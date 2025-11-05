<script lang="ts">
	import { customerStore } from '$lib/stores/customer.svelte';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';

		try {
			await customerStore.login(email, password);
			goto('/profile');
		} catch (err: any) {
			error = err.message || 'Login failed. Please check your credentials.';
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
		<h1 class="text-3xl font-bold mb-6 text-center text-gray-900">Login</h1>

		{#if error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
				<p>{error}</p>
			</div>
		{/if}

		<form onsubmit={handleLogin} class="space-y-6">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
					Email Address
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="Enter your password"
				/>
			</div>

			<button
				type="submit"
				disabled={customerStore.loading}
				class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
			>
				{customerStore.loading ? 'Logging in...' : 'Login'}
			</button>
		</form>

		<p class="mt-6 text-center text-gray-600">
			Don't have an account?
			<a href="/auth/register" class="text-blue-600 hover:text-blue-800 font-medium">
				Register here
			</a>
		</p>
	</div>
</div>
