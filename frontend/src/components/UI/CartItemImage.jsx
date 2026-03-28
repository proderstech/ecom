import { useState, useEffect } from 'react';
import { productsAPI, getImageUrl } from '../../services/api';

export default function CartItemImage({ item }) {
  const [dbImg, setDbImg] = useState(null);

  useEffect(() => {
    let active = true;
    productsAPI.getBySlug(item.id)
      .then(prod => {
        if (!active) return;
        const primaryImage = prod.images?.find(img => img.is_primary)?.image_url || prod.images?.[0]?.image_url;
        const finalImg = primaryImage || prod.image || prod.image_url;
        if (finalImg) {
          setDbImg(finalImg);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [item.id]);

  const displayImg = dbImg !== null ? dbImg : (item.image || item.image_url);

  return (
    <img 
      src={getImageUrl(displayImg)} 
      alt={item.name} 
      onError={(e) => { e.target.src = 'https://placehold.co/400x400/18181b/c9a84c?text=Belgravia'; e.target.onerror = null; }}
    />
  );
}
