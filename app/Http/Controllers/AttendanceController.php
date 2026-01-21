<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'matricule' => 'required|string|max:255',
            'type' => 'required|in:arrival,departure',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'signature_data' => 'nullable|string',
        ]);

        // Check for duplicate today
        $today = Carbon::today();
        $duplicate = Attendance::where('matricule', $validated['matricule'])
            ->whereDate('created_at', $today)
            ->where('type', $validated['type'])
            ->exists();

        if ($duplicate) {
            $typeLabel = $validated['type'] === 'arrival' ? 're-arrivée' : 're-départ';
            return response()->json([
                'message' => "Vous avez déjà pointé votre " . ($validated['type'] === 'arrival' ? 'arrivée' : 'départ') . " aujourd'hui."
            ], 422);
        }

        // Logic check: departure without arrival today
        if ($validated['type'] === 'departure') {
            $hasArrival = Attendance::where('matricule', $validated['matricule'])
                ->whereDate('created_at', $today)
                ->where('type', 'arrival')
                ->exists();

            if (!$hasArrival) {
                return response()->json([
                    'message' => "Vous devez d'abord pointer votre arrivée avant de pointer votre départ."
                ], 422);
            }
        }

        $attendance = Attendance::create($validated);

        return response()->json([
            'message' => 'Pointage enregistré avec succès.',
            'data' => $attendance
        ], 201);
    }

    public function markPresent(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'type' => 'required|in:arrival,departure',
        ]);

        $driver = \App\Models\Driver::findOrFail($validated['driver_id']);
        
        // Authorization check
        if ($driver->user_id !== auth()->id()) {
            return back()->with('error', 'Vous n\'avez pas le droit d\'exécuter cette opération.');
        }

        // Logic check: prevent double arrival/departure
        // Get the LAST attendance of today
        $lastAttendance = Attendance::where('driver_id', $driver->id)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        if ($validated['type'] === 'arrival') {
            if ($lastAttendance && $lastAttendance->type === 'arrival') {
                return back()->with('error', 'Chauffeur déjà marqué arrivé.');
            }
        } else {
            // Depature
            if (!$lastAttendance || $lastAttendance->type === 'departure') {
                 return back()->with('error', 'Impossible de marquer le départ (Déjà parti ou pas encore arrivé).');
            }
        }

        Attendance::create([
            'driver_id' => $driver->id,
            'matricule' => $driver->matricule,
            'first_name' => explode(' ', $driver->name)[0] ?? '',
            'last_name' => explode(' ', $driver->name)[1] ?? '',
            'type' => $validated['type'],
            'created_at' => now(),
        ]);

        $msg = $validated['type'] === 'arrival' ? 'Arrivée marquée avec succès.' : 'Départ marqué avec succès.';
        return back()->with('success', $msg);
    }

    public function export(Request $request)
    {
        if (!auth()->user()->is_admin) {
             return back()->with('error', 'Vous n\'avez pas le droit d\'exporter ce rapport.');
        }

        $period = $request->query('period', 'all');
        $query = Attendance::with(['driver.user']);

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                $fileName = 'rapport_presences_aujourdhui_' . date('Y-m-d') . '.csv';
                break;
            case 'week':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                $fileName = 'rapport_presences_semaine_' . date('Y-m-d') . '.csv';
                break;
            case 'month':
                $query->whereMonth('created_at', Carbon::now()->month)
                      ->whereYear('created_at', Carbon::now()->year);
                $fileName = 'rapport_presences_mois_' . date('Y-m') . '.csv';
                break;
            default:
                $fileName = 'rapport_presences_complet_' . date('Y-m-d_H-i') . '.csv';
                break;
        }

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Nom Chauffeur', 'Matricule', 'Rattaché à (Manager)', 'Type', 'Date', 'Heure'];

        $callback = function() use ($columns, $query) {
            $file = fopen('php://output', 'w');
            // Add BOM for Excel UTF-8 support
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, $columns);

            $query->orderBy('created_at', 'desc')
                ->chunk(100, function($attendances) use ($file) {
                    foreach ($attendances as $attendance) {
                        $row = [
                            $attendance->id,
                            $attendance->driver ? $attendance->driver->name : ($attendance->first_name . ' ' . $attendance->last_name),
                            $attendance->driver ? $attendance->driver->matricule : ($attendance->matricule ?? 'N/A'),
                            $attendance->driver && $attendance->driver->user ? $attendance->driver->user->name : 'N/A',
                            $attendance->type === 'arrival' ? 'Arrivée' : 'Départ',
                            $attendance->created_at->format('Y-m-d'),
                            $attendance->created_at->format('H:i:s')
                        ];

                        fputcsv($file, $row);
                    }
                });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'type' => 'required|in:arrival,departure',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
        ]);

        $driver = \App\Models\Driver::findOrFail($validated['driver_id']);

        // Authorization check
        if ($driver->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return back()->with('error', 'Vous n\'avez pas le droit d\'exécuter cette opération.');
        }

        // Create DateTime from date and time
        $dateTime = Carbon::parse($validated['date'] . ' ' . $validated['time']);

        // Check for duplicate on that specific time/type?
        // Or just allow it since it's manual override?
        // Let's prevent exact duplicate for same type/day to avoid spam, but allow if time diff?
        // Let's just create it. The user knows what they are doing.

        // Create and save manually to ensure created_at is respected
        // (created_at is not in fillable usually)
        $attendance = new Attendance();
        $attendance->driver_id = $driver->id;
        $attendance->matricule = $driver->matricule;
        $attendance->first_name = explode(' ', $driver->name)[0] ?? '';
        $attendance->last_name = explode(' ', $driver->name)[1] ?? '';
        $attendance->type = $validated['type'];
        $attendance->created_at = $dateTime; // Explicitly set custom date
        $attendance->updated_at = now();
        $attendance->save();

        return back()->with('success', 'Pointage manuel ajouté avec succès.');
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'type' => 'required|in:arrival,departure',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
        ]);

        $driver = $attendance->driver;

        // Authorization check
        if ($driver && $driver->user_id !== auth()->id() && !auth()->user()->is_admin) {
             return back()->with('error', 'Vous n\'avez pas le droit d\'exécuter cette opération.');
        }
        
        $dateTime = Carbon::parse($validated['date'] . ' ' . $validated['time']);

        $attendance->type = $validated['type'];
        $attendance->created_at = $dateTime;
        $attendance->save();

        return back()->with('success', 'Pointage modifié avec succès.');
    }
}
