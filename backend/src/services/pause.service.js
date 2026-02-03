const prisma = require('../config/database');

class PauseService {
  async createPause(disponibiliteId, data) {
    // Verify disponibilite exists
    const disponibilite = await prisma.disponibiliteCoiffeur.findUnique({
      where: { id: disponibiliteId },
      include: { coiffeur: { include: { salon: true } } }
    });

    if (!disponibilite) {
      throw new Error('Disponibilité non trouvée');
    }

    // Validate pause times are within availability hours
    if (data.startTime < disponibilite.startTime || data.endTime > disponibilite.endTime) {
      throw new Error('Les heures de pause doivent être dans les heures de disponibilité');
    }

    if (data.startTime >= data.endTime) {
      throw new Error('L\'heure de début doit être avant l\'heure de fin');
    }

    const pause = await prisma.coiffeurPause.create({
      data: {
        disponibiliteId,
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason
      },
      include: {
        disponibilite: {
          include: {
            coiffeur: true
          }
        }
      }
    });

    return pause;
  }

  async getPausesByDisponibilite(disponibiliteId) {
    const pauses = await prisma.coiffeurPause.findMany({
      where: { disponibiliteId },
      orderBy: { startTime: 'asc' },
      include: {
        disponibilite: {
          include: {
            coiffeur: true
          }
        }
      }
    });

    return pauses;
  }

  async getPausesByCoiffeur(coiffeurId) {
    const pauses = await prisma.coiffeurPause.findMany({
      where: {
        disponibilite: {
          coiffeurId
        }
      },
      include: {
        disponibilite: {
          include: {
            coiffeur: true
          }
        }
      },
      orderBy: [
        { disponibilite: { dayOfWeek: 'asc' } },
        { startTime: 'asc' }
      ]
    });

    return pauses;
  }

  async updatePause(pauseId, data) {
    const existingPause = await prisma.coiffeurPause.findUnique({
      where: { id: pauseId },
      include: {
        disponibilite: {
          include: {
            coiffeur: { include: { salon: true } }
          }
        }
      }
    });

    if (!existingPause) {
      throw new Error('Pause non trouvée');
    }

    // Validate pause times are within availability hours
    const disponibilite = existingPause.disponibilite;
    const newStartTime = data.startTime || existingPause.startTime;
    const newEndTime = data.endTime || existingPause.endTime;

    if (newStartTime < disponibilite.startTime || newEndTime > disponibilite.endTime) {
      throw new Error('Les heures de pause doivent être dans les heures de disponibilité');
    }

    if (newStartTime >= newEndTime) {
      throw new Error('L\'heure de début doit être avant l\'heure de fin');
    }

    const updated = await prisma.coiffeurPause.update({
      where: { id: pauseId },
      data: {
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.reason !== undefined && { reason: data.reason })
      },
      include: {
        disponibilite: {
          include: {
            coiffeur: true
          }
        }
      }
    });

    return updated;
  }

  async deletePause(pauseId) {
    const pause = await prisma.coiffeurPause.findUnique({
      where: { id: pauseId },
      include: {
        disponibilite: {
          include: {
            coiffeur: { include: { salon: true } }
          }
        }
      }
    });

    if (!pause) {
      throw new Error('Pause non trouvée');
    }

    await prisma.coiffeurPause.delete({
      where: { id: pauseId }
    });

    return { message: 'Pause supprimée avec succès' };
  }

  async setPausesForDisponibilite(disponibiliteId, pauses) {
    // Delete existing pauses
    await prisma.coiffeurPause.deleteMany({
      where: { disponibiliteId }
    });

    // Create new pauses
    const createdPauses = [];
    for (const pauseData of pauses) {
      const pause = await this.createPause(disponibiliteId, pauseData);
      createdPauses.push(pause);
    }

    return createdPauses;
  }
}

module.exports = new PauseService();
