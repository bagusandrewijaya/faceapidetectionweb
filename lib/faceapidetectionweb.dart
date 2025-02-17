// Export JSBridge only if platform is web
@JS()
library faceapidetectionweb;

import 'package:js/js.dart';

export './src/services/js_bridge.dart' if (dart.library.html) './src/services/js_bridge.dart';