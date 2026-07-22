// src/wisdom-web/app/graphql/admin/mutations/admin.mutations.ts

import { gql } from "@apollo/client/core";

export const CREATE_ADMIN_USER = gql`
  mutation CreateAdminUser($input: CreateAdminUserInput!) {
    createAdminUser(input: $input) {
      id
      email
      name
      role
      avatar
      isActive
      createdAt
    }
  }
`;

export const UPDATE_ADMIN_USER = gql`
  mutation UpdateAdminUser($id: ID!, $input: UpdateAdminUserInput!) {
    updateAdminUser(id: $id, input: $input) {
      id
      email
      name
      role
      avatar
      isActive
      updatedAt
    }
  }
`;

export const DELETE_ADMIN_USER = gql`
  mutation DeleteAdminUser($id: ID!) {
    deleteAdminUser(id: $id)
  }
`;

export const CREATE_AUDIT_LOG = gql`
  mutation CreateAdminAuditLog($input: CreateAuditLogInput!) {
    createAdminAuditLog(input: $input) {
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

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      role
      avatar
      isActive
      updatedAt
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const UPDATE_SYSTEM_SETTING = gql`
  mutation UpdateSystemSetting($input: UpdateSystemSettingInput!) {
    updateSystemSetting(input: $input) {
      id
      key
      value
      category
      description
      updatedAt
    }
  }
`;

export const DELETE_SYSTEM_SETTING = gql`
  mutation DeleteSystemSetting($key: String!) {
    deleteSystemSetting(key: $key)
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;
