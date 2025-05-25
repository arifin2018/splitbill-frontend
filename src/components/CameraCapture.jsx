import React, { useState, useRef, useEffect } from 'react';

function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    async function getVideo() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
        setError('Error accessing your camera. Please make sure it is enabled and permissions are granted.');
      }
    }

    getVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <video ref={videoRef} className="w-64 h-48 rounded-md" autoPlay playsInline />
      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
      {imageURL && (
        <div className="mt-4">
          <img src={imageURL} alt="Captured Image" className="w-64 h-auto rounded-md" />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            onClick={() => setImageURL(null)}
          >
            Retake
          </button>
        </div>
      )}
      {!imageURL && stream && (
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={captureImage}
        >
          Capture
        </button>
      )}
    </div>
  );

  function captureImage() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // Get the data URL of the captured image
      const dataURL = canvas.toDataURL('image/png');
      setImageURL(dataURL);
    }
  }
}

export default CameraCapture;