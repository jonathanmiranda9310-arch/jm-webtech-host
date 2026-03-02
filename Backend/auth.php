<?php
if ($action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    $email_digitado = isset($data->email) ? strtolower(trim($data->email)) : '';
    $senha_digitada = isset($data->senha) ? trim($data->senha) : '';

    if ($email_digitado === strtolower($admin_email) && $senha_digitada === $admin_pass) {
        $_SESSION['admin_logado'] = true;
        echo json_encode(["sucesso" => true]);
    } else {
        http_response_code(401);
        echo json_encode(["erro" => "E-mail ou senha incorretos."]);
    }
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(["sucesso" => true]);
    exit;
}

if ($action === 'check_auth') {
    echo json_encode(["logado" => isset($_SESSION['admin_logado'])]);
    exit;
}
?>