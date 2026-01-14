import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import {
    Calendar,
    CheckSquare,
    Clock,
    Hash,
    Loader2,
    LogIn,
    LogOut,
    Pen,
    User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SignatureCanvas from './SignatureCanvas';

interface AttendanceFormProps {
    onSuccess: (data: {
        firstName: string;
        lastName: string;
        matricule: string;
        date: string;
        time: string;
        type: 'arrival' | 'departure';
    }) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSuccess }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [matricule, setMatricule] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [signatureMode, setSignatureMode] = useState<
        'signature' | 'checkbox'
    >('checkbox');
    const [hasSignature, setHasSignature] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [checkboxConfirmed, setCheckboxConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pointageType, setPointageType] = useState<'arrival' | 'departure'>(
        'arrival',
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Update date and time
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDate(
                now.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
            );
            setCurrentTime(
                now.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            );
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSignatureChange = (hasSig: boolean, dataUrl: string | null) => {
        setHasSignature(hasSig);
        setSignatureData(dataUrl);
    };

    const isFormValid = () => {
        const hasRequiredFields =
            firstName.trim() && lastName.trim() && matricule.trim();
        const hasValidation =
            signatureMode === 'signature' ? hasSignature : checkboxConfirmed;
        const valid = hasRequiredFields && hasValidation;
        console.log('Form check:', {
            hasRequiredFields,
            hasValidation,
            signatureMode,
            hasSignature,
            checkboxConfirmed,
            valid,
        });
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            toast.error(
                'Veuillez remplir tous les champs et valider votre pointage.',
            );
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        axios
            .post('/attendance', {
                first_name: firstName,
                last_name: lastName,
                matricule: matricule,
                type: pointageType,
                signature_data:
                    signatureMode === 'signature'
                        ? signatureData
                        : 'checkbox_confirmed',
            })
            .then((response: any) => {
                setIsSubmitting(false);
                const successMessage =
                    pointageType === 'arrival'
                        ? 'Arrivée enregistrée !'
                        : 'Départ enregistré !';
                toast.success(successMessage);

                onSuccess({
                    firstName,
                    lastName,
                    matricule,
                    date: currentDate,
                    time: currentTime,
                    type: pointageType,
                });
            })
            .catch((error: any) => {
                setIsSubmitting(false);
                const message =
                    error.response?.data?.message ||
                    "Une erreur est survenue lors de l'enregistrement.";
                setErrorMessage(message);
                toast.error(message);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
                <div className="animate-in rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                            !
                        </span>
                        {errorMessage}
                    </div>
                </div>
            )}
            {/* Pointage Type Selection */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    type="button"
                    variant={pointageType === 'arrival' ? 'default' : 'outline'}
                    className={`h-20 rounded-2xl border-2 text-lg font-bold transition-all ${
                        pointageType === 'arrival'
                            ? 'border-success bg-success text-success-foreground shadow-lg shadow-success/20 hover:bg-success/90'
                            : 'border-border/40 hover:border-success/50 hover:bg-success/5'
                    }`}
                    onClick={() => {
                        setPointageType('arrival');
                        setErrorMessage(null);
                    }}
                >
                    <div className="flex flex-col items-center gap-1">
                        <LogIn className="h-6 w-6" />
                        <span>Arrivée</span>
                    </div>
                </Button>
                <Button
                    type="button"
                    variant={
                        pointageType === 'departure' ? 'default' : 'outline'
                    }
                    className={`h-20 rounded-2xl border-2 text-lg font-bold transition-all ${
                        pointageType === 'departure'
                            ? 'border-warning bg-warning text-warning-foreground shadow-lg shadow-warning/20 hover:bg-warning/90'
                            : 'border-border/40 hover:border-warning/50 hover:bg-warning/5'
                    }`}
                    onClick={() => {
                        setPointageType('departure');
                        setErrorMessage(null);
                    }}
                >
                    <div className="flex flex-col items-center gap-1">
                        <LogOut className="h-6 w-6" />
                        <span>Départ</span>
                    </div>
                </Button>
            </div>

            {/* Date and Time Display */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-muted/30 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Date
                        </p>
                        <p className="truncate text-sm font-bold text-foreground capitalize">
                            {currentDate}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 border-l border-border/40 pl-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Heure
                        </p>
                        <p className="text-xl font-bold tracking-tight text-foreground">
                            {currentTime}
                        </p>
                    </div>
                </div>
            </div>

            {/* Name Fields */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label
                        htmlFor="lastName"
                        className="flex items-center gap-2 text-foreground"
                    >
                        <User className="h-4 w-4" />
                        Nom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom de famille"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 text-base dark:bg-slate-800"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="firstName"
                        className="flex items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        Prénom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 text-base dark:bg-slate-800"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="matricule"
                        className="flex items-center gap-2"
                    >
                        <Hash className="h-4 w-4" />
                        Matricule <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="matricule"
                        type="text"
                        placeholder="Votre matricule chauffeur"
                        value={matricule}
                        onChange={(e) => setMatricule(e.target.value)}
                        className="h-12 text-base dark:bg-slate-800"
                        required
                    />
                </div>
            </div>

            {/* Validation Mode */}
            <div className="space-y-3">
                <Label className="font-medium text-foreground">
                    Mode de validation
                </Label>
                <Tabs
                    value={signatureMode}
                    onValueChange={(v: string) =>
                        setSignatureMode(v as 'signature' | 'checkbox')
                    }
                >
                    <TabsList className="grid h-14 w-full grid-cols-2 rounded-2xl bg-muted/50 p-1.5">
                        <TabsTrigger
                            value="checkbox"
                            className="flex items-center justify-center gap-2 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <CheckSquare className="h-4 w-4" />
                            Simple
                        </TabsTrigger>
                        <TabsTrigger
                            value="signature"
                            className="flex items-center justify-center gap-2 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Pen className="h-4 w-4" />
                            Signature
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="checkbox" className="mt-4">
                        <div className="flex items-start gap-3 rounded-xl bg-secondary/30 p-4">
                            <Checkbox
                                id="confirm"
                                checked={checkboxConfirmed}
                                onCheckedChange={(checked) =>
                                    setCheckboxConfirmed(checked === true)
                                }
                                className="mt-0.5 h-6 w-6"
                            />
                            <Label
                                htmlFor="confirm"
                                className="cursor-pointer leading-relaxed text-foreground"
                            >
                                {pointageType === 'arrival'
                                    ? 'Je confirme mon arrivée et suis prêt(e) à commencer mon service.'
                                    : 'Je confirme mon départ et la fin de mon service.'}
                            </Label>
                        </div>
                    </TabsContent>

                    <TabsContent value="signature" className="mt-4">
                        <SignatureCanvas
                            onSignatureChange={handleSignatureChange}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                size="lg"
                className={`h-16 w-full rounded-2xl text-lg font-extrabold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    pointageType === 'arrival'
                        ? 'bg-success text-success-foreground shadow-success/20 hover:bg-success/90'
                        : 'bg-warning text-warning-foreground shadow-warning/20 hover:bg-warning/90'
                }`}
                disabled={!isFormValid() || isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Enregistrement...
                    </>
                ) : pointageType === 'arrival' ? (
                    <>
                        <LogIn className="mr-2 h-6 w-6" />
                        Pointer mon arrivée
                    </>
                ) : (
                    <>
                        <LogOut className="mr-2 h-6 w-6" />
                        Pointer mon départ
                    </>
                )}
            </Button>
        </form>
    );
};

export default AttendanceForm;
