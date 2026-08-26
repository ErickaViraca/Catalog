import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { linkClicks, NewLinkClick, NewTrackedLink, trackedLinks } from "../db/schema";

export class LinksRepository {
  async findAllLinks() {
    return db
      .select({
        id: trackedLinks.id,
        slug: trackedLinks.slug,
        destinationUrl: trackedLinks.destinationUrl,
        label: trackedLinks.label,
        active: trackedLinks.active,
        createdAt: trackedLinks.createdAt,
        clickCount: sql<number>`count(${linkClicks.id})::int`,
      })
      .from(trackedLinks)
      .leftJoin(linkClicks, eq(linkClicks.linkId, trackedLinks.id))
      .groupBy(trackedLinks.id)
      .orderBy(desc(trackedLinks.createdAt));
  }

  async findLinkById(id: string) {
    return db.select().from(trackedLinks).where(eq(trackedLinks.id, id)).limit(1);
  }

  async findLinkBySlug(slug: string) {
    return db.select().from(trackedLinks).where(eq(trackedLinks.slug, slug)).limit(1);
  }

  async createLink(data: NewTrackedLink) {
    return db.insert(trackedLinks).values(data).returning();
  }

  async updateLink(id: string, data: Partial<NewTrackedLink>) {
    return db.update(trackedLinks).set(data).where(eq(trackedLinks.id, id)).returning();
  }

  async deleteLink(id: string) {
    return db.delete(trackedLinks).where(eq(trackedLinks.id, id)).returning();
  }

  async recordClick(data: NewLinkClick) {
    return db.insert(linkClicks).values(data).returning();
  }

  async findClicksByLinkId(linkId: string) {
    return db
      .select()
      .from(linkClicks)
      .where(eq(linkClicks.linkId, linkId))
      .orderBy(desc(linkClicks.clickedAt));
  }
}

export const linksRepository = new LinksRepository();
