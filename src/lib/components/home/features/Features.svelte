<script lang="ts">
	// Features component showcasing key benefits
	interface Feature {
		icon: string;
		title: string;
		description: string;
	}

	const features: Feature[] = [
		{
			icon: '/icons/truck-delivery.svg',
			title: 'სწრაფი მიტანის სერვისი',
			description:
				'შეძენილ ნივთს სწრაფად მოგაწვდით თქვენს მისამართზე მთელი მსოფლიოს მასშტაბით'
		},
		{
			icon: '/icons/shield-check.svg',
			title: 'გარანტირებული ხარისხი',
			description: 'ჩვენთან შეგიძლიათ შეიძინოთ მხოლოდ წამყვანი ბრენდების ორიგინალი პროდუქცია'
		},
		{
			icon: '/icons/star-outline.svg',
			title: 'საუკეთესო მომსახურება',
			description: 'შეგიძლიათ ნებისმიერ დროს გაცვალოთ ან დააბრუნოთ ნივთი'
		}
	];
</script>

<section class="w-full px-20 py-0">
	<div class="grid grid-cols-3 gap-8">
		{#each features as feature}
			<div class="flex flex-col items-center justify-center p-6 rounded-2xl overflow-hidden">
				<div class="flex flex-col items-center justify-center gap-5 w-full">
					<!-- Icon -->
					<div class="w-10 h-10 flex-shrink-0">
						<img src={feature.icon} alt="" class="w-full h-full object-contain" />
					</div>

					<!-- Text Content -->
					<div class="flex flex-col gap-1 w-[297px] text-center">
						<h3
							class="font-['Inter','Noto_Sans_Georgian',sans-serif] font-medium text-base leading-6 uppercase text-black"
						>
							{feature.title}
						</h3>
						<p
							class="font-['Inter','Noto_Sans_Georgian',sans-serif] font-normal text-xs leading-normal text-black"
						>
							{feature.description}
						</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
