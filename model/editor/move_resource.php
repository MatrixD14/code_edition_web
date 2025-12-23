<?php
require_once '../../bootstrap.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$origem = $data['origem'];
$destinoDir = $data['destino'];

$nomeBase = basename($origem);
$novoPath = $destinoDir . DIRECTORY_SEPARATOR . $nomeBase;

if (rename($origem, $novoPath)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Não foi possível mover o arquivo.']);
}