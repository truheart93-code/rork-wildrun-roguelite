import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';

const { width: W } = Dimensions.get('window');

const DIALOGUE = [
  {
    speaker: 'DR. WREN',
    text: "Ah, you're finally here. I'm Dr. Wren â field biologist, naturalist, and apparently the only person willing to venture into these territories.",
    highlight: null,
  },
  {
    speaker: 'DR. WREN',
    text: "We've detected unusual creature activity across four biomes: Savanna, Ocean, Jungle, and Arctic. Each is teeming with wild animals that have never been properly catalogued.",
    highlight: 'four biomes',
  },
  {
    speaker: 'DR. WREN',
    text: "Your mission is to travel through these biomes, fight wild creatures to weaken them, then attempt to Bond with them â forming a partnership to join your squad.",
    highlight: 'Bond',
  },
  {
    speaker: 'DR. WREN',
    text: "Each biome is a dungeon â a series of rooms. Fight rooms, Catch rooms, Rest camps, Treasure chests, and at the top... a Boss.",
    highlight: 'Boss',
  },
  {
    speaker: 'DR. WREN',
    text: "Build a squad of up to 3 creatures. Each has unique HP, Attack, Defense, and Speed stats. A well-balanced squad is the difference between glory and defeat.",
    highlight: null,
  },
  {
    speaker: 'DR. WREN',
    text: "When your creatures fall in battle and none remain standing â the run ends. But you'll earn Skulls, our research currency, to permanently upgrade for the next run.",
    highlight: 'Skulls',
  },
  {
    speaker: 'DR. WREN',
    text: "Every creature you bond with gets added to the Field Journal â a living record of our discoveries. Fill it completely and you'll have catalogued every known species.",
    highlight: 'Field Journal',
  },
  {
    speaker: 'DR. WREN',
    text: "The wilderness is unforgiving. But science waits for no one. Good luck out there, researcher. The animals are counting on us to understand them.",
    highlight: null,
  },
];

const WREN_ANIMALS = ['snowy_owl', 'capybara', 'narwhal'];

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [typing, setTyping] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const wrenFloat = useRef(new Animated.Value(0)).current;
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wrenFloat, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(wrenFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    setDisplayedText('');
    setTyping(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    const fullText = DIALOGUE[page].text;
    let i = 0;
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typingRef.current!);
        setTyping(false);
      }
    }, 22);

    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, [page]);

  const handleNext = () => {
    if (typing) {
      // Skip typewriter â show full text
      if (typingRef.current) clearInterval(typingRef.current);
      setDisplayedText(DIALOGUE[page].text);
      setTyping(false);
      return;
    }
    if (page < DIALOGUE.length - 1) {
      setPage(p => p + 1);
    } else {
      router.replace('/starter-camp');
    }
  };

  const skip = () => router.replace('/starter-camp');

  const current = DIALOGUE[page];
  const isLast = page === DIALOGUE.length - 1;

  // Highlight key words in text
  const renderText = () => {
    if (!current.highlight || !displayedText.includes(current.highlight)) {
      return (
        <RetroText variant="body" color={COLORS.whiteDim} style={styles.dialogueText}>
          {displayedText}
        </RetroText>
      );
    }
    const parts = displayedText.split(current.highlight);
    return (
      <RetroText variant="body" color={COLORS.whiteDim} style={styles.dialogueText}>
        {parts[0]}
        <RetroText variant="bodyBold" color={COLORS.green} style={styles.dialogueText}>
          {current.highlight}
        </RetroText>
        {parts[1] ?? ''}
      </RetroText>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <RetroText variant="label" color={COLORS.grayDark} style={styles.skipText}>SKIP âº</RetroText>
      </TouchableOpacity>

      {/* Dr. Wren scene */}
      <View style={styles.sceneArea}>
        {/* Floating animals in background */}
        <Animated.View style={[styles.bgAnimal, { left: '5%', top: 20 }]}>
          <AnimalSilhouette animalId="lion" color={COLORS.savanna} size={40} />
        </Animated.View>
        <Animated.View style={[styles.bgAnimal, { right: '5%', top: 30 }]}>
          <AnimalSilhouette animalId="orca" color={COLORS.ocean} size={36} />
        </Animated.View>
        <Animated.View style={[styles.bgAnimal, { left: '15%', bottom: 20 }]}>
          <AnimalSilhouette animalId="gorilla" color={COLORS.jungle} size={32} />
        </Animated.View>
        <Animated.View style={[styles.bgAnimal, { right: '12%', bottom: 30 }]}>
          <AnimalSilhouette animalId="polar_bear" color={COLORS.arctic} size={38} />
        </Animated.View>

        {/* Dr. Wren character */}
        <Animated.View style={[styles.wrenContainer, { transform: [{ translateY: wrenFloat }] }]}>
          <View style={styles.wrenBadge}>
            <RetroText variant="label" color={COLORS.green} style={styles.wrenTitle}>DR. WREN</RetroText>
            <RetroText variant="body" color={COLORS.grayDark} style={styles.wrenSubtitle}>Field Biologist</RetroText>
          </View>
          <View style={styles.wrenSilhouettes}>
            {WREN_ANIMALS.map((id, i) => (
              <Animated.View key={id} style={{ opacity: 0.9 }}>
                <AnimalSilhouette animalId={id} color={COLORS.green} size={44 - i * 4} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Dialogue box */}
      <Animated.View style={[styles.dialogueBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.dialogueHeader}>
          <View style={styles.speakerDot} />
          <RetroText variant="label" color={COLORS.green} style={styles.speakerName}>
            {current.speaker}
          </RetroText>
          {typing && (
            <View style={styles.typingDots}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.dialogueTextArea}>
          {renderText()}
        </View>

        {/* Progress pips */}
        <View style={styles.progressRow}>
          {DIALOGUE.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressPip,
                i === page && styles.progressPipActive,
                i < page && styles.progressPipDone,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
          <RetroText variant="label" color={COLORS.bg} style={styles.nextText}>
            {typing ? 'SKIP âº' : isLast ? 'BEGIN â' : 'NEXT â'}
          </RetroText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bgTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
    backgroundColor: '#0a1a0e',
  },
  bgBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
    backgroundColor: COLORS.bg,
  },
  skipBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  skipText: { fontSize: 9 },
  sceneArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgAnimal: { position: 'absolute', opacity: 0.12 },
  wrenContainer: { alignItems: 'center', gap: 12 },
  wrenBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.green + '40',
  },
  wrenTitle: { fontSize: 11 },
  wrenSubtitle: { fontSize: 12, marginTop: 2 },
  wrenSilhouettes: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  dialogueBox: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 2,
    borderTopColor: COLORS.green + '60',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  dialogueHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speakerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  speakerName: { fontSize: 9, flex: 1 },
  typingDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.green },
  dialogueTextArea: { minHeight: 80 },
  dialogueText: { fontSize: 14, lineHeight: 22 },
  progressRow: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  progressPip: { width: 20, height: 4, borderRadius: 2, backgroundColor: COLORS.grayDark },
  progressPipActive: { backgroundColor: COLORS.green, width: 28 },
  progressPipDone: { backgroundColor: COLORS.greenDark },
  nextBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextText: { fontSize: 10 },
});
