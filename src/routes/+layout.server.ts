import {strapi, mapParaglideLocaleToStrapi} from '$lib/strapi';
import type {Header} from '$lib/types/strapi-generated';
import type {LayoutServerLoad} from './$types';
import {getLocale} from '$lib/paraglide/runtime';

export const load: LayoutServerLoad = async () => {
    try {
        // Get current locale from Paraglide and map to Strapi format
        const locale = getLocale();
        console.log(locale)
        const strapiLocale = mapParaglideLocaleToStrapi(locale);

        // Fetch header data from Strapi (single-type content)
        const headerData = await strapi.findSingle<Header>('header', {
            locale: strapiLocale,
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
        "documentId": "mur84ihub0w8jxv1jo04qp2f",
        "logoAlt": "Hubs.ge",
        "promotionalBanner": "20% ფასდაკლება",
        "logoUrl": null,
        "navigationItems":
            [
                {
                    "id": "19",
                    "label": "ფეხბურთი",
                    "href": "#",
                    "subcategories": [
                        {
                            "id": "39",
                            "label": "ბუცი",
                            "href": "#",
                            "iconSrc": "https://cms.znagti.ge/uploads/ID_0918_10_FOOTWEAR_3_D_Rendering_Side_Lateral_Left_View_transparent_87ce6d5779.png",
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "73",
                                    "label": "Elite",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": [
                                        {
                                            "id": "1",
                                            "label": "Pro",
                                            "href": "#",
                                            "iconSrc": null,
                                            "description": null,
                                            "productType": null
                                        },
                                        {
                                            "id": "2",
                                            "label": "Academy/League",
                                            "href": "#",
                                            "iconSrc": null,
                                            "description": null,
                                            "productType": null
                                        },
                                        {
                                            "id": "3",
                                            "label": "Club",
                                            "href": "#",
                                            "iconSrc": null,
                                            "description": null,
                                            "productType": null
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "id": "21",
                            "label": "ეკიპირება",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "13",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "14",
                                    "label": "თერმო მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "15",
                                    "label": "შორტი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "22",
                            "label": "აქსესუარები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "16",
                                    "label": "მეკარის ხელთათმანები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "17",
                                    "label": "დამცავები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "18",
                                    "label": "წინდები & გეტრები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "19",
                                    "label": "ჩანთა",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "19",
                            "label": "ბურთი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": []
                        },
                        {
                            "id": "23",
                            "label": "შიპოვკა",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "20",
                                    "label": "Pro",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "21",
                                    "label": "Academy/League",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "22",
                                    "label": "Club",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "15",
                    "label": "ფან-შოპი",
                    "href": "#",
                    "subcategories": [
                        {
                            "id": "24",
                            "label": "ფეხბურთის ეროვნული ნაკრები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "23",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "25",
                            "label": "რაგბის ეროვნული ნაკრები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "24",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "25",
                                    "label": "შარვალი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "26",
                                    "label": "მოსაცმელი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "27",
                                    "label": "ქურთუკი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "28",
                                    "label": "აქსესუარები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "26",
                            "label": "დინამო თბილისი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "29",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "27",
                            "label": "იბერია 1999",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "30",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "31",
                                    "label": "საგულშემატკივრო აქსესუარები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "32",
                                    "label": "აქსესუარები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "28",
                            "label": "ტორპედო ქუთაისი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "33",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "34",
                                    "label": "მოსაცმელი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "29",
                            "label": "კალათბურთის ეროვნული ნაკრები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "35",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "36",
                                    "label": "მოსაცმელი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "37",
                                    "label": "შორტი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "38",
                                    "label": "ფან მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "39",
                                    "label": "სვიტერი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "40",
                                    "label": "აქსესუარები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "11",
                    "label": "ბრენდები",
                    "href": "#",
                    "subcategories": []
                },
                {
                    "id": "16",
                    "label": "მამაკაცი",
                    "href": "#",
                    "subcategories": [
                        {
                            "id": "30",
                            "label": "ფეხსაცმელი",
                            "href": "#",
                            "iconSrc": "https://cms.znagti.ge/uploads/ID_0918_10_FOOTWEAR_3_D_Rendering_Side_Lateral_Left_View_transparent_87ce6d5779.png",
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "41",
                                    "label": "ყოველდღიური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "42",
                                    "label": "სპორტული",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "43",
                                    "label": "სანდლები & ჩუსტები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "31",
                            "label": "ტანსაცმელი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "44",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "45",
                                    "label": "შარვალი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "46",
                                    "label": "ჰუდი & სვიტერი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "47",
                                    "label": "მოსაცმელი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "48",
                                    "label": "ქურთუკი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "32",
                            "label": "აქსესუარაები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "49",
                                    "label": "წინდები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "50",
                                    "label": "ქუდი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "51",
                                    "label": "ჩანთა",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "52",
                                    "label": "საცვლები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "53",
                                    "label": "თერმოსები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "17",
                    "label": "ქალი",
                    "href": "#",
                    "subcategories": [
                        {
                            "id": "33",
                            "label": "ფეხსაცმელი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "54",
                                    "label": "ყოველდღიური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "55",
                                    "label": "სპორტული",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "56",
                                    "label": "სანდლები & ჩუსტები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "34",
                            "label": "ტანსაცმელი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "57",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "58",
                                    "label": "შარვალი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "59",
                                    "label": "ჰუდი & სვიტერი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "60",
                                    "label": "მოსაცმელი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "61",
                                    "label": "ქურთუკი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "35",
                            "label": "აქსესუარები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "62",
                                    "label": "წინდები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "63",
                                    "label": "ქუდი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "64",
                                    "label": "ჩანთა",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "65",
                                    "label": "საცვლები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "66",
                                    "label": "თერმოსები",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "18",
                    "label": "პადელი",
                    "href": "#",
                    "subcategories": [
                        {
                            "id": "36",
                            "label": "მამაკაცი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "67",
                                    "label": "მაისური",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "68",
                                    "label": "შორტი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "37",
                            "label": "ქალი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "69",
                                    "label": "მაისური & ტოპი",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "70",
                                    "label": "შორტი & კაბა",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        },
                        {
                            "id": "20",
                            "label": "ჩოგანი",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": []
                        },
                        {
                            "id": "38",
                            "label": "აქსესუარები",
                            "href": "#",
                            "iconSrc": null,
                            "description": null,
                            "productType": null,
                            "subcategories": [
                                {
                                    "id": "71",
                                    "label": "ჩანთა",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                },
                                {
                                    "id": "72",
                                    "label": "სხვა",
                                    "href": "#",
                                    "iconSrc": null,
                                    "description": null,
                                    "productType": null,
                                    "subcategories": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "12",
                    "label": "საბრძოლო ხელოვნებები",
                    "href": "#",
                    "subcategories": []
                },
                {
                    "id": "13",
                    "label": "ფასდაკლება",
                    "href": "#",
                    "subcategories": []
                },
                {
                    "id": "14",
                    "label": "Outlet",
                    "href": "#",
                    "subcategories": []
                }
            ],
        "localizations":
            [
                {
                    "locale": "en",
                    documentId: "",
                    localizations: []
                }
            ]
    };
}
