<?php

namespace App\Filters;

use App\Libraries\AdminToken;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/** Exige un token de administrador válido en la cabecera X-Admin-Token. */
class AdminAuth implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Los preflight CORS los atiende el filtro cors
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            return null;
        }

        if (AdminToken::verificar($request->getHeaderLine('X-Admin-Token')) === null) {
            return service('response')
                ->setStatusCode(401)
                ->setHeader('Access-Control-Allow-Origin', '*')
                ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Token')
                ->setJSON(['error' => 'Sesión de administrador no válida o expirada.']);
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
