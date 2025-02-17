import 'package:faceapidetectionweb/faceapidetectionweb.dart';
import 'package:flutter/material.dart';


void main() {
  WidgetsFlutterBinding.ensureInitialized(); // Add initialization binding
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Web Counter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Face Detection'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: const CounterWidget(),
    );
  }
}


class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
final JSBridge _jsBridge = JSBridge();
  bool _isCameraOpen = false;
  String? _lastPhotoTaken;
  String? _lastPhotoWithBox;
  bool _faceDetected = false;
  List<Map<String, dynamic>> _expressions = [];

  @override
  void initState() {
    super.initState();
    _jsBridge.initialize(
      onCameraStateChanged: (isOpen) {
        setState(() {
          _isCameraOpen = isOpen;
        });
      },
      onCameraError: (error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Camera Error: $error')),
        );
      },
      onPhotoTaken: (originalPhotoData, secondPhotoData) {
        setState(() {
          _lastPhotoTaken = originalPhotoData;
          _lastPhotoWithBox = secondPhotoData; // Store the second photo
        });
      },
      onFaceDetectionStatus: (detected, expressions) {
        setState(() {
          _faceDetected = detected;
          _expressions = expressions;
        });
      },
    );
  }

  void _toggleCamera() async {
    if (_isCameraOpen) {
      _jsBridge.closeCamera();
    } else {
      final success = await _jsBridge.openCamera();
      if (!success) {
        if (mounted) {
       
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          // Empty box for camera
          Container(
            width: MediaQuery.of(context).size.width, // Full width of the screen
            height: MediaQuery.of(context).size.height * 0.5, // 50% of screen height
            color: Colors.grey[300], // Placeholder color
          ),
          
          // Display face detection status
          if (_isCameraOpen) ...[
            const SizedBox(height: 16),
            Text(
              _faceDetected ? 'Face Detected!' : 'No Face Detected',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _faceDetected ? Colors.green : Colors.red,
              ),
            ),
            if (_faceDetected && _expressions.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Expressions: ${_expressions.toString()}',
                style: const TextStyle(fontSize: 14),
              ),
            ],
          ],

          const SizedBox(height: 30),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: _toggleCamera,
                icon: Icon(_isCameraOpen ? Icons.camera_indoor_outlined : Icons.camera),
                label: Text(_isCameraOpen ? 'Close Camera' : 'Open Camera'),
              ),
              if (_isCameraOpen) ...[
                const SizedBox(width: 16),
                ElevatedButton.icon(
                  onPressed: () => _jsBridge.takePhoto(),
                  icon: const Icon(Icons.photo_camera),
                  label: const Text('Take Photo'),
                ),
              ],
            ],
          ),
          if (_lastPhotoTaken != null || _lastPhotoWithBox != null) ...[
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_lastPhotoTaken != null) ...[
                  Image.network(
                    _lastPhotoTaken!,
                    width: 150,
                    height: 150,
                    fit: BoxFit.cover,
                  ),
                  const SizedBox(width: 16),
                ],
                if (_lastPhotoWithBox != null) ...[
                  Image.network(
                    _lastPhotoWithBox!,
                    width: 150,
                    height: 150,
                    fit: BoxFit.cover,
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}