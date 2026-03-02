<?php
if ($action === 'delete' && $id) {
    $stmt = $pdo->prepare("DELETE FROM projetos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["sucesso" => true]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if ($id) {
    $imagem_db = $data->imagem ?? null;
    $categoria_db = $data->categoria ?? 'Maker';
    $galeria_db = null;

    if ($imagem_db && strpos($imagem_db, 'data:image') === 0) {
        if (strlen($imagem_db) > 3145728) {
            http_response_code(413);
            die(json_encode(["erro" => "A imagem principal passa de 2MB."]));
        }
        $parts = explode(";base64,", $imagem_db);
        $imagem_decodificada = base64_decode($parts[1]);
        $info_imagem = @getimagesizefromstring($imagem_decodificada);
        if ($info_imagem === false) {
            http_response_code(415);
            die(json_encode(["erro" => "Arquivo malicioso na capa."]));
        }
        $extensao = explode('/', $info_imagem['mime'])[1];
        if (!in_array($extensao, ['png', 'jpeg', 'jpg', 'gif', 'webp'])) {
            http_response_code(415);
            die(json_encode(["erro" => "Formato de capa inválido."]));
        }
        if (!file_exists('uploads')) mkdir('uploads', 0777, true);
        $nome_arquivo = 'uploads/projeto_' . $id . '_' . time() . '.' . $extensao;
        file_put_contents($nome_arquivo, $imagem_decodificada);
        $imagem_db = $nome_arquivo; 
    }

    if (isset($data->galeria) && is_array($data->galeria)) {
        $nova_galeria = [];
        foreach ($data->galeria as $idx => $img_item) {
            if (strpos($img_item, 'data:image') === 0) {
                if (strlen($img_item) > 3145728) continue;
                $parts = explode(";base64,", $img_item);
                $img_decodificada = base64_decode($parts[1]);
                $info = @getimagesizefromstring($img_decodificada);
                if ($info === false) continue;
                $ext = explode('/', $info['mime'])[1];
                if (!in_array($ext, ['png', 'jpeg', 'jpg', 'gif', 'webp'])) continue;
                if (!file_exists('uploads')) mkdir('uploads', 0777, true);
                $nome_arq = 'uploads/galeria_' . $id . '_' . time() . '_' . $idx . '.' . $ext;
                file_put_contents($nome_arq, $img_decodificada);
                $nova_galeria[] = $nome_arq;
            } else {
                $nova_galeria[] = $img_item;
            }
        }
        $galeria_db = json_encode($nova_galeria);
    }

    $stmt = $pdo->prepare("UPDATE projetos SET nome = ?, descricao = ?, montagem = ?, codigo = ?, imagem = ?, categoria = ?, galeria = ? WHERE id = ?");
    $stmt->execute([$data->nome, $data->descricao, $data->montagem, $data->codigo, $imagem_db, $categoria_db, $galeria_db, $id]);
    
    $stmt = $pdo->prepare("SELECT * FROM projetos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
} else {
    $montagem = "<p>(passo a passo vazio)</p>";
    $codigo = "// Insira o código do projeto aqui...";
    $categoria = isset($data->categoria) ? $data->categoria : 'Maker';

    $stmt = $pdo->prepare("INSERT INTO projetos (nome, descricao, montagem, codigo, imagem, categoria, galeria) VALUES (?, ?, ?, ?, NULL, ?, NULL)");
    $stmt->execute([$data->nome, $data->descricao, $montagem, $codigo, $categoria]);
    
    echo json_encode([
        "id" => $pdo->lastInsertId(), "nome" => $data->nome, "descricao" => $data->descricao,
        "montagem" => $montagem, "codigo" => $codigo, "imagem" => null, "categoria" => $categoria, "galeria" => null
    ]);
}
?>