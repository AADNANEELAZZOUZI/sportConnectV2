/**
 */
function computePrice({ basePrice, isResident, familyRank, quotientFamilial, hasPassSport }) {
    let priceCents = Math.round(parseFloat(basePrice) * 100);

    if (!isResident) {
        priceCents = Math.round(priceCents * 1.35);
    }

    let degressiviteRate = 0;
    if (familyRank === 2) {
        degressiviteRate = 0.15;
    } else if (familyRank >= 3) {
        degressiviteRate = 0.30;
    }
    priceCents = Math.round(priceCents * (1 - degressiviteRate));

    let qfDiscountRate = 0;
    if (quotientFamilial < 600) {
        qfDiscountRate = 0.40;
    } else if (quotientFamilial <= 900) {
        qfDiscountRate = 0.20;
    }
    priceCents = Math.round(priceCents * (1 - qfDiscountRate));

    if (hasPassSport) {
        priceCents -= 5000;
    }

    const minPriceCents = 1500;
    if (priceCents < minPriceCents) {
        priceCents = minPriceCents;
    }

    const e2 = Math.round(priceCents * 0.30);
    const e3 = Math.round(priceCents * 0.30);
    const e1 = priceCents - e2 - e3;

    return {
        totalCents: priceCents,
        totalEuros: priceCents / 100,
        installments: {
            e1: e1 / 100,
            e2: e2 / 100,
            e3: e3 / 100
        }
    };
}

module.exports = {
    computePrice
};