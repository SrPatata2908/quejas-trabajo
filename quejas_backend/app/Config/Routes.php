<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->group('api', function ($routes) {
    // Respuesta preflight CORS para cualquier ruta dentro de /api
    $routes->options('(:any)', function () {
        return response()
            ->setHeader('Access-Control-Allow-Origin', '*')
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Token')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->setStatusCode(200);
    });

    // Login / registro automático de alumnos (y acceso admin)
    $routes->post('login', 'Quejoso::login');

    // Padrón de quejosos (solo administrador)
    $routes->get('quejosos', 'Quejoso::index', ['filter' => 'adminAuth']);
    $routes->post('quejosos', 'Quejoso::create', ['filter' => 'adminAuth']);

    // Quejas: crear y consultar las propias es libre (por matrícula); ver todas y actualizar exige admin
    $routes->get('quejas', 'Quejas::index');
    $routes->post('quejas', 'Quejas::create');
    $routes->put('quejas/(:num)', 'Quejas::update/$1', ['filter' => 'adminAuth']);

    // Catálogo de salones: lectura libre, altas/bajas solo administrador
    $routes->get('salones', 'Salones::index');
    $routes->post('salones', 'Salones::create', ['filter' => 'adminAuth']);
    $routes->delete('salones/(:num)', 'Salones::delete/$1', ['filter' => 'adminAuth']);
});