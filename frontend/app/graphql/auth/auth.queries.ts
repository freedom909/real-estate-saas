// src/wisdom-web/app/graphql/auth/auth.queries.ts

import { gql } from "@apollo/client/core";

export const ME = gql`
  query Me {
    me {
      id
      email
      name
      picture
    }
  }
`;

export const MY_SESSIONS = gql`
  query MySessions {
    mySessions {
      id
      userId
      deviceId
      ip
      userAgent
      createdAt
      lastSeenAt
    }
  }
`;

export const MY_IDENTITIES = gql`
  query MyIdentities {
    myIdentities {
      id
      provider
      email
    }
  }
`;

export const MY_SECURITY_EVENTS = gql`
  query MySecurityEvents($limit: Int) {
    mySecurityEvents(limit: $limit) {
      id
      userId
      type
      ip
      deviceId
      userAgent
      severity
      createdAt
    }
  }
`;

export const LIST_OAUTH_ACCOUNTS = gql`
  query ListOAuthAccounts {
    listOAuthAccounts {
      id
      userId
      provider
      createdAt
    }
  }
`;
