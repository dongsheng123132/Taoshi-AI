import React, { useState, useRef, useCallback, useEffect } from 'react';

interface MediaSelectorProps {
  onImageCapture: (imageDataUrl: string) => void;
  onVideoSelect: (file: File) => void;
}

type Tab = 'image' | 'camera' | 'video';

const MediaSelector: React.FC<MediaSelectorProps> = ({ onImageCapture, onVideoSelect }) => {
  const [activeTab, setActiveTab] = useState<Tab>('image');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageCapture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have granted permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    setStream(prevStream => {
      if (prevStream) {
        prevStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onImageCapture(dataUrl);
        stopCamera();
      }
    }
  };
  
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
      return () => {
        stopCamera();
      };
    }
  }, [activeTab, startCamera, stopCamera]);
  
  const getTabClassName = (tabName: Tab) => 
    `flex-1 text-center px-4 py-3 rounded-lg transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2 ${
      activeTab === tabName
        ? 'bg-cyan-600 text-white shadow-md'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gray-800/80 rounded-2xl shadow-xl border border-gray-700">
      <div className="flex justify-center space-x-2 mb-6 bg-gray-900/50 p-1 rounded-lg">
        <div onClick={() => setActiveTab('image')} className={getTabClassName('image')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
          Image
        </div>
        <div onClick={() => setActiveTab('camera')} className={getTabClassName('camera')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 4.372A1 1 0 0116 5.175V15.825a1 1 0 01-1.447.894l-4.553-2.276A1 1 0 019 13.524V7.476a1 1 0 011.003-.925l4.55-2.179z" /></svg>
          Camera
        </div>
        <div onClick={() => setActiveTab('video')} className={getTabClassName('video')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
          Video
        </div>
      </div>

      <div>
        {activeTab === 'image' && (
           <label htmlFor="file-upload" className="cursor-pointer w-full text-center px-4 py-10 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700/50 hover:border-cyan-500 transition-colors">
              <span className="text-lg font-medium text-gray-300">Click to upload an image</span>
              <span className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP, etc.</span>
           </label>
        )}
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        
        {activeTab === 'video' && (
           <label htmlFor="video-upload" className="cursor-pointer w-full text-center px-4 py-10 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700/50 hover:border-cyan-500 transition-colors">
               <span className="text-lg font-medium text-gray-300">Click to upload a video</span>
               <span className="text-sm text-gray-500 mt-1">MP4, MOV, WEBM, etc.</span>
           </label>
        )}
        <input id="video-upload" type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" />

        {activeTab === 'camera' && (
          <div className="mt-4 flex flex-col items-center">
            <div className="w-full bg-black rounded-lg overflow-hidden border-2 border-cyan-500">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto"></video>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
            {stream ? (
              <button onClick={captureFrame} className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                Capture Frame
              </button>
            ) : (
               <p className="text-gray-400 mt-4">Waiting for camera access...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSelector;