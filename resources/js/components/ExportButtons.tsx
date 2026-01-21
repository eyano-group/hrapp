import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Calendar,
    ChevronDown,
    Download,
    FileSpreadsheet,
    History,
} from 'lucide-react';

interface ExportButtonsProps {
    onExport: (period: 'today' | 'week' | 'month' | 'all') => void;
}

export function ExportButtons({ onExport }: ExportButtonsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="relative h-11 items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-6 font-semibold text-white shadow-2xl transition-all hover:bg-slate-800 hover:shadow-slate-900/20 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50" />
                    <Download className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">
                        Exporter les présences
                    </span>
                    <ChevronDown className="relative z-10 h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl border-slate-100 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"
            >
                <div className="mb-2 px-3 py-2">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Choisir la période
                    </p>
                </div>
                <DropdownMenuItem
                    onClick={() => onExport('today')}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Aujourd'hui
                        </p>
                        <p className="text-xs text-slate-500">
                            Rapport du jour
                        </p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onExport('week')}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <History className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Cette semaine
                        </p>
                        <p className="text-xs text-slate-500">
                            Lundi au dimanche
                        </p>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onExport('month')}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Ce mois-ci
                        </p>
                        <p className="text-xs text-slate-500">
                            Rapport mensuel
                        </p>
                    </div>
                </DropdownMenuItem>

                <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                <DropdownMenuItem
                    onClick={() => onExport('all')}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <Download className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Historique complet
                        </p>
                        <p className="text-xs text-slate-500">
                            Toutes les données
                        </p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
