<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\ModelSalon;

class Salones extends BaseController
{
    private function setCors()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', '*')
                       ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Token')
                       ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }

    public function index()
    {
        $this->setCors();

        $model = new ModelSalon();
        return $this->response->setJSON($model->orderBy('id_salon', 'ASC')->findAll());
    }

    /** POST /api/salones  (solo administrador) */
    public function create()
    {
        $this->setCors();

        $json   = $this->request->getJSON(true) ?? [];
        $nombre = trim((string) ($json['nombre_salon'] ?? ''));

        if ($nombre === '' || mb_strlen($nombre) > 150) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Escribe un nombre de salón (máximo 150 caracteres).']);
        }

        $model = new ModelSalon();
        if ($model->where('LOWER(nombre_salon)', mb_strtolower($nombre, 'UTF-8'))->first()) {
            return $this->response->setStatusCode(409)->setJSON(['error' => 'Ese salón ya existe.']);
        }

        $id = $model->insert(['nombre_salon' => $nombre]);
        return $this->response->setStatusCode(201)->setJSON($model->find($id));
    }

    /** DELETE /api/salones/{id}  (solo administrador). Las quejas ya registradas conservan su ubicación. */
    public function delete($id = null)
    {
        $this->setCors();

        $model = new ModelSalon();
        if (!$id || !$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Salón no encontrado.']);
        }

        $model->delete($id);
        return $this->response->setJSON(['ok' => true]);
    }
}
