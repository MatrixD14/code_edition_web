<?php
if(session_status()===PHP_SESSION_NONE) session_start();
ob_start();
require_once '../../bootstrap.php';
function log_error($log){
    $_SESSION["log_create"]=$log;
    header('location: ../../view/index.php');
    exit;
}
$nome= $_POST["nome"];
$PassWord= $_POST["senha"];
$accounts=Env::get('accounts');
if(isset($nome,$PassWord)){
    if(strlen($nome)==0) log_error("preencha o campo nome");
    else if(strlen($PassWord)==0) log_error("preenchao campo senha");
    else{
            if(isset($accounts[$nome]) && $PassWord===$accounts[$nome]){
                if(!isset($_SESSION)) session_start();
                $_SESSION["nome"]=$nome;
                header('location: ../../../../view/vendor/editor/editor.php');
                exit;
            }else log_error("senha incorreta");
    }
}
ob_end_flush();