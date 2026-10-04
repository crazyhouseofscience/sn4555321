import { UnpackStep } from '../types/scinote';

export interface ComputedHopping {
  originalRaw: string;
  cleanNumber: string;
  isNegative: boolean;
  mantissa: number;
  mantissaStr: string;
  exponent: number;
  direction: 'left' | 'right' | 'none';
  hopCount: number;
  digits: string[];
  initialDotIndex: number;
  finalDotIndex: number;
  hops: Array<{
    step: number;
    fromIndex: number;
    toIndex: number;
    currentExponent: number;
    direction: 'left' | 'right';
  }>;
  scientificNotation: string;
  spokenReadout: string;
  metricPrefix?: string;
  explanation: string;
}

export interface ComputedUnpack {
  mantissa: number;
  mantissaStr: string;
  exponent: number;
  direction: 'right' | 'left' | 'none';
  totalHops: number;
  standardFormFormatted: string;
  standardFormRaw: string;
  steps: UnpackStep[];
  explanation: string;
  spokenReadout: string;
  zerosAddedCount: number;
}

/**
 * Packs standard number into scientific notation (Standard -> Scientific)
 */
export function computeHopSteps(inputStr: string): ComputedHopping | null {
  const cleaned = inputStr.replace(/,/g, '').trim();
  if (!cleaned || isNaN(Number(cleaned)) || Number(cleaned) === 0) {
    return null;
  }

  const isNeg = cleaned.startsWith('-');
  const absStr = isNeg ? cleaned.substring(1) : cleaned;
  const numVal = Math.abs(Number(cleaned));

  let dotPos = absStr.indexOf('.');
  if (dotPos === -1) {
    dotPos = absStr.length;
  }

  let firstNonZeroIndex = -1;
  for (let i = 0; i < absStr.length; i++) {
    if (absStr[i] !== '0' && absStr[i] !== '.') {
      firstNonZeroIndex = i;
      break;
    }
  }

  if (firstNonZeroIndex === -1) return null;

  const exp = Math.floor(Math.log10(numVal));
  const mantissaVal = numVal / Math.pow(10, exp);
  const mantissaFormatted = Math.round(mantissaVal * 1000000) / 1000000;
  const mantissaStr = mantissaFormatted.toString();

  const digits = absStr.split('');
  const direction = exp > 0 ? 'left' : exp < 0 ? 'right' : 'none';
  const hopCount = Math.abs(exp);

  const hops: ComputedHopping['hops'] = [];

  if (direction === 'left') {
    for (let s = 1; s <= hopCount; s++) {
      hops.push({
        step: s,
        fromIndex: dotPos - (s - 1),
        toIndex: dotPos - s,
        currentExponent: s,
        direction: 'left'
      });
    }
  } else if (direction === 'right') {
    for (let s = 1; s <= hopCount; s++) {
      hops.push({
        step: s,
        fromIndex: dotPos + (s - 1),
        toIndex: dotPos + s,
        currentExponent: -s,
        direction: 'right'
      });
    }
  }

  const metricPrefixes: Record<number, string> = {
    18: 'Exa (E)', 15: 'Peta (P)', 12: 'Tera (T)', 9: 'Giga (G)', 6: 'Mega (M)',
    3: 'Kilo (k)', 2: 'Hecto (h)', 1: 'Deka (da)', 0: 'Standard Units',
    '-1': 'deci (d)', '-2': 'centi (c)', '-3': 'milli (m)', '-6': 'micro (µ)',
    '-9': 'nano (n)', '-12': 'pico (p)', '-15': 'femto (f)', '-18': 'atto (a)'
  };

  const metricPrefix = metricPrefixes[exp] || `Power of 10^${exp}`;
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
  };
  const expSuperscript = exp.toString().split('').map(c => superscripts[c] || c).join('');
  const signStr = isNeg ? '-' : '';
  const sciFormatted = `${signStr}${mantissaStr} × 10${expSuperscript}`;

  const expSignWord = exp < 0 ? 'negative ' + Math.abs(exp) : exp.toString();
  const spokenReadout = `${signStr ? 'negative ' : ''}${mantissaStr} times ten to the ${expSignWord} power`;

  let explanation = '';
  if (exp > 0) {
    explanation = `Because ${cleaned} is greater than 10, we hop the decimal ${hopCount} places to the LEFT. That gives a positive exponent of +${exp}.`;
  } else if (exp < 0) {
    explanation = `Because ${cleaned} is a small decimal under 1, we hop the decimal ${hopCount} places to the RIGHT. That gives a negative exponent of ${exp}.`;
  } else {
    explanation = `Because ${cleaned} is already between 1 and 10, the decimal moves 0 hops (10⁰ = 1).`;
  }

  return {
    originalRaw: inputStr,
    cleanNumber: cleaned,
    isNegative: isNeg,
    mantissa: Number(`${signStr}${mantissaStr}`),
    mantissaStr,
    exponent: exp,
    direction,
    hopCount,
    digits,
    initialDotIndex: dotPos,
    finalDotIndex: exp > 0 ? dotPos - hopCount : dotPos + hopCount,
    hops,
    scientificNotation: sciFormatted,
    spokenReadout,
    metricPrefix,
    explanation
  };
}

/**
 * Unpacks scientific notation into standard decimal (Scientific -> Standard)
 * e.g., 3.45 x 10^6 -> 3,450,000
 * or 8.2 x 10^-4 -> 0.00082
 */
export function computeUnpackSteps(mantissa: number, exponent: number): ComputedUnpack {
  const isNeg = mantissa < 0;
  const absMantissa = Math.abs(mantissa);
  const mantissaStr = absMantissa.toString();
  const signStr = isNeg ? '-' : '';

  const totalHops = Math.abs(exponent);
  const direction = exponent > 0 ? 'right' : exponent < 0 ? 'left' : 'none';

  const steps: UnpackStep[] = [];
  let zerosAddedCount = 0;

  if (exponent === 0) {
    steps.push({
      step: 0,
      description: `Exponent is 0 (10⁰ = 1). The number stays exactly ${signStr}${mantissaStr}.`,
      charState: mantissaStr.split(''),
      dotPos: mantissaStr.indexOf('.') !== -1 ? mantissaStr.indexOf('.') : mantissaStr.length,
      zerosAdded: 0,
      currentValueDisplay: `${signStr}${mantissaStr}`
    });

    return {
      mantissa,
      mantissaStr,
      exponent,
      direction: 'none',
      totalHops: 0,
      standardFormFormatted: `${signStr}${mantissaStr}`,
      standardFormRaw: `${signStr}${mantissaStr}`,
      steps,
      explanation: 'Multiplying by 10⁰ is multiplying by 1, so the number stays identical.',
      spokenReadout: `${signStr}${mantissaStr}`,
      zerosAddedCount: 0
    };
  }

  // Parse mantissa digits and initial dot
  let mantissaDigits = mantissaStr.split('');
  let dotPos = mantissaDigits.indexOf('.');
  if (dotPos === -1) {
    dotPos = mantissaDigits.length;
    mantissaDigits.push('.');
  }

  // Initial step 0
  steps.push({
    step: 0,
    description: `Start with the boss number: ${mantissaStr}. Dot is at position ${dotPos}. Ready to hop ${totalHops} places ${direction.toUpperCase()}.`,
    charState: [...mantissaDigits],
    dotPos,
    zerosAdded: 0,
    currentValueDisplay: `${signStr}${mantissaStr}`
  });

  if (direction === 'right') {
    // POSITIVE EXPONENT: Decimal hops RIGHT, creating zeros at the end if needed
    // e.g. 3.45 -> hop 1: 34.5 -> hop 2: 345. -> hop 3: 3450. -> hop 4: 34500. etc.
    let digitsWithoutDot = mantissaStr.replace('.', '').split('');
    let currentDot = dotPos;

    for (let h = 1; h <= totalHops; h++) {
      currentDot += 1;
      let zerosCreated = 0;

      // If dot exceeds available digits, we append zeros
      while (digitsWithoutDot.length < currentDot) {
        digitsWithoutDot.push('0');
        zerosCreated++;
      }

      zerosAddedCount = Math.max(zerosAddedCount, zerosCreated);

      // Construct display state
      const displayChars = [...digitsWithoutDot];
      if (currentDot < displayChars.length) {
        displayChars.splice(currentDot, 0, '.');
      }

      const valStr = digitsWithoutDot.join('') + (currentDot < digitsWithoutDot.length ? '.' + digitsWithoutDot.slice(currentDot).join('') : '');
      const numVal = parseFloat(valStr);
      const formattedNum = signStr + numVal.toLocaleString('en-US');

      const isZeroAdd = h > (mantissaStr.replace('.', '').length - 1);
      const stepDesc = isZeroAdd
        ? `Hop #${h}: We ran out of digits! Drop a 0 into the hop cup to make ${formattedNum}.`
        : `Hop #${h}: Hop the decimal 1 step right past '${digitsWithoutDot[h]}' to make ${formattedNum}.`;

      steps.push({
        step: h,
        description: stepDesc,
        charState: displayChars,
        dotPos: currentDot,
        zerosAdded: zerosCreated,
        currentValueDisplay: formattedNum
      });
    }

    const finalRaw = digitsWithoutDot.join('');
    const finalFormatted = signStr + Number(finalRaw).toLocaleString('en-US');
    const spoken = `${signStr}${finalFormatted} (${totalHops} hops right)`;

    return {
      mantissa,
      mantissaStr,
      exponent,
      direction: 'right',
      totalHops,
      standardFormFormatted: finalFormatted,
      standardFormRaw: signStr + finalRaw,
      steps,
      explanation: `Because the exponent is +${exponent}, we hopped the decimal point ${totalHops} places to the RIGHT. We added zeros to fill empty positions to get ${finalFormatted}.`,
      spokenReadout: spoken,
      zerosAddedCount
    };
  } else {
    // NEGATIVE EXPONENT: Decimal hops LEFT, creating leading zeros
    // e.g. 8.2 x 10^-4 -> hop 1: 0.82 -> hop 2: 0.082 -> hop 3: 0.0082 -> hop 4: 0.00082
    let digitsWithoutDot = mantissaStr.replace('.', '').split('');
    let zerosInFront = 0;

    for (let h = 1; h <= totalHops; h++) {
      zerosInFront++;
      const currentDigits = ['0', '.', ...Array(zerosInFront - 1).fill('0'), ...digitsWithoutDot];
      const currentValStr = currentDigits.join('');

      const stepDesc = `Hop #${h} (Left): Decimal moves left. Drop a zero in front: ${currentValStr}.`;

      steps.push({
        step: h,
        description: stepDesc,
        charState: currentDigits,
        dotPos: 1,
        zerosAdded: zerosInFront,
        currentValueDisplay: `${signStr}${currentValStr}`
      });
    }

    zerosAddedCount = totalHops - 1;
    const finalRaw = `0.${'0'.repeat(Math.max(0, totalHops - 1))}${digitsWithoutDot.join('')}`;
    const finalFormatted = `${signStr}${finalRaw}`;

    return {
      mantissa,
      mantissaStr,
      exponent,
      direction: 'left',
      totalHops,
      standardFormFormatted: finalFormatted,
      standardFormRaw: finalFormatted,
      steps,
      explanation: `Because the exponent is ${exponent} (negative), we hopped the decimal point ${totalHops} places to the LEFT. We added ${zerosAddedCount} zeros after 0. to reach ${finalFormatted}.`,
      spokenReadout: `${finalFormatted} (${totalHops} hops left)`,
      zerosAddedCount
    };
  }
}

/**
 * Parses scientific expressions such as "3.45 x 10^6", "3.45*10^6", "3.45e6", "3.45 × 10⁶"
 */
export function parseScientificInput(input: string): { mantissa: number; exponent: number } | null {
  const clean = input.trim().replace(/\s+/g, '');
  if (!clean) return null;

  // Handle standard 'e' format e.g. 3.45e6, 3.45E-4
  const eMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
  if (eMatch) {
    return {
      mantissa: parseFloat(eMatch[1]),
      exponent: parseInt(eMatch[2], 10)
    };
  }

  // Handle "3.45x10^6", "3.45*10^6", "3.45×10⁶", "3.45*10^-4"
  const superscriptsMap: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-'
  };

  let normalized = clean;
  for (const [sup, norm] of Object.entries(superscriptsMap)) {
    normalized = normalized.replaceAll(sup, norm);
  }

  const multMatch = normalized.match(/^([+-]?\d+(?:\.\d+)?)[xX*×]10(?:\^|\*\*)?([+-]?\d+)$/);
  if (multMatch) {
    return {
      mantissa: parseFloat(multMatch[1]),
      exponent: parseInt(multMatch[2], 10)
    };
  }

  return null;
}

export function formatSuperscript(exp: number): string {
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
  };
  return exp.toString().split('').map(c => superscripts[c] || c).join('');
}
