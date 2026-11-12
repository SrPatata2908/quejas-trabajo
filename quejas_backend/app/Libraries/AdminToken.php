<?php

namespace App\Libraries;

/**
 * Token firmado (HMAC-SHA256) sin estado: "payload.firma".
 * Se envía en la cabecera X-Admin-Token.
 */
class AdminToken
{
    private static function b64(string $s): string
    {
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    }

    private static function unb64(string $s): string
    {
        return (string) base64_decode(strtr($s, '-_', '+/'));
    }

    public static function generar(string $usuario): string
    {
        $cfg     = config('AdminAuth');
        $payload = self::b64(json_encode(['u' => $usuario, 'exp' => time() + $cfg->ttl]));
        $firma   = hash_hmac('sha256', $payload, $cfg->secret);

        return $payload . '.' . $firma;
    }

    /** Devuelve ['u' => usuario, 'exp' => ts] si el token es válido y no ha expirado; si no, null. */
    public static function verificar(?string $token): ?array
    {
        if (!$token || substr_count($token, '.') !== 1) {
            return null;
        }

        [$payload, $firma] = explode('.', $token);
        $esperada = hash_hmac('sha256', $payload, config('AdminAuth')->secret);

        if (!hash_equals($esperada, $firma)) {
            return null;
        }

        $datos = json_decode(self::unb64($payload), true);
        if (!is_array($datos) || ($datos['exp'] ?? 0) < time()) {
            return null;
        }

        return $datos;
    }
}
