<?php
session_start();

$origem_permitida = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : "*";
header("Access-Control-Allow-Origin: " . $origem_permitida);
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

require_once 'backend/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];
$id = isset($_GET['id']) ? $_GET['id'] : (isset($path[0]) ? $path[0] : null);
$action = isset($_GET['action']) ? $_GET['action'] : null;

if ($action === 'login' || $action === 'logout' || $action === 'check_auth') {
    require_once 'backend/auth.php';
}

if ($method == 'GET' && !$action) {
    $stmt = $pdo->query("SELECT * FROM projetos");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if (!isset($_SESSION['admin_logado']) || $_SESSION['admin_logado'] !== true) {
    http_response_code(403);
    die(json_encode(["erro" => "Acesso negado. Sessão inválida."]));
}

if ($method == 'POST') {
    require_once 'backend/projects.php';
}
?>