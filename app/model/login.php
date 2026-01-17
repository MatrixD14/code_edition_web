<?php
class login
{
    public $nome, $senha;
    public function __construct($nome, $senha)
    {
        $this->nome = $nome;
        $this->senha = $senha;
    }
    public function protect()
    {
        if (!isset($_SESSION['nome'])) die("não nao tem permissão para acessar essa página <a href=\"../../login.php\">sair</a>");
    }
}
// class User
// {
//     public static function checkPassword(string $user, string $pass): bool
//     {
//         $accounts = Env::get('accounts');

//         if (!isset($accounts[$user])) return false;
//         return $accounts[$user] === $pass;
//     }
// }