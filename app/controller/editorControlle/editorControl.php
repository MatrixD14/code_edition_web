<?php
class EditorController
{
    public function index()
    {
        AuthLogin::check();

        if (!HTDOC) die('Pasta HTDOC não configurada');
        

        $fontsize = filter_var(
            Env::get("fontSize","size"),
            FILTER_VALIDATE_INT,
            ["options"=>["default"=>14]]
        );

        $autocomplete = filter_var(
            Env::get("autoComple","autocomple"),
            FILTER_VALIDATE_BOOLEAN
        );

        $sdkPath = Env::get('android', 'sdk_path');
        if (!$sdkPath) die('SDK Android não configurado');
        
    //     require VIEW_PATH . '/editor.php';
    // }
    $htdoc = realpath(__DIR__ . Env::get('path_htdoc','HTDOC'));
if (!$htdoc){
    echo "Pasta   ( /htdoc )  não existe cria uma no diretorio raiz";
    throw new RuntimeException("Path htdoc não existe cria uma no diretorio raiz");
}
define('HTDOC', $htdoc);

//fontsize do text
$fontsize = Env::get("fontSize","size");
$fontsize = filter_var($fontsize,FILTER_VALIDATE_INT,["options"=>["default"=>14]]);

//ativa autocomple
$ativaAutocomple = Env::get("autoComple","autocomple");
$ativaAutocomple = filter_var($ativaAutocomple, FILTER_VALIDATE_BOOLEAN);

//caminha do Android/Sdk
$sdkPath = Env::get('android', 'sdk_path');
if (!$sdkPath){
    echo "Digite o caminho do Android SDK no ./.editorConf : </br></br>[android]</br>sdk_path=?";
   throw new RuntimeException("Digite o caminho do Android SDK no ./.editorConf : </br></br>[android]</br>sdk_path=?");
}
}}