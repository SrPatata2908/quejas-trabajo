<?php

namespace App\Models;

use CodeIgniter\Model;

class ModelSalon extends Model
{
    protected $table            = 'salones';
    protected $primaryKey       = 'id_salon';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = ['nombre_salon'];
}   