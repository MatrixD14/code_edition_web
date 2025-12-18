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
    <link rel="stylesheet" href="./editor.css">
    <title>editor</title>
</head>
<body >
    <nav class="top">
        <a href="../../../controller/login/logout.php">logout</a>
      
    </nav>
    <div class="box-editor">
        <div class="path_menu">
            <ul class="menu_top">
                <li class="file_push_open">📄</li>
                <li>💾</li>
                <li>
                    <label for="open_file" style="cursor:pointer;">📁</label>
                    <input type="file" id="open_file" name="open_file" style="display:none;">
                </li> 
            </ul>
            <ul class="menu_bottom">
                <li>⚙️</li>
            </ul>
        </div>
        <div class="painel_path">
            <div class="mune_select_file_dir">
                <p class="nome_diretory">file</p>
                <a id="criar_file">📄</a>
                <a id="criar_dir">📁</a>
                <a id="salvar">💾</a>
            </div>
            <div class="path_display">
                <ul>
                    <li>path1</li>
                    <li>path2</li>
                    <li>path3</li>
                    <li>path4</li>
                    <li>path5</li>
                </ul>   
            </div>
        </div>
        <div class="editor_terminal_container">
            <div class="editor-box">
                <textarea name="editor" class="editor"id=""></textarea>
            </div>
            <div class="terminal-box">
                <div class="terminal_top">
                    <button class="terminal_btn">Terminal</button>
                </div>
                <div class="terminal">
                    <textarea  readonly name="terminal" class="terminal-text" id="">test</textarea>
                    <div class="terminal_input_button">
                        <input type="text" name="command" class="terminal_input" placeholder="type a command" />
                        <input type="submit" class="terminal_submit" value="Send" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        let display_terminal=document.querySelector('.terminal'),
            terminal_toggle=document.querySelector('.terminal_btn'),
            painel_path=document.querySelector('.painel_path'),
            file_push_open=document.querySelector('.file_push_open');
        terminal_toggle.addEventListener('click', () => {
            display_terminal.style.display = display_terminal.style.display === 'none'? 'block': 'none';
        });
        file_push_open.addEventListener('click', () => {
            painel_path.style.display = painel_path.style.display === 'none' ? 'block' : 'none';
        }); 
    </script>
    </body>
</html>
