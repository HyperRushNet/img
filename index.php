<?php
if(isset($_GET['url'])){
    $url = $_GET['url'];
    
    // Gebruik file_get_contents om de HTML van de opgegeven URL te verkrijgen
    $html = file_get_contents($url);
    
    // Verwijder HTML-tags en extraheren alleen de tekst
    $text = strip_tags($html);

    // Toon de tekst op de pagina
    echo "<pre>$text</pre>";
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Externe Pagina Tekst Extractor</title>
</head>
<body>
    <h1>Webpagina Tekst Extractor</h1>
    <p>Voer een URL in van de webpagina waarvan je tekst wilt extraheren:</p>
    
    <form method="get" action="">
        <input type="text" name="url" placeholder="Voer URL in" style="width: 300px;" />
        <button type="submit">Haal tekst op</button>
    </form>

    <div>
        <h2>Gekregen Tekst:</h2>
        <p>De tekst van de opgegeven URL wordt hieronder weergegeven:</p>
        <pre><?php
        // Als de 'url' parameter is ingesteld, voer deze actie uit
        if(isset($_GET['url'])){
            echo $text;
        }
        ?></pre>
    </div>
</body>
</html>
