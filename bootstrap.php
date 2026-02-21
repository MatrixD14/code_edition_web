<?php
if (session_status() === PHP_SESSION_NONE) session_start();
ini_set('memory_limit', '256M');
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

require_once 'app/model/editorConf.php';

//carrega as cnfiguração definidas
Env::load(__DIR__ . '/.editorConf');

//onde fica todos os projeto
$htdoc = realpath(__DIR__ . Env::get('path_htdoc', 'HTDOC'));
if (!$htdoc) {
    echo "Pasta   ( /htdoc )  não existe cria uma no diretorio raiz";
    throw new RuntimeException("Path htdoc não existe cria uma no diretorio raiz");
}
define('HTDOC', $htdoc);

//caminha do Android/Sdk
$sdkPath = Env::get('android', 'sdk_path');
if (!$sdkPath) {
    echo "Digite o caminho do Android SDK no ./.editorConf : </br></br>[android]</br>sdk_path=?";
    throw new RuntimeException("Digite o caminho do Android SDK no ./.editorConf : </br></br>[android]</br>sdk_path=?");
}

// CONFIGURAÇÕES DO EDITOR

//fontsize do text
$fontsize = Env::get("editor", "fontSize");
$fontsize = filter_var($fontsize, FILTER_VALIDATE_INT, ["options" => ["default" => 14]]);

//ativa autocomple
$ativaAutocomple = Env::get("editor", "autocomple");
$ativaAutocomple = filter_var($ativaAutocomple, FILTER_VALIDATE_BOOLEAN);

$tabSize = Env::get('editor', 'tabSize');
$tabSize = filter_var(
    $tabSize,
    FILTER_VALIDATE_INT,
    ["options" => ["default" => 1]]
);

$autoIndent = Env::get('editor', 'autoIndent');
$autoIndent = filter_var(
    $autoIndent,
    FILTER_VALIDATE_BOOLEAN
);
///
//login
require_once __DIR__ . '/app/controller/login/auth_login.php';
require_once __DIR__ . '/app/model/login.php';
