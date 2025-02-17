import 'package:flutter/material.dart';
import 'src/widgets/counter_widget.dart';


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