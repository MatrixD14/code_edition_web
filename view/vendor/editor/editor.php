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
        <link rel="stylesheet" href="./css/confing.css">
        <link rel="stylesheet" href="./css/autocomplete.css">
        <link rel="stylesheet" href="./css/menu_xml.css">
        <title>editor</title>
    </head>
    <body >
        <nav class="top">
            <a href="../../../controller/login/logout.php"><?=$_SESSION["nome"]?></a>
            <a id="btn_fullscreen" title="Tela Cheia (shift+F)">⛶</a>
        </nav>
        <div class="box-editor">
            <div class="path_menu">
                <ul class="menu_top">
                    <li class="file_push_open" title="Abrir Arquivo (ctrl+b)">📄</li>
                    <li title="Open Projeto">
                        <label for="open_file" id="btn_open_project" style="cursor:pointer;">📁</label>
                    </li> 
                    <li title="Upload Projeto">
                        <label for="upload_projeto" id="btn_upload_projeto" style="cursor:pointer;">⬆️</label>
                        <input type="file" id="upload_projeto" name="file[]" webkitdirectory directory multiple style="display:none;">
                    </li>
                    <li >
                        <a id="btn-java-import">📥</a>
                    </li>
                </ul>
            <ul class="menu_bottom">
                <li title="Configurações" class="config_settings">⚙️</li>
            </ul>
        </div>
        <div id="projects_selector" class="projects-menu hidden">
            <h3>Projetos Recentes</h3>
            <hr>
            <ul id="projects_list"></ul>
        </div>
        <div class="painel-config hidden" id="painel-config">
            <h3 >Configurações</h3>
            <hr>
            <label for="font_size">Tamanho da fonte:</label>
            <input type="number" id="font_size" name="font_size" min="10" max="35">
            <br><br>
            <label for="painel_tag">Painel de tag:</label>
            <input type="checkbox" id="painel_tag" name="painel_tag">
            <br><br>
            <button id="close_config" class>Enter</button>
        </div>
        <div id="xml-quick" class="hidden">
            <div class="xml-quick-box"></div>
        </div>
        <div class="painel_path">
            <div class="mune_select_file_dir">
                <p class="nome_diretory"></p>
                <a id="btn_rename" title="Renomear (F2)">✏️</a>
                <a id="criar_file" title="criar file (shift+M)">📄</a>
                <a id="criar_dir" title="criar dir (shift+N)">📁</a>
                <a id="btn-delete" title="Deletar (Delete)">🗑️</a>
                <a id="salvar" title="Salvar (ctrl+s)">💾</a>
                <a id="btn-open-preview" title="Preview Android Layout">📱</a>
            </div>
            <div class="path_display">
                <ul>
                    </ul>   
                </div>
            </div>

            <div class="editor_terminal_container">
                <div class="editor-box">
                    <div id="line-numbers">1</div>
                    <div class="editor-wrapper">
                        <pre id="highlight-layer"><code id="highlight-content"></code></pre>
                        <textarea class="editor" id="code-input" spellcheck="false"></textarea>
                    </div>
                    <aside id="xml-help">
                        <div id="xml-context"></div>
                        <ul id="xml-list"></ul>
                      </aside>
                </div>
                <div class="terminal-box">
                    <div class="terminal_top">
                        <button class="terminal_btn" title="Terminal (ctrl+shift+'')">Terminal</button>
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
               
                <script>
                    window.EDITOR_CONFIG = {
                        autocomplete: <?= json_encode($ativaAutocomple) ?>,
                        fontsizevalue: <?= json_encode($fontsize)?>
                    };
                    <?php if(isset($_SESSION["list_java"])){ ?>
                        alert(<?= json_encode($_SESSION["list_java"]) ?>);
                    <?php 
                        unset($_SESSION["list_java"]);
                    }?>
                </script>
                <script src="./js/variaveis.js"></script>
                <script src="./js/autocomplete/list_tag_xml.js"></script>
                <script src="./js/autocomplete/list_base_java.js"></script>
                <script src="./js/autocomplete/list_lib_java.js"></script>
                <script src="./js/conf_system.js"></script>
                <script src="./js/highlighter.js"></script>
                <script src="./js/list_path_editor.js"></script>
                <script src="./js/upload_path_editor.js"></script>
                <script src="./js/autocomplete/list_java_lib.js"></script>
                <script src="./js/terminal.js"></script>
                <script src="./js/fullscreen.js"></script>
                <script src="./js/preview/preview.js"></script>
                <script src="../preview/js/variaveis.js"></script>
                <script src="./js/autocomplete/function_java.js"></script>
                <script src="./js/autocomplete/function_xml.js"></script>
                <script src="./js/autocomplete/autocomplet.js"></script>
      </body>
</html>