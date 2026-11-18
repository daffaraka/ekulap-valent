<?php

namespace App\Services;

use App\Models\AuditLog;
use Carbon\CarbonImmutable;

class SystemHealthLogService
{
    private const MAX_READ_BYTES = 262144;

    private const MAX_INCIDENTS = 40;

    /**
     * @return list<array{
     *     id: string,
     *     occurred_at: string,
     *     occurred_human: string,
     *     is_recent_24h: bool,
     *     severity: string,
     *     severity_label: string,
     *     category: string,
     *     title: string,
     *     human_summary: string,
     *     recommended_action: string,
     *     technical_detail: string,
     * }>
     */
    public function parseRecentIncidents(?string $logPath = null): array
    {
        $path = $logPath ?? storage_path('logs/laravel.log');
        if (! is_file($path) || ! is_readable($path)) {
            return [];
        }

        $tail = $this->readFileTail($path, self::MAX_READ_BYTES);
        if ($tail === '') {
            return [];
        }

        $rawEntries = $this->splitLogEntries($tail);
        $incidents = [];

        foreach ($rawEntries as $entry) {
            $level = strtoupper($entry['level']);
            if (! in_array($level, ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING'], true)) {
                continue;
            }

            $translated = $this->translateEntry($entry['timestamp'], $level, $entry['body']);
            $incidents[] = $translated;

            if (count($incidents) >= self::MAX_INCIDENTS) {
                break;
            }
        }

        return $incidents;
    }

    /**
     * @param  list<array<string, mixed>>  $incidents
     * @return array{
     *     status: string,
     *     status_label: string,
     *     headline: string,
     *     narrative: string,
     *     errors_24h: int,
     *     upload_failures_24h: int,
     *     failed_logins_24h: int,
     *     sensitive_actions_24h: int,
     *     storage_link_active: bool,
     *     log_file_size_kb: float,
     * }
     */
    public function buildOverview(array $incidents, ?string $logPath = null): array
    {
        $path = $logPath ?? storage_path('logs/laravel.log');
        $logSizeKb = is_file($path) ? round((float) filesize($path) / 1024, 1) : 0.0;
        $storageLinkActive = is_link(public_path('storage')) || is_dir(public_path('storage'));

        $since24h = now()->subDay();
        $errors24h = 0;
        $uploadLogFailures24h = 0;

        foreach ($incidents as $incident) {
            if (($incident['is_recent_24h'] ?? false) !== true) {
                continue;
            }

            $errors24h++;
            if (($incident['category'] ?? '') === 'upload') {
                $uploadLogFailures24h++;
            }
        }

        $uploadAuditFailures24h = AuditLog::query()
            ->where('category', 'upload')
            ->where('created_at', '>=', $since24h)
            ->count();

        $uploadFailures24h = $uploadLogFailures24h + $uploadAuditFailures24h;

        $failedLogins24h = AuditLog::query()
            ->where('category', 'auth')
            ->whereIn('action', ['login_failed', 'lockout'])
            ->where('created_at', '>=', $since24h)
            ->count();

        $sensitiveActions24h = AuditLog::query()
            ->where('created_at', '>=', $since24h)
            ->whereIn('severity', ['warning', 'danger'])
            ->where('category', '!=', 'auth')
            ->count();

        $status = 'aman';
        $statusLabel = 'Sistem Normal & Aman';
        $headline = 'Aplikasi berjalan lancar dan aman untuk operasional kebun.';

        if ($errors24h > 0 || $uploadFailures24h > 0 || ! $storageLinkActive) {
            $status = 'gangguan';
            $statusLabel = 'Perlu Penanganan';
            $headline = 'Terdeteksi kendala aplikasi atau unggah foto yang perlu dicek.';
        } elseif ($failedLogins24h >= 3 || $sensitiveActions24h > 0) {
            $status = 'perhatian';
            $statusLabel = 'Perlu Perhatian';
            $headline = 'Sistem online normal, namun ada aktivitas keamanan atau penghapusan data yang perlu dipantau.';
        }

        $narrative = $this->composeNarrative(
            errors24h: $errors24h,
            uploadFailures24h: $uploadFailures24h,
            failedLogins24h: $failedLogins24h,
            sensitiveActions24h: $sensitiveActions24h,
            storageLinkActive: $storageLinkActive,
        );

        return [
            'status' => $status,
            'status_label' => $statusLabel,
            'headline' => $headline,
            'narrative' => $narrative,
            'errors_24h' => $errors24h,
            'upload_failures_24h' => $uploadFailures24h,
            'failed_logins_24h' => $failedLogins24h,
            'sensitive_actions_24h' => $sensitiveActions24h,
            'storage_link_active' => $storageLinkActive,
            'log_file_size_kb' => $logSizeKb,
        ];
    }

    /**
     * @return array{
     *     id: string,
     *     occurred_at: string,
     *     occurred_human: string,
     *     is_recent_24h: bool,
     *     severity: string,
     *     severity_label: string,
     *     category: string,
     *     title: string,
     *     human_summary: string,
     *     recommended_action: string,
     *     technical_detail: string,
     * }
     */
    public function translateEntry(string $timestamp, string $level, string $body): array
    {
        $parsedTime = $this->parseTimestamp($timestamp);
        $isRecent = $parsedTime->greaterThanOrEqualTo(now()->subDay());
        $lower = mb_strtolower($body);

        $match = match (true) {
            str_contains($lower, 'posttoolargeexception') || str_contains($lower, 'post data is too large') => [
                'severity' => 'danger',
                'severity_label' => 'Gangguan Upload',
                'category' => 'upload',
                'title' => 'Gagal Mengunggah Foto (Ukuran Melebihi Batas Server)',
                'human_summary' => 'Petugas mencoba mengirim foto yang ukurannya terlalu besar untuk diterima server sekaligus.',
                'recommended_action' => 'Minta petugas mengirim foto sedikit demi sedikit atau pastikan konfigurasi batas upload server (.user.ini / Nginx) sudah minimal 32 MB.',
            ],
            str_contains($lower, 'validation.uploaded') || str_contains($lower, 'failed to upload') => [
                'severity' => 'warning',
                'severity_label' => 'Perlu Perhatian',
                'category' => 'upload',
                'title' => 'Foto Bukti Gagal Diterima Saat Validasi',
                'human_summary' => 'Salah satu file foto tidak berhasil diproses oleh server (biasanya ukuran file melebihi batas PHP atau koneksi terputus saat mengunggah).',
                'recommended_action' => 'Arahkan pengguna memilih ulang foto JPG/PNG dari galeri dan pastikan koneksi sinyal stabil.',
            ],
            str_contains($lower, 'sqlstate') || str_contains($lower, 'queryexception') || str_contains($lower, 'pdoexception') => [
                'severity' => 'danger',
                'severity_label' => 'Gangguan Database',
                'category' => 'database',
                'title' => 'Kendala Penyimpanan atau Pembacaan Database',
                'human_summary' => 'Aplikasi mengalami hambatan saat menyimpan atau mengambil data dari database.',
                'recommended_action' => 'Coba muat ulang halaman. Jika muncul lagi, salin Info Teknis di bawah lalu kirimkan ke tim IT.',
            ],
            str_contains($lower, 'permission denied') || str_contains($lower, 'unable to write') || str_contains($lower, 'failed to open stream') => [
                'severity' => 'danger',
                'severity_label' => 'Gangguan Penyimpanan',
                'category' => 'storage',
                'title' => 'Folder Penyimpanan Foto Tidak Bisa Diakses Server',
                'human_summary' => 'Server tidak memiliki izin untuk menulis atau membaca file foto/log di folder penyimpanan.',
                'recommended_action' => 'Hubungi tim IT untuk memeriksa izin folder storage dan menjalankan php artisan storage:link.',
            ],
            str_contains($lower, 'tokenmismatchexception') || str_contains($lower, 'csrf token mismatch') => [
                'severity' => 'warning',
                'severity_label' => 'Perlu Perhatian',
                'category' => 'session',
                'title' => 'Sesi Halaman Kedaluwarsa Sebelum Simpan',
                'human_summary' => 'Halaman formulir dibiarkan terbuka terlalu lama tanpa aktivitas sebelum pengguna menekan tombol simpan.',
                'recommended_action' => 'Minta pengguna me-refresh halaman atau login ulang sebelum menginput ulang data.',
            ],
            str_contains($lower, 'curl error') || str_contains($lower, 'gemini') || str_contains($lower, 'openai') || str_contains($lower, 'aiassistant') => [
                'severity' => 'warning',
                'severity_label' => 'Layanan AI',
                'category' => 'ai',
                'title' => 'Koneksi Asisten AI Sawit Sedang Terganggu',
                'human_summary' => 'Fitur Asisten AI gagal menghubungi layanan AI eksternal karena jaringan atau batas kuota API, namun fitur timbang & SPB tetap normal.',
                'recommended_action' => 'Tunggu beberapa saat lalu coba tanya ulang Asisten AI, atau periksa kuota kunci API jika berlanjut.',
            ],
            default => [
                'severity' => $level === 'WARNING' ? 'warning' : 'danger',
                'severity_label' => $level === 'WARNING' ? 'Perlu Perhatian' : 'Gangguan Sistem',
                'category' => 'application',
                'title' => $level === 'WARNING' ? 'Peringatan Proses Aplikasi' : 'Gangguan Internal Halaman Aplikasi',
                'human_summary' => 'Terjadi kendala teknis internal pada salah satu halaman atau proses aplikasi.',
                'recommended_action' => 'Periksa aktivitas pengguna di waktu yang sama. Jika pengguna melapor gagal simpan, kirimkan Info Teknis ke tim IT.',
            ],
        };

        $firstLine = trim(strtok($body, "\n") ?: $body);

        return [
            'id' => substr(md5($timestamp.$firstLine), 0, 12),
            'occurred_at' => $parsedTime->toIso8601String(),
            'occurred_human' => $parsedTime->setTimezone('Asia/Jakarta')->format('d M Y, H:i').' WIB',
            'is_recent_24h' => $isRecent,
            'severity' => $match['severity'],
            'severity_label' => $match['severity_label'],
            'category' => $match['category'],
            'title' => $match['title'],
            'human_summary' => $match['human_summary'],
            'recommended_action' => $match['recommended_action'],
            'technical_detail' => mb_substr(trim($firstLine), 0, 480),
        ];
    }

    private function composeNarrative(
        int $errors24h,
        int $uploadFailures24h,
        int $failedLogins24h,
        int $sensitiveActions24h,
        bool $storageLinkActive,
    ): string {
        $parts = [];

        if ($errors24h === 0 && $uploadFailures24h === 0) {
            $parts[] = 'Dalam 24 jam terakhir tidak ditemukan error aplikasi maupun kegagalan upload foto.';
        } else {
            $parts[] = "Dalam 24 jam terakhir tercatat {$errors24h} catatan gangguan di log sistem dan {$uploadFailures24h} kali gagal unggah foto ukuran besar.";
        }

        if (! $storageLinkActive) {
            $parts[] = 'Tautan folder foto (storage:link) belum aktif sehingga foto bukti lapangan bisa gagal tampil.';
        } else {
            $parts[] = 'Folder penyimpanan foto aktif dan siap menampilkan dokumentasi lapangan.';
        }

        if ($failedLogins24h === 0) {
            $parts[] = 'Keamanan login aman tanpa percobaan sandi gagal.';
        } elseif ($failedLogins24h < 3) {
            $parts[] = "Ada {$failedLogins24h} percobaan salah sandi saat login dalam 24 jam terakhir (masih dalam batas wajar).";
        } else {
            $parts[] = "Perlu dicek: ada {$failedLogins24h} kali percobaan login gagal dalam 24 jam terakhir.";
        }

        if ($sensitiveActions24h > 0) {
            $parts[] = "Selain itu terdapat {$sensitiveActions24h} aktivitas penting (seperti penghapusan data, perubahan pengguna, atau susut PKS > 2%) yang tercatat di jejak audit.";
        }

        return implode(' ', $parts);
    }

    private function readFileTail(string $path, int $maxBytes): string
    {
        $handle = @fopen($path, 'rb');
        if ($handle === false) {
            return '';
        }

        $size = (int) filesize($path);
        if ($size <= 0) {
            fclose($handle);

            return '';
        }

        if ($size > $maxBytes) {
            fseek($handle, -$maxBytes, SEEK_END);
            // Buang baris terpotong di awal potongan tail
            fgets($handle);
        }

        $content = stream_get_contents($handle);
        fclose($handle);

        return is_string($content) ? $content : '';
    }

    /**
     * @return list<array{timestamp: string, level: string, body: string}>
     */
    private function splitLogEntries(string $content): array
    {
        $lines = preg_split("/\r\n|\n|\r/", $content) ?: [];
        $entries = [];
        $current = null;

        foreach ($lines as $line) {
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*)\]\s+[\w.-]+\.(\w+):\s*(.*)$/', $line, $matches) === 1) {
                if ($current !== null) {
                    $entries[] = $current;
                }

                $current = [
                    'timestamp' => $matches[1],
                    'level' => $matches[2],
                    'body' => $matches[3],
                ];
            } elseif ($current !== null) {
                $current['body'] .= "\n".$line;
            }
        }

        if ($current !== null) {
            $entries[] = $current;
        }

        return array_reverse($entries);
    }

    private function parseTimestamp(string $raw): CarbonImmutable
    {
        try {
            return CarbonImmutable::parse($raw);
        } catch (\Throwable) {
            return now()->toImmutable();
        }
    }
}
