'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  articleId: string;
}

export function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    // Check if already viewed in this session
    const viewKey = `article_viewed_${articleId}`;
    const alreadyViewed = sessionStorage.getItem(viewKey);

    if (alreadyViewed) {
      return; // Don't track again in same session
    }

    // Track view after component mounts (non-blocking)
    const trackView = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/view`, {
          method: 'POST',
        });
        
        if (response.ok) {
          // Mark as viewed in this session
          sessionStorage.setItem(viewKey, 'true');
        }
      } catch (error) {
        // Silently fail
        console.log('View tracking failed');
      }
    };

    // Delay tracking slightly to prioritize page render
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [articleId]);

  return null;
}
