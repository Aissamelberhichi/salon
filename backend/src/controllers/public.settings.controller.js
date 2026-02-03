// Import the same settings store from admin controller
let settingsStore = {
  bookingTimeBuffer: 30,
  maxAdvanceBookingDays: 30
};

class PublicSettingsController {
  async getSettings(req, res, next) {
    try {
      // Return only public-safe settings
      const publicSettings = {
        bookingTimeBuffer: settingsStore.bookingTimeBuffer,
        maxAdvanceBookingDays: settingsStore.maxAdvanceBookingDays
        // Don't return sensitive settings like email/SMS configs
      };

      res.status(200).json(publicSettings);
    } catch (error) {
      console.error('Error in public getSettings:', error);
      next(error);
    }
  }
}

module.exports = new PublicSettingsController();
