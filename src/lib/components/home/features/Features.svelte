<script lang="ts">
	import { PUBLIC_STRAPI_URL } from '$env/static/public';

	type ServiceItem = { Title: string; Description: string; Image: { url: string } };

	let { services }: { services: ServiceItem[] } = $props();
</script>

{#if services.length}
<section class="w-full px-20 py-0">
	<div class="grid grid-cols-3 gap-8">
		{#each services as service}
			<div class="flex flex-col items-center justify-center p-6 rounded-2xl overflow-hidden">
				<div class="flex flex-col items-center justify-center gap-5 w-full">
					<!-- Icon -->
					<div class="w-10 h-10 flex-shrink-0">
						<img src="{PUBLIC_STRAPI_URL}{service.Image.url}" alt="" class="w-full h-full object-contain" />
					</div>

					<!-- Text Content -->
					<div class="flex flex-col gap-1 w-[297px] text-center">
						<h3
							class="font-['Inter','Noto_Sans_Georgian',sans-serif] font-medium text-base leading-6 uppercase text-black"
						>
							{service.Title}
						</h3>
						<p
							class="font-['Inter','Noto_Sans_Georgian',sans-serif] font-normal text-xs leading-normal text-black"
						>
							{service.Description}
						</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
{/if}
