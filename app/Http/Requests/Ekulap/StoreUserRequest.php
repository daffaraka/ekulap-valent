<?php

namespace App\Http\Requests\Ekulap;

use App\Enums\RecordStatus;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $routeUser = $this->route('user');
        $userId = $routeUser instanceof User ? $routeUser->id : null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'username' => [
                'required',
                'string',
                'min:4',
                'max:32',
                'regex:/^[0-9A-Za-z\-_]+$/',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'phone' => ['nullable', 'string', 'max:32', Rule::unique('users', 'phone')->ignore($userId)],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)],
            'password' => [$userId ? 'nullable' : 'required', 'string', 'min:6'],
            'role' => ['required', Rule::in(UserRole::values())],
            'division_id' => ['nullable', 'integer', 'exists:divisions,id'],
            'status' => ['required', Rule::in(RecordStatus::values())],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'username.required' => 'NIK pengguna wajib diisi.',
            'username.regex' => 'NIK tidak boleh mengandung spasi, simbol @, atau format email.',
            'username.unique' => 'NIK ini sudah terdaftar pada pengguna lain.',
        ];
    }
}
