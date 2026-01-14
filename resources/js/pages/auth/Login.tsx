import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, Smartphone } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            phone: '', // Changed from login to phone
            password: '', // PIN
        });

    const [pin, setPin] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const triggerShake = () => {
        setIsShaking(true);
        if (navigator.vibrate) {
            navigator.vibrate(300);
        }
        setTimeout(() => setIsShaking(false), 400);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();
        post(route('login'), {
            onFinish: () => {
                // reset('password'); // Don't reset immediately on finish, only on success/error logic if needed.
                // Actually Inertia resets password by default usually, but we want to control it for the PIN.
            },
            onError: () => {
                reset('password');
                setPin('');
                triggerShake();
            },
        });
    };

    const handlePinChange = (value: string) => {
        setPin(value);
        setData('password', value);
    };

    // Helper to translate errors
    const getError = (field: 'phone' | 'password') => {
        const error = errors[field];
        if (!error) return null;

        if (error.includes('credentials'))
            return 'Ces identifiants sont incorrects.';
        if (error.includes('required')) return 'Ce champ est requis.';
        if (error.includes('phone')) return 'Numéro de téléphone invalide.';

        return error;
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--brand-color)]">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-black/20 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-white/10 blur-[100px] delay-1000" />

            <Head title="Connexion" />

            <div
                className={`relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
                    isShaking
                        ? 'animate-shake ring-2 ring-red-500/50'
                        : 'animate-in duration-700 fade-in slide-in-from-bottom-8 zoom-in'
                }`}
            >
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
                        <img
                            src="/images/logo.png"
                            alt=""
                            className="h-12 w-12"
                        />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                        Bon retour
                    </h1>
                    <p className="text-white/60">
                        Connectez-vous avec votre PIN
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/80">
                            Téléphone
                        </Label>
                        <div className="relative">
                            <Smartphone className="absolute top-3 left-4 h-5 w-5 text-white/40" />
                            <Input
                                id="phone"
                                name="phone"
                                value={data.phone}
                                className={`h-12 border-white/10 bg-white/5 pl-12 text-white transition-all placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 focus:ring-0 ${
                                    getError('phone')
                                        ? 'border-red-500/50 focus:border-red-500/50'
                                        : ''
                                }`}
                                autoComplete="tel"
                                autoFocus
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                required
                                placeholder="0123456789"
                            />
                        </div>
                        {getError('phone') && (
                            <p className="animate-in text-sm font-medium text-red-400 slide-in-from-top-1">
                                {getError('phone')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white/80">
                                Code PIN
                            </Label>
                        </div>

                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={4}
                                value={pin}
                                onChange={handlePinChange}
                                className="gap-3"
                            >
                                <InputOTPGroup>
                                    {[0, 1, 2, 3].map((index) => (
                                        <InputOTPSlot
                                            key={index}
                                            index={index}
                                            className={`h-14 w-14 border-white/10 bg-white/5 text-xl font-bold text-white transition-all focus:border-white/30 focus:bg-white/10 ${
                                                getError('password')
                                                    ? 'border-red-500/50'
                                                    : ''
                                            }`}
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {getError('password') && (
                            <p className="animate-in text-center text-sm font-medium text-red-400 slide-in-from-top-1">
                                {getError('password')}
                            </p>
                        )}
                    </div>

                    <Button
                        className="h-14 w-full transform rounded-2xl bg-white text-lg font-bold text-[var(--brand-color)] shadow-xl transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            'Se connecter'
                        )}
                    </Button>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('register')}
                            className="text-sm font-medium text-white/40 transition-colors hover:text-white"
                        >
                            Pas encore de compte ?{' '}
                            <span className="text-white underline underline-offset-4">
                                Créer un compte
                            </span>
                        </Link>
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-6 text-center">
                        <p className="text-xs font-medium tracking-wider text-white/30 uppercase">
                            HRApp <span className="mx-1 text-white/10">|</span>{' '}
                            <span className="text-white/20">powered by</span>{' '}
                            <span className="text-white/40">EyanoGroup</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
