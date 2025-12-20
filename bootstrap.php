<?php 
if(session_status()===PHP_SESSION_NONE) session_start();
ini_set('memory_limit', '256M');
require_once 'model/editorConf.php';
Env::load(__DIR__. '/.editorConf');
require_once 'model/login.php';
define('HTDOC', realpath(__DIR__ . '/htdoc') );
