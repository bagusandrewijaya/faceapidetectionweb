# faceapidetectionweb

A Flutter package that enables face detection and expression analysis through JavaScript interoperability.

## Prerequisites

Before using this package, you must download the required face detection model files.

1. Download the model files from:
   https://github.com/bagusandrewijaya/modelfaceapidetection

2. Create the following directory structure in your project:
   ```
   web/
   └── js/
       ├── camera_logic.js
       ├── face-api.js
       └── models/
           └── [model files]
   ```

3. Add the required scripts to your `index.html`:
   ```html
   <head>
       <script src="js/camera_logic.js" defer></script>
       <script src="js/face-api.js" defer></script>
       <!-- Other head elements -->
   </head>
   ```

## Usage Guide

### JSBridge Class

The `JSBridge` class provides the interface between Flutter and JavaScript for camera control and face detection.

#### Methods

**initialize**
```dart
void initialize({
    required Function(bool) onCameraStateChanged,
    required Function(String) onCameraError,
    required Function(String, String) onPhotoTaken,
    required Function(bool, List<Map<String, dynamic>>) onFaceDetectionStatus
})
```
Initializes the bridge with callback functions for various events:
- `onCameraStateChanged`: Notifies when camera state changes
- `onCameraError`: Provides camera error messages
- `onPhotoTaken`: Called when a photo is captured
- `onFaceDetectionStatus`: Reports face detection results

**openCamera**
```dart
Future<bool> openCamera()
```
Activates the camera. Returns a Future that resolves to:
- `true`: Camera opened successfully
- `false`: Camera failed to open

**closeCamera**
```dart
void closeCamera()
```
Deactivates the camera.

**takePhoto**
```dart
void takePhoto()
```
Captures a photo using the active camera.

### CounterWidget

A stateful widget that demonstrates the implementation of camera controls and face detection.

#### State Properties

```dart
bool _isCameraOpen
String _lastPhotoTaken
String _lastPhotoWithBox
bool _faceDetected
List<Map<String, dynamic>> _expressions
```

#### Key Features

The widget provides:
- Camera view container
- Face detection status display
- Expression analysis results
- Camera control buttons
- Photo preview with and without detection boxes

#### Example Implementation

```dart
class CounterWidget extends StatefulWidget {
  @override
  _CounterWidgetState createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  final JSBridge _bridge = JSBridge();
  
  void _toggleCamera() {
    if (_isCameraOpen) {
      _bridge.closeCamera();
    } else {
      _bridge.openCamera();
    }
  }
  
  // ... rest of the implementation
}
```

## UI Components

The package includes several UI components:
- Camera viewport container
- Status indicators for face detection
- Expression analysis display
- Camera control interface
- Photo preview displays

Each component is designed to work seamlessly with the face detection functionality while maintaining a responsive layout.