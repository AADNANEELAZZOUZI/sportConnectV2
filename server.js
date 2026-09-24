const http = require('http');
const path = require('path');
const ejs = require('ejs');
const findMyWay = require('find-my-way');
const db = require('./src/config/db');

// 1. On initialise le routeur ICI en premier
const router = findMyWay();

// 2. Ensuite seulement, on définit les routes
router.on('GET', '/activities', async (req, res, params) => {
    try {
        const result = await db.query('SELECT * FROM activities');
        
        ejs.renderFile(path.join(__dirname, 'views/pages/activities.ejs'), { activities: result.rows }, (err, str) => {
            if (err) {
                console.error('Erreur EJS :', err);
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Erreur de rendu de la vue');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(str);
        });
    } catch (error) {
        console.error('Erreur SQL :', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erreur serveur interne');
    }
});

router.on('GET', '/activities/:id', async (req, res, params) => {
    try {
        const activityId = params.id;
        const result = await db.query('SELECT * FROM activities WHERE id = $1', [activityId]);
        
        if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Activité non trouvée');
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.rows[0], null, 2));
    } catch (error) {
        console.error('Erreur SQL :', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erreur serveur interne');
    }
});

router.on('GET', '*', (req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Page non trouvée (404)');
});

const server = http.createServer((req, res) => {
    router.lookup(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});