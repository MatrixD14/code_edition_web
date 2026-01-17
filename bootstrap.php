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

//fontsize do text
$fontsize = Env::get("fontSize", "size");
$fontsize = filter_var($fontsize, FILTER_VALIDATE_INT, ["options" => ["default" => 14]]);

//ativa autocomple
$ativaAutocomple = Env::get("autoComple", "autocomple");
$ativaAutocomple = filter_var($ativaAutocomple, FILTER_VALIDATE_BOOLEAN);

//caminha do Android/Sdk
$sdkPath = Env::get('android', 'sdk_path');
if (!$sdkPath) {
    echo "Digite o caminho do Android SDK no ./.editorConf : </br></br>[android]</br>sdk_path=?";
    throw new RuntimeException("Digite o caminho do Android SDK no ./.editorConf : </br></br>[android]</br>sdk_path=?");
}
//login
require_once 'app/model/login.php';
// define('ROOT_PATH', realpath(__DIR__));

// spl_autoload_register(function ($class) {
//     $paths = [
//         ROOT_PATH . '/controller/',
//         ROOT_PATH . '/model/',
//     ];

//     foreach ($paths as $path) {
//         $file = $path . $class . '.php';
//         if (file_exists($file)) {
//             require_once $file;
//             return;
//         }
//     }
// });

// require_once ROOT_PATH . '/app/model/editorConf.php';
// Env::load(ROOT_PATH . '/.editorConf');

// $htdoc = realpath(ROOT_PATH . Env::get('path_htdoc', '/HTDOC'));
// define('HTDOC', $htdoc ?: '');