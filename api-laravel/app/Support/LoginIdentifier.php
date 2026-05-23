<?php

namespace App\Support;

use App\Models\User;

class LoginIdentifier
{
    /**
     * Normalise un numéro (RDC : 243XXXXXXXXX).
     */
    public static function normalizePhone(?string $phone): ?string
    {
        if ($phone === null || trim($phone) === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone);
        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        if (str_starts_with($digits, '243') && strlen($digits) >= 12) {
            return substr($digits, 0, 12);
        }

        if (str_starts_with($digits, '0') && strlen($digits) >= 10) {
            return '243'.substr($digits, 1);
        }

        if (strlen($digits) === 9) {
            return '243'.$digits;
        }

        return $digits;
    }

    public static function isEmail(string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Variantes à tester en base (formats saisis différemment).
     *
     * @return list<string>
     */
    public static function phoneLookupVariants(string $input): array
    {
        $normalized = self::normalizePhone($input);
        $variants = array_filter(array_unique([
            trim($input),
            $normalized,
            $normalized ? '+'. $normalized : null,
            $normalized && str_starts_with($normalized, '243')
                ? '0'.substr($normalized, 3)
                : null,
        ]));

        return array_values($variants);
    }

    public static function findUser(string $login): ?User
    {
        $login = trim($login);
        if ($login === '') {
            return null;
        }

        if (self::isEmail($login)) {
            return User::where('email', $login)->first();
        }

        $variants = self::phoneLookupVariants($login);
        if ($variants !== []) {
            $byExact = User::whereIn('phone', $variants)->first();
            if ($byExact) {
                return $byExact;
            }
        }

        $target = self::normalizePhone($login);
        if (! $target) {
            return null;
        }

        $suffix = strlen($target) >= 9 ? substr($target, -9) : $target;

        return User::query()
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->get()
            ->first(function (User $user) use ($target, $suffix) {
                $stored = self::normalizePhone($user->phone);
                if (! $stored) {
                    return false;
                }

                return $stored === $target
                    || substr($stored, -9) === $suffix
                    || substr($target, -9) === substr($stored, -9);
            });
    }
}
