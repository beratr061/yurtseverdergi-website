'use client';

import { useState, FormEvent } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailFormProps {
  onSuccess?: () => void;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'already_subscribed';

interface FormState {
  status: FormStatus;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSubscriptionForm({ onSuccess }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    message: '',
  });

  const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email.trim());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // Client-side validation
    if (!trimmedEmail) {
      setFormState({
        status: 'error',
        message: 'Lütfen e-posta adresinizi girin',
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setFormState({
        status: 'error',
        message: 'Geçerli bir e-posta adresi girin',
      });
      return;
    }

    setFormState({ status: 'loading', message: '' });

    try {
      const response = await fetch('/api/invitation/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadySubscribed) {
          setFormState({
            status: 'already_subscribed',
            message: data.message,
          });
        } else {
          setFormState({
            status: 'success',
            message: data.message,
          });
          setEmail('');
          onSuccess?.();
        }
      } else {
        setFormState({
          status: 'error',
          message: data.error || 'Bir hata oluştu, lütfen tekrar deneyin',
        });
      }
    } catch {
      setFormState({
        status: 'error',
        message: 'Bağlantı hatası, lütfen tekrar deneyin',
      });
    }
  };

  const isLoading = formState.status === 'loading';
  const showSuccess = formState.status === 'success' || formState.status === 'already_subscribed';
  const showError = formState.status === 'error';

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <p className="text-sm text-white/60 text-center">
        Site yayına alındığında haberdar olmak için e-posta bırakın
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formState.status !== 'idle' && formState.status !== 'loading') {
                setFormState({ status: 'idle', message: '' });
              }
            }}
            placeholder="E-posta adresiniz"
            disabled={isLoading}
            className={`
              w-full pl-12 pr-4 py-3 sm:py-4
              bg-white/10 backdrop-blur-sm
              border border-white/20
              rounded-lg
              text-white placeholder-white/40
              focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
              ${showError ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}
              ${showSuccess ? 'border-green-500/50 ring-1 ring-green-500/30' : ''}
            `}
            aria-label="E-posta adresi"
            aria-invalid={showError}
            aria-describedby={formState.message ? 'form-message' : undefined}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 sm:py-4 px-6
            bg-primary-600 hover:bg-primary-700
            text-white font-medium
            rounded-lg
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center space-x-2
            hover:shadow-lg hover:shadow-primary-500/25
            active:scale-[0.98]
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <span>Beni Haberdar Et</span>
          )}
        </button>
      </form>

      {/* Status Message */}
      {formState.message && (
        <div
          id="form-message"
          role={showError ? 'alert' : 'status'}
          className={`
            flex items-center justify-center space-x-2 text-sm
            animate-in fade-in slide-in-from-bottom-2 duration-300
            ${showError ? 'text-red-400' : ''}
            ${showSuccess ? 'text-green-400' : ''}
          `}
        >
          {showError && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {showSuccess && <CheckCircle className="h-4 w-4 flex-shrink-0" />}
          <span>{formState.message}</span>
        </div>
      )}
    </div>
  );
}
