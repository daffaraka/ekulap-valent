<?php

namespace App\Http\Requests\Ekulap;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
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
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:60',
                Rule::unique('roles', 'name')->where('guard_name', 'web'),
            ],
            'template_role' => [
                'nullable',
                'string',
                Rule::exists('roles', 'name')->where('guard_name', 'web'),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['required', 'string', 'exists:permissions,name'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama role wajib diisi.',
            'name.min' => 'Nama role minimal 2 karakter.',
            'name.unique' => 'Nama role tersebut sudah terdaftar.',
            'template_role.exists' => 'Role template yang dipilih tidak ditemukan.',
            'permissions.*.exists' => 'Terdapat permission yang tidak valid.',
        ];
    }
}
