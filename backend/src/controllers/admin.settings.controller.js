// Simple in-memory settings storage (temporary solution)
let settingsStore = {
  id: 'default-settings',
  bookingTimeBuffer: 30,
  maxAdvanceBookingDays: 30,
  autoConfirmReservations: false,
  sendEmailNotifications: true,
  sendSMSNotifications: false,
  updatedBy: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

class AdminSettingsController {
  async getSettings(req, res, next) {
    try {
      console.log('Admin settings requested by user:', {
        id: req.user?.id,
        role: req.user?.role,
        email: req.user?.email
      });

      // Return in-memory settings
      res.status(200).json(settingsStore);
    } catch (error) {
      console.error('Error in getSettings:', error);
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      console.log('Admin settings update requested by user:', {
        id: req.user?.id,
        role: req.user?.role,
        email: req.user?.email
      });

      const settings = req.body;

      // Validate settings
      const validatedSettings = {
        bookingTimeBuffer: Math.max(0, Math.min(120, parseInt(settings.bookingTimeBuffer) || 30)),
        maxAdvanceBookingDays: Math.max(1, Math.min(365, parseInt(settings.maxAdvanceBookingDays) || 30)),
        autoConfirmReservations: Boolean(settings.autoConfirmReservations),
        sendEmailNotifications: Boolean(settings.sendEmailNotifications),
        sendSMSNotifications: Boolean(settings.sendSMSNotifications)
      };

      // Update in-memory store
      settingsStore = {
        ...settingsStore,
        ...validatedSettings,
        updatedBy: req.user.id,
        updatedAt: new Date()
      };

      console.log('Settings updated:', settingsStore);
      res.status(200).json(settingsStore);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      next(error);
    }
  }
}

module.exports = new AdminSettingsController();
