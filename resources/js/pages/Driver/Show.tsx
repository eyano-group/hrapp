import { Badge } from '@/components/ui/badge';
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
import { useFlashToast } from '@/hooks/use-flash-toast';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isToday,
    startOfMonth,
    subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
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
    auth: any;
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [editingAttendance, setEditingAttendance] =
        useState<HistoryItem | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [detailsDate, setDetailsDate] = useState<Date | null>(new Date());

    useFlashToast();

    const { data, setData, post, put, processing, reset, errors } = useForm({
        driver_id: driver.id,
        date: '',
        time: '',
        type: 'arrival' as 'arrival' | 'departure',
    });

    const openAddModal = (date?: Date) => {
        setEditingAttendance(null);
        setData({
            driver_id: driver.id,
            date: date
                ? format(date, 'yyyy-MM-dd')
                : new Date().toISOString().split('T')[0],
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

    // Calendar Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
    });

    const getAttendanceForDay = (date: Date) => {
        return history.filter((h) => isSameDay(new Date(h.date), date));
    };

    const getDayStatus = (date: Date) => {
        const atts = getAttendanceForDay(date);
        if (atts.length === 0) return 'absent';

        const hasArrival = atts.some((a) => a.type === 'arrival');
        const hasDeparture = atts.some((a) => a.type === 'departure');

        if (hasArrival && hasDeparture) return 'complete'; // Green
        if (hasArrival) return 'partial'; // Orange
        return 'error'; // Red
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Stats
    const totalPresentDays = daysInMonth.filter((d) => {
        const status = getDayStatus(d);
        return status === 'complete' || status === 'partial';
    }).length;

    const rate = Math.round((totalPresentDays / daysInMonth.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 dark:bg-slate-900 dark:selection:bg-purple-900">
            <Head title={`Historique - ${driver.name}`} />

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('dashboard')}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                            onClick={() => openAddModal()}
                            className="hidden items-center gap-2 rounded-full bg-purple-600 px-6 text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-700 md:flex"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter présence
                        </Button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-lg font-bold text-white shadow-lg ring-2 ring-white dark:ring-slate-800">
                            {driver.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto animate-in space-y-8 p-6 pb-32 duration-700 fade-in slide-in-from-bottom-4">
                {/* Monthly Stats Summary */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Calendar className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">
                                Taux de présence -{' '}
                                {format(currentMonth, 'MMMM', { locale: fr })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-1 text-4xl font-black">
                                {rate}%
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: `${rate}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-center border-none bg-white shadow-md dark:bg-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Jours de travail
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white">
                                {totalPresentDays}
                            </div>
                            <p className="text-xs text-slate-500">
                                sur {daysInMonth.length} jours civils
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-center border-none bg-white shadow-md dark:bg-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Statut du mois
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge
                                className={
                                    rate > 80
                                        ? 'bg-emerald-500'
                                        : 'bg-orange-500'
                                }
                            >
                                {rate > 80 ? 'Excellent' : 'Régulier'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Calendar Grid */}
                    <div className="space-y-6 lg:col-span-8">
                        <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-xl dark:bg-slate-800">
                            <div className="flex items-center justify-between border-b bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
                                <h2 className="flex items-center gap-3 text-xl font-black text-slate-800 capitalize dark:text-white">
                                    <div className="rounded-xl bg-purple-100 p-2 dark:bg-purple-900/30">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                    {format(currentMonth, 'MMMM yyyy', {
                                        locale: fr,
                                    })}
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={prevMonth}
                                        className="rounded-xl"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={nextMonth}
                                        className="rounded-xl"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-7 gap-3">
                                    {[
                                        'Lun',
                                        'Mar',
                                        'Mer',
                                        'Jeu',
                                        'Ven',
                                        'Sam',
                                        'Dim',
                                    ].map((day) => (
                                        <div
                                            key={day}
                                            className="pb-4 text-center text-xs font-black tracking-wider text-slate-400 uppercase"
                                        >
                                            {day}
                                        </div>
                                    ))}

                                    {/* Empty cells for padding if the month doesn't start on Monday */}
                                    {Array.from({
                                        length:
                                            (startOfMonth(
                                                currentMonth,
                                            ).getDay() +
                                                6) %
                                            7,
                                    }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="aspect-square"
                                        />
                                    ))}

                                    {daysInMonth.map((day) => {
                                        const status = getDayStatus(day);
                                        const isSelected =
                                            detailsDate &&
                                            isSameDay(detailsDate, day);

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                onClick={() =>
                                                    setDetailsDate(day)
                                                }
                                                className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
                                                    isSelected
                                                        ? 'scale-95 shadow-inner ring-4 ring-purple-500/20'
                                                        : 'hover:z-10 hover:scale-105 hover:shadow-lg'
                                                } ${
                                                    status === 'complete'
                                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                        : status === 'partial'
                                                          ? 'bg-orange-500 text-white shadow-orange-500/20'
                                                          : status === 'error'
                                                            ? 'bg-red-500 text-white shadow-red-500/20'
                                                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                                }`}
                                            >
                                                <span
                                                    className={`text-lg font-black ${
                                                        isToday(day) &&
                                                        status === 'absent'
                                                            ? 'flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white'
                                                            : ''
                                                    }`}
                                                >
                                                    {format(day, 'd')}
                                                </span>
                                                {isToday(day) &&
                                                    status !== 'absent' && (
                                                        <div className="absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full bg-white" />
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="mt-8 flex flex-wrap justify-center gap-6 border-t pt-6 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Complet (Arrivée + Départ)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Partiel (Arrivée seule)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Inactif
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Day Sidebar Details */}
                    <div className="space-y-6 lg:col-span-4">
                        {detailsDate ? (
                            <div className="sticky top-28 animate-in duration-500 slide-in-from-right-8">
                                <Card className="overflow-hidden rounded-3xl border-none bg-white shadow-xl dark:bg-slate-800">
                                    <CardHeader className="border-b bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-black capitalize">
                                                    {format(
                                                        detailsDate,
                                                        'EEEE d MMMM',
                                                        { locale: fr },
                                                    )}
                                                </CardTitle>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Détails de l'activité
                                                </p>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                                onClick={() =>
                                                    openAddModal(detailsDate)
                                                }
                                            >
                                                <Plus className="h-5 w-5 text-purple-600" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {getAttendanceForDay(detailsDate)
                                                .length > 0 ? (
                                                getAttendanceForDay(
                                                    detailsDate,
                                                ).map((record) => (
                                                    <div
                                                        key={record.id}
                                                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${
                                                                    record.type ===
                                                                    'arrival'
                                                                        ? 'bg-emerald-100 text-emerald-600'
                                                                        : 'bg-orange-100 text-orange-600'
                                                                }`}
                                                            >
                                                                {record.type ===
                                                                'arrival' ? (
                                                                    <CheckCircle className="h-6 w-6" />
                                                                ) : (
                                                                    <Clock className="h-6 w-6" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800 capitalize dark:text-white">
                                                                    {record.type ===
                                                                    'arrival'
                                                                        ? 'Arrivée'
                                                                        : 'Départ'}
                                                                </p>
                                                                <p className="font-mono text-lg font-black text-purple-600">
                                                                    {
                                                                        record.time
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-full"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    record,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4 text-slate-400 group-hover:text-purple-600" />
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                                        <Calendar className="h-8 w-8 text-slate-300" />
                                                    </div>
                                                    <p className="font-medium text-slate-400">
                                                        Aucun pointage ce jour.
                                                    </p>
                                                    <Button
                                                        variant="link"
                                                        className="mt-2 text-purple-600"
                                                        onClick={() =>
                                                            openAddModal(
                                                                detailsDate,
                                                            )
                                                        }
                                                    >
                                                        Ajouter maintenant
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card className="rounded-3xl border-2 border-dashed border-none border-slate-200 bg-white p-8 text-center font-medium text-slate-400 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
                                <p>
                                    Sélectionnez un jour pour voir les détails.
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile FAB */}
            <button
                onClick={() => openAddModal(detailsDate || new Date())}
                className="group fixed right-8 bottom-8 z-50 flex h-16 w-16 transform items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_8px_30px_rgb(147,51,234,0.4)] transition-all duration-300 hover:scale-110 hover:bg-purple-700 active:scale-90 md:hidden"
            >
                <Plus className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" />
            </button>

            {/* Manual/Edit Modal */}
            <Dialog
                open={isManualModalOpen}
                onOpenChange={setIsManualModalOpen}
            >
                <DialogContent className="max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-2xl dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-black text-slate-800 dark:text-white">
                            {editingAttendance
                                ? 'Modifier Pointage'
                                : 'Nouveau Pointage'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-8 pt-6">
                        {/* Type Selection - Premium Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setData('type', 'arrival')}
                                className={`group cursor-pointer rounded-3xl border-4 p-6 text-center transition-all duration-300 ${
                                    data.type === 'arrival'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10'
                                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                                }`}
                            >
                                <div
                                    className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                                        data.type === 'arrival'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-white text-slate-400 shadow-sm'
                                    }`}
                                >
                                    <CheckCircle className="h-7 w-7" />
                                </div>
                                <span className="text-sm font-black tracking-wider uppercase">
                                    Arrivée
                                </span>
                            </div>

                            <div
                                onClick={() => setData('type', 'departure')}
                                className={`group cursor-pointer rounded-3xl border-4 p-6 text-center transition-all duration-300 ${
                                    data.type === 'departure'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg shadow-orange-500/10'
                                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                                }`}
                            >
                                <div
                                    className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                                        data.type === 'departure'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-white text-slate-400 shadow-sm'
                                    }`}
                                >
                                    <Clock className="h-7 w-7" />
                                </div>
                                <span className="text-sm font-black tracking-wider uppercase">
                                    Départ
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="px-1 text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Date
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    required
                                    className="h-14 rounded-2xl border-none bg-slate-100 text-center font-mono text-lg font-bold focus-visible:ring-purple-500"
                                />
                                {errors.date && (
                                    <p className="mt-1 text-xs text-red-500 italic">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="px-1 text-xs font-black tracking-widest text-slate-400 uppercase">
                                    Heure
                                </Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={data.time}
                                    onChange={(e) =>
                                        setData('time', e.target.value)
                                    }
                                    required
                                    className="h-14 rounded-2xl border-none bg-slate-100 text-center font-mono text-lg font-bold focus-visible:ring-purple-500"
                                />
                                {errors.time && (
                                    <p className="mt-1 text-xs text-red-500 italic">
                                        {errors.time}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={processing}
                                className={`h-16 w-full rounded-2xl text-lg font-black text-white shadow-xl transition-all active:scale-95 ${
                                    data.type === 'arrival'
                                        ? 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600'
                                        : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'
                                }`}
                            >
                                {processing
                                    ? 'Transaction...'
                                    : editingAttendance
                                      ? 'Confirmer Modification'
                                      : 'Enregistrer le Pointage'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsManualModalOpen(false)}
                                className="h-12 w-full rounded-2xl font-bold text-slate-400 hover:text-red-500"
                            >
                                Abandonner
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
