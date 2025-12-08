<script lang="ts">
    import {getLocale, setLocale} from '@/paraglide/runtime';
    import * as m from '@/paraglide/messages';
    import {browser} from '$app/environment';

    // Props
    interface Props {
        class?: string;
    }

    let {class: className}: Props = $props();

    // Available languages configuration
    const languages: Array<{ code: 'en' | 'ka-ge'; label: string }> = [
        {code: 'en', label: m.lang_en()},
        {code: 'ka-ge', label: m.lang_ka_ge()}
    ];

    // Current selected language state
    let currentLocale = $state<'en' | 'ka-ge'>(getLocale());
    let isDropdownOpen = $state(false);

    // Get the display code for the current locale
    const displayCode = $derived(currentLocale.toUpperCase().replace('-', '_'));

    // Toggle dropdown function
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const dropdown = document.getElementById('language-dropdown');
        if (dropdown && !dropdown.contains(target)) {
            isDropdownOpen = false;
        }
    }

    // Handle language selection
    function selectLanguage(code: 'en' | 'ka-ge') {
        currentLocale = code;
        setLocale(code);
        isDropdownOpen = false;

        // Store preference in localStorage
        if (browser) {
            localStorage.setItem('preferred_locale', code);
            // Reload page to apply new locale
            window.location.reload();
        }
    }

    // Add click outside listener
    $effect(() => {
        if (browser && isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    });
</script>

<div id="language-dropdown" class="relative {className}">
    <button
            type="button"
            onclick={toggleDropdown}
            class="flex items-center gap-1 text-sm font-medium hover:text-gray-600"
            aria-label="Select language"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
    >
        {displayCode === 'EN' ? 'EN' : 'GEO'}
        <svg
                class="h-4 w-4 transition-transform"
                class:rotate-180={isDropdownOpen}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
        >
            <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
            />
        </svg>
    </button>

    {#if isDropdownOpen}
        <div
                class="absolute right-0 top-full z-50 mt-2 w-32 rounded-md border border-gray-200 bg-white shadow-lg"
                role="menu"
        >
            {#each languages as lang (lang.code)}
                <button
                        type="button"
                        onclick={() => selectLanguage(lang.code)}
                        class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        class:bg-gray-100={currentLocale === lang.code}
                        class:font-medium={currentLocale === lang.code}
                        role="menuitem"
                >
                    {lang.label}
                </button>
            {/each}
        </div>
    {/if}
</div>
