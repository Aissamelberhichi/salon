const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class FavoriteService {
  async addToFavorites(clientId, salonId) {
    // Vérifier si le salon existe avec une requête simple
    const salonResult = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.name,
        s.address,
        s.city,
        s."postal_code" as "postalCode",
        s.country,
        s.lat,
        s.lng,
        s.phone,
        s.email,
        s.website,
        s.description,
        s.type,
        s."is_active" as "isActive",
        s."created_at" as "created_at",
        s."updated_at" as "updated_at",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', si.id,
              'url', si.url,
              'caption', si.caption,
              'is_primary', si."is_primary",
              'order', si."order"
            ) ORDER BY si."order"
          ),
          '[]'::json
        ) as images
      FROM "salons" s
      LEFT JOIN "salon_images" si ON s.id = si.salon_id
      WHERE s.id = ${salonId}
      GROUP BY s.id, s.name, s.address, s.city, s."postal_code", s.country, s.lat, s.lng, s.phone, s.email, s.website, s.description, s.type, s."is_active", s."created_at", s."updated_at"
    `;

    const salon = salonResult[0];
    if (!salon) {
      throw new Error('Salon non trouvé');
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await prisma.$queryRaw`
      SELECT * FROM "favorites" 
      WHERE "clientId" = ${clientId} AND "salonId" = ${salonId}
      LIMIT 1
    `;

    if (existingFavorite.length > 0) {
      throw new Error('Ce salon est déjà dans vos favoris');
    }

    // Ajouter aux favoris
    const favoriteId = 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    await prisma.$queryRaw`
      INSERT INTO "favorites" ("id", "clientId", "salonId", "createdAt")
      VALUES (${favoriteId}, ${clientId}, ${salonId}, NOW())
    `;

    // Retourner le favori créé avec le salon et ses images
    return {
      id: favoriteId,
      clientId,
      salonId,
      createdAt: new Date(),
      salon
    };
  }

  async removeFromFavorites(clientId, salonId) {
    // Vérifier si le favori existe
    const existingFavorite = await prisma.$queryRaw`
      SELECT * FROM "favorites" 
      WHERE "clientId" = ${clientId} AND "salonId" = ${salonId}
      LIMIT 1
    `;

    if (existingFavorite.length === 0) {
      throw new Error('Ce salon n\'est pas dans vos favoris');
    }

    // Supprimer le favori
    await prisma.$queryRaw`
      DELETE FROM "favorites" 
      WHERE "clientId" = ${clientId} AND "salonId" = ${salonId}
    `;

    return { message: 'Salon retiré des favoris avec succès' };
  }

  async getFavorites(clientId) {
    // Récupérer les favoris avec SQL brut simplifié
    const favorites = await prisma.$queryRaw`
      SELECT 
        f.id as "id",
        f."clientId" as "clientId", 
        f."salonId" as "salonId", 
        f."createdAt" as "createdAt",
        s.id as "salon_id",
        s.name,
        s.address,
        s.city,
        s."postal_code" as "postalCode",
        s.country,
        s.lat,
        s.lng,
        s.phone,
        s.email,
        s.website,
        s.description,
        s.type,
        s."is_active" as "isActive",
        s."created_at" as "created_at",
        s."updated_at" as "updated_at",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', si.id,
              'url', si.url,
              'caption', si.caption,
              'is_primary', si."is_primary",
              'order', si."order"
            ) ORDER BY si."order"
          ),
          '[]'::json
        ) as images
      FROM "favorites" f
      INNER JOIN "salons" s ON f."salonId" = s.id
      LEFT JOIN "salon_images" si ON s.id = si.salon_id
      WHERE f."clientId" = ${clientId}
      GROUP BY f.id, s.id, s.name, s.address, s.city, s."postal_code", s.country, s.lat, s.lng, s.phone, s.email, s.website, s.description, s.type, s."is_active", s."created_at", s."updated_at"
      ORDER BY f."createdAt" DESC
    `;

    // Formater les résultats pour correspondre à ce que le frontend attend
    return favorites.map(fav => ({
      id: fav.id,
      clientId: fav.clientId,
      salonId: fav.salonId,
      createdAt: fav.createdAt,
      ...fav  // Inclure toutes les données du salon
    }));
  }

  async isFavorite(clientId, salonId) {
    // Vérifier si c'est un favori avec SQL brut
    const favorite = await prisma.$queryRaw`
      SELECT * FROM "favorites" 
      WHERE "clientId" = ${clientId} AND "salonId" = ${salonId}
      LIMIT 1
    `;

    return { isFavorite: favorite.length > 0 };
  }
}

module.exports = new FavoriteService();
