export const calculateCreatorEconomy = (inputs) => {
  const {
    desiredIncome = 5000,
    audienceSize = 10000,
    reachRate = 30, // %
    clickThroughRate = 3, // % of total audience
    postsPerMonth = 4
  } = inputs;

  const activeAudience = audienceSize * (reachRate / 100);
  const estimatedClicks = audienceSize * (clickThroughRate / 100);
  const revenueNeededPerPost = desiredIncome / postsPerMonth;

  const safeActiveAudience = activeAudience > 0 ? activeAudience : 1;
  const safeClicks = estimatedClicks > 0 ? estimatedClicks : 1;

  const requiredCPM = (revenueNeededPerPost / safeActiveAudience) * 1000;
  const requiredCPC = revenueNeededPerPost / safeClicks;

  const standardCpm = 25;
  const premiumCpm = 45;
  const integrationCpm = 75;

  const tiers = [
    {
      name: 'Standard Shoutout',
      cpm: standardCpm,
      flatRate: (safeActiveAudience / 1000) * standardCpm,
      monthlyRevenue: (safeActiveAudience / 1000) * standardCpm * postsPerMonth
    },
    {
      name: 'Dedicated Ad',
      cpm: premiumCpm,
      flatRate: (safeActiveAudience / 1000) * premiumCpm,
      monthlyRevenue: (safeActiveAudience / 1000) * premiumCpm * postsPerMonth
    },
    {
      name: 'Full Integration',
      cpm: integrationCpm,
      flatRate: (safeActiveAudience / 1000) * integrationCpm,
      monthlyRevenue: (safeActiveAudience / 1000) * integrationCpm * postsPerMonth
    }
  ];

  const maxRealisticMonthly = tiers[2].monthlyRevenue;
  const gap = desiredIncome - maxRealisticMonthly;

  const realityCheck = {
    isRealistic: requiredCPM <= integrationCpm,
    gap: gap > 0 ? gap : 0,
    message:
      requiredCPM <= integrationCpm
        ? 'Your goal is achievable within standard industry rates.'
        : 'You need to increase your audience or post frequency to hit this goal.',
    requiredAudienceToHitGoal: Math.ceil((revenueNeededPerPost * 1000) / (integrationCpm * (reachRate / 100)))
  };

  return {
    activeAudience,
    estimatedClicks,
    revenueNeededPerPost,
    requiredCPM,
    requiredCPC,
    tiers,
    realityCheck
  };
};
