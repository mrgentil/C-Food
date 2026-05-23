<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion — C-Food Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    @include('layouts.partials.admin-head')
</head>
<body class="admin-app min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center shadow-lg shadow-brand-600/40 mb-4">
                <span class="text-white font-bold text-2xl">C</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">C-Food Panel</h1>
            <p class="text-slate-400 text-sm mt-2">Admin ou établissement — email ou téléphone</p>
        </div>

        <div class="admin-card p-8 shadow-soft">
            <form action="/login" method="POST" class="space-y-5">
                @csrf
                <x-admin.input label="Email ou téléphone" name="login" type="text" :value="old('login', old('email'))" :required="true" autocomplete="username" placeholder="ex: admin@cf.com ou +243…" />
                <x-admin.input label="Mot de passe" name="password" type="password" :required="true" autocomplete="current-password" />

                @if ($errors->any())
                    <div class="admin-alert bg-red-50 border border-red-200 text-red-800">
                        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/></svg>
                        <ul class="list-disc list-inside space-y-0.5">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <x-admin.button type="submit" variant="primary" size="lg" class="w-full">
                    Se connecter
                </x-admin.button>
            </form>
        </div>
    </div>
</body>
</html>
