import 'dart:convert';
import 'dart:js' as js;
//
// FUNGSI JS BRIDGE PLATFORM CHANNEL ANTARA FLUTTER DAN JS
//
class JSBridge {
  void initialize({
    required Function(bool) onCameraStateChanged,
    required Function(String) onCameraError,
    required Function(String, String) onPhotoTaken,
    required Function(bool, List<Map<String, dynamic>>) onFaceDetectionStatus,
  }) {
    js.context['onCameraStateChanged'] = (bool isOpen) {
      onCameraStateChanged(isOpen);
    };
    js.context['onCameraError'] = (String error) {
      onCameraError(error);
    };
    js.context['onPhotoTaken'] = (String originalPhotoData, String secondPhotoData) {
      onPhotoTaken(originalPhotoData, secondPhotoData);
    };
    
    js.context['onFaceDetectionStatus'] = (String jsonData) {
      try {
        final data = jsonDecode(jsonData);
        final bool detected = data['detected'] ?? false;
        final List<dynamic> rawExpressions = data['expressions'] ?? [];
        final List<Map<String, dynamic>> expressions = rawExpressions
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
        
        onFaceDetectionStatus(detected, expressions);
      } catch (e) {
        print('Error parsing face detection data: $e');
        onFaceDetectionStatus(false, []);
      }
    };
  

  }

  void incrementCounter() {
    js.context.callMethod('incrementCounter');
  }

  void decrementCounter() {
    js.context.callMethod('decrementCounter');
  }

  String helloWorld() {
    return js.context.callMethod('helloWorld');
  }

  Future<bool> openCamera() async {
    var result = js.context.callMethod('initializeCamera');
    return result is bool ? result : false; // Ensure the result is a boolean
  }

  void closeCamera() {
    js.context.callMethod('stopCamera');
  }

  void takePhoto() {
    js.context.callMethod('takePhoto');
  }
}