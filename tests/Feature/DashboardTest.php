<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_guests_must_login_before_accessing_any_application_module(): void
    {
        $protectedRoutes = [
            route('home'),
            route('dashboard'),
            route('tph-harvest.index'),
            route('surat-jalan.index'),
            route('pks-reconciliation.index'),
            route('ai-assistant.index'),
            route('master-data.index'),
            route('users.index'),
        ];

        foreach ($protectedRoutes as $url) {
            $this->get($url)->assertRedirect(route('login'));
        }

        $this->postJson(route('ai-assistant.ask'), ['question' => 'Tes'])
            ->assertUnauthorized();
    }
}
