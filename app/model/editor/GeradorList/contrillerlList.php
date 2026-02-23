<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
if (session_status() === PHP_SESSION_NONE) session_start();
require_once '../../../../bootstrap.php';

function voltapagina($sms)
{
    if (ob_get_length()) ob_clean();
    header('Content-Type: text/plain; charset=utf-8');
    echo $sms;
    exit;
}

$VersionAndroid = $_GET['version'] ?? null;
if (!$VersionAndroid) voltapagina("Versão Android não informada");

if (!is_dir($sdkPath)) voltapagina("caminho invalido: $sdkPath");
$platforms = $sdkPath . DIRECTORY_SEPARATOR . 'platforms' . DIRECTORY_SEPARATOR . $VersionAndroid;
if (!is_dir($platforms)) voltapagina("Nenhuma plataforma $VersionAndroid encontrada em $sdkPath/platforms\n");

$jar = $platforms . DIRECTORY_SEPARATOR . 'android.jar';
if (!file_exists($jar))  voltapagina("android.jar não encontrado em $VersionAndroid");
require_once 'lista_java.php';
require_once 'list_xml_layout.php';
require_once 'list_xml_manifest.php';
require_once 'list_xml.php';

voltapagina("Concluído ✔\njava import: " . count($classes) . "\nTags: " . count($widgetClasses) . "\nAtributos: " . count($GLOBAL_attrValueType));
