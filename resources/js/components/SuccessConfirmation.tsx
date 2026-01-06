import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, LogIn, LogOut, User } from 'lucide-react';
import React from 'react';

interface SuccessConfirmationProps {
    driverName: string;
    matricule: string;
    date: string;
    time: string;
    type: 'arrival' | 'departure';
    onNewSignature: () => void;
}

const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
    driverName,
    matricule,
    date,
    time,
    type,
    onNewSignature,
}) => {
    const isArrival = type === 'arrival';

    return (
        <div className="space-y-6 px-4 py-8 text-center">
            <div className="flex justify-center">
                <div className="relative">
                    <div
                        className={`animate-pulse-success flex h-24 w-24 items-center justify-center rounded-full ${
                            isArrival ? 'bg-success/10' : 'bg-warning/10'
                        }`}
                    >
                        <CheckCircle2
                            className={`animate-check-bounce h-16 w-16 ${
                                isArrival ? 'text-success' : 'text-warning'
                            }`}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    {isArrival
                        ? 'Arrivée enregistrée !'
                        : 'Départ enregistré !'}
                </h2>
                <p className="font-medium text-muted-foreground">
                    Votre pointage a été transmis avec succès au service RH.
                </p>
            </div>

            <div className="mx-auto max-w-sm space-y-4 rounded-2xl border border-border/40 bg-muted/30 p-6 text-left shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-4 border-b border-border/20 pb-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${isArrival ? 'bg-success/10' : 'bg-warning/10'}`}
                    >
                        {isArrival ? (
                            <LogIn className="h-5 w-5 text-success" />
                        ) : (
                            <LogOut className="h-5 w-5 text-warning" />
                        )}
                    </div>
                    <div>
                        <p className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Opération
                        </p>
                        <p className="font-bold text-foreground">
                            {isArrival ? 'Arrivée' : 'Départ'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Chauffeur
                            </p>
                            <p className="truncate font-bold text-foreground">
                                {driverName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <span className="text-xs font-extrabold text-primary">
                                ID
                            </span>
                        </div>
                        <div>
                            <p className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Matricule
                            </p>
                            <p className="font-bold text-foreground">
                                {matricule}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Date & Heure
                            </p>
                            <p className="font-bold text-foreground">
                                {date} à {time}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                onClick={onNewSignature}
                variant="outline"
                size="lg"
                className="mt-6"
            >
                Nouveau pointage
            </Button>
        </div>
    );
};

export default SuccessConfirmation;
