// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  backgroundImage = '/westin.jpg'  // Default fallback
}) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Function to fetch the login background from the database
    const fetchBackgroundImage = async () => {
      try {
        setIsLoading(true);
        
        // Use the absolute URL to your backend API
        const response = await fetch('http://localhost:5000/api/map-images/login_background');
        
        if (!response.ok) {
          console.error(`Failed to fetch background image: ${response.statusText}`);
          return; // Use the default
        }
        
        // Get the image as a blob
        const imageBlob = await response.blob();
        
        // Create a URL for the blob
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Set the background image URL
        setBgImage(imageUrl);
      } catch (err) {
        console.error('Error fetching background image:', err);
        // Silently fail and use the default
      } finally {
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchBackgroundImage();
    
    // Cleanup function to revoke the blob URL when the component unmounts
    return () => {
      if (bgImage && bgImage.startsWith('blob:')) {
        URL.revokeObjectURL(bgImage);
      }
    };
  }, []);

  return (
    <div 
      className="min-h-screen w-full h-full flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `url('${bgImage || backgroundImage}')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(14, 9, 6, 0.4)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {children}
    </div>
  );
};

export default MainLayout;