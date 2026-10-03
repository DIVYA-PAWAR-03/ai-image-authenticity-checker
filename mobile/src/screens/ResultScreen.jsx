/**
 * ResultScreen.jsx
 * ────────────────
 * Displays the AI analysis verdict in a clear, elderly-friendly format.
 * Color-coded: 🟢 Green = Real, 🔴 Red = AI-Generated, 🟡 Yellow = Uncertain
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Color themes per verdict
const VERDICT_THEMES = {
  LIKELY_REAL: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#10b981',
    glow: '#10b981',
    icon: 'checkmark-circle',
    badge: '#10b981',
  },
  LIKELY_AI_GENERATED: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#ef4444',
    glow: '#ef4444',
    icon: 'warning',
    badge: '#ef4444',
  },
  UNCERTAIN: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.4)',
    text: '#f59e0b',
    glow: '#f59e0b',
    icon: 'help-circle',
    badge: '#f59e0b',
  },
};

export default function ResultScreen({ navigation, route }) {
  const { result, imageUri } = route.params;

  const theme = VERDICT_THEMES[result.verdict] || VERDICT_THEMES.UNCERTAIN;

  // Entry animations
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `AI Image Check Result\n\n` +
          `${result.emoji} ${result.title}\n\n` +
          `Confidence: ${result.confidence_percent}%\n\n` +
          `${result.explanation}\n\n` +
          `Checked with AI Image Authenticity Checker`,
      });
    } catch (e) {}
  };

  const handleCheckAnother = () => {
    navigation.navigate('Home');
  };

  const confidenceBar = `${result.confidence_percent}%`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={[styles.imageBorder, { borderColor: theme.border }]} />
          </View>
        )}

        {/* Main Verdict Card */}
        <Animated.View
          style={[
            styles.verdictCard,
            { backgroundColor: theme.bg, borderColor: theme.border },
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          {/* Emoji */}
          <Text style={styles.emoji}>{result.emoji}</Text>

          {/* Verdict Title */}
          <Text style={[styles.verdictTitle, { color: theme.text }]}>
            {result.title}
          </Text>

          {/* Confidence bar */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={styles.barBackground}>
              <Animated.View
                style={[
                  styles.barFill,
                  { width: confidenceBar, backgroundColor: theme.badge },
                ]}
              />
            </View>
            <Text style={[styles.confidencePercent, { color: theme.text }]}>
              {result.confidence_percent}%
            </Text>
          </View>
        </Animated.View>

        {/* Explanation Card */}
        <Animated.View
          style={[styles.explanationCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.explanationHeader}>
            <Ionicons name="information-circle" size={22} color="#7c3aed" />
            <Text style={styles.explanationTitle}>What does this mean?</Text>
          </View>
          <Text style={styles.explanationText}>{result.explanation}</Text>
        </Animated.View>

        {/* AI Score Detail */}
        <Animated.View
          style={[styles.detailCard, { opacity: fadeAnim }]}
        >
          <View style={styles.detailRow}>
            <Ionicons name="analytics-outline" size={20} color="#9ca3af" />
            <Text style={styles.detailLabel}>AI Probability Score</Text>
            <Text style={styles.detailValue}>
              {(result.ai_probability * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.scaleBar}>
            <View style={styles.scaleSection}>
              <Text style={styles.scaleLabel}>🟢 Real</Text>
            </View>
            <View style={styles.scaleSection}>
              <Text style={styles.scaleLabel}>🟡 Uncertain</Text>
            </View>
            <View style={styles.scaleSection}>
              <Text style={styles.scaleLabel}>🔴 AI</Text>
            </View>
          </View>
          <View style={styles.scaleBarFull}>
            <View
              style={[
                styles.scaleIndicator,
                { left: `${result.ai_probability * 100}%`, backgroundColor: theme.badge },
              ]}
            />
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCheckAnother}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Check Another Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={22} color="#7c3aed" />
            <Text style={styles.shareButtonText}>Share Result</Text>
          </TouchableOpacity>
        </View>

        {/* Safety reminder */}
        <View style={styles.reminderBox}>
          <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
          <Text style={styles.reminderText}>
            Always verify important information from trusted sources before sharing.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scroll: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 220,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2,
  },
  verdictCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  verdictTitle: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 20,
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barBackground: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  confidencePercent: {
    fontSize: 22,
    fontWeight: '800',
  },
  explanationCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  explanationText: {
    fontSize: 17,
    color: '#d1d5db',
    lineHeight: 26,
  },
  detailCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  scaleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scaleSection: {
    flex: 1,
    alignItems: 'center',
  },
  scaleLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  scaleBarFull: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    position: 'relative',
  },
  scaleIndicator: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  shareButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7c3aed',
  },
  reminderBox: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});
