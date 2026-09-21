/**
 * Common Admin Entity Definitions & Dashboard Types
 */

export type UserRole = "super_admin" | "admin" | "moderator" | "support";

export type AdminStatus = "active" | "inactive" | "suspended" | "pending";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: AdminStatus;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  titleAr: string;
  href: string;
  iconName: string;
  badge?: string | number;
  roles?: UserRole[];
  children?: NavigationItem[];
}

export interface StatSummaryCard {
  id: string;
  title: string;
  value: number | string;
  changePercentage?: number;
  trend?: "up" | "down" | "neutral";
  iconName: string;
  description?: string;
}

export type ThemeMode = "dark" | "light" | "system";
