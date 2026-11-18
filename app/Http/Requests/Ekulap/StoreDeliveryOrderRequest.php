<?php

namespace App\Http\Requests\Ekulap;

use App\Enums\DeliveryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeliveryOrderRequest extends FormRequest
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
        $isDispatched = $this->input('delivery_status') === DeliveryStatus::SudahDikirim->value;

        return [
            'division_id' => ['required', 'integer', 'exists:divisions,id'],
            'truck_id' => ['required', 'integer', 'exists:trucks,id'],
            'pks_mill_id' => ['required', 'integer', 'exists:pks_mills,id'],
            'notes' => ['nullable', 'string', 'max:500'],
            'delivery_status' => ['nullable', Rule::in(DeliveryStatus::values())],
            'departed_at' => ['nullable', 'date'],
            'loading_photos' => [$isDispatched ? 'required' : 'nullable', 'array', $isDispatched ? 'min:1' : 'min:0', 'max:2'],
            'loading_photos.*' => ['required', 'image', 'max:15360'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.tph_harvest_record_id' => ['required', 'integer', 'exists:tph_harvest_records,id'],
            'items.*.loaded_sacks' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'loading_photos.required' => 'Unggah 1 atau 2 foto saat pengangkutan SPB.',
            'loading_photos.min' => 'Unggah minimal 1 foto saat pengangkutan SPB.',
            'loading_photos.max' => 'Maksimal 2 foto pengangkutan SPB.',
            'loading_photos.*.image' => 'Foto pengangkutan SPB harus berupa gambar yang valid.',
        ];
    }
}
