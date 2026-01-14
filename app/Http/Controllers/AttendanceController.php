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

    public function export()
    {
        // Only allow admin to export
        // Assuming 'is_admin' is available on user model.
        // We can check via auth() or specific logic.
        // The migration added is_admin column.
        if (!auth()->user()->is_admin) {
             return back()->with('error', 'Vous n\'avez pas le droit d\'exporter ce rapport.');
        }

        $fileName = 'rapport_presences_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Nom Chauffeur', 'Matricule', 'Type', 'Date', 'Heure'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            Attendance::with('driver')
                ->orderBy('created_at', 'desc')
                ->chunk(100, function($attendances) use ($file) {
                    foreach ($attendances as $attendance) {
                        $row['ID']  = $attendance->id;
                        $row['Nom Chauffeur'] = $attendance->driver ? $attendance->driver->name : ($attendance->first_name . ' ' . $attendance->last_name);
                        $row['Matricule'] = $attendance->driver ? $attendance->driver->matricule : ($attendance->matricule ?? 'N/A');
                        $row['Type']  = $attendance->type === 'arrival' ? 'Arrivée' : 'Départ';
                        $row['Date']  = $attendance->created_at->format('Y-m-d');
                        $row['Heure'] = $attendance->created_at->format('H:i:s');

                        fputcsv($file, array($row['ID'], $row['Nom Chauffeur'], $row['Matricule'], $row['Type'], $row['Date'], $row['Heure']));
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
