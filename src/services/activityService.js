const db = require('../config/db');


async function checkCollision(facilityId, dayOfWeek, startTime, endTime, subZone, excludeActivityId = null) {
    let query = `
        SELECT id, title, start_time, end_time, sub_zone 
        FROM activities 
        WHERE facility_id = $1 
          AND day_of_week = $2 
          AND ($3::time < end_time AND start_time < $4::time)
    `;
    
    const params = [facilityId, dayOfWeek, startTime, endTime];

    if (excludeActivityId) {
        params.push(excludeActivityId);
        query += ` AND id <> $5`;
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
        return false;
    }

    for (const row of result.rows) {
        const existingSubZone = row.sub_zone;
        if (subZone === 'FULL' || existingSubZone === 'FULL' || subZone === existingSubZone) {
            return true;
        }
    }

    return false;
}


async function checkErpCapacity(facilityId, maxCapacity) {
    const result = await db.query('SELECT erp_capacity FROM facilities WHERE id = $1', [facilityId]);
    
    if (result.rows.length === 0) {
        throw new Error("Installation introuvable.");
    }

    const erpCapacity = result.rows[0].erp_capacity;
    return maxCapacity <= erpCapacity;
}


async function createActivity(data) {
    const { title, category, facility_id, day_of_week, start_time, end_time, max_capacity, base_price, sub_zone, requires_strict_certificate } = data;

    const isValidCapacity = await checkErpCapacity(facility_id, max_capacity);
    if (!isValidCapacity) {
        throw new Error("Erreur ERP : La capacité maximale du cours dépasse la capacité autorisée de l'installation.");
    }

    const hasCollision = await checkCollision(facility_id, day_of_week, start_time, end_time, sub_zone || 'FULL');
    if (hasCollision) {
        throw new Error("Erreur de collision : Ce créneau horaire chevauche une autre activité sur cette installation et cette zone.");
    }

    const query = `
        INSERT INTO activities (title, category, facility_id, day_of_week, start_time, end_time, max_capacity, base_price, sub_zone, requires_strict_certificate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    
    const values = [
        title, category, facility_id, day_of_week, start_time, end_time, 
        max_capacity, base_price, sub_zone || 'FULL', requires_strict_certificate || false
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}

module.exports = {
    checkCollision,
    checkErpCapacity,
    createActivity
};