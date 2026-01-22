<?php
class User
{
    public static function checkPassword(string $user, string $pass): bool
    {
        $accounts = Env::get('accounts');

        if (!is_array($accounts))
            return false;

        $user = trim($user);
        $pass = trim($pass);

        if (!isset($accounts[$user])) return false;
        return trim($accounts[$user]) === $pass;
    }
}
