import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Settings as Lungs, Activity, ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import JSZip from 'jszip';
import ImageUploader from './ImageUploader'; // Import the ImageUploader component

const TumorSegmentation = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [highlightedImage, setHighlightedImage] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null); // State for processed video
  const [originalVideo, setOriginalVideo] = useState(null); // State for original video

  useEffect(() => {
    if (!originalVideo && !processedVideo) return;

    const handleVideo = (videoId, videoSrc) => {
      const videoElement = document.getElementById(videoId);
      if (videoElement && videoSrc) {
        videoElement.src = videoSrc; // Directly set src
        videoElement.muted = true;
        videoElement.load();
        videoElement.play().catch((error) => {
          console.error(`${videoId} Play Error:`, error);
        });
      }
    };

    handleVideo('original-video', originalVideo);
    handleVideo('processed-video', processedVideo);

    // Cleanup previous URLs when component unmounts or video changes
    return () => {
      if (originalVideo) URL.revokeObjectURL(originalVideo);
      if (processedVideo) URL.revokeObjectURL(processedVideo);
    };
  }, [originalVideo, processedVideo]);

  const handleFileUpload = async (file) => {
    if (!selectedType) return;

    console.log("Selected Type:", selectedType);
    console.log("Uploaded File:", file);

    const formData = new FormData();
    setIsProcessing(true);
    setError(null);

    if (selectedType === "lung_tumor_image") {
      if (!Array.isArray(file) && file.name.endsWith(".npy")) {
        formData.append("file", file);
      } else {
        setError("Invalid file format. Only .npy files are allowed.");
        return;
      }
    } else if (selectedType === "brain_tumor") {
      if (!Array.isArray(file) && (file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg"))) {
        formData.append("image", file);
      } else {
        setError("Invalid file format. Only .png, .jpg, or .jpeg files are allowed.");
        return;
      }
    } else if (selectedType === "lung_tumor_video") {
      if (!Array.isArray(file) && file.name.endsWith(".mp4")) {
        formData.append("file", file);
      } else {
        setError("Invalid file format. Only .mp4 videos are allowed.");
        return;
      }
    } else {
      setError("Invalid selection");
      return;
    }

    formData.append("model_type", selectedType);

    try {
      const response = await axios.post("http://localhost:5000/api/segment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: selectedType === "lung_tumor_video" ? "blob" : selectedType === "brain_tumor" ? "arraybuffer" : "json",
      });

      console.log("Response received:", response);

      if (selectedType === "lung_tumor_video") {
        // Extract the zip file containing both videos
        const zip = new JSZip();
        const zipData = await zip.loadAsync(response.data);

        // Log the files in the zip
        console.log("Files in zip:", Object.keys(zipData.files));

        // Check if the files exist
        if (!zipData.file("original_video.mp4") || !zipData.file("segmented_video.mp4")) {
          throw new Error("Zip file is missing required videos.");
        }

        // Extract the original video
        const originalVideoFile = zipData.file("original_video.mp4");
        const processedVideoFile = zipData.file("segmented_video.mp4");
        if (!originalVideoFile || !processedVideoFile) {
          throw new Error("Zip file is missing required videos.");
        }

        const originalVideoBlob = new Blob([await originalVideoFile.async("arraybuffer")], { type: "video/mp4" });
        const processedVideoBlob = new Blob([await processedVideoFile.async("arraybuffer")], { type: "video/mp4" });
        console.log("Original Video Blob:", originalVideoBlob);
        console.log("Processed Video Blob:", processedVideoBlob);

        // Create object URLs for the videos
        const originalVideoUrl = URL.createObjectURL(originalVideoBlob);
        const processedVideoUrl = URL.createObjectURL(processedVideoBlob);
        console.log("Original Video URL:", originalVideoUrl);
        console.log("Processed Video URL:", processedVideoUrl);

        // Set the video URLs in the state
        console.log("Setting Original Video URL:", originalVideoUrl);
        console.log("Setting Processed Video URL:", processedVideoUrl);
        setOriginalVideo(originalVideoUrl);
        setProcessedVideo(processedVideoUrl);
        setOriginalImage(null);
        setHighlightedImage(null);
      } else if (selectedType === "lung_tumor_image") {
        const originalImage = `data:image/png;base64,${response.data.original_image}`;
        const highlightedImage = `data:image/png;base64,${response.data.segmented_image}`;
        setOriginalImage(originalImage);
        setHighlightedImage(highlightedImage);
        setProcessedVideo(null);
      } else if (selectedType === "brain_tumor") {
        const imageBlob = new Blob([response.data], { type: "image/png" });
        const highlightedURL = URL.createObjectURL(imageBlob);
        setHighlightedImage(highlightedURL);
        setProcessedVideo(null);
        if (!Array.isArray(file)) {
          const fileURL = URL.createObjectURL(file);
          setOriginalImage(fileURL);
        }
      }
    } catch (error) {
      console.error("Segmentation failed:", error);
      setError("Failed to process the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    if (originalVideo) URL.revokeObjectURL(originalVideo);
    if (processedVideo) URL.revokeObjectURL(processedVideo);

    setSelectedType(null);
    setUploadedFile(null);
    setIsProcessing(false);
    setError(null);
    setOriginalImage(null);
    setHighlightedImage(null);
    setProcessedVideo(null);
    setOriginalVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-medical-blue-100 text-gray-800 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Activity className="h-10 w-10 text-medical-blue-600 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-gray-900">AI Tumor Segmentation</h1>
          </div>
          <div className="flex gap-4">
            {selectedType && (
              <button
                onClick={resetState} // Go back to selection
                className="flex items-center text-medical-blue-600 hover:text-medical-blue-800 transition"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Selection
              </button>
            )}
            <button
              onClick={() => navigate('/')} // Go back to tools
              className="flex items-center text-medical-blue-600 hover:text-medical-blue-800 transition"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Tools
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {!selectedType ? (
          <>
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">Select a Tumor Segmentation Type</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { type: 'brain_tumor', label: 'Brain Tumor Segmentation', Icon: Brain },
                { type: 'lung_tumor_image', label: 'Lung Tumor (Numpy Image)', Icon: Lungs },
                { type: 'lung_tumor_video', label: 'Lung Tumor (Video)', Icon: Lungs }
              ].map(({ type, label, Icon }) => (
                <div
                  key={type}
                  className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedType(type)} // Set the selected type
                >
                  <div className="flex flex-col items-center">
                    <Icon className="h-24 w-24 text-medical-blue-600 group-hover:text-medical-blue-800 transition-transform" />
                    <h3 className="text-2xl font-semibold mt-5 text-gray-800">{label}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {selectedType === 'brain_tumor' ? 'Brain' : 'Lung'} Tumor Segmentation
            </h2>

            {!uploadedFile ? (
              <ImageUploader
                onUpload={(file) => {
                  setUploadedFile(file);
                  handleFileUpload(file);
                }}
                acceptedFormats={
                  selectedType === 'brain_tumor' ? ['.png', '.jpg', '.jpeg'] :
                  selectedType === 'lung_tumor_image' ? ['.npy'] :
                  selectedType === 'lung_tumor_video' ? ['.mp4'] : []
                }
                isSingleNpy={selectedType === 'lung_tumor_image'} // Restrict to single .npy file for lung tumor image
              />
            ) : (
              <>
                {selectedType === "lung_tumor_video" ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-700 mb-3">Original Video</h3>
                      {originalVideo ? (
                        <video id="original-video" controls className="rounded-lg mt-6 w-full" key={originalVideo}>
                          <source src={originalVideo} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <p className="text-red-500">No original video available.</p>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-700 mb-3">Processed Video</h3>
                      {processedVideo ? (
                        <video id="processed-video" controls className="rounded-lg mt-6 w-full" key={processedVideo}>
                          <source src={processedVideo} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <p className="text-red-500">No processed video available.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-700 mb-3">Original Image</h3>
                      {originalImage ? (
                        <img src={originalImage} alt="Original" className="rounded-lg shadow-md mt-6 w-full" />
                      ) : (
                        <p className="text-red-500">No original image available.</p>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-700 mb-3">Segmented Result</h3>
                      {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      ) : highlightedImage ? (
                        <img src={highlightedImage} alt="Segmented" className="rounded-lg mt-6 w-full" />
                      ) : (
                        <p className="text-red-500">No segmented image available.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TumorSegmentation;