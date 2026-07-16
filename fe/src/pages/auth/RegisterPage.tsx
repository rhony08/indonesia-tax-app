import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[0-9]{8,15}$/.test(val), {
      message: 'Invalid phone number',
    }),
  npwp: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{15,16}$/.test(val), {
      message: 'Invalid NPWP format',
    }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registerUser = useAuthStore((s) => s.register);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      npwp: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        npwp: data.npwp || undefined,
      });
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('common.error');
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-border rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {t('auth.register')}
            </h1>
            <p className="text-text-secondary text-sm">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-6 p-3 bg-critical-bg border border-warning/30 rounded-lg text-sm text-warning">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                {t('auth.name')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.name ? 'border-warning' : 'border-border'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-warning">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.email ? 'border-warning' : 'border-border'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-warning">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.password ? 'border-warning' : 'border-border'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-warning">{errors.password.message}</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                {t('auth.phone')}{' '}
                <span className="text-text-disabled font-normal">
                  ({t('auth.optional')})
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+6281234567890"
                  {...register('phone')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.phone ? 'border-warning' : 'border-border'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-warning">{errors.phone.message}</p>
              )}
            </div>

            {/* NPWP (optional) */}
            <div>
              <label
                htmlFor="npwp"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                {t('auth.npwp')}{' '}
                <span className="text-text-disabled font-normal">
                  ({t('auth.optional')})
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled text-xs font-mono">
                  ID
                </span>
                <input
                  id="npwp"
                  type="text"
                  placeholder="12.345.678.9-123.000"
                  {...register('npwp')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    errors.npwp ? 'border-warning' : 'border-border'
                  }`}
                />
              </div>
              {errors.npwp && (
                <p className="mt-1 text-xs text-warning">{errors.npwp.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-text-disabled disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-text-disabled">
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-border hover:border-primary/30 hover:bg-background-gray text-text-primary font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('auth.googleLogin')}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            {t('auth.haveAccount')}{' '}
            <Link
              to="/auth/login"
              className="text-primary hover:text-primary-hover font-medium"
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
