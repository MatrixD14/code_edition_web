<?php 
class login{
    public $nome,$senha;
    public function __construct($nome,$senha){
        $this->nome=$nome;
        $this->senha=$senha;
    }
    public function protect(){
        if(!isset($_SESSION['nome'])) die("não nao tem permissão para acessar essa página <a href=\"../../index.php\">sair</a>");
    }
}