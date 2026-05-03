/**
 * Formats image URLs to be absolute if they are relative paths.
 * @param {string} url - The URL or path to format
 * @param {object} req - The Express request object to get the host info
 * @returns {string} - The absolute URL or the original URL if already absolute
 */
const formatUrl = (url, req) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  // If it's something like 'uploads/filename.jpg', ensure it's '/uploads/filename.jpg'
  if (!cleanPath.startsWith('/uploads') && !url.startsWith('http')) {
      return `${baseUrl}/uploads${cleanPath}`;
  }
  
  return `${baseUrl}${cleanPath}`;
};

/**
 * Formats all image URLs in an item object or array of items.
 */
const formatItemImages = (item, req) => {
  if (!item) return item;
  
  // Handle Mongoose document or plain object
  const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;

  if (itemObj.images && Array.isArray(itemObj.images)) {
    itemObj.images = itemObj.images.map(img => formatUrl(img, req));
  }

  if (itemObj.owner) {
    if (itemObj.owner.avatar) {
      itemObj.owner.avatar = formatUrl(itemObj.owner.avatar, req);
    }
  }

  return itemObj;
};

/**
 * Formats a user object's avatar.
 */
const formatUserAvatar = (user, req) => {
  if (!user) return user;
  
  const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
  
  if (userObj.avatar) {
    userObj.avatar = formatUrl(userObj.avatar, req);
  }
  
  return userObj;
};

module.exports = {
  formatUrl,
  formatItemImages,
  formatUserAvatar
};
