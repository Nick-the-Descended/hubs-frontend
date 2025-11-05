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
            customerStore.error = 'Phone number must be at least 10 digits';
            return;
        }

        try {
            await customerStore.register(phone, password, firstName, lastName, email || undefined);
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

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        {#if step === 'register'}
            <h1 class="text-3xl font-bold mb-6 text-center text-gray-900">Create Account</h1>

            {#if customerStore.error}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <p>{customerStore.error}</p>
                </div>
            {/if}

            <form onsubmit={handleRegister} class="space-y-6">
                <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        bind:value={firstName}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John"
                    />
                </div>

                <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        bind:value={lastName}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Doe"
                    />
                </div>

                <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        bind:value={phone}
                        required
                        minlength="10"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1234567890"
                    />
                    <p class="mt-1 text-xs text-gray-500">We'll send you a verification code via SMS</p>
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Email <span class="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        bind:value={email}
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Password <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        bind:value={password}
                        required
                        minlength="8"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="At least 8 characters"
                    />
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        bind:value={confirmPassword}
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Re-enter your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={customerStore.loading}
                    class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {customerStore.loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <p class="mt-6 text-center text-gray-600">
                Already have an account?
                <a href="/auth/login" class="text-blue-600 hover:text-blue-800 font-medium">
                    Login here
                </a>
            </p>
        {:else if step === 'verify'}
            <h1 class="text-3xl font-bold mb-6 text-center text-gray-900">Verify Phone Number</h1>

            <div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
                <p class="text-sm">
                    <strong>Note:</strong> In development, check your server console for the OTP code.
                    In production, you'll receive it via SMS.
                </p>
            </div>

            {#if otpError}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <p>{otpError}</p>
                </div>
            {/if}

            {#if customerStore.error}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <p>{customerStore.error}</p>
                </div>
            {/if}

            <form onsubmit={handleVerifyOTP} class="space-y-6">
                <div>
                    <label for="phoneDisplay" class="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        id="phoneDisplay"
                        type="tel"
                        value={phone}
                        readonly
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                </div>

                <div>
                    <label for="otp" class="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP Code <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="otp"
                        type="text"
                        bind:value={otp}
                        required
                        maxlength="4"
                        pattern="[0-9]{4}"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                        placeholder="0000"
                    />
                    <p class="mt-1 text-xs text-gray-500">Enter the 4-digit code sent to your phone</p>
                </div>

                <button
                    type="submit"
                    disabled={customerStore.loading}
                    class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {customerStore.loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>

            <button
                type="button"
                onclick={backToRegister}
                class="mt-4 w-full text-blue-600 hover:text-blue-800 font-medium"
            >
                ← Back to Registration
            </button>
        {/if}
    </div>
</div>