<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAdministradoresTable extends Migration
{
    public function up()
    {
        if (!$this->db->tableExists('administradores')) {
            $this->forge->addField([
                'id_admin' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
                'usuario'  => ['type' => 'VARCHAR', 'constraint' => 50, 'unique' => true],
                'nombre'   => ['type' => 'VARCHAR', 'constraint' => 150],
                'password_hash' => ['type' => 'VARCHAR', 'constraint' => 255],
                'created_at' => ['type' => 'DATETIME', 'null' => true],
                'updated_at' => ['type' => 'DATETIME', 'null' => true],
            ]);
            $this->forge->addKey('id_admin', true);
            $this->forge->createTable('administradores');
        }

        // Administrador inicial: usuario "admin" / contraseña "admin123" (cámbiala después)
        $existe = $this->db->table('administradores')->where('usuario', 'admin')->countAllResults();
        if ($existe === 0) {
            $ahora = date('Y-m-d H:i:s');
            $this->db->table('administradores')->insert([
                'usuario'       => 'admin',
                'nombre'        => 'Administrador',
                'password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
                'created_at'    => $ahora,
                'updated_at'    => $ahora,
            ]);
        }
    }

    public function down()
    {
        $this->forge->dropTable('administradores', true);
    }
}
