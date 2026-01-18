// Utilitaires pour la transformation des données des coiffeurs

/**
 * Extrait et normalise les informations d'un coiffeur
 * @param {Object} coiffeur - Données brutes du coiffeur
 * @param {number} index - Index dans le tableau
 * @returns {Object} Coiffeur normalisé
 */
export const normalizeCoiffeurData = (coiffeur, index) => {
  // Extraire les données en fonction de la structure réelle
  const nom = coiffeur.fullName || coiffeur.nom || coiffeur.name || coiffeur.username || 'Coiffeur';
  const specialite = coiffeur.specialty || coiffeur.specialite || coiffeur.role || 'Coiffeur Professionnel';
  const bio = coiffeur.bio || coiffeur.description || 'Aucune biographie disponible.';
  const imageProfil = coiffeur.imageProfil || coiffeur.photo || null;
  const isAvailable = coiffeur.isAvailable !== undefined ? coiffeur.isAvailable : true;
  const rating = coiffeur.rating || 0;
  
  // Gérer les compétences
  let skills = [];
  if (coiffeur.skills) {
    skills = Array.isArray(coiffeur.skills) 
      ? coiffeur.skills 
      : coiffeur.skills.split(',').map(s => s.trim());
  } else if (coiffeur.competences) {
    skills = Array.isArray(coiffeur.competences)
      ? coiffeur.competences
      : coiffeur.competences.split(',').map(s => s.trim());
  } else {
    skills = ['Coupe', 'Coloration', 'Soins'];
  }

  return {
    id: coiffeur.id || index,
    nom,
    specialite,
    bio,
    imageProfil,
    isAvailable,
    rating,
    skills,
    rawData: coiffeur
  };
};
