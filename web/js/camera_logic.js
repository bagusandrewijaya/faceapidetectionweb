let stream = null;
let videoElement = null;
let detectInterval = null;

async function initializeFaceDetection() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('js/models/');
        await faceapi.nets.faceExpressionNet.loadFromUri('js/models/');
        console.log('Face detection models loaded');
        return true;
    } catch (error) {
        console.error('Error loading face detection models:', error);
        return false;
    }
}



function sendFaceDetectionStatus(isDetected, detections) {
    // Prepare expressions data in a format that's easier to parse in Dart
    const expressionsData = [];
    if (isDetected && detections.length > 0) {
        detections.forEach(detection => {
            // Convert expressions object to a simpler format
            const expressions = {};
            for (const [expression, value] of Object.entries(detection.expressions)) {
                expressions[expression] = parseFloat(value.toFixed(2)); // Round to 2 decimal places
            }
            expressionsData.push(expressions);
        });
    }

    // Create a simple object structure
    const data = {
        detected: isDetected,
        expressions: expressionsData
    };

    if (window.onFaceDetectionStatus) {
        window.onFaceDetectionStatus(JSON.stringify(data));
    }
}

async function detectFaces() {
    if (!videoElement) return;

    // Check if video is ready and has valid dimensions
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.log('Video dimensions not ready yet');
        return;
    }

    try {
        // Ensure canvas exists and matches video dimensions
        let canvas = document.getElementById('face-detection-canvas');
        if (!canvas) {
            canvas = faceapi.createCanvasFromMedia(videoElement);
            canvas.id = 'face-detection-canvas';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            document.getElementById('camera-container').append(canvas);
        }

        // Ensure canvas dimensions match video
        const displaySize = {
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight
        };

        if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
            faceapi.matchDimensions(canvas, displaySize);
        }

        const detections = await faceapi.detectAllFaces(
            videoElement,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            sendFaceDetectionStatus(true, detections);
        } else {
            sendFaceDetectionStatus(false, []);
        }
    } catch (error) {
        console.error('Error in face detection:', error);
        sendFaceDetectionStatus(false, []); // Send failure status
    }
}

async function startFaceDetection() {
    if (detectInterval) {
        clearInterval(detectInterval);
    }

    // Wait for video to be properly loaded
    await new Promise((resolve) => {
        const checkDimensions = () => {
            if (videoElement.videoWidth && videoElement.videoHeight) {
                resolve();
            } else {
                setTimeout(checkDimensions, 100);
            }
        };
        checkDimensions();
    });

    detectInterval = setInterval(detectFaces, 100);
}

async function initializeCamera() {
    try {
        const modelLoaded = await initializeFaceDetection();
        if (!modelLoaded) {
            throw new Error('Failed to load face detection models');
        }

        // Create or get container
        let container = document.getElementById('camera-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'camera-container';
            container.style.position = 'absolute';
            container.style.top = '60px';
            container.style.bottom = '30%';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '50vh';
            container.style.zIndex = '1000';
            container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            container.style.padding = '0';
            container.style.borderRadius = '0';
            container.style.marginBottom = '20px';
            document.body.appendChild(container);
        }

        // Always create a new video element
        if (videoElement) {
            videoElement.remove(); // Remove old video element if exists
        }
        
        videoElement = document.createElement('video');
        videoElement.id = 'camera-preview';
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '50vh';
        videoElement.style.objectFit = 'cover';
        
        container.appendChild(videoElement);
        container.style.display = 'block';

        // Request new camera stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop any existing stream
        }
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        videoElement.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve();
            };
        });

        // Start face detection after video is fully ready
        await startFaceDetection();

        if (window.onCameraStateChanged) {
            window.onCameraStateChanged(true);
        }

        return true;
    } catch (error) {
        console.error('Error accessing camera:', error);
        if (window.onCameraError) {
            window.onCameraError(error.message);
        }
        return false;
    }
}

function stopCamera() {
    if (detectInterval) {
        clearInterval(detectInterval);
        detectInterval = null;
    }

    // Stop all tracks in the stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Remove video element and canvas
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.remove();
        videoElement = null;
    }

    // Hide container
    const container = document.getElementById('camera-container');
    if (container) {
        // Remove face detection canvas
        const canvas = document.getElementById('face-detection-canvas');
        if (canvas) {
            canvas.remove();
        }
        container.style.display = 'none';
    }

    if (window.onCameraStateChanged) {
        window.onCameraStateChanged(false);
    }
}

async function takePhoto() {
    if (!stream || !videoElement) return null;

    // Create canvas for original photo
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg');

    // Detect faces in the current frame
    const detections = await faceapi.detectAllFaces(
        videoElement,
        new faceapi.TinyFaceDetectorOptions()
    ).withFaceExpressions();

    // Create canvas for photo with detection boxes
    const boxCanvas = document.createElement('canvas');
    boxCanvas.width = videoElement.videoWidth;
    boxCanvas.height = videoElement.videoHeight;
    const boxContext = boxCanvas.getContext('2d');
    
    // Draw the original image first
    boxContext.drawImage(videoElement, 0, 0);

    let boxPhotoData;
    // Draw detection boxes if faces are found
    if (detections.length > 0) {
        const displaySize = {
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
        };
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Draw the detection boxes
        faceapi.draw.drawDetections(boxCanvas, resizedDetections);
        // Draw the face expressions
        faceapi.draw.drawFaceExpressions(boxCanvas, resizedDetections);
        boxPhotoData = boxCanvas.toDataURL('image/jpeg');
    } else {
        // If no face detected, use original photo without boxes
        boxPhotoData = photoData;
    }

    if (window.onPhotoTaken) {
        window.onPhotoTaken(photoData, boxPhotoData);
    }

    return { original: photoData, box: boxPhotoData };
}

// Export functions to window object for Flutter JS interop
window.initializeCamera = initializeCamera;
window.stopCamera = stopCamera;
window.takePhoto = takePhoto;
window.initializeFaceDetection = initializeFaceDetection;
window.detectFaces = detectFaces;