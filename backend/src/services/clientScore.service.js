const prisma = require('../config/database');

class ClientScoreService {
  // Scoring rules configuration
  getScoreRules() {
    return {
      NO_SHOW: { change: -20, description: "Absence non justifiée" },
      LATE: { change: -5, description: "Retard au rendez-vous" },
      LATE_CANCELLATION: { change: -10, description: "Annulation tardive" },
      ON_TIME: { change: +2, description: "Présent à l'heure" },
      EARLY_CANCELLATION: { change: +1, description: "Annulation anticipée" },
      POSITIVE_REVIEW: { change: +3, description: "Avis positif (4-5 étoiles)" },
      NEGATIVE_REVIEW: { change: -2, description: "Avis négatif (1-2 étoiles)" },
      FIRST_BOOKING: { change: +5, description: "Premier rendez-vous" },
      REPEAT_BOOKING: { change: +4, description: "Rendez-vous récurrent" }
    };
  }

  // Determine client level based on score
  calculateLevel(score) {
    if (score >= 120) return 'RELIABLE';
    if (score >= 80) return 'NORMAL';
    return 'AT_RISK';
  }

  // Determine if deposit is required
  requiresDeposit(level, score) {
    return level === 'AT_RISK' || score < 70;
  }

  async getClientScore(clientId) {
    let clientScore = await prisma.clientScore.findUnique({
      where: { clientId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    // Create initial score if doesn't exist
    if (!clientScore) {
      clientScore = await prisma.clientScore.create({
        data: {
          clientId,
          score: 100,
          level: 'NORMAL',
          requiresDeposit: false
        },
        include: {
          events: true
        }
      });
    }

    return clientScore;
  }

  async updateScore(clientId, eventType, metadata = {}) {
    const rules = this.getScoreRules();
    const rule = rules[eventType];
    
    if (!rule) {
      throw new Error(`Unknown event type: ${eventType}`);
    }

    let clientScore = await this.getClientScore(clientId);
    
    // Calculate new score
    const newScore = Math.max(0, Math.min(200, clientScore.score + rule.change));
    const newLevel = this.calculateLevel(newScore);
    const newRequiresDeposit = this.requiresDeposit(newLevel, newScore);

    // Update score
    const updatedScore = await prisma.clientScore.update({
      where: { clientId },
      data: {
        score: newScore,
        level: newLevel,
        requiresDeposit: newRequiresDeposit,
        eventsCount: clientScore.eventsCount + 1
      },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    // Create event record
    await prisma.clientEvent.create({
      data: {
        clientId,
        eventType,
        scoreChange: rule.change,
        metadata
      }
    });

    return updatedScore;
  }

  async getClientHistory(clientId, limit = 50) {
    const events = await prisma.clientEvent.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return events.map(event => ({
      ...event,
      description: this.getScoreRules()[event.type]?.description || event.type
    }));
  }

  async addEvent(clientId, eventType, metadata = {}) {
    return this.updateScore(clientId, eventType, metadata);
  }

  // Get all clients with their scores (for admin)
  async getAllClientsScores() {
    return prisma.clientScore.findMany({
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { score: 'desc' }
    });
  }

  // Reset client score (admin function)
  async resetClientScore(clientId) {
    const updatedScore = await prisma.clientScore.update({
      where: { clientId },
      data: {
        score: 100,
        level: 'NORMAL',
        requiresDeposit: false,
        eventsCount: 0
      }
    });

    // Delete all events
    await prisma.clientEvent.deleteMany({
      where: { clientId }
    });

    return updatedScore;
  }
}

module.exports = new ClientScoreService();
