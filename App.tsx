import React, { useState, useCallback, useEffect } from 'react';
import { Product } from './types';
import { analyzeImageForProducts, analyzeVideoForProducts, generateProductImageView } from './services/geminiService';
import { extractFramesFromVideo } from './services/videoProcessor';
import Header from './components/Header';
import MediaSelector from './components/MediaSelector';
import ProductCard from './components/ProductCard';
import Loader from './components/Loader';
import WelcomeScreen from './components/WelcomeScreen';
import ErrorDisplay from './components/ErrorDisplay';
import ThreeDViewModal from './components/ThreeDViewModal';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // State for the 3D View Modal
  const [threeDViewProduct, setThreeDViewProduct] = useState<Product | null>(null);
  const [isThreeDModalOpen, setIsThreeDModalOpen] = useState<boolean>(false);
  const [threeDImageData, setThreeDImageData] = useState<string | null>(null);
  const [isThreeDLoading, setIsThreeDLoading] = useState<boolean>(false);
  const [threeDError, setThreeDError] = useState<string | null>(null);
  
  // This effect robustly handles turning off the loader for the 3D modal.
  // It only fires after the imageData state has been successfully updated, preventing a race condition.
  useEffect(() => {
    if (threeDImageData) {
        setIsThreeDLoading(false);
    }
  }, [threeDImageData]);

  const handleImageCapture = (imageDataUrl: string) => {
    setImageSrc(imageDataUrl);
    setVideoFile(null);
    setVideoSrc(null);
    setProducts(null);
    setError(null);
  };
  
  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setImageSrc(null);
    setProducts(null);
    setError(null);
  };

  const handleImageAnalysis = useCallback(async () => {
    if (!imageSrc) {
      setError("Please provide an image first.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('AI is analyzing your image...');
    setError(null);
    setProducts(null);

    try {
      const base64Data = imageSrc.split(',')[1];
      if (!base64Data) {
        throw new Error("Invalid image data format.");
      }
      const foundProducts = await analyzeImageForProducts(base64Data);
      setProducts(foundProducts);
    } catch (err) {
      console.error("Image analysis failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [imageSrc]);
  
  const handleVideoAnalysis = useCallback(async () => {
    if (!videoFile) {
      setError("Please provide a video first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setProducts(null);

    try {
      setLoadingMessage('Extracting key frames from video...');
      // Extract 10 frames evenly spaced throughout the video
      const frames = await extractFramesFromVideo(videoFile, 10);
      
      if (frames.length === 0) {
        throw new Error("Could not extract frames from the video. The file might be corrupted or in an unsupported format.");
      }
      
      setLoadingMessage('AI is analyzing your video...');
      const foundProducts = await analyzeVideoForProducts(frames);
      setProducts(foundProducts);
    } catch (err) {
       console.error("Video analysis failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during video analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [videoFile]);
  
  const handleThreeDView = useCallback(async (product: Product) => {
    setIsThreeDModalOpen(true);
    setThreeDViewProduct(product);
    setIsThreeDLoading(true);
    setThreeDImageData(null);
    setThreeDError(null);

    const TIMEOUT_DURATION = 30000; // 30 seconds

    try {
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out after 30 seconds. The AI is taking too long to respond.")), TIMEOUT_DURATION)
        );
        
        // This now only sets the image data. The useEffect handles turning the loader off.
        const imageData = await Promise.race([
            generateProductImageView(product),
            timeoutPromise
        ]);
        setThreeDImageData(imageData);

    } catch (err) {
        console.error("3D view generation failed:", err);
        setThreeDError(err instanceof Error ? err.message : "Could not generate a new perspective for this product.");
        setIsThreeDLoading(false); // Ensure loader is turned off on error.
    }
  }, []);

  const closeThreeDModal = () => {
    setIsThreeDModalOpen(false);
    setThreeDViewProduct(null);
    // It's good practice to clear modal state on close
    setThreeDImageData(null);
    setThreeDError(null);
    setIsThreeDLoading(false);
  };

  const getCurrentAnalysisHandler = () => {
      if (imageSrc) return handleImageAnalysis;
      if (videoFile) return handleVideoAnalysis;
      return () => {};
  };

  const handleReset = () => {
    setImageSrc(null);
    setVideoFile(null);
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setProducts(null);
    setError(null);
    setIsLoading(false);
  };
  
  const mediaLoaded = imageSrc || videoSrc;

  return (
    <div className="min-h-screen text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl mx-auto">
          {!mediaLoaded && !isLoading && !products && !error && (
            <WelcomeScreen>
              <MediaSelector onImageCapture={handleImageCapture} onVideoSelect={handleVideoSelect} />
            </WelcomeScreen>
          )}

          {mediaLoaded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center p-6 bg-gray-800/60 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Your Media</h2>
                {imageSrc && <img src={imageSrc} alt="Frame for analysis" className="rounded-lg max-h-96 w-auto object-contain shadow-md" />}
                {videoSrc && <video src={videoSrc} controls className="rounded-lg max-h-96 w-full object-contain shadow-md"></video>}

                {!isLoading && !products && !error && (
                  <button
                    onClick={getCurrentAnalysisHandler()}
                    className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                  >
                    Find Products
                  </button>
                )}
                 {!isLoading && (products || error) && (
                  <button
                    onClick={handleReset}
                    className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Analyze Another File
                  </button>
                )}
              </div>

              <div className="p-6 bg-gray-800/60 rounded-2xl shadow-lg min-h-[30rem] flex flex-col justify-center border border-gray-700">
                {isLoading && <Loader message={loadingMessage} />}
                {error && !isLoading && <ErrorDisplay message={error} onRetry={getCurrentAnalysisHandler()} />}
                {products && !isLoading && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-cyan-400 text-center">
                      {products.length > 0
                        ? `Found ${products.length} Product${products.length > 1 ? 's' : ''}`
                        : "No Products Found"}
                    </h2>
                    {products.length > 0 ? (
                      <div className="space-y-4">
                        {products.map((product, index) => (
                          <ProductCard key={index} product={product} onThreeDViewClick={handleThreeDView} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400">The AI couldn't identify distinct, searchable products in the media.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      {isThreeDModalOpen && threeDViewProduct && (
        <ThreeDViewModal
          productName={threeDViewProduct.name}
          isLoading={isThreeDLoading}
          imageData={threeDImageData}
          error={threeDError}
          onClose={closeThreeDModal}
        />
      )}
    </div>
  );
};

export default App;