import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BiomeType } from '@/constants/types';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import HpBar from '@/components/HpBar';
import SquadSlots from '@/components/SquadSlots';
import { Swords, Heart, Package, ArrowLeftRight, Skull, Trophy, UserPlus, ChevronUp } from 'lucide-react-native';

const { width: W, height: H } = Dimensions.get('window');

export default function BattleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { run, battle, attack, bond, swapAnimal, useItem, completeRoom } = useGame();

  const playerShake = useRef(new Animated.Value(0)).current;
  const enemyShake = useRef(new Animated.Value(0)).current;
  const enemyBob = useRef(new Animated.Value(0)).current;
  const playerBob = useRef(new Animated.Value(0)).current;
  const enemyFlash = useRef(new Animated.Value(1)).current;
  const playerFlash = useRef(new Animated.Value(1)).current;

  const [showDmg, setShowDmg] = useState<{ value: number; isPlayer: boolean } | null>(null);
  const dmgAnim = useRef(new Animated.Value(0)).current;
  const dmgUpValue = useRef(new Animated.Value(-50)).current;

  const messageScroll = useRef<ScrollView>(null);
  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [catchBarWidth, setCatchBarWidth] = useState(0);

  // Idle bob animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(enemyBob, { toValue: -8, duration: 1400, useNativeDriver: true }),
        Animated.timing(enemyBob, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(playerBob, { toValue: -6, duration: 1600, useNativeDriver: true }),
        Animated.timing(playerBob, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const animateHit = useCallback((target: 'player' | 'enemy') => {
    const shake = target === 'player' ? playerShake : enemyShake;
    const flash = target === 'player' ? playerFlash : enemyFlash;
    Animated.sequence([
      Animated.timing(shake, { toValue: 14, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -14, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(flash, { toValue: 0.2, duration: 60, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0.4, duration: 60, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const showDamageNumber = useCallback((value: number, isPlayer: boolean) => {
    setShowDmg({ value, isPlayer });
    dmgAnim.setValue(0);
    Animated.timing(dmgAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start(() => {
      setShowDmg(null);
    });
  }, [dmgAnim]);

  const prevEnemyHp = useRef(battle?.enemy.currentHp ?? 0);
  const prevPlayerHp = useRef<number | null>(null);

  useEffect(() => {
    if (!battle) return;
    if (battle.enemy.currentHp < prevEnemyHp.current) {
      animateHit('enemy');
      showDamageNumber(prevEnemyHp.current - battle.enemy.currentHp, false);
    }
    prevEnemyHp.current = battle.enemy.currentHp;
  }, [battle?.enemy.currentHp]);

  useEffect(() => {
    if (!battle) return;
    const activeAnimal = run.squad[battle.activeSquadIndex];
    if (!activeAnimal) return;
    const currentHp = activeAnimal.currentHp;
    if (prevPlayerHp.current !== null && currentHp < prevPlayerHp.current) {
      animateHit('player');
      showDamageNumber(prevPlayerHp.current - currentHp, true);
    }
    prevPlayerHp.current = currentHp;
  }, [run.squad, battle?.activeSquadIndex]);

  useEffect(() => {
    messageScroll.current?.scrollToEnd({ animated: true });
  }, [battle?.messages.length]);

  const handleContinue = () => {
    completeRoom();
    router.back();
  };

  if (!battle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <RetroText variant="heading" color={COLORS.red}>No battle active</RetroText>
      </View>
    );
  }

  const activeAnimal = run.squad[battle.activeSquadIndex];
  const enemyBiomeColor = BIOME_COLORS[battle.enemy.biome as BiomeType] ?? COLORS.red;
  const playerBiomeColor = activeAnimal ? (BIOME_COLORS[activeAnimal.biome as BiomeType] ?? COLORS.green) : COLORS.green;
  const isOver = battle.turnPhase === 'victory' || battle.turnPhase === 'defeat' || battle.turnPhase === 'caught';
  const isEnemyTurn = battle.turnPhase === 'enemy' || battle.turnPhase === 'resolving';
  const catchChance = battle.catchChance;

  const currentBiome = battle.enemy.biome as BiomeType;
  const biomeGradients: Record<BiomeType, readonly [string, string, string, string]> = {
    savanna: ['#1a0e04', '#3d1e06', '#7a3d10', '#b56020'] as const,
    ocean: ['#020810', '#041830', '#072850', '#0a3870'] as const,
    jungle: ['#010a01', '#041404', '#082808', '#104010'] as const,
    arctic: ['#05080f', '#0a1020', '#101828', '#1a2838'] as const,
  };
  const groundColors: Record<BiomeType, [string, string]> = {
    savanna: ['#5a3508', '#3d2505'],
    ocean: ['#030d22', '#020810'],
    jungle: ['#061206', '#030803'],
    arctic: ['#0a1018', '#060c12'],
  };

  const bondLabel = battle.isCatchable ? `BOND (${run.bondAttemptsRemaining})` : 'BOND';

  const enemyHpPct = battle.enemy.currentHp / battle.enemy.maxHp;
  const playerHpPct = activeAnimal ? activeAnimal.currentHp / activeAnimal.maxHp : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── BATTLE SCENE ── */}
      <View style={styles.battleScene}>
        {/* Sky gradient */}
        <LinearGradient
          colors={biomeGradients[currentBiome]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Atmospheric glow */}
        <View style={[styles.atmosphereGlow, { backgroundColor: enemyBiomeColor + '18' }]} />

        {/* Ground */}
        <LinearGradient
          colors={groundColors[currentBiome]}
          style={styles.ground}
        />
        {/* Ground line */}
        <View style={[styles.groundLine, { backgroundColor: enemyBiomeColor + '40' }]} />

        {/* ── ENEMY SIDE (top-left) ── */}
        <View style={styles.enemySide}>
          {/* Enemy status card */}
          <View style={[styles.statusCard, styles.enemyCard]}>
            <View style={styles.statusCardInner}>
              <RetroText variant="bodyBold" color={COLORS.white} style={styles.fighterName}>
                {battle.enemy.name}
              </RetroText>
              <RetroText variant="label" color={enemyBiomeColor} style={styles.fighterLevel}>
                LV.{battle.enemy.level}
              </RetroText>
            </View>
            <HpBar
              current={battle.enemy.currentHp}
              max={battle.enemy.maxHp}
              width={140}
              height={8}
              showNumbers
            />
            {battle.isCatchable && (
              <View style={styles.bondMeter}>
                <View style={styles.bondMeterRow}>
                  <RetroText variant="label" color={COLORS.catchGreen} style={styles.bondLabel}>
                    BOND
                  </RetroText>
                  <RetroText variant="label" color={COLORS.catchGreen} style={styles.bondPct}>
                    {catchChance}%
                  </RetroText>
                </View>
                <View
                  style={styles.bondBarBg}
                  onLayout={e => setCatchBarWidth(e.nativeEvent.layout.width)}
                >
                  <Animated.View
                    style={[
                      styles.bondBarFill,
                      { width: catchBarWidth * (catchChance / 100), backgroundColor: catchChance > 60 ? COLORS.catchGreen : catchChance > 30 ? COLORS.gold : COLORS.red },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Enemy sprite */}
          <Animated.View
            style={[
              styles.enemySprite,
              {
                transform: [
                  { translateX: enemyShake },
                  { translateY: enemyBob },
                ],
                opacity: enemyFlash,
              },
            ]}
          >
            <AnimalSilhouette animalId={battle.enemy.id} color={enemyBiomeColor} size={110} />
            {/* Shadow */}
            <View style={[styles.spriteShadow, { backgroundColor: enemyBiomeColor + '30' }]} />
          </Animated.View>

          {/* Enemy damage number */}
          {showDmg && !showDmg.isPlayer && (
            <Animated.View
              style={[
                styles.dmgNumber,
                {
                  opacity: Animated.subtract(1, dmgAnim),
                  transform: [{ translateY: Animated.multiply(dmgAnim, dmgUpValue) }],
                  right: 10,
                  top: 80,
                },
              ]}
            >
              <RetroText variant="heading" color={COLORS.gold} style={styles.dmgText}>
                -{showDmg.value}
              </RetroText>
            </Animated.View>
          )}
        </View>

        {/* ── PLAYER SIDE (bottom-right) ── */}
        <View style={styles.playerSide}>
          {/* Player damage number */}
          {showDmg && showDmg.isPlayer && (
            <Animated.View
              style={[
                styles.dmgNumber,
                {
                  opacity: Animated.subtract(1, dmgAnim),
                  transform: [{ translateY: Animated.multiply(dmgAnim, dmgUpValue) }],
                  left: 10,
                  bottom: 120,
                },
              ]}
            >
              <RetroText variant="heading" color={COLORS.red} style={styles.dmgText}>
                -{showDmg.value}
              </RetroText>
            </Animated.View>
          )}

          {/* Player sprite */}
          <Animated.View
            style={[
              styles.playerSprite,
              {
                transform: [
                  { translateX: playerShake },
                  { translateY: playerBob },
                ],
                opacity: playerFlash,
              },
            ]}
          >
            {activeAnimal && (
              <>
                <AnimalSilhouette animalId={activeAnimal.id} color={playerBiomeColor} size={96} />
                <View style={[styles.spriteShadow, { backgroundColor: playerBiomeColor + '30' }]} />
              </>
            )}
          </Animated.View>

          {/* Player status card */}
          {activeAnimal && (
            <View style={[styles.statusCard, styles.playerCard]}>
              <View style={styles.statusCardInner}>
                <RetroText variant="bodyBold" color={COLORS.white} style={styles.fighterName}>
                  {activeAnimal.name}
                </RetroText>
                <RetroText variant="label" color={playerBiomeColor} style={styles.fighterLevel}>
                  LV.{activeAnimal.level}
                </RetroText>
              </View>
              <HpBar
                current={activeAnimal.currentHp}
                max={activeAnimal.maxHp}
                width={140}
                height={8}
                showNumbers
              />
            </View>
          )}
        </View>

        {/* Turn indicator */}
        {!isOver && (
          <View style={[styles.turnBadge, { backgroundColor: isEnemyTurn ? COLORS.red + 'cc' : COLORS.green + 'cc' }]}>
            <RetroText variant="label" color={COLORS.white} style={styles.turnText}>
              {isEnemyTurn ? '⚠ ENEMY TURN' : '▶ YOUR TURN'}
            </RetroText>
          </View>
        )}
      </View>

      {/* ── MESSAGE LOG ── */}
      <View style={styles.messageWrapper}>
        <ScrollView
          ref={messageScroll}
          style={styles.messageBox}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {battle.messages.slice(-6).map((msg, i, arr) => (
            <RetroText
              key={i}
              variant="body"
              color={i === arr.length - 1 ? COLORS.white : COLORS.whiteDim}
              style={[styles.messageText, i === arr.length - 1 && styles.messageTextLatest]}
            >
              {i === arr.length - 1 ? '▸ ' : '  '}{msg}
            </RetroText>
          ))}
        </ScrollView>
      </View>

      {/* ── ACTION AREA ── */}
      {isOver ? (
        <View style={[styles.actionArea, { paddingBottom: insets.bottom + 12 }]}>
          {battle.rewards && (battle.turnPhase === 'victory' || battle.turnPhase === 'caught') && (
            <View style={styles.rewardPanel}>
              <View style={styles.rewardHeaderRow}>
                <Trophy size={20} color={COLORS.gold} />
                <RetroText variant="heading" color={COLORS.gold} style={styles.rewardTitle}>
                  {battle.turnPhase === 'caught' ? 'BOND SUCCESS!' : 'VICTORY!'}
                </RetroText>
              </View>
              <View style={styles.rewardChips}>
                <View style={styles.rewardChip}>
                  <RetroText variant="label" color={COLORS.grayDark} style={styles.rewardChipLabel}>CLAWS</RetroText>
                  <RetroText variant="heading" color={COLORS.gold} style={styles.rewardChipValue}>
                    +{battle.rewards.clawsEarned}
                  </RetroText>
                </View>
                {(battle.rewards.skullsEarned ?? 0) > 0 && (
                  <View style={styles.rewardChip}>
                    <Skull size={14} color={COLORS.whiteDim} />
                    <RetroText variant="heading" color={COLORS.whiteDim} style={styles.rewardChipValue}>
                      +{battle.rewards.skullsEarned}
                    </RetroText>
                  </View>
                )}
                {battle.rewards.caughtAnimal && (
                  <View style={[styles.rewardChip, { borderColor: COLORS.green + '60', flex: 1.5 }]}>
                    <UserPlus size={14} color={COLORS.green} />
                    <RetroText variant="bodyBold" color={COLORS.green} style={styles.rewardCaughtText}>
                      {battle.rewards.caughtAnimal}{battle.rewards.addedToSquad ? ' joined!' : ' (journal)'}
                    </RetroText>
                  </View>
                )}
              </View>
            </View>
          )}

          {battle.turnPhase === 'defeat' && (
            <View style={styles.defeatBanner}>
              <Skull size={24} color={COLORS.red} />
              <RetroText variant="heading" color={COLORS.red} style={styles.defeatText}>
                SQUAD DEFEATED
              </RetroText>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.continueBtn,
              battle.turnPhase === 'defeat' && { backgroundColor: COLORS.red },
            ]}
            onPress={() => {
              if (battle.turnPhase === 'defeat') router.replace('/game-over');
              else handleContinue();
            }}
            activeOpacity={0.8}
          >
            <RetroText variant="label" color={COLORS.bg} style={styles.continueBtnText}>
              {battle.turnPhase === 'defeat' ? 'VIEW RESULTS' : 'CONTINUE →'}
            </RetroText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.actionArea, { paddingBottom: insets.bottom + 6 }]}>
          {showSwapMenu ? (
            <View style={styles.subMenu}>
              <RetroText variant="label" color={COLORS.gray} style={styles.subMenuLabel}>
                SELECT ANIMAL TO SWAP IN
              </RetroText>
              <SquadSlots
                squad={run.squad}
                maxSlots={run.squad.length}
                activeIndex={battle.activeSquadIndex}
                onTap={i => { swapAnimal(i); setShowSwapMenu(false); }}
                showHp
                compact
              />
              <TouchableOpacity onPress={() => setShowSwapMenu(false)} style={styles.cancelBtn}>
                <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 8 }}>✕ CANCEL</RetroText>
              </TouchableOpacity>
            </View>
          ) : showItemMenu ? (
            <View style={styles.subMenu}>
              <RetroText variant="label" color={COLORS.gray} style={styles.subMenuLabel}>
                SELECT ITEM
              </RetroText>
              {run.items.length === 0 ? (
                <RetroText variant="body" color={COLORS.grayDark} style={{ textAlign: 'center', paddingVertical: 8 }}>
                  No items in bag
                </RetroText>
              ) : (
                run.items.map((item, i) => (
                  <TouchableOpacity
                    key={item.uniqueId}
                    style={styles.itemRow}
                    onPress={() => { useItem(i); setShowItemMenu(false); }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.itemDot} />
                    <View style={{ flex: 1 }}>
                      <RetroText variant="bodyBold" color={COLORS.gold} style={styles.itemName}>{item.name}</RetroText>
                      <RetroText variant="body" color={COLORS.gray} style={styles.itemDesc}>{item.description}</RetroText>
                    </View>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity onPress={() => setShowItemMenu(false)} style={styles.cancelBtn}>
                <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 8 }}>✕ CANCEL</RetroText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.actionGrid}>
                {/* ATTACK */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.attackBtn, isEnemyTurn && styles.actionBtnDisabled]}
                  onPress={attack}
                  disabled={isEnemyTurn}
                  activeOpacity={0.75}
                >
                  <Swords size={22} color={isEnemyTurn ? COLORS.grayDark : COLORS.red} />
                  <RetroText variant="label" color={isEnemyTurn ? COLORS.grayDark : COLORS.red} style={styles.actionBtnText}>
                    ATTACK
                  </RetroText>
                </TouchableOpacity>

                {/* BOND */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.bondBtn,
                    (isEnemyTurn || !battle.isCatchable || run.bondAttemptsRemaining <= 0) && styles.actionBtnDisabled,
                  ]}
                  onPress={bond}
                  disabled={isEnemyTurn || !battle.isCatchable || run.bondAttemptsRemaining <= 0}
                  activeOpacity={0.75}
                >
                  <Heart size={22} color={(!isEnemyTurn && battle.isCatchable && run.bondAttemptsRemaining > 0) ? COLORS.green : COLORS.grayDark} />
                  <RetroText
                    variant="label"
                    color={(!isEnemyTurn && battle.isCatchable && run.bondAttemptsRemaining > 0) ? COLORS.green : COLORS.grayDark}
                    style={styles.actionBtnText}
                  >
                    {bondLabel}
                  </RetroText>
                </TouchableOpacity>

                {/* ITEM */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.itemBtn, isEnemyTurn && styles.actionBtnDisabled]}
                  onPress={() => setShowItemMenu(true)}
                  disabled={isEnemyTurn}
                  activeOpacity={0.75}
                >
                  <Package size={22} color={isEnemyTurn ? COLORS.grayDark : COLORS.gold} />
                  <RetroText variant="label" color={isEnemyTurn ? COLORS.grayDark : COLORS.gold} style={styles.actionBtnText}>
                    ITEM ({run.items.length})
                  </RetroText>
                </TouchableOpacity>

                {/* SWAP */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.swapBtn,
                    (isEnemyTurn || run.squad.filter(a => a.currentHp > 0).length <= 1) && styles.actionBtnDisabled,
                  ]}
                  onPress={() => setShowSwapMenu(true)}
                  disabled={isEnemyTurn || run.squad.filter(a => a.currentHp > 0).length <= 1}
                  activeOpacity={0.75}
                >
                  <ArrowLeftRight size={22} color={(!isEnemyTurn && run.squad.filter(a => a.currentHp > 0).length > 1) ? COLORS.blue : COLORS.grayDark} />
                  <RetroText
                    variant="label"
                    color={(!isEnemyTurn && run.squad.filter(a => a.currentHp > 0).length > 1) ? COLORS.blue : COLORS.grayDark}
                    style={styles.actionBtnText}
                  >
                    SWAP
                  </RetroText>
                </TouchableOpacity>
              </View>

              {/* Squad slots */}
              <SquadSlots
                squad={run.squad}
                maxSlots={run.squad.length}
                activeIndex={battle.activeSquadIndex}
                showHp
                compact
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── SCENE ──
  battleScene: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
  },
  atmosphereGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '60%',
    opacity: 0.5,
  },
  ground: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 80,
  },
  groundLine: {
    position: 'absolute',
    bottom: 80, left: 0, right: 0,
    height: 1,
  },

  // ── FIGHTERS ──
  enemySide: {
    position: 'absolute',
    left: 16,
    top: 12,
    right: '45%',
    alignItems: 'flex-start',
  },
  playerSide: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    left: '40%',
    alignItems: 'flex-end',
  },
  enemySprite: {
    alignItems: 'center',
    marginTop: 8,
  },
  playerSprite: {
    alignItems: 'center',
    marginBottom: 8,
  },
  spriteShadow: {
    width: 80,
    height: 14,
    borderRadius: 40,
    marginTop: -6,
  },

  // ── STATUS CARDS ──
  statusCard: {
    backgroundColor: 'rgba(10,14,12,0.88)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
    minWidth: 160,
  },
  enemyCard: {
    borderColor: 'rgba(224,67,58,0.3)',
  },
  playerCard: {
    borderColor: 'rgba(61,186,94,0.3)',
    alignItems: 'flex-end',
  },
  statusCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fighterName: {
    fontSize: 13,
  },
  fighterLevel: {
    fontSize: 8,
  },
  bondMeter: {
    gap: 3,
    marginTop: 2,
  },
  bondMeterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bondLabel: {
    fontSize: 7,
  },
  bondPct: {
    fontSize: 7,
  },
  bondBarBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bondBarFill: {
    height: 5,
    borderRadius: 3,
  },

  // ── TURN BADGE ──
  turnBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  turnText: {
    fontSize: 7,
  },

  // ── DAMAGE NUMBERS ──
  dmgNumber: {
    position: 'absolute',
    zIndex: 20,
  },
  dmgText: {
    fontSize: 26,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  // ── MESSAGE LOG ──
  messageWrapper: {
    backgroundColor: 'rgba(10,14,12,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(61,186,94,0.15)',
    maxHeight: 72,
  },
  messageBox: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 2,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
  },
  messageTextLatest: {
    color: COLORS.white,
  },

  // ── ACTION AREA ──
  actionArea: {
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 4,
  },
  attackBtn: {
    backgroundColor: COLORS.red + '18',
    borderColor: COLORS.red + '80',
  },
  bondBtn: {
    backgroundColor: COLORS.green + '18',
    borderColor: COLORS.green + '80',
  },
  itemBtn: {
    backgroundColor: COLORS.gold + '18',
    borderColor: COLORS.gold + '80',
  },
  swapBtn: {
    backgroundColor: COLORS.blue + '18',
    borderColor: COLORS.blue + '80',
  },
  actionBtnDisabled: {
    opacity: 0.3,
  },
  actionBtnText: {
    fontSize: 8,
  },

  // ── REWARD PANEL ──
  rewardPanel: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold + '50',
    padding: 12,
    gap: 10,
  },
  rewardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rewardTitle: {
    fontSize: 14,
  },
  rewardChips: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  rewardChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rewardChipLabel: {
    fontSize: 8,
  },
  rewardChipValue: {
    fontSize: 18,
  },
  rewardCaughtText: {
    fontSize: 12,
  },
  defeatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  defeatText: {
    fontSize: 16,
  },
  continueBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 11,
  },

  // ── SUB MENUS ──
  subMenu: {
    gap: 6,
    alignItems: 'center',
    paddingVertical: 4,
  },
  subMenuLabel: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 2,
  },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  itemName: {
    fontSize: 14,
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 1,
  },
});
