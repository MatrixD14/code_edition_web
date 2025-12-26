<!DOCTYPE html>
<html>
<head>
    <title>Android XML Preview</title>
    <style>
        body { background: #222; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .smartphone { 
            width: 360px; height: 640px; background: white; 
            border: 12px solid #000; border-radius: 24px; overflow: hidden; position: relative;
        }
        
    </style>
</head>
<body>
    <div class="smartphone" id="screen">
        <p style="padding: 20px;">Aguardando XML do editor...</p>
    </div>

    <script src="./js/leitor_xml.js"></script>
</body>
</html>