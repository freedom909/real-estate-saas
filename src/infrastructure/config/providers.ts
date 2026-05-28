
//config/providers.js
export const PROVIDERS = {
    google: {
      userInfo: 'https://openidconnect.googleapis.com/v1/userinfo',
      extractUser: (data) => ({
        email: data.email,
        name: data.name,
        picture: data.picture,
        sub: data.sub,
      }),
    },
    facebook: {
      userInfo: 'https://graph.facebook.com/me?fields=id,name,email,picture',
      extractUser: (data) => ({
        email: data.email,
        name: data.name,
        picture: data.picture?.data?.url,
        id: data.id,
      }),
    },
    apple: {
      userInfo: null, // Apple's info usually comes with the token
      extractUser: (data) => ({
        email: data.email,
        name: data.name,
        sub: data.sub,
      }),
    },
  };
export function getProviderConfig(config) {
  console.log("getUserInfoFromProvider config:", JSON.stringify(config, null, 2));
  return {
    userInfo: config.userInfo,
    extractUser: config.extractUser,
  };
}
getProviderConfig(PROVIDERS.google);
  
  