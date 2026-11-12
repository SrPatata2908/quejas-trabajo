<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddNotaAtencionToQuejas extends Migration
{
    public function up()
    {
        if (!$this->db->fieldExists('nota_atencion', 'quejas')) {
            $this->forge->addColumn('quejas', [
                'nota_atencion' => ['type' => 'TEXT', 'null' => true, 'after' => 'ubicacion_descripcion'],
            ]);
        }
    }

    public function down()
    {
        $this->forge->dropColumn('quejas', 'nota_atencion');
    }
}
