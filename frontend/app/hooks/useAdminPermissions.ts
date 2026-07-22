"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";

const MY_PERMISSIONS = gql`
  query MyPermissions {
    myPermissions {
      role
      permissions
    }
  }
`;

export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
export type Permission = string;

export function useAdminPermissions() {
  const { data, loading, error } = useQuery(MY_PERMISSIONS);

  const role = data?.myPermissions?.role as AdminRole | undefined;
  const permissions = (data?.myPermissions?.permissions ?? []) as Permission[];

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (...perms: Permission[]): boolean => {
    return perms.some((p) => permissions.includes(p));
  };

  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isModerator = role === "MODERATOR";

  return {
    role,
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isSuperAdmin,
    isModerator,
  };
}
