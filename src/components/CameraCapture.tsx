"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, RotateCcw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CameraCapture({ onCapture, onClose, isOpen }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check your camera permissions and try again.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (!context) {
        throw new Error("Could not get canvas context");
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/jpeg", 0.8);
      });
      
      // Create file from blob
      const file = new File([blob], `live-photo-${Date.now()}.jpg`, {
        type: "image/jpeg"
      });
      
      // Store the file and create preview URL
      setCapturedFile(file);
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage(imageUrl);
      
      // Stop camera after capture
      stopCamera();
      
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError("Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCapturedFile(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedFile) {
      onCapture(capturedFile);
      
      // Clean up
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
      setCapturedImage(null);
      setCapturedFile(null);
      onClose();
    }
  }, [capturedFile, capturedImage, onCapture, onClose]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isStreaming, stopCamera, startCamera]);

  // Cleanup on unmount
  const handleClose = useCallback(() => {
    stopCamera();
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCapturedFile(null);
    setError(null);
    onClose();
  }, [stopCamera, capturedImage, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[99999] flex items-end justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '2rem',
      }}
    >
      <Card 
        className="w-full max-w-2xl z-[99999]"
        style={{
          position: 'relative',
          maxHeight: '90vh',
          overflow: 'auto',
          marginBottom: '0',
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Take Live Photo</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="relative bg-black rounded-lg overflow-hidden">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-[400px]"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <CameraOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">Camera not started</p>
                      <Button onClick={startCamera} disabled={isCapturing}>
                        {isCapturing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured photo"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            {!capturedImage ? (
              <>
                {isStreaming && (
                  <>
                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      disabled={isCapturing}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Switch Camera
                    </Button>
                    <Button
                      onClick={capturePhoto}
                      disabled={isCapturing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isCapturing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 mr-2" />
                      )}
                      Capture Photo
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button onClick={retakePhoto} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={confirmPhoto} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Use This Photo
                </Button>
              </>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Hold your ID document clearly visible in the frame</p>
            <p>Ensure good lighting and avoid shadows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
