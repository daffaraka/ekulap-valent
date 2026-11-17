<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#102B26">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <style>
            html {
                background-color: #f6f8f6;
            }
        </style>

        <link rel="icon" href="/images/sinarmas-mark.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/sinarmas-mark.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'eKULAP') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased bg-[#F6F8F6] text-[#102B26]">
        <x-inertia::app />
    </body>
</html>
