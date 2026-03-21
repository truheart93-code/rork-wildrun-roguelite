import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
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
import { Swords, Heart, Package, ArrowLeftRight, Skull, Trophy, UserPlus } from 'lucide-react-native';

export default function BattleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { run, battle, attack, bond, swapAnimal, useItem, completeRoom } = useGame();

  const playerShake = useRef(new Animated.Value(0)).current;
  const enemyShake = useRef(new Animated.Value(0)).current;
  const [showDmg, setShowDmg] = useState<{ value: number; isPlayer: boolean } | null>(null);
  const dmgAnim = useRef(new Animated.Value(0)).current;
  const messageScroll = useRef<ScrollView>(null);
  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [catchBarWidth, setCatchBarWidth] = useState(0);

  const animateHit = useCallback((target: 'player' | 'enemy') => {
    const anim = target === 'player' ? playerShake : enemyShake;
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [playerShake, enemyShake]);

  const showDamageNumber = useCallback((value: number, isPlayer: boolean) => {
    setShowDmg({ value, isPlayer });
    dmgAnim.setValue(0);
    Animated.timing(dmgAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => {
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
  }, [battle, animateHit, showDamageNumber]);

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
  }, [run.squad, battle, animateHit, showDamageNumber]);

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
  const enemyBiomeColor = BIOME_COLORS[battle.enemy.biome] ?? COLORS.red;
  const playerBiomeColor = activeAnimal ? (BIOME_COLORS[activeAnimal.biome] ?? COLORS.green) : COLORS.green;
  const isOver = battle.turnPhase === 'victory' || battle.turnPhase === 'defeat' || battle.turnPhase === 'caught';
  const isEnemyTurn = battle.turnPhase === 'enemy';
  const catchChance = battle.catchChance;

  const currentBiome: BiomeType = battle.enemy.biome;
  const biomeGradients: Record<BiomeType, [string, string, string]> = {
    savanna: ['#7a4a10', '#c87020', '#e8c060'],
    ocean: ['#0a1a3a', '#0a4070', '#1a60a0'],
    jungle: ['#0a1a0a', '#1a4a1a', '#2a6a2a'],
    arctic: ['#101828', '#1a2a40', '#2a4060'],
  };
  const biomeGroundColors: Record<BiomeType, string> = {
    savanna: '#5a3508',
    ocean: '#061230',
    jungle: '#061206',
    arctic: '#0a1018',
  };
  const gradientColors = biomeGradients[currentBiome];
  const groundColor = biomeGroundColors[currentBiome];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.battleScene}>
        <LinearGradient
          colors={gradientColors}
          locations={[0, 0.5, 1]}
          style={styles.biomeGradient}
        />
        <View style={[styles.groundStrip, { backgroundColor: groundColor }]} />
        <View style={styles.enemySide}>
          <View style={styles.statusBox}>
            <RetroText variant="bodyBold" color={COLORS.white} style={styles.animalName}>
              {battle.enemy.name} Lv.{battle.enemy.level}
            </RetroText>
            <HpBar current={battle.enemy.currentHp} max={battle.enemy.maxHp} width={110} height={8} showNumbers />
            {battle.isCatchable && (
              <View style={styles.catchBar}>
                <RetroText variant="body" color={COLORS.catchBlue} style={{ fontSize: 11 }}>
                  Bond: {catchChance}%
                </RetroText>
                <View
                  style={styles.catchBarBg}
                  onLayout={(e) => setCatchBarWidth(e.nativeEvent.layout.width)}
                >
                  <View style={[styles.catchBarFill, { width: catchBarWidth * (catchChance / 100) }]} />
                </View>
              </View>
            )}
          </View>
          <Animated.View style={[styles.enemySprite, { transform: [{ translateX: enemyShake }] }]}>
            <View style={[styles.platform, { backgroundColor: enemyBiomeColor + '30' }]} />
            <AnimalSilhouette animalId={battle.enemy.id} color={enemyBiomeColor} size={80} />
          </Animated.View>
          {showDmg && !showDmg.isPlayer && (
            <Animated.View
              style={[
                styles.dmgNumber,
                styles.dmgEnemy,
                {
                  opacity: Animated.subtract(1, dmgAnim),
                  transform: [{ translateY: Animated.multiply(dmgAnim, new Animated.Value(-40)) }],
                },
              ]}
            >
              <RetroText variant="heading" color={COLORS.gold} style={styles.dmgText}>
                -{showDmg.value}
              </RetroText>
            </Animated.View>
          )}
        </View>

        <View style={styles.playerSide}>
          {showDmg && showDmg.isPlayer && (
            <Animated.View
              style={[
                styles.dmgNumber,
                styles.dmgPlayer,
                {
                  opacity: Animated.subtract(1, dmgAnim),
                  transform: [{ translateY: Animated.multiply(dmgAnim, new Animated.Value(-40)) }],
                },
              ]}
            >
              <RetroText variant="heading" color={COLORS.red} style={styles.dmgText}>
                -{showDmg.value}
              </RetroText>
            </Animated.View>
          )}
          <Animated.View style={[styles.playerSprite, { transform: [{ translateX: playerShake }] }]}>
            {activeAnimal && (
              <>
                <AnimalSilhouette animalId={activeAnimal.id} color={playerBiomeColor} size={72} />
                <View style={[styles.platform, { backgroundColor: playerBiomeColor + '30' }]} />
              </>
            )}
          </Animated.View>
          {activeAnimal && (
            <View style={styles.statusBox}>
              <RetroText variant="bodyBold" color={COLORS.white} style={styles.animalName}>
                {activeAnimal.name} Lv.{activeAnimal.level}
              </RetroText>
              <HpBar current={activeAnimal.currentHp} max={activeAnimal.maxHp} width={110} height={8} showNumbers />
            </View>
          )}
        </View>
      </View>

      <ScrollView
        ref={messageScroll}
        style={styles.messageBox}
        contentContainerStyle={styles.messageContent}
      >
        {battle.messages.slice(-5).map((msg, i) => (
          <RetroText key={i} variant="body" color={COLORS.whiteDim} style={styles.messageText}>
            {msg}
          </RetroText>
        ))}
      </ScrollView>

      {isOver ? (
        <View style={[styles.actionArea, { paddingBottom: insets.bottom + 12 }]}>
          {battle.rewards && (battle.turnPhase === 'victory' || battle.turnPhase === 'caught') && (
            <View style={styles.rewardPanel}>
              <View style={styles.rewardHeader}>
                <Trophy size={18} color={COLORS.gold} />
                <RetroText variant="label" color={COLORS.gold} style={styles.rewardTitle}>
                  {battle.turnPhase === 'caught' ? 'BOND SUCCESS' : 'VICTORY'}
                </RetroText>
              </View>
              <View style={styles.rewardGrid}>
                <View style={styles.rewardChip}>
                  <RetroText variant="body" color={COLORS.gray} style={styles.rewardChipLabel}>Claws</RetroText>
                  <RetroText variant="heading" color={COLORS.gold} style={styles.rewardChipValue}>
                    +{battle.rewards.clawsEarned}
                  </RetroText>
                </View>
                {battle.rewards.skullsEarned > 0 && (
                  <View style={styles.rewardChip}>
                    <Skull size={14} color={COLORS.whiteDim} />
                    <RetroText variant="heading" color={COLORS.whiteDim} style={styles.rewardChipValue}>
                      +{battle.rewards.skullsEarned}
                    </RetroText>
                  </View>
                )}
                {battle.rewards.caughtAnimal && (
                  <View style={[styles.rewardChip, styles.rewardChipWide]}>
                    <UserPlus size={14} color={COLORS.green} />
                    <RetroText variant="bodyBold" color={COLORS.green} style={styles.rewardCaughtText}>
                      {battle.rewards.caughtAnimal}{battle.rewards.addedToSquad ? ' joined!' : ' (journal)'}
                    </RetroText>
                  </View>
                )}
              </View>
            </View>
          )}
          <TouchableOpacity
            style={[styles.continueButton, battle.turnPhase === 'defeat' && { backgroundColor: COLORS.red }]}
            onPress={() => {
              if (battle.turnPhase === 'defeat') {
                router.replace('/game-over');
              } else {
                handleContinue();
              }
            }}
            activeOpacity={0.8}
          >
            <RetroText variant="label" color={COLORS.bg} style={styles.actionText}>
              {battle.turnPhase === 'defeat' ? 'GAME OVER' : 'CONTINUE'}
            </RetroText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.actionArea, { paddingBottom: insets.bottom + 8 }]}>
          {showSwapMenu ? (
            <View style={styles.subMenu}>
              <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 8, marginBottom: 6 }}>
                SELECT ANIMAL
              </RetroText>
              <SquadSlots
                squad={run.squad}
                maxSlots={run.squad.length}
                activeIndex={battle.activeSquadIndex}
                onTap={(i) => { swapAnimal(i); setShowSwapMenu(false); }}
                showHp
                compact
              />
              <TouchableOpacity onPress={() => setShowSwapMenu(false)} style={styles.cancelBtn}>
                <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 8 }}>CANCEL</RetroText>
              </TouchableOpacity>
            </View>
          ) : showItemMenu ? (
            <View style={styles.subMenu}>
              <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 8, marginBottom: 6 }}>
                SELECT ITEM
              </RetroText>
              {run.items.length === 0 ? (
                <RetroText variant="body" color={COLORS.grayDark}>No items</RetroText>
              ) : (
                run.items.map((item, i) => (
                  <TouchableOpacity key={item.uniqueId} style={styles.itemRow} onPress={() => { useItem(i); setShowItemMenu(false); }}>
                    <RetroText variant="bodyBold" color={COLORS.gold}>{item.name}</RetroText>
                    <RetroText variant="body" color={COLORS.gray} style={{ fontSize: 13 }}>{item.description}</RetroText>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity onPress={() => setShowItemMenu(false)} style={styles.cancelBtn}>
                <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 8 }}>CANCEL</RetroText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.red + '30', borderColor: COLORS.red }, isEnemyTurn && styles.actionDisabled]} onPress={attack} activeOpacity={0.7} disabled={isEnemyTurn}>
                  <Swords size={18} color={isEnemyTurn ? COLORS.grayDark : COLORS.red} />
                  <RetroText variant="label" color={isEnemyTurn ? COLORS.grayDark : COLORS.red} style={styles.actionText}>ATTACK</RetroText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: COLORS.green + '30', borderColor: COLORS.green },
                    (isEnemyTurn || !battle.isCatchable || run.bondAttemptsRemaining <= 0) && styles.actionDisabled,
                  ]}
                  onPress={bond}
                  activeOpacity={0.7}
                  disabled={isEnemyTurn || !battle.isCatchable || run.bondAttemptsRemaining <= 0}
                >
                  <Heart size={18} color={!isEnemyTurn && battle.isCatchable && run.bondAttemptsRemaining > 0 ? COLORS.green : COLORS.grayDark} />
                  <RetroText variant="label" color={!isEnemyTurn && battle.isCatchable && run.bondAttemptsRemaining > 0 ? COLORS.green : COLORS.grayDark} style={styles.actionText}>
                    BOND ({run.bondAttemptsRemaining})
                  </RetroText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.gold + '30', borderColor: COLORS.gold }, isEnemyTurn && styles.actionDisabled]} onPress={() => setShowItemMenu(true)} activeOpacity={0.7} disabled={isEnemyTurn}>
                  <Package size={18} color={isEnemyTurn ? COLORS.grayDark : COLORS.gold} />
                  <RetroText variant="label" color={isEnemyTurn ? COLORS.grayDark : COLORS.gold} style={styles.actionText}>ITEM ({run.items.length})</RetroText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.blue + '30', borderColor: COLORS.blue }, (isEnemyTurn || run.squad.filter(a => a.currentHp > 0).length <= 1) && styles.actionDisabled]}
                  onPress={() => setShowSwapMenu(true)}
                  activeOpacity={0.7}
                  disabled={isEnemyTurn || run.squad.filter(a => a.currentHp > 0).length <= 1}
                >
                  <ArrowLeftRight size={18} color={!isEnemyTurn && run.squad.filter(a => a.currentHp > 0).length > 1 ? COLORS.blue : COLORS.grayDark} />
                  <RetroText variant="label" color={!isEnemyTurn && run.squad.filter(a => a.currentHp > 0).length > 1 ? COLORS.blue : COLORS.grayDark} style={styles.actionText}>SWAP</RetroText>
                </TouchableOpacity>
              </View>
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
  battleScene: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  biomeGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  groundStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    zIndex: 1,
  },
  enemySide: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    position: 'relative',
    zIndex: 5,
  },
  playerSide: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    position: 'relative',
    zIndex: 5,
  },
  statusBox: {
    backgroundColor: COLORS.bgCard + 'DD',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#222826',
    gap: 4,
    zIndex: 6,
  },
  animalName: {
    fontSize: 13,
  },
  catchBar: {
    gap: 2,
    marginTop: 2,
  },
  catchBarBg: {
    width: 100,
    height: 5,
    backgroundColor: COLORS.bgLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catchBarFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.catchGreen,
  },
  enemySprite: {
    alignItems: 'center',
    marginTop: 12,
  },
  playerSprite: {
    alignItems: 'center',
    marginBottom: 12,
  },
  platform: {
    width: 80,
    height: 12,
    borderRadius: 40,
    marginTop: -4,
  },
  dmgNumber: {
    position: 'absolute',
    zIndex: 20,
  },
  dmgEnemy: {
    right: 20,
    top: 60,
  },
  dmgPlayer: {
    left: 20,
    bottom: 80,
  },
  dmgText: {
    fontSize: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageBox: {
    maxHeight: 80,
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222826',
  },
  messageContent: {
    padding: 10,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionArea: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    width: '48%' as const,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  actionDisabled: {
    opacity: 0.35,
  },
  actionText: {
    fontSize: 9,
  },
  rewardPanel: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    padding: 12,
    marginBottom: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rewardTitle: {
    fontSize: 10,
  },
  rewardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  rewardChip: {
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
    minWidth: 80,
  },
  rewardChipWide: {
    flexDirection: 'row',
    minWidth: 160,
    justifyContent: 'center',
    gap: 6,
  },
  rewardChipLabel: {
    fontSize: 11,
  },
  rewardChipValue: {
    fontSize: 16,
  },
  rewardCaughtText: {
    fontSize: 13,
  },
  continueButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  subMenu: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 6,
    marginBottom: 4,
    width: '100%' as const,
  },
});
