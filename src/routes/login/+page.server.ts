import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { auth, AUTH_CODE_EXPIRES_IN_SECONDS } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';

function authError(error: unknown, fallback: string) {
	if (error instanceof APIError) {
		return error.message || fallback;
	}
	return fallback;
}

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/dashboard');
	}

	return {
		codeExpiresIn: AUTH_CODE_EXPIRES_IN_SECONDS
	};
};

export const actions: Actions = {
	sendCode: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
		const name = formData.get('name')?.toString().trim() ?? '';

		if (!email) {
			return fail(400, { message: 'Email is required', email, name });
		}

		try {
			await auth.api.sendVerificationOTP({
				body: {
					email,
					type: 'sign-in'
				},
				headers: event.request.headers
			});
		} catch (error) {
			return fail(400, { message: authError(error, 'Could not send verification code'), email, name });
		}

		return {
			step: 'verify',
			email,
			name,
			message: `Code sent to ${email}`,
			codeExpiresIn: AUTH_CODE_EXPIRES_IN_SECONDS
		};
	},

	verifyCode: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
		const name = formData.get('name')?.toString().trim() ?? '';
		const otp = formData.get('otp')?.toString().trim() ?? '';

		if (!email || !otp) {
			return fail(400, {
				step: 'verify',
				message: 'Email and code are required',
				email,
				name,
				codeExpiresIn: AUTH_CODE_EXPIRES_IN_SECONDS
			});
		}

		try {
			const result = await auth.api.signInEmailOTP({
				body: { email, otp },
				headers: event.request.headers
			});

			if (name && !result.user.name) {
				await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, result.user.id));
			}
		} catch (error) {
			return fail(400, {
				step: 'verify',
				message: authError(error, 'Invalid or expired code'),
				email,
				name,
				codeExpiresIn: AUTH_CODE_EXPIRES_IN_SECONDS
			});
		}

		return redirect(302, '/dashboard');
	}
};
