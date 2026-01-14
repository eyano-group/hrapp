<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                'max:255',
                Rule::unique(User::class),
            ],
            // We expect 'password' to be the PIN code or sent as 'pin_code' and mapped
            'password' => ['required', 'string', 'min:4', 'max:6'], 
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'phone' => $input['phone'],
            'pin_code' => $input['password'], // Store PIN in pin_code (optional if we want raw or encrypted separately)
            'password' => $input['password'], // Hash the PIN as the password for Fortify
        ]);
    }
}
