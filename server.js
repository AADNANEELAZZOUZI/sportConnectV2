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


router.on('GET', '/activities/new', async (req, res, params) => {
    try {
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

const activityService = require('./src/services/activityService');

router.on('POST', '/activities', async (req, res, params) => {
    urlencodedParser(req, res, async () => {
        try {
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

            await activityService.createActivity(data);

            res.writeHead(302, { 'Location': '/activities' });
            res.end();

        } catch (error) {
            console.error('Erreur métier / collision :', error.message);
            
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


const eligibilityService = require('./src/services/eligibilityService');

router.on('GET', '/members', async (req, res, params) => {
    try {
        const result = await db.query('SELECT * FROM members');
        const seasonYear = 2026;

        const enrichedMembers = result.rows.map(member => {
            const ageAtDec31 = eligibilityService.calculateAgeAtDec31(member.birth_date, seasonYear);
            const certCheck = eligibilityService.checkMedicalCertificate(member.medical_certificate_date, false);

            return {
                ...member,
                age_at_dec31: ageAtDec31,
                is_certif_valid: certCheck.isValid
            };
        });

        ejs.renderFile(path.join(__dirname, 'views/pages/members.ejs'), { members: enrichedMembers }, (err, str) => {
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





const pricingService = require('./src/services/pricingService');

router.on('GET', '/checkout-test', async (req, res, params) => {
    try {
        const simulationData = {
            basePrice: 100.00,
            isResident: false,
            familyRank: 2,
            quotientFamilial: 500,
            hasPassSport: true
        };

        const calculation = pricingService.computePrice(simulationData);

        ejs.renderFile(path.join(__dirname, 'views/pages/checkout.ejs'), { 
            basePrice: simulationData.basePrice,
            simulation: simulationData,
            calculation: calculation 
        }, (err, str) => {
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
        console.error('Erreur :', error);
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