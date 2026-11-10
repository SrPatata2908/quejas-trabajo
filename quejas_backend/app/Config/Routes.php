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
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->setStatusCode(200);
    });

    // Login / registro automático de alumnos (y acceso admin)
    $routes->post('login', 'Quejoso::login');

    // Rutas para Quejosos
    $routes->get('quejosos', 'Quejoso::index');
    $routes->post('quejosos', 'Quejoso::create');

    // Rutas para Quejas
    $routes->get('quejas', 'Quejas::index');
    $routes->post('quejas', 'Quejas::create');
    $routes->put('quejas/(:num)', 'Quejas::update/$1');
    // Catálogo de salones (antes estaba como 'api/salones' dentro del grupo => /api/api/salones)
    $routes->get('salones', 'Salones::index');
});