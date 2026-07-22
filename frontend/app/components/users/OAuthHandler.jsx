import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { oauthService } from '../../userService/oauthService';

const providerInfo = {
  google: {
    tokenKey: 'googleToken',
  },
  github: {
    tokenKey: 'githubToken',
  },
  facebook: {
    tokenKey: 'facebookToken',
  },
  twitter: {
    tokenKey: 'twitterToken',
  },
};

const OAuthHandler = ({ code }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateWithSubgraph = async () => {
      try {
        // Detect which provider token is available
        const provider = Object.keys(providerInfo).find((p) => code[providerInfo[p].tokenKey]);

        if (!provider) {
          throw new Error('No valid OAuth provider token found');
        }

        const token = code[providerInfo[provider].tokenKey];

        // 使用 oauthService 发送认证请求到 subgraph-auths
        const authResponse = await oauthService.sendOAuthRequestToSubgraph(provider, token);

        if (authResponse.success) {
          // 登录成功，重定向到仪表板
          navigate('/dashboard');
        } else {
          throw new Error(authResponse.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('❌ Failed to authenticate with OAuth:', err.message);
        // 登录失败，可以重定向到登录页
        navigate('/login');
      }
    };

    if (code) {
      authenticateWithSubgraph();
    }
  }, [code, navigate]);

  return <p>Logging in...</p>;
};

export default OAuthHandler;