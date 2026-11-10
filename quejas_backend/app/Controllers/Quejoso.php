<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\ModelQuejoso;

class Quejoso extends BaseController
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
        $model = new ModelQuejoso();
        $data = $model->orderBy('id_quejoso', 'DESC')->findAll();
        return $this->response->setJSON($data);
    }

    public function create()
    {
        $this->setCors();
        $model = new ModelQuejoso();
        $json = $this->request->getJSON(true);

        if (!$json || empty($json['clave']) || empty($json['nombre']) || empty($json['carrera'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Todos los campos (clave, nombre, carrera) son obligatorios.'
            ]);
        }

        // Verificar si la clave/matrícula ya existe
        if ($model->where('clave', $json['clave'])->first()) {
            return $this->response->setStatusCode(409)->setJSON([
                'error' => 'Esta clave/matrícula ya está registrada.'
            ]);
        }

        $id = $model->insert([
            'clave'   => $json['clave'],
            'nombre'  => $json['nombre'],
            'carrera' => $json['carrera'],
        ]);

        $nuevo = $model->find($id);
        return $this->response->setStatusCode(201)->setJSON($nuevo);
    }
}