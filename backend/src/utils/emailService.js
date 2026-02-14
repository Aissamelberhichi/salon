const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); // Charger les variables d'environnement

class EmailService {
  constructor() {
    // Configuration du transporteur email (Gmail)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // votre email Gmail
        pass: process.env.EMAIL_PASS  // votre mot de passe d'application Gmail
      },
      debug: process.env.NODE_ENV === 'development', // logs détaillés en dev
      logger: process.env.NODE_ENV === 'development'
    });

    // Vérifier la connexion au démarrage
    this.verifyConnection();
  }

  // Vérifier la connexion SMTP
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Connexion SMTP Gmail établie avec succès');
    } catch (error) {
      console.error('❌ Erreur de connexion SMTP:', error.message);
      console.error('🔧 Configuration utilisée:', {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS
      });
    }
  }

  // Générer un token de vérification
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Envoyer l'email de vérification
  async sendVerificationEmail(email, token, fullName) {
    // MODE TEST TEMPORAIRE - désactiver l'envoi d'email réel
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 MODE TEST - Email de vérification non envoyé');
      console.log('📧 Email destinataire:', email);
      console.log('📧 Token de vérification:', token);
      console.log('📧 Nom complet:', fullName);
      console.log('📧 URL de vérification:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
      
      return {
        messageId: 'test-mode',
        preview: `Email de vérification envoyé à ${email} avec le token ${token}`
      };
    }

    // Code original pour la production
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
      from: `"Coifure App" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Vérifiez votre adresse email',
      html: this.generateVerificationEmailHtml(email, token, fullName)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de vérification envoyé:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw error;
    }
  }

  // Envoyer l'email de réinitialisation de mot de passe
  async sendPasswordResetEmail(email, resetToken, fullName) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Coifure App" <${process.env.EMAIL_FROM || 'noreply@coifure.com'}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Coifure App',
      html: this.getPasswordResetEmailTemplate(fullName, resetUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email de réinitialisation envoyé à:', email);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }

  // Template HTML pour l'email de réinitialisation
  getPasswordResetEmailTemplate(fullName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation Mot de Passe - Coifure App</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">💇 Coifure App</div>
          <h1>Réinitialisation du mot de passe</h1>
        </div>
        
        <div class="content">
          <h2>Bonjour ${fullName},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          
          <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          
          <p><strong>Important :</strong> Ce lien expirera dans 1 heure.</p>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #f59e0b; font-size: 12px;">${resetUrl}</p>
        </div>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement. Ne répondez pas à cet email.</p>
          <p>&copy; 2024 Coifure App. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Envoyer un email d'approbation de salon
  async sendSalonApprovalEmail(email, { ownerName, salonName, salonCity }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Salon Approuvé - Coifure App</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .info-box { background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💇 Coifure App</div>
            <h1>🎉 Félicitations ! Votre salon a été approuvé</h1>
          </div>
          
          <div class="content">
            <h2>Bonjour ${ownerName},</h2>
            
            <div class="success-box">
              <h3>✅ Votre salon a été validé par notre équipe</h3>
              <p>Vous pouvez maintenant commencer à utiliser Coifure App pour gérer votre activité</p>
            </div>
            
            <div class="info-box">
              <h4>📍 Informations de votre salon</h4>
              <p><strong>Nom :</strong> ${salonName}</p>
              <p><strong>Ville :</strong> ${salonCity || 'Non spécifiée'}</p>
            </div>
            
            <p>Vous pouvez maintenant vous connecter et accéder à votre dashboard pour :</p>
            <ul>
              <li>✨ Gérer vos services et tarifs</li>
              <li>👥 Ajouter vos coiffeurs</li>
              <li>📅 Gérer vos rendez-vous</li>
              <li>📊 Voir vos statistiques</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
              Accéder à mon dashboard
            </a>
            
            <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Ne répondez pas à cet email.</p>
            <p>&copy; 2024 Coifure App. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"Coifure App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Votre salon a été approuvé - Coifure App',
      html
    });
  }

  // Envoyer un email d'activation de salon
  async sendSalonActivationEmail(email, { ownerName, salonName, salonCity }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Salon Activé - Coifure App</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💇 Coifure App</div>
            <h1>✅ Votre salon a été activé</h1>
          </div>
          
          <div class="content">
            <h2>Bonjour ${ownerName},</h2>
            
            <div class="success-box">
              <h3>Votre salon est de nouveau actif</h3>
              <p>Vous pouvez continuer à utiliser Coifure App normalement</p>
            </div>
            
            <p><strong>Nom du salon :</strong> ${salonName}</p>
            <p><strong>Ville :</strong> ${salonCity || 'Non spécifiée'}</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
              Accéder à mon dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Ne répondez pas à cet email.</p>
            <p>&copy; 2024 Coifure App. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"Coifure App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Votre salon a été activé - Coifure App',
      html
    });
  }

  // Envoyer un email de désactivation de salon
  async sendSalonDeactivationEmail(email, { ownerName, salonName, salonCity }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Salon Désactivé - Coifure App</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #f59e0b; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💇 Coifure App</div>
            <h1>⚠️ Votre salon a été désactivé</h1>
          </div>
          
          <div class="content">
            <h2>Bonjour ${ownerName},</h2>
            
            <div class="warning-box">
              <h3>Votre salon a été temporairement désactivé</h3>
              <p>Veuillez contacter le support pour plus d'informations</p>
            </div>
            
            <div class="info-box">
              <h4>Informations concernées</h4>
              <p><strong>Nom du salon :</strong> ${salonName}</p>
              <p><strong>Ville :</strong> ${salonCity || 'Non spécifiée'}</p>
            </div>
            
            <p>Cette désactivation peut être due à :</p>
            <ul>
              <li>• Non-respect des conditions d'utilisation</li>
              <li>• Signalements reçus</li>
              <li>• Vérification en cours</li>
              <li>• Autres raisons administratives</li>
            </ul>
            
            <p><strong>Pour plus d'informations :</strong></p>
            <p>📧 Email : support@coifure.com</p>
            <p>📞 Téléphone : 01 23 45 67 89</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Ne répondez pas à cet email.</p>
            <p>&copy; 2024 Coifure App. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"Coifure App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '⚠️ Votre salon a été désactivé - Coifure App',
      html
    });
  }
}

module.exports = new EmailService();
