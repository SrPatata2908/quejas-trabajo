<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateQuejasTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id_queja' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'matricula' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
            ],
            'fecha' => [
                'type' => 'DATETIME',
            ],
            'descripcion' => [
                'type' => 'TEXT',
            ],
            'tipo_queja' => [
                'type'       => 'ENUM',
                'constraint' => ['infraestructura', 'hardware', 'software', 'insumos'],
                'default'    => 'infraestructura',
            ],
            'estatus' => [
                'type'       => 'ENUM',
                'constraint' => ['levantada', 'en proceso', 'atendida'],
                'default'    => 'levantada',
            ],
            'fecha_cierre' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'ubicacion' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'ubicacion_descripcion' => [
                'type' => 'TEXT',
                'null' => true,
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

        $this->forge->addKey('id_queja', true);
        $this->forge->addForeignKey('matricula', 'quejosos', 'clave', 'CASCADE', 'CASCADE');
        $this->forge->createTable('quejas');
    }

    public function down()
    {
        $this->forge->dropTable('quejas');
    }
}