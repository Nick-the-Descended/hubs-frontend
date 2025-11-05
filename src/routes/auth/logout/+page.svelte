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

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
		<h1 class="text-3xl font-bold mb-4 text-gray-900">Logging Out</h1>
		<div class="flex justify-center mb-4">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
		<p class="text-gray-600">You are being logged out. Redirecting to home page...</p>
	</div>
</div>
