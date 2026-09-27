/**
 * @param {Date|string} 
 * @param {number}
 */
function calculateAgeAtDec31(birthDate, seasonYear) {
    const dob = new Date(birthDate);
    return seasonYear - dob.getFullYear();
}

/**
 * @param {Date|string} 
 * @param {boolean} 
 */
function checkMedicalCertificate(certificateDate, requiresStrictCertificate) {
    if (!certificateDate) {
        return { isValid: false, status: 'medical_non_compliant', message: 'Certificat manquant' };
    }

    const certDate = new Date(certificateDate);
    const now = new Date();
    
    const validityYears = requiresStrictCertificate ? 1 : 3;
    
    const expiryDate = new Date(certDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);

    if (now > expiryDate) {
        return { 
            isValid: false, 
            status: 'medical_non_compliant', 
            message: `Certificat médical périmé depuis le ${expiryDate.toLocaleDateString('fr-FR')}` 
        };
    }

    return { 
        isValid: true, 
        status: 'confirmed', 
        message: 'Certificat valide' 
    };
}

module.exports = {
    calculateAgeAtDec31,
    checkMedicalCertificate
};