<?php

namespace App\Http\Requests\Ekulap;

use Illuminate\Foundation\Http\FormRequest;

class RecordPksWeighingRequest extends FormRequest
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
            'pks_ticket_number' => ['required', 'string', 'max:64'],
            'pks_net_weight_kg' => ['required', 'numeric', 'min:1', 'max:100000'],
            'arrived_at' => ['nullable', 'date'],
            'pks_slip_photo' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
