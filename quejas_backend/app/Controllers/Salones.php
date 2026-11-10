<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\ModelSalon;

class Salones extends BaseController
{
    public function index()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', '*')
                       ->setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        $model = new ModelSalon();
        return $this->response->setJSON($model->findAll());
    }
}