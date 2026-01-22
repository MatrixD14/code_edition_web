<?php

class AuthLogin
{
    public static function login()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        function log_error($log)
        {
            $_SESSION["log_create"] = $log;
            header('location: /');
            exit;
        }
        $user = $_POST['nome'] ?? '';
        $pass = $_POST['senha'] ?? '';
        if (isset($user, $pass)) {
            if (strlen($user) == 0) log_error("preencha o campo nome");
            else if (strlen($pass) == 0) log_error("preenchao campo senha");
            else {
                if (!User::checkPassword($user, $pass)) {
                    $_SESSION['log_create'] = 'Usuário ou senha inválidos';
                    header('Location: /');
                    exit;
                }
                $_SESSION['nome'] = $user;
                header('Location: /editor');
                exit;
            }
        }
    }


    public static function logout()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        session_destroy();
        header('Location: /');
        exit;
    }

    public static function check()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['nome'])) {
            header('Location: /');
            exit;
        }
    }
}
