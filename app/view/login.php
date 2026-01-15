<?php 
// defined('APP') or die('Acesso negado');
if(session_status()=== PHP_SESSION_NONE)session_start();?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," type="image/x-icon">
    <link rel="stylesheet" href="./css/global.css" />
    <link rel="stylesheet" href="./css/component/button.css" />
    <title>login</title>
  </head>
  <body class="body-center">
    <div class="center box-border">
      <h1 class="h1-center">logar na conta</h1>
      <div class="center">
      <p style="color: red;">
      <?php
      if(isset($_SESSION["log_create"])){ 
        echo $_SESSION["log_create"];
        session_destroy();
      }
      ?>
      </p>
        <form action="../controller/login/login.php" method="post">
        <!-- <form action="/login" method="post"> -->
          <label for="nome">nome</label><br />
          <input type="text" name="nome" /><br />
          <label for="senha">senha</label><br />
          <input type="password" name="senha" /><br /><br />
          <div class="box-center">
            <input type="submit" value="enter" class="bt-enter" />
            <p></p>
          </div>
        </form>
      </div>
    </div>
  </body>
</html>
