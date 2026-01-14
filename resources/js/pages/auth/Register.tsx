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
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-purple-500/30 blur-[100px]" />
            <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-blue-500/30 blur-[100px] delay-1000" />

            <Head title="Inscription" />

            <div className="relative z-10 w-full max-w-md animate-in rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl duration-700 fade-in slide-in-from-bottom-8 zoom-in">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                        Bienvenue
                    </h1>
                    <p className="text-slate-300">
                        Créez votre compte chauffeur
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                            Nom complet
                        </Label>
                        <div className="relative">
                            <User className="absolute top-2.5 left-3 h-5 w-5 text-slate-400" />
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                className="border-white/10 bg-white/5 pl-10 text-white transition-all placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
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
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

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
                                className="border-white/10 bg-white/5 pl-10 text-white transition-all placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
                                autoComplete="tel"
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                required
                                placeholder="0123456789"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-sm text-red-500">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-white">
                            Code PIN (4 chiffres)
                        </Label>
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
                                        className="h-12 w-12 border-white/10 bg-white/5 text-lg text-white"
                                    />
                                    <InputOTPSlot
                                        index={1}
                                        className="h-12 w-12 border-white/10 bg-white/5 text-lg text-white"
                                    />
                                    <InputOTPSlot
                                        index={2}
                                        className="h-12 w-12 border-white/10 bg-white/5 text-lg text-white"
                                    />
                                    <InputOTPSlot
                                        index={3}
                                        className="h-12 w-12 border-white/10 bg-white/5 text-lg text-white"
                                    />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {errors.pin_code && (
                            <p className="text-sm text-red-500">
                                {errors.pin_code}
                            </p>
                        )}
                        {errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password}
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
                            'Créer mon compte'
                        )}
                    </Button>

                    <div className="mt-4 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-slate-400 transition-colors hover:text-white"
                        >
                            Déjà un compte ? Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
