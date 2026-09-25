const http = require('http');
const path = require('path');
const ejs = require('ejs');
const findMyWay = require('find-my-way');
const db = require('./src/config/db');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const router = findMyWay();

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

        ejs.renderFile(path.join(__dirname, 'views/pages/activity-detail.ejs'), { activity: result.rows[0] }, (err, str) => {
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

// Route GET /facilities : Affiche la liste des installations sportives (EJS)
router.on('GET', '/facilities', async (req, res, params) => {
    try {
        const result = await db.query('SELECT * FROM facilities');
        
        ejs.renderFile(path.join(__dirname, 'views/pages/facilities.ejs'), { facilities: result.rows }, (err, str) => {
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


// Route GET /activities/new : Affiche le formulaire de création d'activité
router.on('GET', '/activities/new', async (req, res, params) => {
    try {
        // On récupère les installations pour les lister dans le select du formulaire
        const facilitiesResult = await db.query('SELECT * FROM facilities');
        
        ejs.renderFile(path.join(__dirname, 'views/pages/activity-form.ejs'), { facilities: facilitiesResult.rows, error: null }, (err, str) => {
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

// Route POST /activities : Traite l'ajout d'une activité via le service métier
const activityService = require('./src/services/activityService');

router.on('POST', '/activities', async (req, res, params) => {
    // Utilisation du middleware body-parser pour les requêtes POST
    urlencodedParser(req, res, async () => {
        try {
            // Récupération des données du formulaire POST
            const data = {
                title: req.body.title,
                category: req.body.category,
                facility_id: parseInt(req.body.facility_id),
                day_of_week: parseInt(req.body.day_of_week),
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                max_capacity: parseInt(req.body.max_capacity),
                base_price: parseFloat(req.body.base_price),
                sub_zone: req.body.sub_zone || 'FULL',
                requires_strict_certificate: req.body.requires_strict_certificate === 'on'
            };

            // Appel du service (vérifie les collisions et la jauge ERP automatiquement)
            await activityService.createActivity(data);

            // Redirection vers la liste des activités si tout est ok
            res.writeHead(302, { 'Location': '/activities' });
            res.end();

        } catch (error) {
            console.error('Erreur métier / collision :', error.message);
            
            // En cas d'erreur (collision ou dépassement ERP), on réaffiche le formulaire avec l'erreur
            const facilitiesResult = await db.query('SELECT * FROM facilities');
            
            ejs.renderFile(path.join(__dirname, 'views/pages/activity-form.ejs'), { 
                facilities: facilitiesResult.rows, 
                error: error.message 
            }, (err, str) => {
                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(str);
            });
        }
    });
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