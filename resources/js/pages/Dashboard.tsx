import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    LogOut,
    MoreVertical,
    Plus,
    Smartphone,
    Trash2,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Driver {
    id: number;
    name: string;
    matricule: string;
    phone: string;
    isPresent: boolean;
    lastActionTime: string | null;
}

interface Stats {
    totalDrivers: number;
}

export default function Dashboard({
    drivers,
    stats,
    auth,
}: {
    drivers: Driver[];
    stats: Stats;
    auth: any;
}) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    // Form for Adding Driver
    const {
        data: newData,
        setData: setNewData,
        post: postNew,
        processing: processingNew,
        reset: resetNew,
        errors: errorsNew,
    } = useForm({
        name: '',
        matricule: '',
        phone: '',
    });

    // Form for Editing Driver
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: processingEdit,
        reset: resetEdit,
        errors: errorsEdit,
    } = useForm({
        name: '',
        matricule: '',
        phone: '',
    });

    const handleAddDriver = (e: React.FormEvent) => {
        e.preventDefault();
        postNew(route('drivers.store'), {
            onSuccess: () => {
                toast.success('Chauffeur ajouté !');
                setIsAddModalOpen(false);
                resetNew();
            },
            onError: () => toast.error("Erreur lors de l'ajout"),
        });
    };

    const handleEditDriver = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDriver) return;
        putEdit(route('drivers.update', editingDriver.id), {
            onSuccess: () => {
                toast.success('Chauffeur modifié !');
                setEditingDriver(null);
                resetEdit();
            },
            onError: () => toast.error('Erreur lors de la modification'),
        });
    };

    const handleDeleteDriver = (driver: Driver) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?'))
            return;
        router.delete(route('drivers.destroy', driver.id), {
            onSuccess: () => toast.success('Chauffeur supprimé !'),
            onError: () => toast.error('Erreur lors de la suppression'),
        });
    };

    const openEditModal = (driver: Driver) => {
        setEditingDriver(driver);
        setEditData({
            name: driver.name,
            matricule: driver.matricule,
            phone: driver.phone,
        });
    };

    const handleAttendance = (
        driver: Driver,
        type: 'arrival' | 'departure',
    ) => {
        const actionLabel =
            type === 'arrival'
                ? "marquer l'arrivée de"
                : 'marquer le départ de';
        if (!confirm(`Voulez-vous ${actionLabel} ${driver.name} ?`)) return;

        router.post(
            route('attendance.mark-present'),
            { driver_id: driver.id, type: type },
            {
                onSuccess: () => {
                    toast.success(
                        type === 'arrival'
                            ? 'Arrivée enregistrée'
                            : 'Départ enregistré',
                    );
                },
                onError: () => {
                    toast.error('Erreur lors du pointage.');
                },
            },
        );
    };

    const handleCardClick = (driver: Driver) => {
        router.visit(route('drivers.show', driver.id));
    };

    useFlashToast(); // Handle flash messages

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 dark:bg-slate-900 dark:selection:bg-purple-900">
            <Head title="Tableau de bord" />

            {/* Header with Glassmorphism */}
            <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-lg font-bold text-white shadow-lg">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl leading-tight font-bold text-slate-800 dark:text-white">
                                Bonjour, {auth.user.name}
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Manager
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user.is_admin && (
                            <Button
                                onClick={() =>
                                    window.open(
                                        route('attendance.export'),
                                        '_blank',
                                    )
                                }
                                className="hidden items-center gap-2 rounded-full bg-slate-900 px-6 font-medium text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl hover:ring-2 hover:ring-slate-900/10 active:scale-95 md:flex dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                                Exporter Rapport
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            onClick={() => router.post(route('logout'))}
                            className="text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900/20"
                        >
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto animate-in space-y-8 p-6 pb-32 duration-700 fade-in slide-in-from-bottom-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <Card className="transform border-none bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="mb-1 font-medium text-purple-100">
                                    Total Chauffeurs
                                </p>
                                <h2 className="text-4xl font-bold">
                                    {stats.totalDrivers}
                                </h2>
                            </div>
                            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* Simplified Stats - Removed other cards as requested */}
                </div>

                {/* Drivers Grid */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white">
                            <User className="h-6 w-6 text-purple-600" />
                            Mes Chauffeurs
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {drivers.map((driver) => (
                            <Card
                                key={driver.id}
                                className="group cursor-pointer overflow-hidden rounded-2xl border-slate-100 bg-white shadow-md ring-purple-500/0 ring-offset-2 transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-purple-500/50 dark:border-slate-800 dark:bg-slate-800"
                                onClick={() => handleCardClick(driver)}
                            >
                                <CardHeader className="relative h-24 bg-gradient-to-r from-slate-100 to-slate-200 p-0 dark:from-slate-800 dark:to-slate-900">
                                    <div className="absolute -bottom-8 left-6 flex h-16 w-16 transform items-center justify-center rounded-2xl bg-white text-3xl shadow-md transition-transform duration-300 group-hover:scale-110 dark:bg-slate-700">
                                        <span className="text-2xl">🚗</span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        {driver.isPresent ? (
                                            <Badge className="border-0 bg-emerald-500 px-3 py-1 text-xs text-white shadow-lg hover:bg-emerald-600">
                                                Présent depuis{' '}
                                                {driver.lastActionTime}
                                            </Badge>
                                        ) : driver.lastActionTime ? (
                                            <Badge
                                                variant="outline"
                                                className="border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-600 shadow-sm"
                                            >
                                                Parti à {driver.lastActionTime}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 shadow-sm"
                                            >
                                                Absent
                                            </Badge>
                                        )}
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {!auth.user.is_admin && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-white/50 text-slate-400 backdrop-blur-sm hover:text-slate-600"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEditModal(
                                                                    driver,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />{' '}
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                                            onClick={() =>
                                                                handleDeleteDriver(
                                                                    driver,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 pt-10 pb-6">
                                    <div className="mb-4">
                                        <h3 className="mb-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white">
                                            {driver.name}
                                        </h3>
                                        <p className="w-fit rounded bg-slate-100 px-2 py-0.5 font-mono text-sm text-xs text-slate-500 dark:bg-slate-900">
                                            {driver.matricule}
                                        </p>
                                    </div>
                                    <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                                        <Smartphone className="h-4 w-4" />
                                        {driver.phone || 'N/A'}
                                    </div>

                                    {!driver.isPresent ? (
                                        <Button
                                            className="w-full rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-95"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAttendance(
                                                    driver,
                                                    'arrival',
                                                );
                                            }}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Marquer Arrivée
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full rounded-xl bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-orange-500/20 active:scale-95"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAttendance(
                                                    driver,
                                                    'departure',
                                                );
                                            }}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Marquer Départ
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="group fixed right-8 bottom-8 z-50 flex h-16 w-16 transform items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_8px_30px_rgb(147,51,234,0.4)] transition-all duration-300 hover:scale-110 hover:bg-purple-700 active:scale-90"
            >
                <Plus className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" />
            </button>

            {/* Add Driver Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="rounded-2xl border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle>Ajouter un chauffeur</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddDriver} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                value={newData.name}
                                onChange={(e) =>
                                    setNewData('name', e.target.value)
                                }
                                required
                                placeholder="Jean Dupont"
                                className="border-slate-200 bg-slate-50"
                            />
                            {errorsNew.name && (
                                <p className="text-sm text-red-500">
                                    {errorsNew.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="matricule">Matricule</Label>
                            <Input
                                id="matricule"
                                value={newData.matricule}
                                onChange={(e) =>
                                    setNewData('matricule', e.target.value)
                                }
                                required
                                placeholder="CH-001"
                                className="border-slate-200 bg-slate-50"
                            />
                            {errorsNew.matricule && (
                                <p className="text-sm text-red-500">
                                    {errorsNew.matricule}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                value={newData.phone}
                                onChange={(e) =>
                                    setNewData('phone', e.target.value)
                                }
                                placeholder="0123456789"
                                className="border-slate-200 bg-slate-50"
                            />
                            {errorsNew.phone && (
                                <p className="text-sm text-red-500">
                                    {errorsNew.phone}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={processingNew}
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                {processingNew ? 'Ajout...' : 'Ajouter'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Driver Modal */}
            <Dialog
                open={!!editingDriver}
                onOpenChange={(open) => !open && setEditingDriver(null)}
            >
                <DialogContent className="rounded-2xl border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle>Modifier le chauffeur</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleEditDriver}
                        className="space-y-4 pt-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nom complet</Label>
                            <Input
                                id="edit-name"
                                value={editData.name}
                                onChange={(e) =>
                                    setEditData('name', e.target.value)
                                }
                                required
                                className="border-slate-200 bg-slate-50"
                            />
                            {errorsEdit.name && (
                                <p className="text-sm text-red-500">
                                    {errorsEdit.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-matricule">Matricule</Label>
                            <Input
                                id="edit-matricule"
                                value={editData.matricule}
                                onChange={(e) =>
                                    setEditData('matricule', e.target.value)
                                }
                                required
                                className="border-slate-200 bg-slate-50"
                            />
                            {errorsEdit.matricule && (
                                <p className="text-sm text-red-500">
                                    {errorsEdit.matricule}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Téléphone</Label>
                            <Input
                                id="edit-phone"
                                value={editData.phone}
                                onChange={(e) =>
                                    setEditData('phone', e.target.value)
                                }
                                className="border-slate-200 bg-slate-50"
                            />
                            {errorsEdit.phone && (
                                <p className="text-sm text-red-500">
                                    {errorsEdit.phone}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingDriver(null)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={processingEdit}
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                {processingEdit
                                    ? 'Enregistrement...'
                                    : 'Enregistrer'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
