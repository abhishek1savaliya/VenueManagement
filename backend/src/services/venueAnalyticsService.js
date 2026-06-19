const prisma = require('../db/prisma');

function fireAndForget(promise) {
  promise.catch((err) => console.error('Analytics tracking error:', err.message));
}

async function ensureSiteAnalytics(tx) {
  const client = tx || prisma;
  return client.siteAnalytics.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

async function recordListView() {
  fireAndForget(
    prisma.siteAnalytics.upsert({
      where: { id: 1 },
      update: { listViews: { increment: 1 } },
      create: { id: 1, listViews: 1 },
    })
  );
}

async function recordSearch(searchQuery, venueIds = []) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return;

  fireAndForget(
    prisma.$transaction(async (tx) => {
      await ensureSiteAnalytics(tx);
      await tx.siteAnalytics.update({
        where: { id: 1 },
        data: { searches: { increment: 1 } },
      });
      await tx.venueSearchLog.create({
        data: {
          searchQuery: query,
          resultCount: venueIds.length,
        },
      });
      if (venueIds.length) {
        await tx.venue.updateMany({
          where: { id: { in: venueIds } },
          data: { searchHits: { increment: 1 } },
        });
      }
    })
  );
}

async function recordVenueView(venueId) {
  fireAndForget(
    prisma.$transaction(async (tx) => {
      await ensureSiteAnalytics(tx);
      await tx.siteAnalytics.update({
        where: { id: 1 },
        data: { detailViews: { increment: 1 } },
      });
      await tx.venue.update({
        where: { id: venueId },
        data: { viewCount: { increment: 1 } },
      });
    })
  );
}

function calcRate(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

async function getAdminAnalytics() {
  const [site, topViewed, topSearched, allVenues, searchQueryGroups, recentSearches] =
    await Promise.all([
      prisma.siteAnalytics.findUnique({ where: { id: 1 } }),
      prisma.venue.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, name: true, status: true, viewCount: true, searchHits: true },
      }),
      prisma.venue.findMany({
        orderBy: { searchHits: 'desc' },
        take: 10,
        select: { id: true, name: true, status: true, viewCount: true, searchHits: true },
      }),
      prisma.venue.findMany({
        orderBy: [{ viewCount: 'desc' }, { name: 'asc' }],
        select: { id: true, name: true, status: true, viewCount: true, searchHits: true },
      }),
      prisma.venueSearchLog.groupBy({
        by: ['searchQuery'],
        _count: { searchQuery: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: 10,
      }),
      prisma.venueSearchLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 15,
        select: { id: true, searchQuery: true, resultCount: true, timestamp: true },
      }),
    ]);

  const listViews = site?.listViews ?? 0;
  const searches = site?.searches ?? 0;
  const detailViews = site?.detailViews ?? 0;

  const totalVenueViews = allVenues.reduce((sum, v) => sum + v.viewCount, 0);
  const totalSearchHits = allVenues.reduce((sum, v) => sum + v.searchHits, 0);

  return {
    funnel: {
      listViews,
      searches,
      detailViews,
      searchFromListRate: calcRate(searches, listViews),
      viewFromSearchRate: calcRate(detailViews, searches),
      viewFromListRate: calcRate(detailViews, listViews),
    },
    totals: {
      totalVenueViews,
      totalSearchHits,
      totalSearches: searches,
    },
    topViewedVenues: topViewed,
    topSearchedVenues: topSearched.filter((v) => v.searchHits > 0),
    topSearchQueries: searchQueryGroups.map((g) => ({
      query: g.searchQuery,
      count: g._count.searchQuery,
    })),
    recentSearches,
    allVenueStats: allVenues,
  };
}

module.exports = {
  recordListView,
  recordSearch,
  recordVenueView,
  getAdminAnalytics,
};
