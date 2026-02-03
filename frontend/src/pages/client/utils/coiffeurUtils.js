/**
 * Utility functions for handling coiffeur (hairdresser) data
 */

/**
 * Normalizes coiffeur data from API response to consistent format
 * @param {Object} coiffeur - Raw coiffeur data from API
 * @param {number} index - Optional index for default values
 * @returns {Object} Normalized coiffeur data
 */
export const normalizeCoiffeurData = (coiffeur, index = 0) => {
  // Helper function to parse specialities from database string format
  const parseSpecialities = (specialities) => {
    if (!specialities) return [];
    
    // If it's already an array, return as is
    if (Array.isArray(specialities)) return specialities;
    
    // If it's a string like "{COLORISTE,BARBIER,MAQUILLEUR,MANICURE}"
    if (typeof specialities === 'string' && specialities.startsWith('{') && specialities.endsWith('}')) {
      try {
        // Remove braces and split by comma
        const content = specialities.slice(1, -1);
        return content.split(',').filter(item => item.trim() !== '');
      } catch (e) {
        console.error('Error parsing specialities:', e);
        return [];
      }
    }
    
    // If it's a regular string, split by comma
    if (typeof specialities === 'string') {
      return specialities.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    
    return [];
  };

  // Default values for missing fields
  const defaults = {
    id: coiffeur.id || `coiffeur-${index}`,
    firstName: coiffeur.firstName || coiffeur.prenom || 'Coiffeur',
    lastName: coiffeur.lastName || coiffeur.nom || '',
    fullName: coiffeur.fullName || coiffeur.nomComplet || 
      `${coiffeur.firstName || coiffeur.prenom || ''} ${coiffeur.lastName || coiffeur.nom || ''}`.trim(),
    email: coiffeur.email || '',
    phone: coiffeur.phone || coiffeur.telephone || '',
    photo: coiffeur.photo || coiffeur.photoUrl || coiffeur.image || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(coiffeur.firstName || coiffeur.prenom || 'Coiffeur')}&background=6366f1&color=fff`,
    specialities: parseSpecialities(coiffeur.specialties || coiffeur.specialites || []),
    bio: coiffeur.bio || coiffeur.description || coiffeur.biographie || '',
    rating: coiffeur.rating || coiffeur.note || 0,
    reviewCount: coiffeur.reviewCount || coiffeur.nombreAvis || 0,
    experience: coiffeur.experience || coiffeur.anneesExperience || 0,
    isAvailable: coiffeur.isAvailable !== undefined ? coiffeur.isAvailable : true,
    services: coiffeur.services || [],
    languages: coiffeur.languages || coiffeur.langues || ['Français'],
    certifications: coiffeur.certifications || coiffeur.certificats || [],
    workingHours: coiffeur.workingHours || coiffeur.horairesTravail || {},
    socialMedia: coiffeur.socialMedia || coiffeur.reseauxSociaux || {
      instagram: '',
      facebook: '',
      linkedin: ''
    }
  };

  // Merge with provided data, overriding defaults
  return {
    ...defaults,
    ...coiffeur,
    // Ensure fullName is always properly formatted
    fullName: coiffeur.fullName || coiffeur.nomComplet || defaults.fullName,
    // Ensure photo is always a valid URL
    photo: coiffeur.photo || coiffeur.photoUrl || coiffeur.image || defaults.photo,
    // Ensure specialities are properly parsed - check both field names
    specialities: parseSpecialities(coiffeur.specialties || coiffeur.specialites || defaults.specialities)
  };
};

/**
 * Formats coiffeur name for display
 * @param {Object} coiffeur - Coiffeur data
 * @returns {string} Formatted name
 */
export const formatCoiffeurName = (coiffeur) => {
  if (!coiffeur) return '';
  
  if (coiffeur.fullName) {
    return coiffeur.fullName;
  }
  
  const firstName = coiffeur.firstName || coiffeur.prenom || '';
  const lastName = coiffeur.lastName || coiffeur.nom || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName || lastName || 'Coiffeur';
};

/**
 * Gets coiffeur rating display
 * @param {Object} coiffeur - Coiffeur data
 * @returns {Object} Rating information
 */
export const getCoiffeurRating = (coiffeur) => {
  const rating = coiffeur.rating || coiffeur.note || 0;
  const reviewCount = coiffeur.reviewCount || coiffeur.nombreAvis || 0;
  
  return {
    rating: Number(rating.toFixed(1)),
    reviewCount,
    hasReviews: reviewCount > 0,
    displayText: reviewCount > 0 ? `${rating.toFixed(1)} (${reviewCount} avis)` : 'Pas encore d\'avis'
  };
};

/**
 * Checks if coiffeur is available for booking
 * @param {Object} coiffeur - Coiffeur data
 * @returns {boolean} Availability status
 */
export const isCoiffeurAvailable = (coiffeur) => {
  if (coiffeur.isAvailable === false) {
    return false;
  }
  
  // Additional availability checks could be added here
  // For example, checking working hours, current schedule, etc.
  
  return true;
};

/**
 * Formats coiffeur specialities for display
 * @param {Array} specialities - Array of specialities
 * @returns {string} Formatted specialities string
 */
export const formatSpecialities = (specialities = []) => {
  if (!Array.isArray(specialities) || specialities.length === 0) {
    return 'Services généraux';
  }
  
  return specialities.slice(0, 3).join(', ') + 
    (specialities.length > 3 ? ` et ${specialities.length - 3} autres` : '');
};

/**
 * Generates coiffeur avatar URL
 * @param {Object} coiffeur - Coiffeur data
 * @param {number} size - Avatar size
 * @returns {string} Avatar URL
 */
export const generateCoiffeurAvatar = (coiffeur, size = 200) => {
  const name = formatCoiffeurName(coiffeur);
  
  if (coiffeur.photo && coiffeur.photo !== '') {
    return coiffeur.photo;
  }
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=6366f1&color=fff&bold=true`;
};
