export const calculateResultScore = (
  userScores: number[],
  hostScores: number[],
  totalQuestions: number
): number => {
  if (!totalQuestions || totalQuestions <= 0) return 0;

  // Rating scale is 1-7, meaning maximum absolute difference is 6.
  // We use a stricter scoring distribution where large gaps are penalized more:
  // diff = 0: 100 (Perfect Match)
  // diff = 1: 85  (Close Match)
  // diff = 2: 60  (Minor Gap)
  // diff = 3: 30  (Moderate Divergence)
  // diff = 4: 10  (Significant Divergence)
  // diff = 5: 0   (Large Divergence)
  // diff = 6: 0   (Polar Opposites)
  const scoreConfig = [100, 85, 60, 30, 10, 0, 0];
  let totalScore = 0;
  let allMatchesWithinOne = true;
  const count = Math.min(totalQuestions, userScores.length, hostScores.length);

  if (count <= 0) return 0;

  for (let i = 0; i < count; i++) {
    const userVal = userScores[i] !== undefined ? userScores[i] : 4;
    const hostVal = hostScores[i] !== undefined ? hostScores[i] : 4;
    const diff = Math.abs(hostVal - userVal);
    
    if (diff > 1) {
      allMatchesWithinOne = false;
    }
    
    const errorIndex = Math.min(Math.max(Math.round(diff), 0), 6);
    totalScore += scoreConfig[errorIndex];
  }
  
  // If all question differences are within 1 point, output 100 (perfect match score)
  if (allMatchesWithinOne) {
    return 100;
  }
  
  return Math.round(totalScore / count);
}

export const getPercentageTheme = (p: number) => {
  if (p === 100)
    return {
      color: "#d946ef",
      gradient: "from-pink-500 via-yellow-500 to-indigo-500 bg-[linear-gradient(135deg,#ef4444,#eab308,#22c55e,#0ea5e9,#a855f7)] bg-[size:200%_200%] animate-rainbow",
      bgOverlay: "from-pink-500/[0.08] via-white/40 to-indigo-500/[0.08]",
    };
  if (p >= 85)
    return { color: "#16a34a", gradient: "from-green-600 to-green-400", bgOverlay: "from-green-500/[0.08] to-emerald-500/[0.04]" };
  if (p >= 65)
    return { color: "#65a30d", gradient: "from-lime-600 to-lime-400", bgOverlay: "from-lime-500/[0.08] to-green-500/[0.04]" };
  if (p >= 50)
    return { color: "#ca8a04", gradient: "from-yellow-600 to-yellow-400", bgOverlay: "from-yellow-500/[0.08] to-orange-500/[0.04]" };
  return { color: "#dc2626", gradient: "from-red-600 to-red-400", bgOverlay: "from-red-500/[0.08] to-rose-500/[0.04]" };
};

export const getResultFeedback = (percentage: number) => {
  if (percentage === 100) {
    return {
      title: "WTF???",
      desc: "一点没差？？真求求你了，可以一直跟我玩吗💖🥹。",
    };
  } else if (percentage >= 80) {
    return {
      title: "灵魂知己",
      desc: "你绝对不可以跟我绝交！求求你了！因为你要把我底裤扒没了😨。",
    };
  } else if (percentage >= 65) {
    return {
      title: "知人知面",
      desc: "你有点了解我的日常模式，也许我们相处会比较有默契🙏。",
    };
  } else if (percentage >= 50) {
    return {
      title: "点赞之交",
      desc: "你看到了主播的冰山一角，或许我们还需要更多深度的交流🤔。",
    };
  } else {
    return {
      title: "雾里看花",
      desc: "你是不是不小心认错人了...有兴趣的话，多看我一眼。",
    };
  }
};

export const getRandomQuestions = (presets: {text: string, category: string}[], count: number = 10) => {
  const categories = Array.from(new Set(presets.map(p => p.category)));
  const picked: {text: string, category: string}[] = [];
  
  // ensure we pick across different categories randomly
  const grouped = new Map<string, {text: string, category: string}[]>();
  presets.forEach(p => {
    if (!grouped.has(p.category)) grouped.set(p.category, []);
    grouped.get(p.category)!.push(p);
  });
  
  // shuffle within each category
  grouped.forEach(list => list.sort(() => Math.random() - 0.5));
  
  const cats = Array.from(grouped.keys());
  cats.sort(() => Math.random() - 0.5); // shuffle categories
  
  while (picked.length < count && grouped.size > 0) {
    for (const cat of Array.from(grouped.keys())) {
      if (picked.length >= count) break;
      const list = grouped.get(cat)!;
      if (list.length > 0) {
        picked.push(list.shift()!);
      } else {
        grouped.delete(cat);
      }
    }
  }
  
  return picked.map(p => p.text).sort(() => Math.random() - 0.5);
};

export const getScoreColorText = (s: number) => {
  switch (s) {
    case 1: return "text-red-600";
    case 2: return "text-orange-600";
    case 3: return "text-amber-600";
    case 4: return "text-yellow-600";
    case 5: return "text-lime-600";
    case 6: return "text-emerald-600";
    case 7: return "text-green-600";
    default: return "text-green-forest";
  }
};

export const getScoreStyles = (s: number, isSelected: boolean) => {
  if (isSelected) {
    switch (s) {
      case 1:
        return "bg-red-500 text-white border border-transparent";
      case 2:
        return "bg-orange-500 text-white border border-transparent";
      case 3:
        return "bg-amber-500 text-white border border-transparent";
      case 4:
        return "bg-yellow-500 text-white border border-transparent";
      case 5:
        return "bg-lime-500 text-white border border-transparent";
      case 6:
        return "bg-emerald-500 text-white border border-transparent";
      case 7:
        return "bg-green-500 text-white border border-transparent";
      default:
        return "bg-green-forest text-white border border-transparent";
    }
  } else {
    switch (s) {
      case 1:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-red-100 hover:text-red-600 hover:border-transparent";
      case 2:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-orange-100 hover:text-orange-600 hover:border-transparent";
      case 3:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-amber-100 hover:text-amber-600 hover:border-transparent";
      case 4:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-yellow-100 hover:text-yellow-600 hover:border-transparent";
      case 5:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-lime-100 hover:text-lime-600 hover:border-transparent";
      case 6:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-emerald-100 hover:text-emerald-600 hover:border-transparent";
      case 7:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-green-100 hover:text-green-600 hover:border-transparent";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-transparent";
    }
  }
};
