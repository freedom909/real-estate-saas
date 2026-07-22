// src/wisdom-web/app/graphql/admin/queries/admin.queries.ts

import { gql } from "@apollo/client/core";

export const ADMIN_USERS = gql`
  query AdminUsers {
    adminUsers {
      id
      email
      name
      role
      avatar
      isActive
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_USER = gql`
  query AdminUser($id: ID!) {
    adminUser(id: $id) {
      id
      email
      name
      role
      avatar
      isActive
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;

export const AUDIT_LOGS = gql`
  query AdminAuditLogs($limit: Int, $filter: AuditLogFilter) {
    adminAuditLogs(limit: $limit, filter: $filter) {
      id
      adminId
      action
      target
      targetId
      details
      ip
      createdAt
    }
  }
`;

export const AUDIT_LOG_COUNT = gql`
  query AdminAuditLogCount($filter: AuditLogFilter) {
    adminAuditLogCount(filter: $filter)
  }
`;

export const ADMIN_DASHBOARD = gql`
  query AdminDashboard {
    adminDashboard {
      totalUsers
      totalListings
      totalBookings
      recentAuditLogs {
        id
        adminId
        action
        target
        targetId
        details
        ip
        createdAt
      }
    }
  }
`;

export const ALL_USERS = gql`
  query AllUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      email
      name
      picture
      role
      status
      createdAt
    }
  }
`;

export const USER_COUNT = gql`
  query UserCount {
    userCount
  }
`;

export const DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats {
      totalUsers
      totalListings
      totalBookings
      activeAdmins
      recentActivity {
        id
        adminId
        action
        target
        targetId
        details
        ip
        createdAt
      }
      userGrowth {
        date
        count
      }
      activityByAction {
        action
        count
      }
      systemHealth {
        status
        uptime
        databaseStatus
        lastChecked
      }
    }
  }
`;

export const SYSTEM_SETTINGS = gql`
  query SystemSettings($category: String) {
    systemSettings(category: $category) {
      id
      key
      value
      category
      description
      updatedBy
      updatedAt
      createdAt
    }
  }
`;

export const MY_PERMISSIONS = gql`
  query MyPermissions {
    myPermissions {
      role
      permissions
    }
  }
`;

export const NOTIFICATIONS = gql`
  query Notifications($limit: Int) {
    notifications(limit: $limit) {
      notifications {
        id
        adminId
        type
        title
        message
        target
        targetId
        isRead
        createdAt
      }
      unreadCount
    }
  }
`;

export const UNREAD_NOTIFICATION_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;
