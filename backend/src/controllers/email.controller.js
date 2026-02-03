const authService = require('../services/auth.service');

class EmailController {
  // Vérifier l'email
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      
      console.log('🔍 Vérification email reçue');
      console.log('🔑 Token reçu:', token);
      console.log('📅 Date actuelle:', new Date().toISOString());
      
      if (!token) {
        console.log('❌ Token manquant');
        return res.status(400).json({
          message: 'Token de vérification requis'
        });
      }

      const user = await authService.verifyEmail(token);
      
      console.log('✅ Email vérifié avec succès pour:', user.email);
      
      res.status(200).json({
        message: 'Email vérifié avec succès',
        user
      });
    } catch (error) {
      console.error('❌ Erreur de vérification email:', error.message);
      console.error('📋 Détails de l\'erreur:', error);
      
      res.status(400).json({
        message: error.message || 'Erreur lors de la vérification de l\'email'
      });
    }
  }

  // Renvoyer l'email de vérification
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      
      console.log('📧 Demande de renvoi de vérification reçue');
      console.log('📧 Email:', email);
      
      if (!email) {
        console.log('❌ Email manquant');
        return res.status(400).json({
          message: 'Email requis'
        });
      }

      const result = await authService.resendVerificationEmail(email);
      
      console.log('✅ Email de vérification renvoyé avec succès');
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur lors du renvoi de l\'email de vérification:', error.message);
      console.error('📋 Détails de l\'erreur:', error);
      
      res.status(400).json({
        message: error.message || 'Erreur lors de l\'envoi de l\'email de vérification'
      });
    }
  }

  // Demander la réinitialisation du mot de passe
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          message: 'Email requis'
        });
      }

      const result = await authService.requestPasswordReset(email);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error.message || 'Erreur lors de la demande de réinitialisation'
      });
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          message: 'Token et nouveau mot de passe requis'
        });
      }

      const result = await authService.resetPassword(token, newPassword);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error.message || 'Erreur lors de la réinitialisation du mot de passe'
      });
    }
  }
}

module.exports = new EmailController();
