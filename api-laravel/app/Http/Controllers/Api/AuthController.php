<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\LoginIdentifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    private function resolveLoginInput(Request $request): string
    {
        return trim((string) (
            $request->input('login')
            ?? $request->input('email')
            ?? $request->input('phone')
            ?? ''
        ));
    }

    private function authenticateUser(string $login, string $password): ?User
    {
        $user = LoginIdentifier::findUser($login);

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

    // API Login (mobile)
    public function login(Request $request)
    {
        $login = $this->resolveLoginInput($request);

        $validator = Validator::make(
            ['login' => $login, 'password' => $request->password],
            [
                'login' => 'required|string|min:3',
                'password' => 'required',
            ],
            [
                'login.required' => 'Indiquez votre email ou numéro de téléphone.',
            ]
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $this->authenticateUser($login, (string) $request->password);

        if (! $user) {
            return response()->json([
                'message' => 'Identifiant ou mot de passe incorrect',
            ], 401);
        }

        if (! empty($user->suspended_at)) {
            return response()->json([
                'message' => 'Compte suspendu. Contacte le support.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Web Login (admin & restaurant)
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function webLogin(Request $request)
    {
        $request->validate([
            'login' => 'required_without:email|string|min:3',
            'email' => 'nullable|string',
            'password' => 'required',
        ]);

        $login = $this->resolveLoginInput($request);
        $user = $this->authenticateUser($login, (string) $request->password);

        if ($user) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            if (! empty($user->suspended_at)) {
                Auth::logout();

                return back()->withErrors([
                    'login' => 'Compte suspendu.',
                ])->onlyInput('login');
            }

            if ($user->is_admin) {
                return redirect()->intended('/admin/dashboard');
            }
            if ($user->is_merchant || $user->is_restaurant) {
                return redirect()->intended('/restaurant/dashboard');
            }

            return redirect('/');
        }

        return back()->withErrors([
            'login' => 'Email/téléphone ou mot de passe incorrect.',
        ])->onlyInput('login');
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $user->currentAccessToken()?->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function webLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    // API Register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $normalizedPhone = $request->phone ? LoginIdentifier::normalizePhone($request->phone) : null;
        $storedPhone = $normalizedPhone ? '+'.$normalizedPhone : ($request->phone ?: null);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $storedPhone,
            'password' => Hash::make($request->password),
            'is_admin' => false,
            'is_restaurant' => false,
            'is_merchant' => false,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function profile(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'phone']);
        if (isset($data['phone'])) {
            $normalized = LoginIdentifier::normalizePhone($data['phone']);
            if ($normalized) {
                $data['phone'] = '+'.ltrim($normalized, '+');
            }
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour',
            'user' => $user,
        ]);
    }

    public function updatePhoto(Request $request)
    {
        try {
            $request->validate([
                'photo' => 'required|image|max:2048', // max 2MB
            ]);

            $user = $request->user();

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $filename = 'user_'.$user->id.'_'.time().'.'.$file->getClientOriginalExtension();
                $file->move(public_path('photos'), $filename);

                $user->update(['photo' => 'photos/'.$filename]);

                return response()->json([
                    'message' => 'Photo de profil mise à jour',
                    'user' => $user,
                    'photo_url' => url('photos/'.$filename),
                ]);
            }

            return response()->json(['message' => 'Aucun fichier reçu'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur: '.$e->getMessage()], 500);
        }
    }
}
