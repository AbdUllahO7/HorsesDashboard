export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  timeout: 15000,
  endpoints: {
    auth: {
      login: "/admin/auth/login",
      logout: "/admin/auth/logout",
      refreshToken: "/admin/auth/refresh",
      me: "/admin/auth/me",
      updateProfile: "/admin/auth/profile",
    },
    auctions: {
      list: "/admin/auctions",
      details: (id: string) => `/admin/auctions/${id}`,
      create: "/admin/auctions",
      update: (id: string) => `/admin/auctions/${id}`,
      delete: (id: string) => `/admin/auctions/${id}`,
      changeStatus: (id: string) => `/admin/auctions/${id}/status`,
    },
    listings: {
      list: "/admin/listings",
      details: (id: string) => `/admin/listings/${id}`,
      categories: "/admin/categories",
      sellers: "/admin/sellers",
    },
    users: {
      list: "/admin/users",
      details: (id: string) => `/admin/users/${id}`,
      updateStatus: (id: string) => `/admin/users/${id}/status`,
      roles: "/admin/roles",
    },
    analytics: {
      overview: "/admin/analytics/overview",
      revenue: "/admin/analytics/revenue",
      auctionsReport: "/admin/analytics/auctions",
    },
  },
  cookieNames: {
    auth: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "horses_admin_token",
    refresh: process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || "horses_admin_refresh_token",
  },
};
