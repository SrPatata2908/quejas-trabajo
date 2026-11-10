<?php

namespace App\Models;

use CodeIgniter\Model;

class ModelQuejas extends Model
{
    protected $table            = 'quejas';
    protected $primaryKey       = 'id_queja';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'matricula',
        'fecha',
        'descripcion',
        'tipo_queja',
        'estatus',
        'fecha_cierre',
        'ubicacion',
        'ubicacion_descripcion'
    ];

    protected bool $allowEmptyInserts = false;
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}