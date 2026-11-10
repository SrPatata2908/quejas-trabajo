<?php

namespace App\Models;

use CodeIgniter\Model;

class ModelQuejoso extends Model
{
    protected $table            = 'quejosos';
    protected $primaryKey       = 'id_quejoso';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = ['clave', 'nombre', 'carrera', 'anio'];

    protected bool $allowEmptyInserts = false;
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}