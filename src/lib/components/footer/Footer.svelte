<script lang="ts">
	// Footer component for Hubs.ge
</script>

<footer class="bg-[#404040] w-full">
	<div class="mx-auto px-20 pt-[72px] pb-0">
		<!-- Footer Top -->
		<div class="flex items-start justify-between gap-8 pb-4">
			<!-- Footer Left -->
			<div class="flex flex-col gap-6 max-w-[303px]">
				<!-- Logo -->
				<div class="w-[71px] h-10">
					<img src="/logo.svg" alt="Hubs.ge" class="w-full h-full object-contain brightness-0 invert" />
				</div>

				<!-- Text -->
				<p class="font-['Montserrat','Noto_Sans_Georgian',sans-serif] font-medium text-sm leading-6 text-white/70">
					შემოუერთდით ჩვენს სოციალურ ქსელებს და გაიგეთ პირველებმა ჩვენი აქციების შესახებ!
				</p>

				<!-- Social Links -->
				<div class="flex gap-3">
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-white/30 rounded-full p-3 hover:bg-white/40 transition-colors"
						aria-label="Facebook"
					>
						<img src="/icons/facebook.svg" alt="Facebook" class="w-2 h-4" />
					</a>
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-white/30 rounded-full p-3 hover:bg-white/40 transition-colors"
						aria-label="Instagram"
					>
						<img src="/icons/instagram.svg" alt="Instagram" class="w-4 h-4" />
					</a>
					<a
						href="https://linkedin.com"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-white/30 rounded-full p-3 hover:bg-white/40 transition-colors"
						aria-label="LinkedIn"
					>
						<img src="/icons/linkedin.svg" alt="LinkedIn" class="w-4 h-4" />
					</a>
					<a
						href="https://tiktok.com"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:opacity-80 transition-opacity"
						aria-label="TikTok"
					>
						<img src="/icons/tiktok.svg" alt="TikTok" class="w-10 h-10" />
					</a>
				</div>
			</div>

			<!-- Footer Right -->
			<div class="flex gap-12">
				<!-- Information Column -->
				<div class="flex flex-col gap-4">
					<h3 class="font-['Inter','Noto_Sans_Georgian',sans-serif] font-semibold text-base text-white">
						ინფორმაცია
					</h3>
					<nav class="flex flex-col gap-2">
						<a href="/about-us" class="font-['Inter','Noto_Sans_Georgian',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							ჩვენ შესახებ
						</a>
						<a href="/faq" class="font-['Inter',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							FAQs
						</a>
						<a href="/gift-cards" class="font-['Inter','Noto_Sans_Georgian',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							სასაჩუქრე კუპონები
						</a>
						<a href="/brands" class="font-['Inter','Noto_Sans_Georgian',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							ბრენდები
						</a>
						<a href="/orders" class="font-['Inter','Noto_Sans_Georgian',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							შენი შეკვეთის შესახებ
						</a>
					</nav>
				</div>

				<!-- Contact Details Column -->
				<div class="flex flex-col gap-4">
					<h3 class="font-['Inter','Noto_Sans_Georgian',sans-serif] font-semibold text-base text-white">
						საკონტაქტო დეტალები
					</h3>
					<div class="flex flex-col gap-2">
						<a href="tel:+995322560566" class="font-['Inter',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							+995 32 256 05 66
						</a>
						<p class="font-['Inter','Noto_Sans_Georgian',sans-serif] text-sm text-white/70">
							ორშ-კვი 11:00 - 20:00
						</p>
						<a href="mailto:contact@hubs.ge" class="font-['Inter',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							contact@hubs.ge
						</a>
						<a href="#map" class="font-['Inter','Noto_Sans_Georgian',sans-serif] text-sm text-white/70 hover:text-white transition-colors">
							რუკაზე ნახვა
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer Bottom -->
		<div class="border-t border-white/30 py-6 flex items-center justify-center">
			<p class="font-['Inter',sans-serif] text-base text-white/70 text-center">
				HUBS.GE 2025 All Rights Reserved
				<span class="text-white/30">|</span>
				<a href="/terms" class="underline hover:text-white transition-colors">Terms and Conditions</a>
				<span class="text-white/30">|</span>
				<a href="/privacy" class="underline hover:text-white transition-colors">Privacy Policy</a>
			</p>
		</div>
	</div>
</footer>
