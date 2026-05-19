export const calculateResultScore = (
  userScores: number[],
  hostScores: number[],
  totalQuestions: number
): number => {
  const scoreConfig = [100, 90, 60, 40, 30, 10, 0];
  let totalScore = 0;
  let allMatches = true;
  for (let i = 0; i < totalQuestions; i++) {
    const diff = Math.abs((hostScores[i] || 4) - (userScores[i] || 4));
    if (diff > 1) {
      allMatches = false;
    }
    const errorIndex = Math.min(Math.max(diff, 0), 6);
    totalScore += scoreConfig[errorIndex];
  }
  
  if (allMatches && userScores.length === totalQuestions) {
    return 100;
  }
  
  return Math.round(totalScore / totalQuestions);
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

export const getScoreStyles = (s: number, isSelected: boolean) => {
  if (isSelected) {
    switch (s) {
      case 1:
        return "bg-gradient-to-br from-red-600 to-red-400 text-white border border-transparent";
      case 2:
        return "bg-gradient-to-br from-orange-600 to-orange-400 text-white border border-transparent";
      case 3:
        return "bg-gradient-to-br from-amber-600 to-amber-400 text-white border border-transparent";
      case 4:
        return "bg-gradient-to-br from-yellow-600 to-yellow-400 text-white border border-transparent";
      case 5:
        return "bg-gradient-to-br from-lime-600 to-lime-400 text-white border border-transparent";
      case 6:
        return "bg-gradient-to-br from-emerald-600 to-emerald-400 text-white border border-transparent";
      case 7:
        return "bg-gradient-to-br from-green-600 to-green-400 text-white border border-transparent";
      default:
        return "bg-green-forest text-white border border-transparent";
    }
  } else {
    switch (s) {
      case 1:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-red-100 hover:to-red-50 hover:text-red-600 hover:border-transparent";
      case 2:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-orange-100 hover:to-orange-50 hover:text-orange-600 hover:border-transparent";
      case 3:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-50 hover:text-amber-600 hover:border-transparent";
      case 4:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-yellow-50 hover:text-yellow-600 hover:border-transparent";
      case 5:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-lime-100 hover:to-lime-50 hover:text-lime-600 hover:border-transparent";
      case 6:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-50 hover:text-emerald-600 hover:border-transparent";
      case 7:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-50 hover:text-green-600 hover:border-transparent";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-transparent";
    }
  }
};
