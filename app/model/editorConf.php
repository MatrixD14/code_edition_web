<?php
class Env
{
    private static array $data = [];
    private static bool $loaded = false;

    public static function load(string $path = __DIR__ . '/.editorConf'): void
    {
        if (self::$loaded) return;
        if (!file_exists($path)) throw new Exception(".editorConf não encontrado");

        $section = '';
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;

            if (preg_match('/^\[(.+)\]$/', $line, $m)) {
                $section = $m[1];
                self::$data[$section] = [];
                continue;
            }

            if (strpos($line, '=') !== false) {
                [$k, $v] = explode('=', $line, 2);
                $k = trim($k);
                $v = trim($v);
                self::$data[$section][$k] = $v;
            }
        }

        self::$loaded = true;
    }

    public static function get(string $section, ?string $key = null, $default = null)
    {
        if (!isset(self::$data[$section])) return $default;
        if ($key === null) return self::$data[$section];
        return self::$data[$section][$key] ?? $default;
    }
}
