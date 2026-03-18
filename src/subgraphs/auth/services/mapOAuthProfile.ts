//

function mapOAuthProfile(profile) {

  return {
    provider: profile.provider.toUpperCase(),
   
    profile: {
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar
    }
  }

}
export default mapOAuthProfile;