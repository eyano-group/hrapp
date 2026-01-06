import AttendanceForm from '@/components/AttendanceForm';
import ManagerExport from '@/components/ManagerExport';
import SuccessConfirmation from '@/components/SuccessConfirmation';
import { Truck } from 'lucide-react';
import React, { useState } from 'react';

interface SuccessData {
    firstName: string;
    lastName: string;
    matricule: string;
    date: string;
    time: string;
    type: 'arrival' | 'departure';
}

const Index: React.FC = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);

    const handleSuccess = (data: SuccessData) => {
        setSuccessData(data);
        setShowSuccess(true);
    };

    const handleNewSignature = () => {
        setShowSuccess(false);
        setSuccessData(null);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Background Decorative Elements */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute top-[60%] -right-[10%] h-[35%] w-[35%] animate-pulse rounded-full bg-success/5 blur-3xl" />
            </div>

            {/* Main Content Area - Centered Form */}
            <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center p-4 sm:p-6">
                {/* Header - Integrated into the layout */}
                <div className="mb-8 animate-in text-center duration-700 fade-in slide-in-from-top-4">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                        <Truck className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        Pointage Chauffeurs
                    </h1>
                    <p className="mt-2 font-medium text-muted-foreground">
                        Enregistrement sécurisé de votre activité
                    </p>
                </div>

                <div className="shadow-card-lg w-full overflow-hidden rounded-3xl border border-border/40 bg-card p-1 transition-all duration-500 hover:shadow-2xl sm:p-2">
                    <div className="p-5 sm:p-8">
                        {showSuccess && successData ? (
                            <SuccessConfirmation
                                driverName={`${successData.firstName} ${successData.lastName}`}
                                matricule={successData.matricule}
                                date={successData.date}
                                time={successData.time}
                                type={successData.type}
                                onNewSignature={handleNewSignature}
                            />
                        ) : (
                            <AttendanceForm onSuccess={handleSuccess} />
                        )}
                    </div>
                </div>

                <ManagerExport />

                {/* Footer Info */}
                <footer className="mt-8 animate-in text-center duration-1000 fade-in">
                    <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted-foreground">
                        Vos données sont transmises instantanément au service
                        RH.
                        <br />
                        Système de pointage certifié Eyano Group.
                    </p>
                 </footer>
            </main>
        </div>
    );
};

export default Index;
