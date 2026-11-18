<?php

namespace App\Http\Requests\Ekulap;

use App\Enums\HarvestType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTphHarvestRequest extends FormRequest
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
            'work_date' => ['required', 'date'],
            'block_id' => ['required', 'integer', 'exists:blocks,id'],
            'tph_point_id' => ['required', 'integer', 'exists:tph_points,id'],
            'worker_ids' => ['required', 'array', 'min:1'],
            'worker_ids.*' => ['required', 'integer', 'exists:workers,id'],
            'weigher_user_id' => ['required', 'integer', 'exists:users,id'],
            'harvest_type' => ['required', Rule::in(HarvestType::values())],
            'sack_count' => ['required', 'integer', 'min:1', 'max:1000'],
            'tph_count' => ['required', 'integer', 'min:1', 'max:500'],
            'gross_weight_kg' => ['required', 'numeric', 'min:1', 'max:50000'],
            'input_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'input_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'weighed_at' => ['nullable', 'date'],
            'photos' => ['required', 'array', 'min:3', 'max:10'],
            'photos.*' => ['required', 'image', 'max:15360'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'worker_ids.required' => 'Pilih minimal 1 tenaga kerja.',
            'worker_ids.min' => 'Pilih minimal 1 tenaga kerja.',
            'weigher_user_id.required' => 'Pilih petugas timbang.',
            'block_id.required' => 'Pilih blok panen.',
            'tph_count.required' => 'Jumlah TPH wajib diisi.',
            'tph_count.min' => 'Jumlah TPH minimal 1.',
            'photos.required' => 'Unggah minimal 3 foto bukti lapangan (maksimal 10 foto).',
            'photos.min' => 'Unggah minimal 3 foto bukti lapangan.',
            'photos.max' => 'Maksimal 10 foto bukti lapangan.',
            'photos.*.image' => 'Semua lampiran harus berupa file gambar yang valid.',
        ];
    }
}
