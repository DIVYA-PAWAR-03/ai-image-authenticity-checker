/**
 * LoadingScreen.jsx
 * ─────────────────
 * Shown while the image is being uploaded and analyzed.
 * Calls the backend API and navigates to ResultScreen on completion.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyzeImage } from '../services/apiService';

export default function LoadingScreen({ navigation, route }) {
  const { imageAsset } = route.params;

  // Rotation animation for spinner
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // Pulse animation for text
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start spin animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Call the backend
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      const mimeType = imageAsset.mimeType || 'image/jpeg';
      const fileName = imageAsset.fileName || 'image.jpg';

      const result = await analyzeImage(imageAsset.uri, mimeType, fileName);

      // Navigate to result screen
      navigation.replace('Result', {
        result,
        imageUri: imageAsset.uri,
      });
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not reach the checking server. Please make sure:\n\n' +
        '• Your backend server is running\n' +
        '• Your phone is on the same WiFi as your computer\n\n' +
        'Error: ' + error.message,
        [
          { text: 'Try Again', onPress: () => runAnalysis() },
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Preview of the image being analyzed */}
      {imageAsset?.uri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageAsset.uri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>
      )}

      <View style={styles.content}>
        {/* Animated spinner */}
        <View style={styles.spinnerWrapper}>
          <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]} />
          <View style={styles.spinnerCenter}>
            <Ionicons name="shield-checkmark" size={36} color="#7c3aed" />
          </View>
        </View>

        {/* Animated loading text */}
        <Animated.Text style={[styles.loadingTitle, { opacity: pulseAnim }]}>
          Analyzing Image...
        </Animated.Text>

        <Text style={styles.loadingSubtitle}>
          Our AI is carefully checking your image.{'\n'}
          This usually takes just a moment.
        </Text>

        {/* Step indicators */}
        <View style={styles.stepsContainer}>
          <LoadingStep icon="cloud-upload-outline" text="Uploading image securely" delay={0} />
          <LoadingStep icon="cpu-outline"           text="Running AI analysis"     delay={600} />
          <LoadingStep icon="stats-chart-outline"   text="Generating verdict"      delay={1200} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function LoadingStep({ icon, text, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.stepRow, { opacity }]}>
      <Ionicons name={icon} size={20} color="#7c3aed" />
      <Text style={styles.stepText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  imagePreviewContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 26, 0.6)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  spinnerWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  spinnerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#7c3aed',
    borderRightColor: 'rgba(124, 58, 237, 0.4)',
  },
  spinnerCenter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 17,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepText: {
    fontSize: 16,
    color: '#d1d5db',
    fontWeight: '500',
  },
});
