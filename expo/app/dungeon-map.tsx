import React, { useRef, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { BIOMES } from '@/constants/biomes';
import { useGame } from '@/context/GameContext';
import { DungeonRoom, RoomType } from '@/constants/types';
import RetroText from '@/components/RetroText';
import SquadSlots from '@/components/SquadSlots';
import { Swords, Heart, Gift, Moon, Crown, ChevronLeft } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_SIZE = 56;
const BOSS_NODE_SIZE = 68;
const ROW_HEIGHT = 90;
const MAP_PADDING_H = 32;
const MAP_CONTENT_WIDTH = SCREEN_WIDTH - MAP_PADDING_H * 2;

const ROOM_COLORS: Record<RoomType, string> = {
  fight: COLORS.red,
  catchable: COLORS.green,
  treasure: COLORS.gold,
  rest: COLORS.blue,
  boss: COLORS.red,
};

const ROOM_LABELS: Record<RoomType, string> = {
  fight: 'Fight',
  catchable: 'Catch',
  treasure: 'Loot',
  rest: 'Rest',
  boss: 'BOSS',
};

function RoomIcon({ type }: { type: RoomType }) {
  switch (type) {
    case 'fight': return <Swords size={16} color={COLORS.white} />;
    case 'catchable': return <Heart size={16} color={COLORS.white} />;
    case 'treasure': return <Gift size={16} color={COLORS.white} />;
    case 'rest': return <Moon size={16} color={COLORS.white} />;
    case 'boss': return <Crown size={20} color={COLORS.gold} />;
  }
}

interface NodePosition {
  x: number;
  y: number;
  room: DungeonRoom;
}

function computeNodePositions(rooms: DungeonRoom[], totalRows: number): NodePosition[] {
  const positions: NodePosition[] = [];

  for (let row = 0; row < totalRows; row++) {
    const rowRooms = rooms.filter(r => r.row === row);
    const count = rowRooms.length;
    const visualRow = totalRows - 1 - row;

    for (let i = 0; i < count; i++) {
      const room = rowRooms[i];
      const spacing = count === 1 ? 0 : MAP_CONTENT_WIDTH / (count + 1);
      const x = count === 1
        ? MAP_CONTENT_WIDTH / 2
        : spacing * (i + 1);
      const y = visualRow * ROW_HEIGHT + ROW_HEIGHT / 2;

      positions.push({ x, y, room });
    }
  }

  return positions;
}

export default function DungeonMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { run, meta, enterRoom, completeBiomeFloor } = useGame();
  const scrollRef = useRef<ScrollView>(null);

  const biome = BIOMES[run.currentBiomeIndex];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const totalRows = useMemo(() => {
    if (run.dungeonRooms.length === 0) return 0;
    return Math.max(...run.dungeonRooms.map(r => r.row)) + 1;
  }, [run.dungeonRooms]);

  const nodePositions = useMemo(
    () => computeNodePositions(run.dungeonRooms, totalRows),
    [run.dungeonRooms, totalRows]
  );

  const posMap = useMemo(() => {
    const map = new Map<number, NodePosition>();
    nodePositions.forEach(np => map.set(np.room.id, np));
    return map;
  }, [nodePositions]);

  const mapHeight = totalRows * ROW_HEIGHT + ROW_HEIGHT;

  useEffect(() => {
    if (scrollRef.current && totalRows > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [totalRows]);

  const handleRoomPress = (roomId: number) => {
    const roomIndex = run.dungeonRooms.findIndex(r => r.id === roomId);
    const room = run.dungeonRooms[roomIndex];
    if (!room || room.status !== 'available') return;

    enterRoom(roomIndex);

    switch (room.type) {
      case 'fight':
      case 'catchable':
      case 'boss':
        router.push('/battle');
        break;
      case 'treasure':
        router.push('/treasure');
        break;
      case 'rest':
        router.push('/rest');
        break;
    }
  };

  const bossVisited = run.dungeonRooms.some(r => r.type === 'boss' && r.status === 'visited');

  useEffect(() => {
    if (bossVisited && run.dungeonRooms.length > 0) {
      const timer = setTimeout(() => {
        completeBiomeFloor();
        router.replace('/world-map');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bossVisited, run.dungeonRooms.length, completeBiomeFloor, router]);

  const floorPips = Array.from({ length: biome?.floors ?? 4 }, (_, i) => i < ((run.currentFloor - 1) % 4));

  const biomeColor = biome?.color ?? COLORS.green;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.hud, { backgroundColor: biomeColor + '18' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.hudCenter}>
          <RetroText variant="label" color={biomeColor} style={styles.biomeName}>
            {biome?.name ?? 'Unknown'}
          </RetroText>
          <View style={styles.floorPips}>
            {floorPips.map((done, i) => (
              <View
                key={i}
                style={[styles.pip, { backgroundColor: done ? biomeColor : COLORS.grayDark }]}
              />
            ))}
          </View>
        </View>
        <View style={styles.hudRight}>
          <RetroText variant="label" color={COLORS.gold} style={styles.floorLabel}>
            F{run.currentFloor}
          </RetroText>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.mapScroll}
        contentContainerStyle={[styles.mapContent, { height: mapHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <Svg
          width={MAP_CONTENT_WIDTH}
          height={mapHeight}
          style={StyleSheet.absoluteFill}
        >
          {run.dungeonRooms.map(room =>
            room.connections.map(targetId => {
              const from = posMap.get(room.id);
              const to = posMap.get(targetId);
              if (!from || !to) return null;

              const fromVisited = room.status === 'visited';
              const toAvailable = run.dungeonRooms.find(r => r.id === targetId)?.status === 'available';
              const toVisited = run.dungeonRooms.find(r => r.id === targetId)?.status === 'visited';
              const toCurrent = run.dungeonRooms.find(r => r.id === targetId)?.status === 'current';

              const isActive = fromVisited && (toAvailable || toVisited || toCurrent);
              const lineColor = isActive ? biomeColor + '80' : '#1a1e1c';

              return (
                <Line
                  key={`${room.id}-${targetId}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={lineColor}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeLinecap="round"
                  {...(isActive ? {} : { strokeDasharray: '4,4' })}
                />
              );
            })
          )}
        </Svg>

        {nodePositions.map(({ x, y, room }) => {
          const color = ROOM_COLORS[room.type];
          const isAvailable = room.status === 'available';
          const isVisited = room.status === 'visited';
          const isCurrent = room.status === 'current';
          const isBoss = room.type === 'boss';
          const size = isBoss ? BOSS_NODE_SIZE : NODE_SIZE;

          return (
            <Animated.View
              key={room.id}
              style={[
                styles.nodeOuter,
                {
                  left: MAP_PADDING_H + x - size / 2,
                  top: y - size / 2,
                  width: size,
                  height: size,
                },
                isAvailable && { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.roomNode,
                  isBoss && styles.bossNode,
                  { borderColor: color, width: size, height: size },
                  isAvailable && {
                    backgroundColor: color + '28',
                    shadowColor: color,
                    shadowOpacity: 0.6,
                    shadowRadius: 10,
                    ...(Platform.OS === 'android' ? { elevation: 6 } : {}),
                  },
                  isCurrent && { backgroundColor: color + '40', borderWidth: 3 },
                  isVisited && { opacity: 0.35 },
                ]}
                onPress={() => handleRoomPress(room.id)}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <RoomIcon type={room.type} />
                <RetroText
                  variant="label"
                  color={isVisited ? COLORS.grayDark : COLORS.white}
                  style={styles.roomLabel}
                >
                  {ROOM_LABELS[room.type]}
                </RetroText>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <View style={[styles.rowIndicator, { top: (totalRows - 1) * ROW_HEIGHT + ROW_HEIGHT / 2 - 8 }]}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.rowText}>START</RetroText>
        </View>
        <View style={[styles.rowIndicator, { top: ROW_HEIGHT / 2 - 8 }]}>
          <RetroText variant="label" color={COLORS.red} style={styles.rowText}>BOSS</RetroText>
        </View>
      </ScrollView>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 8 }]}>
        <SquadSlots squad={run.squad} maxSlots={meta.upgrades.squadSize} showHp compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  hud: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1e1c',
  },
  backBtn: {
    padding: 6,
  },
  hudCenter: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 4,
  },
  biomeName: {
    fontSize: 10,
  },
  floorPips: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  pip: {
    width: 14,
    height: 6,
    borderRadius: 3,
  },
  hudRight: {
    padding: 6,
  },
  floorLabel: {
    fontSize: 9,
  },
  mapScroll: {
    flex: 1,
  },
  mapContent: {
    position: 'relative' as const,
  },
  nodeOuter: {
    position: 'absolute' as const,
    zIndex: 10,
  },
  roomNode: {
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 3,
  },
  bossNode: {
    borderRadius: 16,
    borderWidth: 3,
  },
  roomLabel: {
    fontSize: 6,
  },
  rowIndicator: {
    position: 'absolute' as const,
    left: 4,
    zIndex: 5,
  },
  rowText: {
    fontSize: 6,
    letterSpacing: 1,
  },
  bottomSection: {
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
  },
});
