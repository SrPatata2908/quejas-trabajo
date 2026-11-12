<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Libraries\AdminToken;
use App\Models\ModelQuejas;
use App\Models\ModelQuejoso;

class Quejas extends BaseController
{
    private const TIPOS   = ['infraestructura', 'hardware', 'software', 'insumos'];
    private const ESTATUS = ['levantada', 'en proceso', 'atendida'];

    private function setCors()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', '*')
                       ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Token')
                       ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }

    /**
     * GET /api/quejas
     * Filtros opcionales por query string: matricula, estatus, tipo_queja, ubicacion.
     * Sin filtros devuelve todas (uso del administrador).
     */
    public function index()
    {
        $this->setCors();

        // Un alumno solo puede consultar SUS quejas (?matricula=...). Ver todas requiere ser administrador.
        $matriculaFiltro = trim((string) $this->request->getGet('matricula'));
        if ($matriculaFiltro === '' && AdminToken::verificar($this->request->getHeaderLine('X-Admin-Token')) === null) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'Sesión de administrador no válida o expirada.']);
        }

        $model = new ModelQuejas();
        $model->select('quejas.*, quejosos.nombre AS nombre_quejoso, quejosos.carrera AS carrera_quejoso')
              ->join('quejosos', 'quejosos.clave = quejas.matricula', 'left');

        foreach (['matricula', 'estatus', 'tipo_queja', 'ubicacion'] as $campo) {
            $valor = $this->request->getGet($campo);
            if ($valor !== null && $valor !== '' && $valor !== 'todas') {
                $model->where('quejas.' . $campo, $valor);
            }
        }

        $data = $model->orderBy('quejas.id_queja', 'DESC')->findAll();

        return $this->response->setJSON($data);
    }

    public function create()
    {
        $this->setCors();

        $modelQueja   = new ModelQuejas();
        $modelQuejoso = new ModelQuejoso();
        $json = $this->request->getJSON(true) ?? [];

        $matricula   = trim((string) ($json['matricula'] ?? ''));
        $descripcion = trim((string) ($json['descripcion'] ?? ''));
        $ubicacion   = trim((string) ($json['ubicacion'] ?? ''));
        $tipo        = $json['tipo_queja'] ?? 'infraestructura';

        // La matrícula debe existir en quejosos (llave foránea)
        if ($matricula === '' || !$modelQuejoso->where('clave', $matricula)->first()) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'La matrícula ingresada no existe en el padrón de Quejosos. Regístrala primero.'
            ]);
        }

        if ($descripcion === '' || $ubicacion === '') {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'La ubicación y la descripción del problema son obligatorias.'
            ]);
        }

        if (!in_array($tipo, self::TIPOS, true)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Tipo de queja no válido.']);
        }

        // Una queja nueva siempre nace "levantada", con fecha del servidor y sin cierre
        $id = $modelQueja->insert([
            'matricula'             => $matricula,
            'fecha'                 => date('Y-m-d H:i:s'),
            'descripcion'           => $descripcion,
            'tipo_queja'            => $tipo,
            'estatus'               => 'levantada',
            'fecha_cierre'          => null,
            'ubicacion'             => $ubicacion,
            'ubicacion_descripcion' => ($json['ubicacion_descripcion'] ?? '') !== '' ? $json['ubicacion_descripcion'] : null,
        ]);

        return $this->response->setStatusCode(201)->setJSON($modelQueja->find($id));
    }

    public function update($id = null)
    {
        $this->setCors();

        $model = new ModelQuejas();
        $json  = $this->request->getJSON(true) ?? [];

        if (!$id || !$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Queja no encontrada']);
        }

        $actual  = $model->find($id);
        $estatus = $json['estatus'] ?? $actual['estatus'];
        if (!in_array($estatus, self::ESTATUS, true)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Estatus no válido.']);
        }

        $cambios = ['estatus' => $estatus];

        // La fecha de cierre la fija el servidor, y solo cuando el estatus realmente cambia
        if ($estatus !== $actual['estatus']) {
            $cambios['fecha_cierre'] = $estatus === 'atendida' ? date('Y-m-d H:i:s') : null;
        }

        // Nota de atención (opcional): el alumno la ve en su historial
        if (array_key_exists('nota_atencion', $json)) {
            $nota = trim((string) $json['nota_atencion']);
            $cambios['nota_atencion'] = $nota !== '' ? $nota : null;
        }

        $model->update($id, $cambios);

        return $this->response->setJSON($model->find($id));
    }
}
