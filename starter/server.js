//tuodaan http-moduuli
const http = require('http');

//ladataan node.js:n sisääänrakennettu fs (file system) ja path-moduuli
const fs = require('fs');
const path = require('path');
const { timeStamp } = require('console');


// Määritellään portti ja julkinen hakemisto
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');


// Määritellään MIME-tyypit tiedostopäätteille
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json'
};

// luodaan HTTP-palvelin
const server = http.createServer((req, res) => {
    // Logataan jokainen saapuva pyyntö konsoliin 
    console.log(`${req.method} ${req.url}`);


    //jos tulee virheitä, ne käsitellään try-catch -lohkon avulla
    try {

        // bonus tehtävä: JSON API endpoint
        if (req.url === '/api/data' && req.method === 'GET') {
            const currentDateTime = new Date().toISOString();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(({
                datetime: currentDateTime,
                timeStamp: Date.now()      
            })));
            return; // Lopetetaan käsittely tähän, koska API-vastaus on jo lähetetty
        }   

        //luodaan muuttuja filePath, joka määritellään alla olevien ehtojen perusteella
        let filePath;


        // jos URL on '/', palataan index.html-tiedostosta
        if (req.url === '/') {
            filePath = path.join(PUBLIC_DIR, 'index.html');
        }

        // jos URL on '/about', palataan about.html-tiedostosta
        else if (req.url === '/about') {
            filePath = path.join(PUBLIC_DIR, 'about.html');
        }

        // jos URL on '/contact', palataan contact.html-tiedostosta
        else if (req.url === '/contact') { 
            filePath = path.join(PUBLIC_DIR, 'contact.html');
        }

        //jos URL alkaa '/styles/', palataan styles-kansion sisältä pyydetty CSS-tiedostosta
        else if(req.url.startsWith('/styles/')) {
            // Varmistetaan, että pyydetty tiedosto sijaitsee PUBLIC_DIR:n sisällä
            filePath = path.join(PUBLIC_DIR, req.url);
            // Varmistetaan, että normalizedPath alkaa PUBLIC_DIR:llä
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.startsWith(PUBLIC_DIR)) {
                handle404(res);
                return;
            }
        }

        // Jos URL ei vastaa mitään yllä olevista, palautetaan 404-virhe
        else {
            handle404(res);
            return;
        }
        
        // haetaan tiedostopääte filePath-muuttujasta
        const extname = path.extname(filePath);
        
        // haetaan MIME-tyyppi MIME_TYPES-objektista, oletuksena 'text/html'
        const contentType = MIME_TYPES[extname] || 'text/html';

        // luetaan tiedosto fs.readFile()-metodilla
        fs.readFile(filePath, (err, content) => {
            // Käsitellään mahdolliset virheet
            if (err) {
                // Jos tiedostoa ei löydy, palautetaan 404
                if (err.code === 'ENOENT') {
                    handle404(res);
                    
                } else {
                    // joku muu virhe, palautetaan 500
                    handleServerError(res, err);
                }
            } else {

                //lähetetään onnistunut vastaus selaimelle
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });

        //tuleeko virheitä, ne käsitellään catch-lohkossa
    } catch (error) {
        // Käsittele palvelinvirheet
        handleServerError(res, error);
    }
});


//tehdään funktio, joka hakee 404.html-tiedoston ja lähettää sen vastauksena, jos URL ei löydy
function handle404(res) {
    // luodaan polku 404.html-tiedostoon
    const notFoundPath = path.join(PUBLIC_DIR, '404.html');
     
    // luetaan tiedosto fs.readFile()-metodilla
        fs.readFile(notFoundPath, (err, content) => {
            if (err) {
                // Jos 404.html-tiedostoa ei löydy, palautetaan pelkkä tekstivastaus
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - Page Not Found');
            } else {
                // Jos 404.html löytyy, palautetaan se HTML-muodossa
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(content, 'utf-8');
            }
        });
}

// tehdään funktio, joka hakee 500.html-tiedoston ja lähettää sen vastauksena, jos palvelimella tapahtuu virhe
function handleServerError(res, error) {
    // Logataan virhe konsoliin
    console.error('Server error:', error);

    // luodaan polku 500.html-tiedostoon
    const serverErrorPath = path.join(PUBLIC_DIR, '500.html');

    //yritetään lukea 500.html-tiedosto
    fs.readFile(serverErrorPath, (err, content) => {
        if (err) {
            // Jos 500.html-tiedostoa ei löydy, palautetaan pelkkä tekstivastaus
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 - Internal Server Error');
        } else {
            // Jos 500.html löytyy, palautetaan se HTML-muodossa
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        }
    });
};


// kuunnellaan porttia ja käynnistetään palvelin
server.listen(PORT, () => {
    
    //logataan konsoliin, että palvelin on käynnissä ja ilmoitetaan URL-osoite, josta palvelimeen pääsee käsiksi
    console.log(`Server is running on http://localhost:${PORT}`);


 
});
