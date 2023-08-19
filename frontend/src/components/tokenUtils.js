// tokenUtils.js
export const parseUserTypeFromToken = (accessToken) => {
    const tokenParts = accessToken.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.user_type || null;
    }
    return null;
  };
  
// tokenUtils.js
export const parseUserNameFromToken = (accessToken) => {
    const tokenParts = accessToken.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.name || null;
    }
    return null;
  };
  