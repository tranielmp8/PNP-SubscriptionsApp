<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const isVerifyStep = $derived(form?.step === 'verify');
	const codeExpiresIn = $derived(form?.codeExpiresIn ?? data.codeExpiresIn);
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
		<div class="mb-6">
			<div
				class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600"
			>
				<span class="text-sm font-bold text-white">P</span>
			</div>
			<h1 class="text-2xl font-bold text-gray-900">Sign in or create account</h1>
			<p class="mt-1 text-sm text-gray-500">
				{isVerifyStep
					? `Enter the 6-digit code sent to ${form?.email}.`
					: 'Use your email to get a secure verification code. New emails are created automatically after verification.'}
			</p>
		</div>

		{#if form?.message}
			<div
				class="mb-4 rounded-lg px-3 py-2 text-sm {isVerifyStep && !form.message.toLowerCase().includes('invalid') && !form.message.toLowerCase().includes('expired') && !form.message.toLowerCase().includes('required')
					? 'bg-emerald-50 text-emerald-700'
					: 'bg-red-50 text-red-700'}"
			>
				{form.message}
			</div>
		{/if}

		{#if isVerifyStep}
			<form method="post" action="?/verifyCode" use:enhance class="space-y-4">
				<input type="hidden" name="email" value={form?.email ?? ''} />
				<input type="hidden" name="name" value={form?.name ?? ''} />

				<label class="block">
					<span class="mb-1 block text-sm font-medium text-gray-700">Verification code</span>
					<input
						name="otp"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength="6"
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-2xl font-semibold tracking-[0.35em] text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
					/>
				</label>

				<p class="text-xs text-gray-500">Code expires in {codeExpiresIn} seconds.</p>

				<button
					type="submit"
					class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
				>
					Verify and continue
				</button>
			</form>

			<form method="post" action="?/sendCode" use:enhance class="mt-3">
				<input type="hidden" name="email" value={form?.email ?? ''} />
				<input type="hidden" name="name" value={form?.name ?? ''} />
				<button
					type="submit"
					class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
				>
					Send a new code
				</button>
			</form>
		{:else}
			<form method="post" action="?/sendCode" use:enhance class="space-y-4">
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-gray-700">Email</span>
					<input
						type="email"
						name="email"
						value={form?.email ?? ''}
						autocomplete="email"
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
					/>
				</label>

				<label class="block">
					<span class="mb-1 block text-sm font-medium text-gray-700">Name <span class="text-gray-400">(optional)</span></span>
					<input
						name="name"
						value={form?.name ?? ''}
						autocomplete="name"
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
					/>
				</label>

				<button
					type="submit"
					class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
				>
					Email me a code
				</button>
			</form>
		{/if}
	</div>
</div>
