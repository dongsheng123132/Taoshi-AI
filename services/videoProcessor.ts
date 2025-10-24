/**
 * Extracts a specified number of frames from a video file.
 *
 * @param videoFile The video file to process.
 * @param framesToExtract The number of frames to extract, evenly spaced throughout the video.
 * @returns A promise that resolves to an array of base64-encoded JPEG image strings.
 */
export function extractFramesFromVideo(
  videoFile: File,
  framesToExtract: number
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];

    if (!context) {
      return reject(new Error('Failed to get canvas context.'));
    }

    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = true;

    let framesExtracted = 0;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      const interval = duration / framesToExtract;

      if (duration === 0 || !isFinite(duration)) {
          URL.revokeObjectURL(videoUrl);
          return reject(new Error("Cannot process video: Invalid duration."));
      }

      // Seek to the first frame immediately
      video.currentTime = 0;
    };

    video.onseeked = () => {
      if (framesExtracted < framesToExtract) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Using JPEG for smaller file size, quality 0.8 is a good balance
        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        frames.push(frameDataUrl.split(',')[1]); // Store only base64 data
        framesExtracted++;

        const nextTime = framesExtracted * (video.duration / framesToExtract);
        if (nextTime <= video.duration) {
          video.currentTime = nextTime;
        } else {
          // All frames captured
          URL.revokeObjectURL(videoUrl);
          resolve(frames);
        }
      } else {
         // Fallback in case onseeked is called more than expected
         if (frames.length === framesToExtract) {
            URL.revokeObjectURL(videoUrl);
            resolve(frames);
         }
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(videoUrl);
      let errorMsg = 'An unknown error occurred while loading the video.';
      if (video.error) {
        switch (video.error.code) {
            case video.error.MEDIA_ERR_ABORTED:
                errorMsg = 'Video playback aborted.';
                break;
            case video.error.MEDIA_ERR_NETWORK:
                errorMsg = 'A network error caused the video download to fail.';
                break;
            case video.error.MEDIA_ERR_DECODE:
                errorMsg = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
                break;
            case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMsg = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
                break;
        }
      }
      reject(new Error(errorMsg));
    };

    // Start loading the video
    video.load();
  });
}
