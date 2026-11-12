<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddAnioToQuejosos extends Migration
{
    public function up()
    {
        if ($this->db->fieldExists('anio', 'quejosos')) {
            return;
        }

        $this->forge->addColumn('quejosos', [
            'anio' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
                'after'      => 'carrera',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('quejosos', 'anio');
    }
}
