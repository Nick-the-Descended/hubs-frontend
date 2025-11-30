<script lang="ts">
    import { customerStore } from '$lib/stores/customer.svelte';
    import { goto } from '$app/navigation';

    // Registration form state
    let email = $state('');
    let password = $state('');
    let firstName = $state('');
    let lastName = $state('');
    let phone = $state('');
    let confirmPassword = $state('');

    // OTP verification state
    let step = $state<'register' | 'verify'>('register');
    let otp = $state('');
    let otpError = $state('');

    async function handleRegister(e: Event) {
        e.preventDefault();

        if (password !== confirmPassword) {
            customerStore.error = 'Passwords do not match';
            return;
        }

        if (phone.length < 10) {
            customerStore.error =
                'Phone number must be at least 10 digits';
            return;
        }

        try {
            await customerStore.register(
                phone,
                password,
                firstName,
                lastName,
                email || undefined
            );
            // Move to OTP verification step
            step = 'verify';
        } catch (err: any) {
            // Error is already set in customerStore
        }
    }

    async function handleVerifyOTP(e: Event) {
        e.preventDefault();
        otpError = '';

        if (otp.length !== 4) {
            otpError = 'OTP must be 4 digits';
            return;
        }

        try {
            await customerStore.verifyOTP(phone, otp);

            // Auto-login after successful OTP verification
            // Use the email (placeholder or provided) for login
            const loginEmail = email || `${phone}@placeholder.com`;
            try {
                await customerStore.login(loginEmail, password);
                goto('/profile');
            } catch (loginErr: any) {
                // If auto-login fails, redirect to login page
                goto('/auth/login?verified=true');
            }
        } catch (err: any) {
            otpError = err.message || 'OTP verification failed';
        }
    }

    function backToRegister() {
        step = 'register';
        otp = '';
        otpError = '';
    }
</script>

<div
    class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
>
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {#if step === 'register'}
            <h1 class="mb-6 text-center text-3xl font-bold text-gray-900">
                Create Account
            </h1>

            {#if customerStore.error}
                <div
                    class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                    role="alert"
                >
                    <p>{customerStore.error}</p>
                </div>
            {/if}

            <form onsubmit={handleRegister} class="space-y-6">
                <div>
                    <label
                        for="firstName"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
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
                    <label
                        for="lastName"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
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

                <div>
                    <label
                        for="phone"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Phone Number <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        bind:value={phone}
                        required
                        minlength="10"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="+1234567890"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                        We'll send you a verification code via SMS
                    </p>
                </div>

                <div>
                    <label
                        for="email"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Email <span class="text-xs text-gray-400"
                            >(Optional)</span
                        >
                    </label>
                    <input
                        id="email"
                        type="email"
                        bind:value={email}
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label
                        for="password"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
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
                    <label
                        for="confirmPassword"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Confirm Password <span class="text-red-500">*</span
                        >
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
                    {customerStore.loading
                        ? 'Creating Account...'
                        : 'Register'}
                </button>
            </form>

            <p class="mt-6 text-center text-gray-600">
                Already have an account?
                <a
                    href="/auth/login"
                    class="font-medium text-blue-600 hover:text-blue-800"
                >
                    Login here
                </a>
            </p>
        {:else if step === 'verify'}
            <h1 class="mb-6 text-center text-3xl font-bold text-gray-900">
                Verify Phone Number
            </h1>

            <div
                class="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800"
            >
                <p class="text-sm">
                    <strong>Note:</strong> In development, check your server
                    console for the OTP code. In production, you'll receive
                    it via SMS.
                </p>
            </div>

            {#if otpError}
                <div
                    class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                    role="alert"
                >
                    <p>{otpError}</p>
                </div>
            {/if}

            {#if customerStore.error}
                <div
                    class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                    role="alert"
                >
                    <p>{customerStore.error}</p>
                </div>
            {/if}

            <form onsubmit={handleVerifyOTP} class="space-y-6">
                <div>
                    <label
                        for="phoneDisplay"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Phone Number
                    </label>
                    <input
                        id="phoneDisplay"
                        type="tel"
                        value={phone}
                        readonly
                        class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600"
                    />
                </div>

                <div>
                    <label
                        for="otp"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Enter OTP Code <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="otp"
                        type="text"
                        bind:value={otp}
                        required
                        maxlength="4"
                        pattern="[0-9]{4}"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-2xl tracking-widest focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="0000"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                        Enter the 4-digit code sent to your phone
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={customerStore.loading}
                    class="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {customerStore.loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>

            <button
                type="button"
                onclick={backToRegister}
                class="mt-4 w-full font-medium text-blue-600 hover:text-blue-800"
            >
                ← Back to Registration
            </button>
        {/if}
    </div>
</div>
