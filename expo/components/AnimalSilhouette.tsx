import React from 'react';
import Svg, { Path, Circle, Ellipse, Rect, G } from 'react-native-svg';

interface AnimalSilhouetteProps {
  animalId: string;
  color: string;
  size?: number;
}

function LionSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Circle cx="24" cy="16" r="10" fill={color} opacity={0.7} />
      <Ellipse cx="24" cy="17" rx="7" ry="6.5" fill={color} />
      <Circle cx="21" cy="15" r="1.2" fill="#0a0c0b" />
      <Circle cx="27" cy="15" r="1.2" fill="#0a0c0b" />
      <Ellipse cx="24" cy="30" rx="10" ry="8" fill={color} />
      <Rect x="15" y="34" width="4" height="10" rx="2" fill={color} />
      <Rect x="21" y="35" width="4" height="9" rx="2" fill={color} />
      <Rect x="29" y="34" width="4" height="10" rx="2" fill={color} />
      <Rect x="24" y="35" width="4" height="9" rx="2" fill={color} />
      <Path d="M34 28 Q40 24 38 32 Q36 36 34 34Z" fill={color} />
      <Circle cx="38" cy="31" r="2" fill={color} />
    </G>
  );
}

function ElephantSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="26" cy="24" rx="14" ry="11" fill={color} />
      <Circle cx="14" cy="16" r="8" fill={color} />
      <Ellipse cx="9" cy="14" rx="5" ry="7" fill={color} opacity={0.8} />
      <Circle cx="12" cy="14" r="1.2" fill="#0a0c0b" />
      <Path d="M10 20 Q8 26 6 32 Q5 36 8 36 Q10 36 11 32 Q12 28 14 24Z" fill={color} />
      <Rect x="16" y="31" width="5" height="12" rx="2.5" fill={color} />
      <Rect x="22" y="32" width="5" height="11" rx="2.5" fill={color} />
      <Rect x="30" y="31" width="5" height="12" rx="2.5" fill={color} />
      <Rect x="36" y="32" width="5" height="11" rx="2.5" fill={color} />
      <Path d="M40 24 Q42 22 40 20" stroke={color} strokeWidth="2" fill="none" />
    </G>
  );
}

function SharkSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Path d="M4 26 Q6 20 14 18 L24 16 Q34 16 42 20 Q46 24 44 28 Q40 32 30 32 Q20 32 12 30 Q6 28 4 26Z" fill={color} />
      <Path d="M24 16 L26 6 L28 16Z" fill={color} />
      <Path d="M40 22 L46 18 L44 26Z" fill={color} />
      <Path d="M4 26 L2 24 Q2 28 4 28Z" fill={color} />
      <Circle cx="10" cy="23" r="1.5" fill="#0a0c0b" />
      <Path d="M38 28 Q42 34 38 36 L36 32Z" fill={color} />
    </G>
  );
}

function OrcaSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="28" rx="16" ry="8" fill={color} />
      <Ellipse cx="10" cy="26" rx="6" ry="5" fill={color} />
      <Circle cx="8" cy="25" r="1.3" fill="#0a0c0b" />
      <Path d="M22 20 L24 8 L26 20Z" fill={color} />
      <Path d="M38 24 L46 20 L44 28 Q42 30 40 28Z" fill={color} />
      <Ellipse cx="30" cy="30" rx="4" ry="2" fill="#0a0c0b" opacity={0.3} />
      <Path d="M14 32 Q12 38 10 36 L14 34Z" fill={color} />
      <Path d="M32 32 Q34 38 36 36 L34 34Z" fill={color} />
    </G>
  );
}

function GorillaSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="28" rx="12" ry="10" fill={color} />
      <Circle cx="24" cy="14" r="8" fill={color} />
      <Ellipse cx="24" cy="16" rx="4" ry="3" fill="#0a0c0b" opacity={0.2} />
      <Circle cx="21" cy="13" r="1.2" fill="#0a0c0b" />
      <Circle cx="27" cy="13" r="1.2" fill="#0a0c0b" />
      <Ellipse cx="12" cy="24" rx="4" ry="6" fill={color} />
      <Ellipse cx="36" cy="24" rx="4" ry="6" fill={color} />
      <Path d="M10 28 Q6 32 8 36 Q10 38 12 36Z" fill={color} />
      <Path d="M38 28 Q42 32 40 36 Q38 38 36 36Z" fill={color} />
      <Rect x="17" y="35" width="5" height="8" rx="2.5" fill={color} />
      <Rect x="26" y="35" width="5" height="8" rx="2.5" fill={color} />
    </G>
  );
}

function PolarBearSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="28" rx="14" ry="10" fill={color} />
      <Circle cx="14" cy="16" r="7" fill={color} />
      <Circle cx="10" cy="11" r="3" fill={color} />
      <Circle cx="18" cy="11" r="3" fill={color} />
      <Circle cx="12" cy="15" r="1.2" fill="#0a0c0b" />
      <Circle cx="16" cy="15" r="1.2" fill="#0a0c0b" />
      <Ellipse cx="14" cy="18" rx="2" ry="1.2" fill="#0a0c0b" opacity={0.3} />
      <Rect x="13" y="34" width="5" height="10" rx="2.5" fill={color} />
      <Rect x="20" y="35" width="5" height="9" rx="2.5" fill={color} />
      <Rect x="27" y="34" width="5" height="10" rx="2.5" fill={color} />
      <Rect x="34" y="35" width="5" height="9" rx="2.5" fill={color} />
      <Path d="M38 26 Q42 24 40 28 Q39 30 38 28Z" fill={color} />
    </G>
  );
}

function CheetahSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="26" rx="11" ry="6" fill={color} />
      <Ellipse cx="12" cy="20" rx="5" ry="4" fill={color} />
      <Circle cx="10" cy="19" r="1" fill="#0a0c0b" />
      <Rect x="14" y="30" width="3" height="12" rx="1.5" fill={color} />
      <Rect x="19" y="31" width="3" height="11" rx="1.5" fill={color} />
      <Rect x="27" y="30" width="3" height="12" rx="1.5" fill={color} />
      <Rect x="32" y="31" width="3" height="11" rx="1.5" fill={color} />
      <Path d="M35 24 Q42 22 46 20" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Circle cx="46" cy="20" r="1.5" fill={color} />
    </G>
  );
}

function ZebraSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="26" rx="12" ry="7" fill={color} />
      <Path d="M12 26 Q10 18 12 12 Q14 8 16 10 Q18 12 14 20Z" fill={color} />
      <Circle cx="13" cy="12" r="1" fill="#0a0c0b" />
      <Path d="M14 8 L12 4 L16 6Z" fill={color} />
      <Path d="M16 8 L18 4 L18 8Z" fill={color} />
      <Rect x="15" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="20" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="27" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="32" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Path d="M36 24 Q40 22 42 24" stroke={color} strokeWidth="2" fill="none" />
    </G>
  );
}

function GiraffeSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="28" cy="32" rx="10" ry="7" fill={color} />
      <Path d="M18 32 Q16 22 14 12 Q13 8 16 6 Q18 5 19 8 Q20 12 20 22Z" fill={color} />
      <Ellipse cx="14" cy="7" rx="4" ry="3" fill={color} />
      <Circle cx="12" cy="6" r="0.9" fill="#0a0c0b" />
      <Path d="M13 4 L11 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="11" cy="1" r="1" fill={color} />
      <Path d="M16 4 L17 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="17" cy="1" r="1" fill={color} />
      <Rect x="20" y="36" width="3.5" height="9" rx="1.75" fill={color} />
      <Rect x="25" y="37" width="3.5" height="8" rx="1.75" fill={color} />
      <Rect x="30" y="36" width="3.5" height="9" rx="1.75" fill={color} />
      <Rect x="35" y="37" width="3.5" height="8" rx="1.75" fill={color} />
    </G>
  );
}

function HyenaSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="22" cy="26" rx="11" ry="7" fill={color} />
      <Path d="M12 26 Q10 20 10 16 Q10 12 14 12 Q16 12 14 18Z" fill={color} />
      <Circle cx="11" cy="14" r="1" fill="#0a0c0b" />
      <Path d="M10 12 L8 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 11 L14 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 22 Q12 20 10 22 Q8 24 12 26Z" fill={color} />
      <Rect x="14" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="19" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="26" y="31" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="31" y="32" width="3.5" height="9" rx="1.75" fill={color} />
      <Path d="M33 24 Q36 20 38 22" stroke={color} strokeWidth="2" fill="none" />
    </G>
  );
}

function DolphinSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Path d="M6 26 Q8 20 16 18 Q22 16 30 18 Q38 20 42 24 Q44 26 42 28 Q38 32 30 32 Q22 32 14 30 Q8 28 6 26Z" fill={color} />
      <Path d="M4 26 Q2 24 4 22 Q6 22 6 26Z" fill={color} />
      <Path d="M26 18 L28 12 L30 18Z" fill={color} />
      <Path d="M40 24 L46 20 L44 28Z" fill={color} />
      <Circle cx="10" cy="24" r="1.3" fill="#0a0c0b" />
      <Path d="M6 24 Q4 24 6 22" stroke={color} strokeWidth="1" fill="none" />
    </G>
  );
}

function NarwhalSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="26" cy="26" rx="14" ry="7" fill={color} />
      <Path d="M12 24 L2 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Ellipse cx="14" cy="24" rx="5" ry="4" fill={color} />
      <Circle cx="12" cy="23" r="1.2" fill="#0a0c0b" />
      <Path d="M38 22 L44 18 L42 28Z" fill={color} />
      <Path d="M20 32 Q18 38 16 36 L20 34Z" fill={color} />
      <Path d="M32 32 Q34 38 36 36 L34 34Z" fill={color} />
    </G>
  );
}

function MantaraySilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="24" rx="8" ry="6" fill={color} />
      <Path d="M16 22 Q8 16 4 12 Q2 10 4 14 Q6 20 16 24Z" fill={color} />
      <Path d="M32 22 Q40 16 44 12 Q46 10 44 14 Q42 20 32 24Z" fill={color} />
      <Path d="M24 30 Q24 36 22 42 Q24 44 26 42 Q24 36 24 30Z" fill={color} />
      <Circle cx="21" cy="22" r="1.2" fill="#0a0c0b" />
      <Circle cx="27" cy="22" r="1.2" fill="#0a0c0b" />
    </G>
  );
}

function OctopusSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="14" rx="9" ry="8" fill={color} />
      <Circle cx="20" cy="12" r="2" fill="#0a0c0b" opacity={0.4} />
      <Circle cx="28" cy="12" r="2" fill="#0a0c0b" opacity={0.4} />
      <Circle cx="20" cy="12" r="1" fill="#0a0c0b" />
      <Circle cx="28" cy="12" r="1" fill="#0a0c0b" />
      <Path d="M16 20 Q12 26 8 32 Q6 36 10 34 Q14 30 16 24Z" fill={color} />
      <Path d="M18 21 Q16 28 14 36 Q12 40 16 38 Q18 34 18 26Z" fill={color} />
      <Path d="M21 22 Q20 30 18 38 Q18 42 22 40 Q22 34 22 28Z" fill={color} />
      <Path d="M27 22 Q28 30 30 38 Q30 42 26 40 Q26 34 26 28Z" fill={color} />
      <Path d="M30 21 Q32 28 34 36 Q36 40 32 38 Q30 34 30 26Z" fill={color} />
      <Path d="M32 20 Q36 26 40 32 Q42 36 38 34 Q34 30 32 24Z" fill={color} />
    </G>
  );
}

function JaguarSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="24" rx="11" ry="7" fill={color} />
      <Circle cx="13" cy="18" r="5" fill={color} />
      <Circle cx="11" cy="17" r="1" fill="#0a0c0b" />
      <Path d="M10 14 L8 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 13 L16 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="15" y="29" width="3.5" height="12" rx="1.75" fill={color} />
      <Rect x="20" y="29" width="3.5" height="12" rx="1.75" fill={color} />
      <Rect x="27" y="29" width="3.5" height="12" rx="1.75" fill={color} />
      <Rect x="32" y="29" width="3.5" height="12" rx="1.75" fill={color} />
      <Path d="M35 22 Q40 20 44 22 Q46 24 44 26 Q42 24 40 24 Q38 24 36 26" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </G>
  );
}

function AnacondaSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Path d="M8 14 Q12 10 18 12 Q24 14 26 20 Q28 26 34 28 Q40 30 44 26 Q46 22 42 18 Q38 14 34 16 Q30 18 28 14 Q26 10 20 8 Q14 6 8 10 Q4 14 8 18Z" fill={color} strokeWidth="0" />
      <Ellipse cx="8" cy="14" rx="4" ry="3.5" fill={color} />
      <Circle cx="6" cy="13" r="1" fill="#0a0c0b" />
      <Path d="M4 15 L2 14 M4 15 L2 16" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <Path d="M42 18 Q44 14 46 16 Q46 20 44 22" fill={color} />
      <Path d="M10 20 Q14 26 20 28 Q26 30 30 34 Q34 38 38 36 Q42 34 40 30" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
    </G>
  );
}

function ToucanSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="28" cy="22" rx="8" ry="9" fill={color} />
      <Circle cx="28" cy="16" r="6" fill={color} />
      <Circle cx="26" cy="14" r="1.2" fill="#0a0c0b" />
      <Path d="M22 16 Q14 14 8 18 Q6 20 8 22 Q10 24 14 22 Q18 20 22 20Z" fill={color} opacity={0.85} />
      <Path d="M8 18 Q6 18 6 20 Q6 22 8 22" fill="#0a0c0b" opacity={0.2} />
      <Path d="M36 28 Q38 30 36 34 Q34 36 32 34 Q34 30 34 28Z" fill={color} />
      <Rect x="24" y="30" width="3" height="10" rx="1.5" fill={color} />
      <Rect x="30" y="30" width="3" height="10" rx="1.5" fill={color} />
      <Path d="M24 40 Q22 42 20 40 L24 40Z" fill={color} />
      <Path d="M30 40 Q32 42 34 40 L30 40Z" fill={color} />
    </G>
  );
}

function CapybaraSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="28" rx="13" ry="8" fill={color} />
      <Ellipse cx="12" cy="22" rx="6" ry="5" fill={color} />
      <Circle cx="10" cy="20" r="1" fill="#0a0c0b" />
      <Ellipse cx="8" cy="22" rx="2" ry="1.5" fill={color} opacity={0.7} />
      <Rect x="14" y="33" width="4" height="9" rx="2" fill={color} />
      <Rect x="20" y="34" width="4" height="8" rx="2" fill={color} />
      <Rect x="28" y="33" width="4" height="9" rx="2" fill={color} />
      <Rect x="34" y="34" width="4" height="8" rx="2" fill={color} />
    </G>
  );
}

function PoisonFrogSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="24" rx="10" ry="7" fill={color} />
      <Ellipse cx="24" cy="18" rx="8" ry="5" fill={color} />
      <Circle cx="19" cy="15" r="3" fill={color} />
      <Circle cx="29" cy="15" r="3" fill={color} />
      <Circle cx="19" cy="15" r="1.2" fill="#0a0c0b" />
      <Circle cx="29" cy="15" r="1.2" fill="#0a0c0b" />
      <Path d="M14 28 Q8 32 6 38 Q4 42 8 40 Q10 38 12 34 Q14 30 16 28Z" fill={color} />
      <Path d="M34 28 Q40 32 42 38 Q44 42 40 40 Q38 38 36 34 Q34 30 32 28Z" fill={color} />
      <Path d="M18 30 Q16 36 14 40 Q14 44 18 42 Q18 38 20 34Z" fill={color} />
      <Path d="M30 30 Q32 36 34 40 Q34 44 30 42 Q30 38 28 34Z" fill={color} />
    </G>
  );
}

function ArcticFoxSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="28" rx="11" ry="7" fill={color} />
      <Ellipse cx="14" cy="20" rx="5" ry="4.5" fill={color} />
      <Path d="M10 20 L6 10 L12 16Z" fill={color} />
      <Path d="M16 18 L18 8 L20 16Z" fill={color} />
      <Circle cx="12" cy="19" r="1" fill="#0a0c0b" />
      <Ellipse cx="11" cy="22" rx="2" ry="1" fill="#0a0c0b" opacity={0.2} />
      <Rect x="15" y="33" width="3" height="9" rx="1.5" fill={color} />
      <Rect x="20" y="33" width="3" height="9" rx="1.5" fill={color} />
      <Rect x="27" y="33" width="3" height="9" rx="1.5" fill={color} />
      <Rect x="32" y="33" width="3" height="9" rx="1.5" fill={color} />
      <Path d="M35 26 Q40 24 44 26 Q46 28 44 30 Q42 28 38 28Z" fill={color} />
    </G>
  );
}

function WalrusSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="26" rx="14" ry="10" fill={color} />
      <Circle cx="14" cy="18" r="7" fill={color} />
      <Circle cx="12" cy="16" r="1.2" fill="#0a0c0b" />
      <Circle cx="16" cy="16" r="1.2" fill="#0a0c0b" />
      <Ellipse cx="14" cy="22" rx="4" ry="2" fill={color} opacity={0.7} />
      <Path d="M12 24 L10 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M16 24 L18 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Rect x="16" y="33" width="5" height="9" rx="2.5" fill={color} />
      <Rect x="22" y="34" width="5" height="8" rx="2.5" fill={color} />
      <Rect x="30" y="33" width="5" height="9" rx="2.5" fill={color} />
      <Rect x="36" y="34" width="5" height="8" rx="2.5" fill={color} />
    </G>
  );
}

function SnowyOwlSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="28" rx="9" ry="10" fill={color} />
      <Circle cx="24" cy="14" r="9" fill={color} />
      <Path d="M15 10 L13 4 L18 10Z" fill={color} />
      <Path d="M33 10 L35 4 L30 10Z" fill={color} />
      <Circle cx="20" cy="14" r="3.5" fill="#0a0c0b" opacity={0.3} />
      <Circle cx="28" cy="14" r="3.5" fill="#0a0c0b" opacity={0.3} />
      <Circle cx="20" cy="14" r="1.5" fill="#0a0c0b" />
      <Circle cx="28" cy="14" r="1.5" fill="#0a0c0b" />
      <Path d="M22 19 L24 22 L26 19Z" fill="#0a0c0b" opacity={0.4} />
      <Path d="M16 30 Q10 34 8 38 Q10 38 14 36 Q16 34 16 30Z" fill={color} />
      <Path d="M32 30 Q38 34 40 38 Q38 38 34 36 Q32 34 32 30Z" fill={color} />
      <Path d="M20 38 Q18 42 16 44 L22 42Z" fill={color} />
      <Path d="M28 38 Q30 42 32 44 L26 42Z" fill={color} />
    </G>
  );
}

function WolverineSilhouette({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="26" rx="12" ry="8" fill={color} />
      <Circle cx="14" cy="20" r="6" fill={color} />
      <Circle cx="12" cy="18" r="1" fill="#0a0c0b" />
      <Path d="M10 16 L8 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M14 15 L16 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Ellipse cx="10" cy="22" rx="2" ry="1.2" fill="#0a0c0b" opacity={0.2} />
      <Rect x="14" y="32" width="4" height="10" rx="2" fill={color} />
      <Rect x="20" y="32" width="4" height="10" rx="2" fill={color} />
      <Rect x="27" y="32" width="4" height="10" rx="2" fill={color} />
      <Rect x="33" y="32" width="4" height="10" rx="2" fill={color} />
      <Path d="M36 24 Q40 22 42 24" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </G>
  );
}

function GenericQuadruped({ color }: { color: string }) {
  return (
    <G>
      <Ellipse cx="24" cy="24" rx="12" ry="7" fill={color} />
      <Circle cx="13" cy="18" r="5" fill={color} />
      <Circle cx="11" cy="17" r="1" fill="#0a0c0b" />
      <Rect x="14" y="29" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="20" y="30" width="3.5" height="9" rx="1.75" fill={color} />
      <Rect x="27" y="29" width="3.5" height="10" rx="1.75" fill={color} />
      <Rect x="33" y="30" width="3.5" height="9" rx="1.75" fill={color} />
      <Path d="M36 22 Q40 20 42 22" stroke={color} strokeWidth="2" fill="none" />
    </G>
  );
}

const ANIMAL_RENDERERS: Record<string, React.FC<{ color: string }>> = {
  lion: LionSilhouette,
  elephant: ElephantSilhouette,
  cheetah: CheetahSilhouette,
  zebra: ZebraSilhouette,
  giraffe: GiraffeSilhouette,
  hyena: HyenaSilhouette,
  orca: OrcaSilhouette,
  shark: SharkSilhouette,
  dolphin: DolphinSilhouette,
  narwhal: NarwhalSilhouette,
  arctic_narwhal: NarwhalSilhouette,
  mantaray: MantaraySilhouette,
  octopus: OctopusSilhouette,
  gorilla: GorillaSilhouette,
  jaguar: JaguarSilhouette,
  anaconda: AnacondaSilhouette,
  toucan: ToucanSilhouette,
  capybara: CapybaraSilhouette,
  poison_frog: PoisonFrogSilhouette,
  polar_bear: PolarBearSilhouette,
  arctic_fox: ArcticFoxSilhouette,
  walrus: WalrusSilhouette,
  snowy_owl: SnowyOwlSilhouette,
  wolverine: WolverineSilhouette,
};

export default React.memo(function AnimalSilhouette({ animalId, color, size = 48 }: AnimalSilhouetteProps) {
  const Renderer = ANIMAL_RENDERERS[animalId] ?? GenericQuadruped;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Renderer color={color} />
    </Svg>
  );
});
