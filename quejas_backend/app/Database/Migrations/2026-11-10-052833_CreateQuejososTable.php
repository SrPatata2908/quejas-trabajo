<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateQuejososTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id_quejoso' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'clave' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'unique'     => true,
            ],
            'nombre' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
            ],
            'carrera' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id_quejoso', true);
        $this->forge->createTable('quejosos');
    }

    public function down()
    {
        $this->forge->dropTable('quejosos');
    }
}