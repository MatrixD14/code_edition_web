<?php 
if(session_status()===PHP_SESSION_NONE) session_start();
ini_set('memory_limit', '256M');
require_once 'model/editorConf.php';
Env::load(__DIR__. '/.editorConf');
require_once 'model/login.php';

$htdoc = realpath(__DIR__ . '/htdoc');
if (!$htdoc)exit("path htdoc não exite");

define('HTDOC', $htdoc);