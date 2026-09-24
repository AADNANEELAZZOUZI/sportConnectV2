const http = require('http');
const findMyWay = require('find-my-way');

const router = findMyWay();

router.on('GET', '/activities', (req, res, params) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Liste de toutes les activités');
});

router.on('GET', '/activities/:id', (req, res, params) => {
    const activityId = params.id; // Récupéré automatiquement par le routeur
    console.log(`ID de l'activité demandé : ${activityId}`);

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Affichage de l'activité avec l'ID : ${activityId}`);
});

router.on('GET', '*', (req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Page non trouvée (404)');
});

const server = http.createServer((req, res) => {
    router.lookup(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});