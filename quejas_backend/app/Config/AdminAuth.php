<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Configuración del acceso de administradores.
 * CAMBIA el secreto antes de usar el sistema en producción.
 */
class AdminAuth extends BaseConfig
{
    /** Clave con la que se firman los tokens de sesión del administrador. */
    public string $secret = 'buzon-quejas-cambia-este-secreto';

    /** Duración de la sesión de administrador en segundos (8 horas). */
    public int $ttl = 28800;
}
