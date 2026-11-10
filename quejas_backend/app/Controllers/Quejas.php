<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\ModelQuejas;
use App\Models\ModelQuejoso;

class Quejas extends BaseController
{
    private function setCors()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', '*')
                       ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
                       ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }

    public function index()
    {
        $this->setCors();
        $model = new ModelQuejas();
        $data = $model->orderBy('id_queja', 'DESC')->findAll();
        return $this->response->setJSON($data);
    }

    public function create()
    {
        $this->setCors();
        $modelQueja = new ModelQuejas();
        $modelQuejoso = new ModelQuejoso();
        $json = $this->request->getJSON(true);

        // Validar que la matrícula exista en la tabla quejosos (por el FOREIGN KEY en MySQL)
        $existeQuejoso = $modelQuejoso->where('clave', $json['matricula'] ?? '')->first();
        if (!$existeQuejoso) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'La matrícula ingresada no existe en el padrón de Quejosos. Regístrala primero.'
            ]);
        }

        $datosInsertar = [
            'matricula'             => $json['matricula'],
            'fecha'                 => !empty($json['fecha']) ? $json['fecha'] . ' 00:00:00' : date('Y-m-d H:i:s'),
            'descripcion'           => $json['descripcion'],
            'tipo_queja'            => $json['tipo_queja'] ?? 'infraestructura',
            'estatus'               => $json['estatus'] ?? 'levantada',
            'fecha_cierre'          => !empty($json['fecha_cierre']) ? $json['fecha_cierre'] . ' 00:00:00' : null,
            'ubicacion'             => $json['ubicacion'],
            'ubicacion_descripcion' => $json['ubicacion_descripcion'] ?? null,
        ];

        $id = $modelQueja->insert($datosInsertar);
        $nueva = $modelQueja->find($id);

        return $this->response->setStatusCode(201)->setJSON($nueva);
    }

    public function update($id = null)
    {
        $this->setCors();
        $model = new ModelQuejas();
        $json = $this->request->getJSON(true);

        if (!$id || !$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Queja no encontrada']);
        }

        $fechaCierre = !empty($json['fecha_cierre']) ? $json['fecha_cierre'] . ' 00:00:00' : null;

        $model->update($id, [
            'estatus'      => $json['estatus'],
            'fecha_cierre' => $fechaCierre,
        ]);

        return $this->response->setJSON($model->find($id));
    }
}