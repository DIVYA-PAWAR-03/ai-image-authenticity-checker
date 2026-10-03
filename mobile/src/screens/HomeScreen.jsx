/**
 * HomeScreen.jsx
 * ─────────────
 * Main screen of the AI Image Authenticity Checker.
 * Elderly-friendly design: large text, big button, simple language.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [scaleAnim] = useState(new Animated.Value(1));

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const pickFromGallery = async () => {
    animateButton();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Needed',
        'Please allow access to your photos so we can check the image for you.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      navigation.navigate('Loading', { imageAsset: asset });
    }
  };

  const pickFromCamera = async () => {
    animateButton();

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera Permission Needed',
        'Please allow camera access so you can take a photo to check.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      navigation.navigate('Loading', { imageAsset: asset });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.shieldIconContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#7c3aed" />
        </View>
        <Text style={styles.appTitle}>Image Checker</Text>
        <Text style={styles.appSubtitle}>AI-Powered Authenticity Detector</Text>
      </View>

      {/* Hero Text */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Is This Image Real?</Text>
        <Text style={styles.heroDescription}>
          See a suspicious image on WhatsApp or Facebook?{'\n'}
          Let us check if it was made by an AI.
        </Text>

        {/* How it works */}
        <View style={styles.stepsContainer}>
          <StepItem icon="image-outline" number="1" text="Pick or take a photo" />
          <StepItem icon="scan-outline"  number="2" text="We check it for you"  />
          <StepItem icon="checkmark-circle-outline" number="3" text="See the result clearly" />
        </View>
      </View>

      {/* Main Action Buttons */}
      <View style={styles.buttonSection}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={pickFromGallery}
            activeOpacity={0.85}
          >
            <Ionicons name="images" size={32} color="#fff" />
            <Text style={styles.primaryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={pickFromCamera}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={28} color="#7c3aed" />
          <Text style={styles.secondaryButtonText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy note */}
      <View style={styles.privacyNote}>
        <Ionicons name="lock-closed" size={16} color="#6b7280" />
        <Text style={styles.privacyText}>
          Your image is checked privately and deleted immediately after.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function StepItem({ icon, number, text }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Ionicons name={icon} size={22} color="#7c3aed" style={styles.stepIcon} />
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  shieldIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroDescription: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  stepsContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  stepIcon: {
    marginRight: 10,
  },
  stepText: {
    fontSize: 17,
    color: '#e5e7eb',
    fontWeight: '500',
    flex: 1,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7c3aed',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 6,
  },
  privacyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    flex: 1,
    lineHeight: 18,
  },
});
