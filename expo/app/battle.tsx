import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BiomeType } from '@/constants/types';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { ANIMALS, getSynergyBonus } from '@/constants/animals';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import HpBar from '@/components/HpBar';
import SquadSlots from '@/components/SquadSlots';
import { Swords, Heart, Package, ArrowLeftRight, Skull, Trophy, UserPlus, Sparkles, ChevronLeft } from 'lucide-react-native';

export default function BattleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { run, battle, attack, bond, swapAnimal, useItem, completeRoom, leaveRoom, useAbility } = useGame();

  const playerShake = useRef(new Animated.Value(0)).current;
  const enemyShake = useRef(new Animated.Value(0)).current;
  const enemyBob = useRef(new Animated.Value(0)).current;
  const playerBob = useRef(new Animated.Value(0)).current;
  const enemyFlash = useRef(new Animated.Value(1)).current;
  const playerFlash = useRef(new Animated.Value(1)).current;
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const synergyAnim = useRef(new Animated.Value(0.4)).current;
  const [showDmg, setShowDmg] = useState(null);
  const dmgAnim = useRef(new Animated.Value(0)).current;
  const dmgUpValue = useRef(new Animated.Value(-50)).current;
  const messageScroll = useRef(null);
  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [catchBarWidth, setCatchBarWidth] = useState(0);
  const [levelUpName, setLevelUpName] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevels = useRef({});

  const squadIds = run.squad.map(a => a.id);
  const synergy = getSynergyBonus(squadIds);

  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(enemyBob,{toValue:-8,duration:1400,useNativeDriver:true}),Animated.timing(enemyBob,{toValue:0,duration:1400,useNativeDriver:true})])).start();
    Animated.loop(Animated.sequence([Animated.timing(playerBob,{toValue:-6,duration:1600,useNativeDriver:true}),Animated.timing(playerBob,{toValue:0,duration:1600,useNativeDriver:true})])).start();
    if (synergy) Animated.loop(Animated.sequence([Animated.timing(synergyAnim,{toValue:1,duration:1500,useNativeDriver:true}),Animated.timing(synergyAnim,{toValue:0.4,duration:1500,useNativeDriver:true})])).start();
  }, []);

  useEffect(() => {
    run.squad.forEach(a => {
      const prev = prevLevels.current[a.uniqueId];
      if (prev !== undefined && a.level > prev) {
        setLevelUpName(a.name); setShowLevelUp(true);
        levelUpAnim.setValue(0); levelUpOpacity.setValue(1);
        Animated.parallel([
          Animated.timing(levelUpAnim,{toValue:-60,duration:900,useNativeDriver:true}),
          Animated.sequence([Animated.delay(500),Animated.timing(levelUpOpacity,{toValue:0,duration:400,useNativeDriver:true})]),
        ]).start(()=>setShowLevelUp(false));
      }
      prevLevels.current[a.uniqueId] = a.level;
    });
  }, [run.squad]);

  const animateHit = useCallback((target) => {
    const shake = target==='player'?playerShake:enemyShake;
    const flash = target==='player'?playerFlash:enemyFlash;
    Animated.sequence([Animated.timing(shake,{toValue:14,duration:50,useNativeDriver:true}),Animated.timing(shake,{toValue:-14,duration:50,useNativeDriver:true}),Animated.timing(shake,{toValue:8,duration:50,useNativeDriver:true}),Animated.timing(shake,{toValue:0,duration:60,useNativeDriver:true})]).start();
    Animated.sequence([Animated.timing(flash,{toValue:0.15,duration:60,useNativeDriver:true}),Animated.timing(flash,{toValue:1,duration:60,useNativeDriver:true}),Animated.timing(flash,{toValue:0.4,duration:60,useNativeDriver:true}),Animated.timing(flash,{toValue:1,duration:100,useNativeDriver:true})]).start();
  },[]);

  const showDamageNumber = useCallback((value, isPlayer, isCrit) => {
    setShowDmg({value,isPlayer,isCrit});
    dmgAnim.setValue(0);
    Animated.timing(dmgAnim,{toValue:1,duration:900,useNativeDriver:true}).start(()=>setShowDmg(null));
  },[dmgAnim]);

  const prevEnemyHp = useRef(battle?.enemy.currentHp??0);
  const prevPlayerHp = useRef(null);

  useEffect(()=>{
    if(!battle)return;
    if(battle.enemy.currentHp<prevEnemyHp.current){animateHit('enemy');showDamageNumber(prevEnemyHp.current-battle.enemy.currentHp,false,battle.isCrit);}
    prevEnemyHp.current=battle.enemy.currentHp;
  },[battle?.enemy.currentHp]);

  useEffect(()=>{
    if(!battle)return;
    const a=run.squad[battle.activeSquadIndex];
    if(!a)return;
    if(prevPlayerHp.current!==null&&a.currentHp<prevPlayerHp.current){animateHit('player');showDamageNumber(prevPlayerHp.current-a.currentHp,true);}
    prevPlayerHp.current=a.currentHp;
  },[run.squad,battle?.activeSquadIndex]);

  useEffect(()=>{ messageScroll.current?.scrollToEnd({animated:true}); },[battle?.messages.length]);

  if(!battle) return <View style={[styles.container,{paddingTop:insets.top}]}><RetroText variant="heading" color={COLORS.red}>No battle active</RetroText></View>;

  const activeAnimal=run.squad[battle.activeSquadIndex];
  const enemyBiomeColor=BIOME_COLORS[battle.enemy.biome]??COLORS.red;
  const playerBiomeColor=activeAnimal?(BIOME_COLORS[activeAnimal.biome]??COLORS.green):COLORS.green;
  const isOver=battle.turnPhase==='victory'||battle.turnPhase==='defeat'||battle.turnPhase==='caught';
  const isEnemyTurn=battle.turnPhase==='enemy'||battle.turnPhase==='resolving';
  const biomeGradients={savanna:['#1a0e04','#3d1e06','#7a3d10','#b56020'],ocean:['#020810','#041830','#072850','#0a3870'],jungle:['#010a01','#041404','#082808','#104010'],arctic:['#05080f','#0a1020','#101828','#1a2838']};
  const groundColors={savanna:['#5a3508','#3d2505'],ocean:['#030d22','#020810'],jungle:['#061206','#030803'],arctic:['#0a1018','#060c12']};
  const animalData=ANIMALS.find(a=>a.id===activeAnimal?.id);
  const ability=animalData?.ability;
  const abilityUnlocked=activeAnimal&&activeAnimal.level>=(ability?.unlockLevel??3);
  const canUseAbility=abilityUnlocked&&!isEnemyTurn&&!isOver;
  const xpPct=activeAnimal?Math.min(1,(activeAnimal.xp??0)/(activeAnimal.xpToNext??20)):0;
  const bondLabel=battle.isCatchable?'BOND ('+run.bondAttemptsRemaining+')':'BOND';

  return (
    <View style={[styles.container,{paddingTop:insets.top}]}>
      {!isOver && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => { leaveRoom(); router.back(); }}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
      <View style={styles.battleScene}>
        <LinearGradient colors={biomeGradients[battle.enemy.biome]} locations={[0,0.3,0.7,1]} style={StyleSheet.absoluteFill}/>
        <View style={[styles.atmosphereGlow,{backgroundColor:enemyBiomeColor+'18'}]}/>
        <LinearGradient colors={groundColors[battle.enemy.biome]} style={styles.ground}/>
        <View style={[styles.groundLine,{backgroundColor:enemyBiomeColor+'40'}]}/>
        {synergy&&<Animated.View style={[styles.synergyBadge,{opacity:synergyAnim}]}><RetroText variant="label" color={COLORS.gold} style={styles.synergyText}>✦ {synergy.pair} +{synergy.bonus} ATK</RetroText></Animated.View>}
        {showLevelUp&&<Animated.View style={[styles.levelUpBanner,{opacity:levelUpOpacity,transform:[{translateY:levelUpAnim}]}]}><RetroText variant="heading" color={COLORS.gold} style={styles.levelUpText}>⬆ {levelUpName} LEVEL UP!</RetroText></Animated.View>}
        <View style={styles.enemySide}>
          <View style={[styles.statusCard,styles.enemyCard]}>
            <View style={styles.statusCardInner}><RetroText variant="bodyBold" color={COLORS.white} style={styles.fighterName}>{battle.enemy.name}</RetroText><RetroText variant="label" color={enemyBiomeColor} style={styles.fighterLevel}>LV.{battle.enemy.level}</RetroText></View>
            <HpBar current={battle.enemy.currentHp} max={battle.enemy.maxHp} width={140} height={8} showNumbers/>
            {battle.isCatchable&&<View style={styles.bondMeter}><View style={styles.bondMeterRow}><RetroText variant="label" color={COLORS.catchGreen} style={styles.bondLabel}>BOND</RetroText><RetroText variant="label" color={COLORS.catchGreen} style={styles.bondPct}>{battle.catchChance}%</RetroText></View><View style={styles.bondBarBg} onLayout={e=>setCatchBarWidth(e.nativeEvent.layout.width)}><View style={[styles.bondBarFill,{width:catchBarWidth*(battle.catchChance/100),backgroundColor:battle.catchChance>60?COLORS.catchGreen:battle.catchChance>30?COLORS.gold:COLORS.red}]}/></View></View>}
          </View>
          <Animated.View style={[styles.enemySprite,{transform:[{translateX:enemyShake},{translateY:enemyBob}],opacity:enemyFlash}]}>
            <AnimalSilhouette animalId={battle.enemy.id} color={enemyBiomeColor} size={110}/>
            <View style={[styles.spriteShadow,{backgroundColor:enemyBiomeColor+'30'}]}/>
          </Animated.View>
          {showDmg&&!showDmg.isPlayer&&<Animated.View style={[styles.dmgNumber,{right:10,top:80,opacity:Animated.subtract(1,dmgAnim),transform:[{translateY:Animated.multiply(dmgAnim,dmgUpValue)}]}]}><RetroText variant="heading" color={showDmg.isCrit?'#ff6b35':COLORS.gold} style={[styles.dmgText,showDmg.isCrit&&{fontSize:30}]}>{showDmg.isCrit?'⚡':''}-{showDmg.value}</RetroText></Animated.View>}
        </View>
        <View style={styles.playerSide}>
          {showDmg&&showDmg.isPlayer&&<Animated.View style={[styles.dmgNumber,{left:10,bottom:120,opacity:Animated.subtract(1,dmgAnim),transform:[{translateY:Animated.multiply(dmgAnim,dmgUpValue)}]}]}><RetroText variant="heading" color={COLORS.red} style={styles.dmgText}>-{showDmg.value}</RetroText></Animated.View>}
          <Animated.View style={[styles.playerSprite,{transform:[{translateX:playerShake},{translateY:playerBob}],opacity:playerFlash}]}>
            {activeAnimal&&<><AnimalSilhouette animalId={activeAnimal.id} color={playerBiomeColor} size={96}/><View style={[styles.spriteShadow,{backgroundColor:playerBiomeColor+'30'}]}/></>}
          </Animated.View>
          {activeAnimal&&<View style={[styles.statusCard,styles.playerCard]}>
            <View style={styles.statusCardInner}><RetroText variant="bodyBold" color={COLORS.white} style={styles.fighterName}>{activeAnimal.name}</RetroText><RetroText variant="label" color={playerBiomeColor} style={styles.fighterLevel}>LV.{activeAnimal.level}</RetroText></View>
            <HpBar current={activeAnimal.currentHp} max={activeAnimal.maxHp} width={140} height={8} showNumbers/>
            <View style={styles.xpBarBg}><View style={[styles.xpBarFill,{width:(xpPct*100+'%')}]}/></View>
          </View>}
        </View>
        {!isOver&&<View style={[styles.turnBadge,{backgroundColor:isEnemyTurn?COLORS.red+'cc':COLORS.green+'cc'}]}><RetroText variant="label" color={COLORS.white} style={styles.turnText}>{isEnemyTurn?'⚠ ENEMY':'▶ YOUR TURN'}</RetroText></View>}
      </View>
      <View style={styles.messageWrapper}>
        <ScrollView ref={messageScroll} style={styles.messageBox} contentContainerStyle={styles.messageContent} showsVerticalScrollIndicator={false}>
          {battle.messages.slice(-6).map((msg,i,arr)=><RetroText key={i} variant="body" color={i===arr.length-1?COLORS.white:COLORS.whiteDim} style={[styles.messageText,i===arr.length-1&&{color:COLORS.white}]}>{i===arr.length-1?'▸ ':'  '}{msg}</RetroText>)}
        </ScrollView>
      </View>
      {isOver?(
        <View style={[styles.actionArea,{paddingBottom:insets.bottom+12}]}>
          {battle.rewards&&(battle.turnPhase==='victory'||battle.turnPhase==='caught')&&<View style={styles.rewardPanel}><View style={styles.rewardHeaderRow}><Trophy size={20} color={COLORS.gold}/><RetroText variant="heading" color={COLORS.gold} style={styles.rewardTitle}>{battle.turnPhase==='caught'?'BOND SUCCESS!':'VICTORY!'}</RetroText></View><View style={styles.rewardChips}><View style={styles.rewardChip}><RetroText variant="label" color={COLORS.grayDark} style={styles.rewardChipLabel}>CLAWS</RetroText><RetroText variant="heading" color={COLORS.gold} style={styles.rewardChipValue}>+{battle.rewards.clawsEarned}</RetroText></View>{(battle.rewards.skullsEarned??0)>0&&<View style={styles.rewardChip}><Skull size={14} color={COLORS.whiteDim}/><RetroText variant="heading" color={COLORS.whiteDim} style={styles.rewardChipValue}>+{battle.rewards.skullsEarned}</RetroText></View>}{battle.rewards.caughtAnimal&&<View style={[styles.rewardChip,{borderColor:COLORS.green+'60',flex:1.5}]}><UserPlus size={14} color={COLORS.green}/><RetroText variant="bodyBold" color={COLORS.green} style={styles.rewardCaughtText}>{battle.rewards.caughtAnimal}{battle.rewards.addedToSquad?' joined!':' (journal)'}</RetroText></View>}</View></View>}
          {battle.turnPhase==='defeat'&&<View style={styles.defeatBanner}><Skull size={24} color={COLORS.red}/><RetroText variant="heading" color={COLORS.red} style={styles.defeatText}>SQUAD DEFEATED</RetroText></View>}
          <TouchableOpacity style={[styles.continueBtn,battle.turnPhase==='defeat'&&{backgroundColor:COLORS.red}]} onPress={()=>{if(battle.turnPhase==='defeat')router.replace('/game-over');else{completeRoom();router.back();}}} activeOpacity={0.8}>
            <RetroText variant="label" color={COLORS.bg} style={styles.continueBtnText}>{battle.turnPhase==='defeat'?'VIEW RESULTS':'CONTINUE →'}</RetroText>
          </TouchableOpacity>
        </View>
      ):(
        <View style={[styles.actionArea,{paddingBottom:insets.bottom+6}]}>
          {showSwapMenu?(<View style={styles.subMenu}><RetroText variant="label" color={COLORS.gray} style={styles.subMenuLabel}>SELECT ANIMAL TO SWAP IN</RetroText><SquadSlots squad={run.squad} maxSlots={run.squad.length} activeIndex={battle.activeSquadIndex} onTap={i=>{swapAnimal(i);setShowSwapMenu(false);}} showHp compact/><TouchableOpacity onPress={()=>setShowSwapMenu(false)} style={styles.cancelBtn}><RetroText variant="label" color={COLORS.gray} style={{fontSize:8}}>✕ CANCEL</RetroText></TouchableOpacity></View>)
          :showItemMenu?(<View style={styles.subMenu}><RetroText variant="label" color={COLORS.gray} style={styles.subMenuLabel}>SELECT ITEM</RetroText>{run.items.length===0?<RetroText variant="body" color={COLORS.grayDark} style={{textAlign:'center',paddingVertical:8}}>No items in bag</RetroText>:run.items.map((item,i)=><TouchableOpacity key={item.uniqueId} style={styles.itemRow} onPress={()=>{useItem(i);setShowItemMenu(false);}} activeOpacity={0.8}><View style={styles.itemDot}/><View style={{flex:1}}><RetroText variant="bodyBold" color={COLORS.gold} style={styles.itemName}>{item.name}</RetroText><RetroText variant="body" color={COLORS.gray} style={styles.itemDesc}>{item.description}</RetroText></View></TouchableOpacity>)}<TouchableOpacity onPress={()=>setShowItemMenu(false)} style={styles.cancelBtn}><RetroText variant="label" color={COLORS.gray} style={{fontSize:8}}>✕ CANCEL</RetroText></TouchableOpacity></View>)
          :(<>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={[styles.actionBtn,styles.attackBtn,isEnemyTurn&&styles.actionBtnDisabled]} onPress={attack} disabled={isEnemyTurn} activeOpacity={0.75}><Swords size={20} color={isEnemyTurn?COLORS.grayDark:COLORS.red}/><RetroText variant="label" color={isEnemyTurn?COLORS.grayDark:COLORS.red} style={styles.actionBtnText}>ATTACK</RetroText></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn,styles.bondBtn,(isEnemyTurn||!battle.isCatchable||run.bondAttemptsRemaining<=0)&&styles.actionBtnDisabled]} onPress={bond} disabled={isEnemyTurn||!battle.isCatchable||run.bondAttemptsRemaining<=0} activeOpacity={0.75}><Heart size={20} color={(!isEnemyTurn&&battle.isCatchable&&run.bondAttemptsRemaining>0)?COLORS.green:COLORS.grayDark}/><RetroText variant="label" color={(!isEnemyTurn&&battle.isCatchable&&run.bondAttemptsRemaining>0)?COLORS.green:COLORS.grayDark} style={styles.actionBtnText}>{bondLabel}</RetroText></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn,styles.itemBtn,isEnemyTurn&&styles.actionBtnDisabled]} onPress={()=>setShowItemMenu(true)} disabled={isEnemyTurn} activeOpacity={0.75}><Package size={20} color={isEnemyTurn?COLORS.grayDark:COLORS.gold}/><RetroText variant="label" color={isEnemyTurn?COLORS.grayDark:COLORS.gold} style={styles.actionBtnText}>ITEM ({run.items.length})</RetroText></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn,styles.swapBtn,(isEnemyTurn||run.squad.filter(a=>a.currentHp>0).length<=1)&&styles.actionBtnDisabled]} onPress={()=>setShowSwapMenu(true)} disabled={isEnemyTurn||run.squad.filter(a=>a.currentHp>0).length<=1} activeOpacity={0.75}><ArrowLeftRight size={20} color={(!isEnemyTurn&&run.squad.filter(a=>a.currentHp>0).length>1)?COLORS.blue:COLORS.grayDark}/><RetroText variant="label" color={(!isEnemyTurn&&run.squad.filter(a=>a.currentHp>0).length>1)?COLORS.blue:COLORS.grayDark} style={styles.actionBtnText}>SWAP</RetroText></TouchableOpacity>
            </View>
            {ability&&<TouchableOpacity style={[styles.abilityBtn,!canUseAbility&&styles.actionBtnDisabled,{borderColor:canUseAbility?playerBiomeColor:COLORS.grayDark,backgroundColor:canUseAbility?playerBiomeColor+'20':COLORS.bgLight}]} onPress={()=>useAbility?.()} disabled={!canUseAbility} activeOpacity={0.75}><Sparkles size={16} color={canUseAbility?playerBiomeColor:COLORS.grayDark}/><View style={{flex:1}}><RetroText variant="label" color={canUseAbility?playerBiomeColor:COLORS.grayDark} style={styles.abilityBtnName}>{ability.name}{!abilityUnlocked?' (Lv.'+ability.unlockLevel+')':''}</RetroText><RetroText variant="body" color={COLORS.grayDark} style={styles.abilityBtnDesc}>{ability.description}</RetroText></View></TouchableOpacity>}
            <SquadSlots squad={run.squad} maxSlots={run.squad.length} activeIndex={battle.activeSquadIndex} showHp compact/>
          </>)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  backButton:{position:'absolute',top:12,left:12,zIndex:100,backgroundColor:'rgba(0,0,0,0.6)',borderRadius:8,padding:8,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  battleScene:{flex:1,position:'relative',overflow:'hidden',minHeight:260},
  atmosphereGlow:{position:'absolute',top:0,left:0,right:0,height:'60%',opacity:0.5},
  ground:{position:'absolute',bottom:0,left:0,right:0,height:80},
  groundLine:{position:'absolute',bottom:80,left:0,right:0,height:1},
  synergyBadge:{position:'absolute',top:8,left:0,right:0,alignItems:'center',zIndex:20},
  synergyText:{fontSize:7,backgroundColor:COLORS.gold+'30',paddingHorizontal:10,paddingVertical:3,borderRadius:4,overflow:'hidden'},
  levelUpBanner:{position:'absolute',top:'35%',left:0,right:0,alignItems:'center',zIndex:30},
  levelUpText:{fontSize:14,textShadowColor:COLORS.gold,textShadowOffset:{width:0,height:0},textShadowRadius:10},
  enemySide:{position:'absolute',left:16,top:12,right:'45%',alignItems:'flex-start'},
  playerSide:{position:'absolute',right:16,bottom:20,left:'40%',alignItems:'flex-end'},
  enemySprite:{alignItems:'center',marginTop:8},
  playerSprite:{alignItems:'center',marginBottom:8},
  spriteShadow:{width:80,height:14,borderRadius:40,marginTop:-6},
  statusCard:{backgroundColor:'rgba(10,14,12,0.88)',borderRadius:10,padding:10,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',gap:5,minWidth:155},
  enemyCard:{borderColor:'rgba(224,67,58,0.3)'},
  playerCard:{borderColor:'rgba(61,186,94,0.3)',alignItems:'flex-end'},
  statusCardInner:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  fighterName:{fontSize:12},
  fighterLevel:{fontSize:8},
  bondMeter:{gap:3,marginTop:2},
  bondMeterRow:{flexDirection:'row',justifyContent:'space-between'},
  bondLabel:{fontSize:7},
  bondPct:{fontSize:7},
  bondBarBg:{height:4,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'},
  bondBarFill:{height:4,borderRadius:2},
  xpBarBg:{height:3,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden',marginTop:2},
  xpBarFill:{height:3,borderRadius:2,backgroundColor:COLORS.gold},
  turnBadge:{position:'absolute',top:10,right:10,paddingHorizontal:8,paddingVertical:4,borderRadius:5},
  turnText:{fontSize:7},
  dmgNumber:{position:'absolute',zIndex:20},
  dmgText:{fontSize:26,textShadowColor:'#000',textShadowOffset:{width:2,height:2},textShadowRadius:4},
  messageWrapper:{backgroundColor:'rgba(10,14,12,0.95)',borderTopWidth:1,borderTopColor:'rgba(61,186,94,0.15)',maxHeight:66},
  messageBox:{flex:1},
  messageContent:{paddingHorizontal:12,paddingVertical:6,gap:2},
  messageText:{fontSize:12,lineHeight:17},
  actionArea:{backgroundColor:COLORS.bgLight,borderTopWidth:1,borderTopColor:'#1a1e1c',paddingHorizontal:10,paddingTop:8,gap:6},
  actionGrid:{flexDirection:'row',gap:5},
  actionBtn:{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:10,borderRadius:8,borderWidth:1.5,gap:3},
  attackBtn:{backgroundColor:COLORS.red+'18',borderColor:COLORS.red+'80'},
  bondBtn:{backgroundColor:COLORS.green+'18',borderColor:COLORS.green+'80'},
  itemBtn:{backgroundColor:COLORS.gold+'18',borderColor:COLORS.gold+'80'},
  swapBtn:{backgroundColor:COLORS.blue+'18',borderColor:COLORS.blue+'80'},
  actionBtnDisabled:{opacity:0.3},
  actionBtnText:{fontSize:7},
  abilityBtn:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:8,paddingHorizontal:12,borderRadius:8,borderWidth:1.5},
  abilityBtnName:{fontSize:9},
  abilityBtnDesc:{fontSize:11,marginTop:1},
  rewardPanel:{backgroundColor:COLORS.bgCard,borderRadius:10,borderWidth:1,borderColor:COLORS.gold+'50',padding:10,gap:8},
  rewardHeaderRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
  rewardTitle:{fontSize:13},
  rewardChips:{flexDirection:'row',gap:6,justifyContent:'center'},
  rewardChip:{flex:1,alignItems:'center',backgroundColor:COLORS.bgLight,borderRadius:7,paddingVertical:8,paddingHorizontal:6,gap:3,borderWidth:1,borderColor:COLORS.gold+'30',flexDirection:'row',justifyContent:'center'},
  rewardChipLabel:{fontSize:7},
  rewardChipValue:{fontSize:16},
  rewardCaughtText:{fontSize:11},
  defeatBanner:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:6},
  defeatText:{fontSize:15},
  continueBtn:{backgroundColor:COLORS.green,paddingVertical:14,borderRadius:9,alignItems:'center'},
  continueBtnText:{fontSize:11},
  subMenu:{gap:5,alignItems:'center',paddingVertical:4},
  subMenuLabel:{fontSize:8,color:COLORS.gray,marginBottom:2},
  cancelBtn:{marginTop:3,paddingVertical:5,paddingHorizontal:18,backgroundColor:COLORS.bgCard,borderRadius:5},
  itemRow:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:7,paddingHorizontal:10,backgroundColor:COLORS.bgCard,borderRadius:7,width:'100%',borderWidth:1,borderColor:COLORS.gold+'30'},
  itemDot:{width:5,height:5,borderRadius:3,backgroundColor:COLORS.gold},
  itemName:{fontSize:13},
  itemDesc:{fontSize:11,marginTop:1},
});