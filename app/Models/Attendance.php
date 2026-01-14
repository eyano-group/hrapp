<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory;

    protected $fillable = [
        'driver_id', // Added driver_id
        'first_name',
        'last_name',
        'matricule',
        'type',
        'latitude',
        'longitude',
        'signature_data',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
