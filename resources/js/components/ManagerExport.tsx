import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Download, FileSpreadsheet, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

const ManagerExport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [managerName, setManagerName] = useState('');
    const [managerMatricule, setManagerMatricule] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDownload = async () => {
        setErrorMessage(null);
        if (!managerName || !managerMatricule) {
            toast.error('Veuillez renseigner vos informations de manager.');
            return;
        }

        try {
            const url = `/attendance/export?manager_name=${encodeURIComponent(managerName)}&manager_matricule=${encodeURIComponent(managerMatricule)}`;
            toast.info('Vérification des accès...');

            // Just a check
            await axios.get(url);

            // If success, trigger real download
            window.location.href = url;
            toast.success('Rapport prêt ! Le téléchargement va commencer.');
            setIsOpen(false);
        } catch (error: any) {
            const message =
                error.response?.data?.message ||
                'Accès refusé. Vérifiez vos identifiants.';
            setErrorMessage(message);
            toast.error(message);
        }
    };

    return (
        <div className="mt-12 border-t border-border/40 pt-8">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group mx-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                    <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                    Espace Manager - Télécharger le rapport
                </button>
            ) : (
                <div className="animate-in rounded-2xl border border-border/40 bg-muted/30 p-6 duration-300 zoom-in-95 fade-in">
                    {errorMessage && (
                        <div className="mb-4 animate-in rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                    !
                                </span>
                                {errorMessage}
                            </div>
                        </div>
                    )}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-foreground">
                                Export du rapport (.csv)
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setErrorMessage(null);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="mgrName"
                                className="text-[10px] font-bold text-muted-foreground uppercase"
                            >
                                Nom complet
                            </Label>
                            <Input
                                id="mgrName"
                                placeholder="Manager..."
                                value={managerName}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    setManagerName(e.target.value);
                                    setErrorMessage(null);
                                }}
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="mgrMatricule"
                                className="text-[10px] font-bold text-muted-foreground uppercase"
                            >
                                Matricule Manager
                            </Label>
                            <Input
                                id="mgrMatricule"
                                placeholder="ID Manager..."
                                value={managerMatricule}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    setManagerMatricule(e.target.value);
                                    setErrorMessage(null);
                                }}
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleDownload}
                        className="w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger le rapport du jour
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ManagerExport;
