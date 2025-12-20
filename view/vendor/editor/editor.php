<?php
if(session_status()=== PHP_SESSION_NONE)session_start();
require_once '../../../bootstrap.php';
$login=new login("","");
$login->protect();
?><!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="../../css/global.css" />
        <link rel="stylesheet" href="./css/editor.css">
        <link rel="stylesheet" href="./css/color_text.css">
        <link rel="stylesheet" href="./css/terminal_style.css">
        <title>editor</title>
    </head>
    <body >
        <nav class="top">
            <a href="../../../controller/login/logout.php"><?=$_SESSION["nome"]?></a>
            
        </nav>
        <div class="box-editor">
            <div class="path_menu">
                <ul class="menu_top">
                    <li class="file_push_open" title="Abrir Arquivo">📄</li>
                    <li title="Open Projeto">
                        <label for="open_file" id="btn_open_project" style="cursor:pointer;">📁</label>
                    </li> 
                    <li title="Upload Projeto">
                        <label for="upload_projeto" id="btn_upload_projeto" style="cursor:pointer;">⬆️</label>
                        <input type="file" id="upload_projeto" name="file[]" webkitdirectory directory multiple style="display:none;">
                </li>
            </ul>
            <ul class="menu_bottom">
                <li title="Configurações">⚙️</li>
            </ul>
        </div>
        <div id="projects_selector" class="projects-menu hidden">
            <ul id="projects_list"></ul>
        </div>
        <div class="painel_path">
            <div class="mune_select_file_dir">
                <p class="nome_diretory"></p>
                <a id="btn_rename" title="Renomear">✏️</a>
                <a id="criar_file" title="criar file">📄</a>
                <a id="criar_dir" title="criar dir">📁</a>
                <a id="btn-delete" title="Deletar">🗑️</a>
                <a id="salvar" title="Salvar">💾</a>
            </div>
            <div class="path_display">
                <ul>
                    </ul>   
                </div>
            </div>
            <div class="editor_terminal_container">
                <div class="editor-box">
                    <pre id="highlight-layer"><code id="highlight-content"></code></pre>
                    <textarea class="editor" id="code-input" spellcheck="false"></textarea>
                </div>
                <div class="terminal-box">
                    <div class="terminal_top">
                        <button class="terminal_btn">Terminal</button>
                        </div>
                        <div class="terminal-body">
                    <div class="terminal">
                        <div class="terminal-text" id="terminal-output"></div>
                    </div>
                    <div class="terminal_input_button">
                        <input type="text" class="terminal_input" id="terminal-input" placeholder="type a command" />
                    </div>
                </div>
                        </div>
                    </div>
                </div>

        <script src="./js/upload_path_editor.js"></script>
        <script src="./js/list_path_editor.js"></script>
        <script src="./js/highlighter.js"></script>
        <script src="./js/terminal.js"></script>
    </body>
</html>