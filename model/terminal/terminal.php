<?php
require_once '../../bootstrap.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$command = $data['command'] ?? '';
$currentDir = !empty($data['cwd']) ? $data['cwd'] : realpath(HTDOC);
if (empty($command)) exit;

$danger_patterns = ['rm -rf /', 'rm -rf *', 'mkfs', ':(){ :|:& };:', '> /dev/sda'];

$forbidden_executables = ['sudo', 'apt', 'su', 'shutdown', 'reboot', 'chmod', 'chown', 'ufw','dd','mkfs','nano','vim','vi','less','more','top','htop','watch','php -S','node','npm','yarn','python -m','serve','http-server','sleep',];

$forbidden_paths = ['/etc', '/bin', '/usr', '/var', '/root', '/boot', '/proc', '/sys'];

$subCommands = preg_split('/(&&|\|\||;|\|)/', $command);
foreach ($subCommands as $sub) {
    $sub = trim($sub);
    if (empty($sub)) continue;

foreach ($danger_patterns as $pattern) {
        if (stripos($sub, $pattern) !== false) {
            echo json_encode(['output' => "❌ Bloqueado: Padrão destrutivo detectado.", 'newCwd' => $currentDir]);
            exit;
        }
    }

$parts = preg_split('/\s+/', $sub);
    $executable = strtolower($parts[0]);

    if (in_array($executable, $forbidden_executables)) {
        echo json_encode(['output' => "❌ Proibido: O comando '$executable' não é permitido.", 'newCwd' => $currentDir]);
        exit;
    }
}

if (preg_match('/^cd\s+(.+)$/', $command, $matches)) {
    $target = trim($matches[1]);
    chdir($currentDir);
    $newPath = realpath($target);
    $rootPath = realpath(HTDOC);

    if (!$newPath || strpos($newPath, $rootPath) !== 0) {
        echo json_encode(['output' => "⚠️ Acesso Negado: Fora do escopo do projeto.", 'newCwd' => $currentDir]);
        exit;
    }

    if (!is_dir($newPath)) {
        echo json_encode(['output' => "❌ Erro: '$target' não é um diretório.", 'newCwd' => $currentDir]);
        exit;
    }
    echo json_encode(['output' => '', 'newCwd' => $newPath]);
    exit;
}

chdir($currentDir);

$descriptorspec = [
    1 => ["pipe", "w"], 
    2 => ["pipe", "w"] 
];

$process = proc_open($command, $descriptorspec, $pipes, $currentDir);

$output = '';

if (is_resource($process)) {
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);

    $start = time();

    while (true) {
        $output .= stream_get_contents($pipes[1]);
        $output .= stream_get_contents($pipes[2]);

        if (time() - $start > 2) {
            proc_terminate($process);
            $output .= "\n⏱️ Processo finalizado por tempo limite.";
            break;
        }

        $status = proc_get_status($process);
        if (!$status['running']) break;

        usleep(50000);
    }

    proc_close($process);
}

$rootPath = realpath(HTDOC);
$currentPath = getcwd();

$displayPath = str_replace($rootPath, 'htdocs', $currentPath);
if ($relativePath === $currentPath) {
    $relativePath = 'htdocs';
}
echo json_encode([
    'output' => trim($output) ?: "Concluído.",
    'newCwd' => $currentPath, 
    'relativeCwd' => $displayPath 
]);