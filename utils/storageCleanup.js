// Utility to help manage localStorage and compress existing images
export const clearAllStorage = () => {
  if (typeof window === "undefined") return;
  
  const keys = [
    'personal_blog.posts',
    'personal_blog.comments',
    'personal_blog.current_user',
    'personal_blog.seeded'
  ];
  
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`Cleared ${key}`);
    } catch (error) {
      console.error(`Failed to clear ${key}:`, error);
    }
  });
  
  console.log('All blog storage cleared. Page will reload.');
  window.location.reload();
};

export const getStorageSize = () => {
  if (typeof window === "undefined") return { total: 0, breakdown: {} };
  
  let total = 0;
  const breakdown = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      const size = new Blob([value || '']).size;
      breakdown[key] = {
        size: size,
        sizeMB: (size / (1024 * 1024)).toFixed(2)
      };
      total += size;
    }
  }
  
  return {
    total: total,
    totalMB: (total / (1024 * 1024)).toFixed(2),
    breakdown
  };
};

// Compress existing images in posts
export const compressExistingImages = async () => {
  if (typeof window === "undefined") return;
  
  try {
    const postsJson = localStorage.getItem('personal_blog.posts');
    if (!postsJson) return;
    
    const posts = JSON.parse(postsJson);
    let updated = false;
    
    for (const post of posts) {
      if (post.cover_image && post.cover_image.startsWith('data:image/')) {
        try {
          // Convert data URL to blob
          const response = await fetch(post.cover_image);
          const blob = await response.blob();
          
          // Compress if larger than 500KB
          if (blob.size > 500 * 1024) {
            const compressed = await compressImageBlob(blob);
            const reader = new FileReader();
            const compressedDataUrl = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(compressed);
            });
            
            post.cover_image = compressedDataUrl;
            updated = true;
            console.log(`Compressed image for post: ${post.title}`);
          }
        } catch (error) {
          console.warn(`Failed to compress image for post ${post.id}:`, error);
        }
      }
    }
    
    if (updated) {
      localStorage.setItem('personal_blog.posts', JSON.stringify(posts));
      console.log('Compressed existing images. Storage size reduced.');
    }
  } catch (error) {
    console.error('Failed to compress existing images:', error);
  }
};

const compressImageBlob = (blob, maxWidth = 1200, maxHeight = 800, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });

