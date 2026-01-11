<?php 
if(session_status()===PHP_SESSION_NONE) session_start();
ini_set('memory_limit', '256M');
ini_set('display_errors', '0');
ini_set('log_errors','1');
error_reporting(E_ALL);

require_once 'model/editorConf.php';
//carrega as cnfiguração definidas
Env::load(__DIR__. '/.editorConf');
//onde fica todos os projeto
$htdoc = realpath(__DIR__ . Env::get('path_htdoc','HTDOC'));
if (!$htdoc) throw new RuntimeException("Path htdoc não existe");
define('HTDOC', $htdoc);
//fontsize do text
$fontsize = Env::get("fontSize","size");
$fontsize = filter_var($fontsize,FILTER_VALIDATE_INT,["options"=>["default"=>14]]);
//ativa autocomple
$ativaAutocomple = Env::get("autoComple","autocomple");
$ativaAutocomple = filter_var($ativaAutocomple, FILTER_VALIDATE_BOOLEAN);
//login
require_once 'model/login.php';