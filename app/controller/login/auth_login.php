<?php

class AuthLogin
{
    public static function login()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $user = $_POST['nome'] ?? '';
        $pass = $_POST['senha'] ?? '';

        if ($user === '' || $pass === '') {
            $_SESSION['log_create'] = 'Preencha todos os campos';
            header('Location: /');
            exit;
        }

        if (!User::checkPassword($user, $pass)) {
            $_SESSION['log_create'] = 'Usuário ou senha inválidos';
            header('Location: /');
            exit;
        }

        $_SESSION['nome'] = $user;

        header('Location: /editor');
        exit;
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
