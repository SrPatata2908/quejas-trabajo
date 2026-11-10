<?php 
namespace App\Models;

use CodeIgniter\Model;

class ModelQuejoso extends Model
{
    protected $table            = 'quejosos';
    protected $primaryKey       = 'id_quejoso';
    protected $allowedFields    = ['clave', 'nombre', 'carrera'];
    protected $useTimestamps     = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = 'updated_at';
}