<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_dashboard_shares_development_environment_flag_for_header_theming(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        app()->detectEnvironment(fn(): string => 'local');
        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn(Assert $page) => $page
                    ->where('isDevelopment', true)
            );

        app()->detectEnvironment(fn(): string => 'production');
        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn(Assert $page) => $page
                    ->where('isDevelopment', false)
            );
    }
}
