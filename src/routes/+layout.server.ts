import { strapi } from '$lib/strapi';
import type { Header } from '$lib/types/strapi-generated';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	try {
		// Fetch header data from Strapi (single-type content)
		const headerData = await strapi.findSingle<Header>('header', {
			fields: [
				'promotionalBanner',
				'logoAlt',
				`navigationItems {
					id
					label
					href
					subcategories {
						id
						label
						href
						iconSrc
						description
						productType
						subcategories {
							id
							label
							href
							iconSrc
							description
							productType
							subcategories {
								id
								label
								href
								iconSrc
								description
								productType
							}
						}
					}
				}`
			]
		});

		if (!headerData) {
			console.warn('No header data found in Strapi');
			return {
				header: getFallbackHeader()
			};
		}

		return {
			header: headerData
		};
	} catch (error) {
		console.error('Error fetching header from Strapi:', error);
		// Return fallback header data if Strapi fetch fails
		return {
			header: getFallbackHeader()
		};
	}
};

// Fallback header data in case Strapi is unavailable
function getFallbackHeader(): Partial<Header> {
	return {
		promotionalBanner: 'Discount promotion/seasonal offer/....',
		logoUrl: '/logo.svg',
		logoAlt: 'HubsGe',
		navigationItems: [
			{
				label: 'ფან-შოპი',
				href: '/products/fan-shop',
				subcategories: [
					{
						label: 'ფეხბურთის ნაკრები',
						href: '/products/fan-shop/football',
						iconSrc: '/nav/icon.png',
						subcategories: [
							{
								productType: 'მაისური',
								href: '/'
							}
						]
					},
					{
						label: 'იბერია 1999',
						href: '/products/fan-shop/iberia',
						iconSrc: '/nav/icon.png',
						subcategories: [
							{ productType: 'მაისური', href: '/' },
							{ productType: 'საგულშემატკივრო მაისური', href: '/' },
							{ productType: 'აქსესუარები', href: '/' }
						]
					},
					{
						label: 'ტორპედო ქუთაისი',
						href: '/products/fan-shop/torpedo-kutaisi',
						iconSrc: '/nav/icon.png',
						subcategories: [
							{ productType: 'მაისური', href: '/' },
							{ productType: 'მოსაცმელი', href: '/' }
						]
					},
					{
						label: 'დინამო თბილისი',
						href: '/products/fan-shop/dinamo-tbilisi',
						iconSrc: '/nav/icon.png',
						subcategories: [{ productType: 'მაისური', href: '/' }]
					},
					{
						label: 'კალათბურთის ეროვნული ნაკრები',
						href: '/products/fan-shop/basketball',
						iconSrc: '/nav/icon.png',
						subcategories: [
							{ productType: 'მაისური', href: '/' },
							{ productType: 'მოსაცმელი', href: '/' },
							{ productType: 'შორტი', href: '/' },
							{ productType: 'ფან-მაისური', href: '/' },
							{ productType: 'სვიტერი', href: '/' },
							{ productType: 'აქსესუარები', href: '/' }
						]
					},
					{
						label: 'რაგბის ეროვნული ნაკრები',
						href: '/products/fan-shop/american-football',
						iconSrc: '/nav/icon.png',
						subcategories: [
							{ productType: 'მაისური', href: '/' },
							{ productType: 'შარვალი', href: '/' },
							{ productType: 'მოსაცმელი', href: '/' },
							{ productType: 'ქურთუკი', href: '/' },
							{ productType: 'აქსესუარები', href: '/' }
						]
					}
				]
			},
			{
				label: 'ფიხტანი',
				href: '/products/fixtures',
				subcategories: [
					{
						label: 'სამზარეულო',
						href: '/products/fixtures/kitchen',
						description: 'ონკანები და სამზარეულო აქსესუარები'
					},
					{ label: 'სააბაზანო', href: '/products/fixtures/bathroom', description: 'ონკანები და ხელსაბანი' },
					{ label: 'შხაპები', href: '/products/fixtures/showers' },
					{ label: 'ნიჟარები', href: '/products/fixtures/sinks' }
				]
			},
			{
				label: 'კალენი',
				href: '/products/stairs',
				subcategories: [
					{ label: 'შიდა კიბეები', href: '/products/stairs/indoor', description: 'კიბეები შიდა სივრცისთვის' },
					{ label: 'გარე კიბეები', href: '/products/stairs/outdoor', description: 'ამინდგამძლე კიბეები' },
					{ label: 'სახელურები', href: '/products/stairs/railings' },
					{ label: 'კიბის საფეხურები', href: '/products/stairs/treads' }
				]
			},
			{
				label: 'ბრენდები',
				href: '/products/brands',
				subcategories: [
					{
						label: 'პრემიუმ ბრენდები',
						href: '/products/brands/premium',
						description: 'მაღალი ხარისხის ბრენდები'
					},
					{ label: 'ეკონომ ბრენდები', href: '/products/brands/economy', description: 'ხელმისაწვდომი ფასები' },
					{ label: 'ადგილობრივი ბრენდები', href: '/products/brands/local' },
					{ label: 'საერთაშორისო ბრენდები', href: '/products/brands/international' }
				]
			},
			{
				label: 'მაგაზიები',
				href: '/stores',
				subcategories: [
					{ label: 'თბილისი', href: '/stores/tbilisi', description: 'მაღაზიები დედაქალაქში' },
					{ label: 'ბათუმი', href: '/stores/batumi' },
					{ label: 'ქუთაისი', href: '/stores/kutaisi' },
					{ label: 'რუსთავი', href: '/stores/rustavi' }
				]
			},
			{
				label: 'ქალი',
				href: '/products/women',
				subcategories: [
					{ label: 'ტანსაცმელი', href: '/products/women/clothing', description: 'კაბები, ბლუზები, შარვლები' },
					{ label: 'ფეხსაცმელი', href: '/products/women/shoes' },
					{ label: 'ჩანთები', href: '/products/women/bags' },
					{ label: 'აქსესუარები', href: '/products/women/accessories' }
				]
			},
			{
				label: 'ფიტდაკოსმეტი',
				href: '/products/fitness-cosmetics',
				subcategories: [
					{
						label: 'ფიტნეს აქსესუარები',
						href: '/products/fitness/accessories',
						description: 'სავარჯიშო აღჭურვილობა'
					},
					{ label: 'კოსმეტიკა', href: '/products/cosmetics', description: 'სხეულის მოვლის საშუალებები' },
					{ label: 'ვიტამინები', href: '/products/fitness/vitamins' },
					{ label: 'სპორტული კვება', href: '/products/fitness/nutrition' }
				]
			},
			{
				label: 'აქსესუარები',
				href: '/products/accessories',
				subcategories: [
					{
						label: 'სახლის აქსესუარები',
						href: '/products/accessories/home',
						description: 'დეკორაციული ელემენტები'
					},
					{ label: 'სამზარეულოს აქსესუარები', href: '/products/accessories/kitchen' },
					{ label: 'სააბაზანოს აქსესუარები', href: '/products/accessories/bathroom' },
					{ label: 'ორგანაიზერები', href: '/products/accessories/organizers' }
				]
			}
		]
	};
}
