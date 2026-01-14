import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface HistoryItem {
    id: number;
    type: 'arrival' | 'departure';
    date: string;
    time: string;
    isToday: boolean;
    daysAgo: number;
}

interface Driver {
    id: number;
    name: string;
    matricule: string;
    phone: string;
}

export default function Show({
    driver,
    history,
    auth,
}: {
    driver: Driver;
    history: HistoryItem[];
    auth: any; // User prop
}) {
    const [editingAttendance, setEditingAttendance] =
        useState<HistoryItem | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        driver_id: driver.id,
        date: '',
        time: '',
        type: 'arrival' as 'arrival' | 'departure',
    });

    const openAddModal = () => {
        setEditingAttendance(null);
        setData({
            driver_id: driver.id,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].slice(0, 5),
            type: 'arrival',
        });
        setIsManualModalOpen(true);
    };

    const openEditModal = (record: HistoryItem) => {
        setEditingAttendance(record);
        setData({
            driver_id: driver.id,
            date: record.date,
            time: record.time,
            type: record.type,
        });
        setIsManualModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAttendance) {
            put(route('attendance.update', editingAttendance.id), {
                onSuccess: () => {
                    toast.success('Pointage modifié avec succès');
                    setIsManualModalOpen(false);
                    // reset(); // Keep data or reset?
                },
                onError: () => toast.error('Erreur lors de la modification'),
            });
        } else {
            post(route('attendance.storeManual'), {
                onSuccess: () => {
                    toast.success('Pointage ajouté avec succès');
                    setIsManualModalOpen(false);
                    reset('date', 'time');
                },
                onError: () => toast.error("Erreur lors de l'ajout"),
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 dark:bg-slate-900 dark:selection:bg-purple-900">
            <Head title={`Historique - ${driver.name}`} />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('dashboard')}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl leading-tight font-bold text-slate-800 dark:text-white">
                                {driver.name}
                            </h1>
                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                {driver.matricule}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={openAddModal}
                            className="hidden items-center gap-2 bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 md:flex"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter présence
                        </Button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-lg font-bold text-white shadow-lg">
                            {driver.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto animate-in space-y-8 p-6 pb-32 duration-700 fade-in slide-in-from-bottom-4">
                <Card className="border-none bg-white/50 shadow-lg backdrop-blur-sm dark:bg-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            Historique des présences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {history.length > 0 ? (
                                history.map((record) => (
                                    <div
                                        key={record.id}
                                        className="group relative flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                    record.type === 'arrival'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-orange-100 text-orange-600'
                                                }`}
                                            >
                                                {record.type === 'arrival' ? (
                                                    <CheckCircle className="h-6 w-6" />
                                                ) : (
                                                    <Clock className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-slate-800 capitalize dark:text-white">
                                                    {record.type === 'arrival'
                                                        ? 'Arrivée'
                                                        : 'Départ'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {record.isToday
                                                        ? "Aujourd'hui"
                                                        : `Il y a ${record.daysAgo} jours`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-mono text-xl font-bold text-slate-800 dark:text-white">
                                                    {record.time}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {record.date}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditModal(record)
                                                }
                                                className="opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <Edit className="h-4 w-4 text-slate-400 hover:text-purple-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    <Calendar className="mx-auto mb-4 h-16 w-16 opacity-20" />
                                    <p>Aucune présence enregistrée.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Mobile FAB for adding manual attendance */}
            <button
                onClick={openAddModal}
                className="group fixed right-8 bottom-8 z-50 flex h-16 w-16 transform items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_8px_30px_rgb(147,51,234,0.4)] transition-all duration-300 hover:scale-110 hover:bg-purple-700 active:scale-90 md:hidden"
            >
                <Plus className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" />
            </button>

            <Dialog
                open={isManualModalOpen}
                onOpenChange={setIsManualModalOpen}
            >
                <DialogContent className="max-w-md rounded-3xl border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">
                            {editingAttendance
                                ? 'Modifier le pointage'
                                : 'Nouveau pointage'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        {/* Type Selection - Big Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setData('type', 'arrival')}
                                className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all ${
                                    data.type === 'arrival'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-700 dark:bg-slate-800'
                                }`}
                            >
                                <div
                                    className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                                        data.type === 'arrival'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                                    }`}
                                >
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <span className="font-bold">Arrivée</span>
                            </div>

                            <div
                                onClick={() => setData('type', 'departure')}
                                className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all ${
                                    data.type === 'departure'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                        : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-700 dark:bg-slate-800'
                                }`}
                            >
                                <div
                                    className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                                        data.type === 'departure'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                                    }`}
                                >
                                    <Clock className="h-6 w-6" />
                                </div>
                                <span className="font-bold">Départ</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    required
                                    className="border-slate-200 bg-slate-50 text-center font-mono"
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-500">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Heure</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={data.time}
                                    onChange={(e) =>
                                        setData('time', e.target.value)
                                    }
                                    required
                                    className="border-slate-200 bg-slate-50 text-center font-mono"
                                />
                                {errors.time && (
                                    <p className="text-sm text-red-500">
                                        {errors.time}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsManualModalOpen(false)}
                                className="w-full rounded-xl"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className={`w-full rounded-xl text-white ${
                                    data.type === 'arrival'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-orange-500 hover:bg-orange-600'
                                }`}
                            >
                                {processing
                                    ? 'Enregistrement...'
                                    : editingAttendance
                                      ? 'Modifier'
                                      : 'Enregistrer'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
