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

    public function exportCsv(Request $request)
    {
        $managerName = $request->query('manager_name');
        $managerMatricule = $request->query('manager_matricule');

        // Static list of authorized managers
        $authorizedManagers = [
            ['name' => 'TSIMBA', 'matricule' => 'TSIMBA-01'],
            ['name' => 'ADMIN', 'matricule' => 'ADMIN-2026'],
        ];

        $isAuthorized = false;
        foreach ($authorizedManagers as $mgr) {
            if ($mgr['name'] === $managerName && $mgr['matricule'] === $managerMatricule) {
                $isAuthorized = true;
                break;
            }
        }

        if (!$isAuthorized) {
            return response()->json(['message' => 'Accès refusé. Informations manager incorrectes.'], 403);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="rapport_presence_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Nom', 'Prénom', 'Matricule', 'Type', 'Date', 'Heure']);

            $attendances = Attendance::whereDate('created_at', Carbon::today())->get();

            foreach ($attendances as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->last_name,
                    $row->first_name,
                    $row->matricule,
                    $row->type === 'arrival' ? 'Arrivée' : 'Départ',
                    $row->created_at->format('Y-m-d'),
                    $row->created_at->format('H:i:s'),
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
