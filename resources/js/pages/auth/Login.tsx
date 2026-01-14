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
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-purple-500/30 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-blue-500/30 blur-[100px] delay-1000" />

            <Head title="Connexion" />

            <div
                className={`relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                    isShaking
                        ? 'animate-shake ring-2 ring-red-500/50'
                        : 'animate-in duration-700 fade-in slide-in-from-bottom-8 zoom-in'
                }`}
            >
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                        Bon retour
                    </h1>
                    <p className="text-slate-300">
                        Connectez-vous avec votre PIN
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">
                            Téléphone
                        </Label>
                        <div className="relative">
                            <Smartphone className="absolute top-2.5 left-3 h-5 w-5 text-slate-400" />
                            <Input
                                id="phone"
                                name="phone"
                                value={data.phone}
                                className={`border-white/10 bg-white/5 pl-10 text-white transition-all placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 ${
                                    getError('phone')
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
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
                            <Label htmlFor="password" className="text-white">
                                Code PIN
                            </Label>
                        </div>

                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={4}
                                value={pin}
                                onChange={handlePinChange}
                                className="gap-2"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot
                                        index={0}
                                        className={`h-12 w-12 border-white/10 bg-white/5 text-lg text-white ${getError('password') ? 'border-red-500' : ''}`}
                                    />
                                    <InputOTPSlot
                                        index={1}
                                        className={`h-12 w-12 border-white/10 bg-white/5 text-lg text-white ${getError('password') ? 'border-red-500' : ''}`}
                                    />
                                    <InputOTPSlot
                                        index={2}
                                        className={`h-12 w-12 border-white/10 bg-white/5 text-lg text-white ${getError('password') ? 'border-red-500' : ''}`}
                                    />
                                    <InputOTPSlot
                                        index={3}
                                        className={`h-12 w-12 border-white/10 bg-white/5 text-lg text-white ${getError('password') ? 'border-red-500' : ''}`}
                                    />
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
                        className="h-12 w-full transform rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-blue-700 active:scale-[0.98]"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Se connecter'
                        )}
                    </Button>

                    <div className="mt-4 text-center">
                        <Link
                            href={route('register')}
                            className="text-sm text-slate-400 transition-colors hover:text-white"
                        >
                            Créer un compte
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
