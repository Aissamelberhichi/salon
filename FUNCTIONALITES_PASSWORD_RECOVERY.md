# Fonctionnalités de Récupération de Mot de Passe

## Pages Frontend

### 1. ForgotPassword.jsx
**Fonctionnalité :** Demande de réinitialisation de mot de passe

**Composants :**
- Formulaire avec champ email
- Validation email requise
- Bouton d'envoi avec état de chargement
- Messages d'erreur et de succès
- Lien de retour vers la connexion

**État :**
- `email` : Email de l'utilisateur
- `loading` : État de chargement pendant l'envoi
- `error` : Message d'erreur
- `success` : Message de succès

**Fonctionnement :**
1. Utilisateur entre son email
2. Appel API `authAPI.requestPasswordReset({ email })`
3. Affiche message de succès si email envoyé
4. Ne révèle pas si l'email existe ou pas (sécurité)

### 2. ResetPassword.jsx
**Fonctionnalité :** Réinitialisation du mot de passe avec token

**Composants :**
- Formulaire avec nouveau mot de passe et confirmation
- Validation complexe du mot de passe
- Token récupéré depuis les paramètres URL
- Messages d'erreur et de succès
- Redirection automatique vers login après succès

**État :**
- `newPassword` : Nouveau mot de passe
- `confirmPassword` : Confirmation du mot de passe
- `loading` : État de chargement
- `error` : Message d'erreur
- `success` : Message de succès

**Validation du mot de passe :**
- Longueur : 8-128 caractères
- Au moins une lettre minuscule
- Au moins une lettre majuscule
- Au moins un chiffre
- Au moins un caractère spécial (@$!%*?&)
- Correspondance entre les deux champs

**Fonctionnement :**
1. Récupère le token depuis l'URL (?token=xxx)
2. Valide le token présent
3. Valide le nouveau mot de passe
4. Appel API `authAPI.resetPassword({ token, newPassword })`
5. Redirection vers login après 2 secondes

## Backend

### 1. Email Controller (email.controller.js)

#### `requestPasswordReset(req, res)`
- **Endpoint :** POST /email/request-password-reset
- **Paramètre :** `{ email }`
- **Validation :** Email requis
- **Fonctionnement :**
  - Vérifie si l'email existe (ne révèle pas s'il n'existe pas)
  - Génère un token de réinitialisation
  - Stocke le token avec expiration (1 heure)
  - Envoie email de réinitialisation
- **Réponse :** Message de succès

#### `resetPassword(req, res)`
- **Endpoint :** POST /email/reset-password
- **Paramètres :** `{ token, newPassword }`
- **Validation :** Token et mot de passe requis
- **Validation mot de passe :**
  - Longueur 8-128 caractères
  - Lettre minuscule requise
  - Lettre majuscule requise
  - Chiffre requis
  - Caractère spécial requis (@$!%*?&)
- **Fonctionnement :**
  - Vérifie la validité et l'expiration du token
  - Hash le nouveau mot de passe
  - Met à jour l'utilisateur
  - Nettoie le token
- **Réponse :** Message de succès

### 2. Auth Service (auth.service.js)

#### `requestPasswordReset(email)`
- Recherche l'utilisateur par email
- Génère token de réinitialisation
- Définit expiration à 1 heure
- Stocke token dans `emailVerificationToken`
- Envoie email via `emailService.sendPasswordResetEmail`

#### `resetPassword(token, newPassword)`
- Cherche utilisateur avec token valide et non expiré
- Hash le nouveau mot de passe
- Met à jour `passwordHash`
- Nettoie `emailVerificationToken` et `emailVerificationExpires`

### 3. Routes (email.routes.js)
- `POST /email/request-password-reset` : Demande de réinitialisation
- `POST /email/reset-password` : Réinitialisation du mot de passe
- Validation des entrées avec express-validator

## API Endpoints

### Demande de réinitialisation
```
POST /api/email/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Réponse :**
```json
{
  "message": "Email de réinitialisation envoyé avec succès"
}
```

### Réinitialisation du mot de passe
```
POST /api/email/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "newPassword": "NewSecurePassword123!"
}
```

**Réponse :**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

## Sécurité

1. **Protection contre l'énumération :** Ne révèle pas si l'email existe
2. **Token à usage unique :** Token nettoyé après utilisation
3. **Expiration des tokens :** 1 heure pour les tokens de réinitialisation
4. **Validation stricte des mots de passe :** Critères de complexité
5. **Hash des mots de passe :** Utilisation de bcrypt

## Intégration Frontend

### Ajouter dans App.jsx
```jsx
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Dans les routes :
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

### Ajouter dans API services
```javascript
// Dans services/api.js
requestPasswordReset: (data) => api.post('/email/request-password-reset', data),
resetPassword: (data) => api.post('/email/reset-password', data),
```

## Flow Complet

1. **Utilisateur clique sur "Mot de passe oublié"**
   - Redirection vers `/forgot-password`
   - Saisie de l'email
   - Envoi du formulaire

2. **Backend traite la demande**
   - Vérifie l'email
   - Génère token
   - Envoie email avec lien `/reset-password?token=xxx`

3. **Utilisateur reçoit l'email**
   - Clique sur le lien
   - Arrive sur `/reset-password?token=xxx`

4. **Réinitialisation**
   - Saisie du nouveau mot de passe
   - Validation
   - Soumission
   - Redirection vers login

## Email Templates

Les emails sont envoyés via `emailService.sendPasswordResetEmail()` avec :
- Token de réinitialisation
- Nom de l'utilisateur
- Lien vers la page de reset

Cette documentation complète couvre toutes les fonctionnalités de récupération de mot de passe implémentées dans l'application.
