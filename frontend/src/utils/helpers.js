export const getScoreColor = (score, curve = 1.5) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    const ratio = clampedScore / 100;
    
    const adjustedRatio = Math.pow(ratio, curve);
    
    const red = Math.round(255 * (1 - adjustedRatio));
    const green = Math.round(255 * adjustedRatio);
    
    return `rgb(${red}, ${green}, 0)`;
  };