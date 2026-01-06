'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl?: string | null;
  title?: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  // Check if URL is HLS (.m3u8)
  const isHLS = videoUrl?.includes('.m3u8') || videoUrl?.includes('cloudfront.net') || videoUrl?.includes('master.m3u8');
  
  // Debug info (no console logging)
  useEffect(() => {
    if (videoUrl) {
      setDebugInfo(`URL: ${videoUrl.substring(0, 50)}... | HLS: ${isHLS}`);
    } else {
      setDebugInfo('No video URL');
    }
  }, [videoUrl, isHLS]);

  // Load HLS.js for browsers that don't support native HLS
  useEffect(() => {
    if (!videoUrl || !videoRef.current) {
      setIsLoading(false);
      return;
    }

    const video = videoRef.current;
    
    if (isHLS) {
      // Always try hls.js first for better compatibility and CORS handling
      import('hls.js').then((Hls) => {
        if (Hls.default.isSupported()) {
          const hls = new Hls.default({
            enableWorker: true,
            lowLatencyMode: false,
            debug: false,
            xhrSetup: (xhr, url) => {
              // Handle CORS - don't send credentials
              xhr.withCredentials = false;
            },
          });
          
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;

          hls.on(Hls.default.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            setError(false);
          });

          hls.on(Hls.default.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.default.ErrorTypes.NETWORK_ERROR:
                  // Try to recover from network errors silently
                  try {
                    hls.startLoad();
                  } catch (e) {
                    // Only log if recovery fails
                    console.error('HLS: Failed to recover from network error');
                    setError(true);
                    setIsLoading(false);
                  }
                  break;
                case Hls.default.ErrorTypes.MEDIA_ERROR:
                  // Try to recover from media errors silently
                  try {
                    hls.recoverMediaError();
                  } catch (e) {
                    // Only log if recovery fails
                    console.error('HLS: Failed to recover from media error');
                    setError(true);
                    setIsLoading(false);
                  }
                  break;
                default:
                  // Only log fatal errors that cannot be recovered
                  console.error('HLS: Fatal error -', data.details || data.message || 'Unknown error');
                  setError(true);
                  setIsLoading(false);
                  hls.destroy();
                  break;
              }
            }
            // Non-fatal errors are ignored (no console logging)
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl') || 
                   video.canPlayType('application/x-mpegURL')) {
          // Native HLS support (Safari) - fallback if hls.js not supported
          video.crossOrigin = 'anonymous';
          video.src = videoUrl;
          setIsLoading(false);
        } else {
          setError(true);
          setIsLoading(false);
          setDebugInfo('HLS video format not supported by this browser');
        }
      }).catch((err) => {
        // Fallback to native HLS if hls.js fails to load
        if (video.canPlayType('application/vnd.apple.mpegurl') || 
            video.canPlayType('application/x-mpegURL')) {
          video.crossOrigin = 'anonymous';
          video.src = videoUrl;
          setIsLoading(false);
        } else {
          setError(true);
          setIsLoading(false);
          setDebugInfo('Failed to load hls.js and browser does not support native HLS');
        }
      });

      // Add event listeners for HLS videos
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });

      video.addEventListener('error', (e) => {
        const videoElement = e.target as HTMLVideoElement;
        const error = videoElement.error;
        if (error) {
          let errorMessage = 'Unknown error';
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              errorMessage = 'Video loading aborted';
              break;
            case error.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error - check CORS settings';
              break;
            case error.MEDIA_ERR_DECODE:
              errorMessage = 'Video decode error';
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Video format not supported';
              break;
          }
          setDebugInfo(`Error: ${errorMessage} (Code: ${error.code})`);
        } else {
          setDebugInfo('Video error occurred');
        }
        setError(true);
        setIsLoading(false);
      });

      video.addEventListener('canplay', () => {
        setIsLoading(false);
      });
    } else {
      // Not HLS, will be handled by iframe below
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isHLS, videoUrl]);

  // Show placeholder if no video URL
  if (!videoUrl || videoUrl.trim() === '') {
    return (
      <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" style={{ paddingBottom: '56.25%', position: 'relative' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="bg-white rounded-full p-6 mb-4 shadow-lg">
            <svg 
              className="w-16 h-16 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Video Placeholder</h3>
          <p className="text-sm text-gray-600 text-center max-w-md mb-2">
            No video URL provided
          </p>
          <p className="text-xs text-gray-500 text-center max-w-md">
            Add a video URL in the lesson settings. For S3Bubble, use the .m3u8 URL.
          </p>
        </div>
      </div>
    );
  }

  // Check if it's a test/local video URL
  const isTestVideo = videoUrl.includes('youtube.com') || 
                      videoUrl.includes('youtu.be') || 
                      videoUrl.includes('vimeo.com') ||
                      videoUrl.startsWith('/test-video');

  // Handle YouTube URLs
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return url;
  };

  // Handle Vimeo URLs
  const getVimeoEmbedUrl = (url: string) => {
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  // Process video URL
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    embedUrl = getYouTubeEmbedUrl(videoUrl);
  } else if (videoUrl.includes('vimeo.com')) {
    embedUrl = getVimeoEmbedUrl(videoUrl);
  }

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Show blank canvas placeholder for errors
  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" style={{ paddingBottom: '56.25%', position: 'relative' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="bg-white rounded-full p-6 mb-4 shadow-lg">
            <svg 
              className="w-16 h-16 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
          </svg>
        </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Video Placeholder</h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Video will be displayed here once available
            </p>
          </div>
      </div>
    );
  }

  // Render HLS video player
  if (isHLS && videoUrl) {
    // Show error placeholder if there's an error
    if (error) {
      return (
        <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" style={{ paddingBottom: '56.25%', position: 'relative' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="bg-white rounded-full p-6 mb-4 shadow-lg">
              <svg 
                className="w-16 h-16 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Something Wrong with the Video</h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Unable to load video. Please check the video URL or contact support.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-gray-300 font-medium">Loading video...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full"
            controls
            playsInline
            crossOrigin="anonymous"
            preload="metadata"
            style={{ display: isLoading ? 'none' : 'block' }}
          >
            <source src={videoUrl} type="application/vnd.apple.mpegurl" />
            <source src={videoUrl} type="application/x-mpegURL" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // Render iframe for YouTube/Vimeo
  return (
    <div className="w-full">
      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm text-gray-300 font-medium">Loading video...</p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || 'Course Video'}
          onError={handleError}
          onLoad={handleLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </div>
      {isTestVideo && (
        <div className="mt-3 text-xs text-primary-700 bg-primary-50 px-4 py-2 rounded-md border border-primary-200">
          ℹ️ Using test video (YouTube/Vimeo). Replace with S3Bubble URL in production.
        </div>
      )}
    </div>
  );
}
