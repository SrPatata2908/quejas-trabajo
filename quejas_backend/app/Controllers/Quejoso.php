<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\ModelQuejoso;

class Quejoso extends BaseController
{
    /** Clave reservada que da acceso al panel de administración. */
    private const CLAVE_ADMIN = 'admin';

    private function setCors()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', '*')
                       ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
                       ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }

    /** Normaliza texto para comparar nombres: minúsculas, sin acentos y sin espacios repetidos. */
    private function normalizar(string $texto): string
    {
        $texto = mb_strtolower(trim(preg_replace('/\s+/', ' ', $texto)), 'UTF-8');
        $sinAcentos = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);
        return $sinAcentos !== false && $sinAcentos !== '' ? preg_replace('/[^a-z0-9 ]/', '', $sinAcentos) : $texto;
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
            'anio'    => $json['anio'] ?? null,
        ]);

        $nuevo = $model->find($id);
        return $this->response->setStatusCode(201)->setJSON($nuevo);
    }

    /**
     * POST /api/login
     * - clave "admin"  -> rol admin (no se guarda en quejosos).
     * - clave nueva    -> se registra automáticamente.
     * - clave existente-> se valida el nombre; carrera y año se actualizan si cambiaron.
     */
    public function login()
    {
        $this->setCors();

        $json = $this->request->getJSON(true) ?? [];

        $clave   = trim((string) ($json['clave'] ?? ''));
        $nombre  = trim((string) ($json['nombre'] ?? ''));
        $carrera = trim((string) ($json['carrera'] ?? ''));
        $anio    = trim((string) ($json['anio'] ?? ''));

        if ($clave === '') {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'La matrícula / clave es obligatoria.']);
        }

        // Acceso de administrador: solo requiere la clave reservada
        if (mb_strtolower($clave, 'UTF-8') === self::CLAVE_ADMIN) {
            return $this->response->setJSON([
                'rol'     => 'admin',
                'quejoso' => ['clave' => self::CLAVE_ADMIN, 'nombre' => 'Administrador', 'carrera' => '', 'anio' => ''],
            ]);
        }

        if ($nombre === '' || $carrera === '' || $anio === '') {
            return $this->response->setStatusCode(400)->setJSON([
                'error' => 'Matrícula, nombre completo, carrera y año son obligatorios.'
            ]);
        }

        $model = new ModelQuejoso();
        $existente = $model->where('clave', $clave)->first();

        if (!$existente) {
            $id = $model->insert(['clave' => $clave, 'nombre' => $nombre, 'carrera' => $carrera, 'anio' => $anio]);
            return $this->response->setStatusCode(201)->setJSON([
                'rol'     => 'alumno',
                'nuevo'   => true,
                'quejoso' => $model->find($id),
            ]);
        }

        if ($this->normalizar($existente['nombre']) !== $this->normalizar($nombre)) {
            return $this->response->setStatusCode(401)->setJSON([
                'error' => 'Los datos no coinciden con los registrados para esta matrícula.'
            ]);
        }

        // Carrera y año pueden cambiar entre semestres: se mantienen al día
        if ($existente['carrera'] !== $carrera || ($existente['anio'] ?? '') !== $anio) {
            $model->update($existente['id_quejoso'], ['carrera' => $carrera, 'anio' => $anio]);
            $existente = $model->find($existente['id_quejoso']);
        }

        return $this->response->setJSON(['rol' => 'alumno', 'nuevo' => false, 'quejoso' => $existente]);
    }
}
