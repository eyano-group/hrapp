import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, Smartphone, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        pin_code: '',
        password: '', // We might need this for fortify, we'll sync it with pin_code or just send pin_code
        password_confirmation: '',
    });

    const [pin, setPin] = useState('');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Sync pin to password for standard Fortify auth compatibility if needed
        // Or we rely on the backend to handle pin_code
        // For now, let's assume we send generic password = pin for Fortify compatibility
        // But the plan was to use pin_code field.
        // Let's send everything.

        post(route('register'), {
            onFinish: () =>
                reset('password', 'password_confirmation', 'pin_code'),
        });
    };

    const handlePinChange = (value: string) => {
        setPin(value);
        setData((data) => ({
            ...data,
            pin_code: value,
            password: value,
            password_confirmation: value,
        }));
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--brand-color)]">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-black/20 blur-[100px]" />
            <div className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-white/10 blur-[100px] delay-1000" />

            <Head title="Inscription" />

            <div className="relative z-10 w-full max-w-md animate-in rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl duration-700 fade-in slide-in-from-bottom-8 zoom-in">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
                        <img
                            src="/images/logo.png"
                            alt=""
                            className="h-12 w-12"
                        />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                        Bienvenue
                    </h1>
                    <p className="text-white/60">Créez votre compte</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white/80">
                            Nom complet
                        </Label>
                        <div className="relative">
                            <User className="absolute top-3 left-4 h-5 w-5 text-white/40" />
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                className="h-12 border-white/10 bg-white/5 pl-12 text-white transition-all placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 focus:ring-0"
                                autoComplete="name"
                                autoFocus
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                placeholder="Jean Dupont"
                            />
                        </div>
                        {errors.name && (
                            <p className="animate-in text-sm font-medium text-red-400 slide-in-from-top-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

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
                                className="h-12 border-white/10 bg-white/5 pl-12 text-white transition-all placeholder:text-white/20 focus:border-white/20 focus:bg-white/10 focus:ring-0"
                                autoComplete="tel"
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                required
                                placeholder="0123456789"
                            />
                        </div>
                        {errors.phone && (
                            <p className="animate-in text-sm font-medium text-red-400 slide-in-from-top-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-white/80">
                            Code PIN (4 chiffres)
                        </Label>
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
                                            className="h-14 w-14 border-white/10 bg-white/5 text-xl font-bold text-white transition-all focus:border-white/30 focus:bg-white/10"
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {errors.pin_code && (
                            <p className="animate-in text-center text-sm font-medium text-red-400 slide-in-from-top-1">
                                {errors.pin_code}
                            </p>
                        )}
                        {errors.password && (
                            <p className="animate-in text-center text-sm font-medium text-red-400 slide-in-from-top-1">
                                {errors.password}
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
                            'Créer mon compte'
                        )}
                    </Button>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm font-medium text-white/40 transition-colors hover:text-white"
                        >
                            Déjà un compte ?{' '}
                            <span className="text-white underline underline-offset-4">
                                Se connecter
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
