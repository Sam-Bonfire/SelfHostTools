export const FUNNEL_PRESETS = {
  'b2b-saas': {
    name: 'B2B SaaS (High-Touch)',
    description: 'A typical enterprise sales funnel mapping outbound and inbound to closed-won.',
    nodes: [
      {
        id: '1',
        title: 'LinkedIn Ads',
        stage: '1. Traffic',
        metrics: '$150 CPL',
        desc: 'Targeting VP of Engineering and CTOs.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Cold Outbound',
        stage: '1. Traffic',
        metrics: '3% Reply',
        desc: 'SDR multi-channel sequencing (Email/Call).',
        targets: ['4']
      },
      {
        id: '3',
        title: 'Webinar Sign-up',
        stage: '2. Capture',
        metrics: '20% Show Rate',
        desc: 'Live technical deep-dive.',
        targets: ['5']
      },
      {
        id: '4',
        title: 'Gated Whitepaper',
        stage: '2. Capture',
        metrics: '15% Opt-in',
        desc: 'Industry benchmark report download.',
        targets: ['5']
      },
      {
        id: '5',
        title: 'Email Nurture',
        stage: '3. Nurture',
        metrics: '14 Days',
        desc: 'Value-add drip sequence to build trust.',
        targets: ['6']
      },
      {
        id: '6',
        title: 'Discovery Call',
        stage: '4. Conversion',
        metrics: '30% Book Rate',
        desc: 'Qualifying the lead (BANT framework).',
        targets: ['7', '8']
      },
      {
        id: '7',
        title: 'Demo Call',
        stage: '4. Conversion',
        metrics: '50% Close Rate',
        desc: 'Live product walkthrough tailored to pain points.',
        targets: ['9']
      },
      {
        id: '8',
        title: 'Disqualified',
        stage: '4. Conversion',
        metrics: '70% Drop',
        desc: 'Not a fit right now. Back to nurture.',
        targets: ['5']
      },
      {
        id: '9',
        title: 'Closed Won',
        stage: '5. Revenue',
        metrics: '$50k ACV',
        desc: 'Annual contract signed and paid.',
        targets: ['10']
      },
      {
        id: '10',
        title: 'Onboarding',
        stage: '6. Retention',
        metrics: '90 Days',
        desc: 'Customer success handover and implementation.',
        targets: []
      }
    ]
  },
  'dtc-ecommerce': {
    name: 'DTC E-Commerce',
    description: 'Direct-to-consumer physical product funnel optimized for ROAS.',
    nodes: [
      {
        id: '1',
        title: 'TikTok Ads',
        stage: '1. Awareness',
        metrics: '$15 CPM',
        desc: 'UGC-style short form videos.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Meta Ads',
        stage: '1. Awareness',
        metrics: '2% CTR',
        desc: 'Retargeting and lookalike audiences.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Product Page',
        stage: '2. Consideration',
        metrics: '5% Add-to-Cart',
        desc: 'High-converting PDP with reviews and clear CTA.',
        targets: ['4', '5']
      },
      {
        id: '4',
        title: 'Exit-Intent Pop-up',
        stage: '2. Consideration',
        metrics: '10% Capture',
        desc: 'Offer 10% off for email capture.',
        targets: ['6']
      },
      {
        id: '5',
        title: 'Checkout Page',
        stage: '3. Decision',
        metrics: '40% Drop-off',
        desc: 'Frictionless payment collection.',
        targets: ['7', '8']
      },
      {
        id: '6',
        title: 'Welcome Sequence',
        stage: '3. Decision',
        metrics: '20% Convert',
        desc: '3-part email series with discount code.',
        targets: ['5']
      },
      {
        id: '7',
        title: 'Abandoned Cart',
        stage: '3. Decision',
        metrics: '15% Recovery',
        desc: 'SMS and Email reminders to finish purchase.',
        targets: ['5']
      },
      {
        id: '8',
        title: 'Purchase Complete',
        stage: '4. Revenue',
        metrics: '$85 AOV',
        desc: 'Successful transaction.',
        targets: ['9']
      },
      {
        id: '9',
        title: 'Post-Purchase Upsell',
        stage: '4. Revenue',
        metrics: '12% Take Rate',
        desc: 'One-click upsell for complementary item.',
        targets: ['10']
      },
      {
        id: '10',
        title: 'Loyalty Program',
        stage: '5. Retention',
        metrics: '30% Repeat',
        desc: 'Points for purchases and referrals.',
        targets: []
      }
    ]
  },
  'content-creator': {
    name: 'Content Ecosystem (Creator)',
    description: 'Audience funnel moving attention from rented platforms to owned platforms.',
    nodes: [
      {
        id: '1',
        title: 'Shorts / Reels',
        stage: '1. Discovery',
        metrics: 'High Reach',
        desc: 'Algorithmic discovery engine.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Twitter / X Threads',
        stage: '1. Discovery',
        metrics: 'High Virality',
        desc: 'Written thought leadership.',
        targets: ['4']
      },
      {
        id: '3',
        title: 'YouTube Longform',
        stage: '2. Depth',
        metrics: '10 min AVD',
        desc: 'Building parasocial relationships and trust.',
        targets: ['4']
      },
      {
        id: '4',
        title: 'Newsletter Opt-in',
        stage: '3. Ownership',
        metrics: '3% CVR',
        desc: 'Moving audience from algorithms to inbox.',
        targets: ['5', '6']
      },
      {
        id: '5',
        title: 'Free Digital Asset',
        stage: '3. Ownership',
        metrics: 'Lead Magnet',
        desc: 'Template or checklist delivered immediately.',
        targets: ['7']
      },
      {
        id: '6',
        title: 'Weekly Dispatch',
        stage: '4. Nurture',
        metrics: '45% Open Rate',
        desc: 'Consistent, high-value free weekly content.',
        targets: ['7']
      },
      {
        id: '7',
        title: 'Paid Course / Community',
        stage: '5. Monetization',
        metrics: '$150-$500',
        desc: 'Premium deep-dive transformation.',
        targets: ['8']
      },
      {
        id: '8',
        title: '1-on-1 Coaching',
        stage: '5. Monetization',
        metrics: '$2,000+',
        desc: 'High-ticket backend offer for top 1% of audience.',
        targets: []
      }
    ]
  },
  freelancer: {
    name: 'Freelancer / Agency',
    description: 'Client acquisition pipeline from cold outreach to retained contract.',
    nodes: [
      {
        id: '1',
        title: 'Cold Email',
        stage: '1. Sourcing',
        metrics: '50/day',
        desc: 'Highly personalized pitches to decision makers.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Inbound SEO / Referrals',
        stage: '1. Sourcing',
        metrics: 'Warm',
        desc: 'Organic traffic to portfolio and past client intros.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Portfolio / Case Studies',
        stage: '2. Proof',
        metrics: '15% Convert',
        desc: 'Showcasing ROI and previous success.',
        targets: ['4']
      },
      {
        id: '4',
        title: 'Discovery Call',
        stage: '3. Qualification',
        metrics: '20 mins',
        desc: 'Checking budget, timeline, and fit.',
        targets: ['5']
      },
      {
        id: '5',
        title: 'Custom Proposal',
        stage: '4. Pitch',
        metrics: '3 Options',
        desc: 'Sending pricing tiers (Good, Better, Best).',
        targets: ['6', '7']
      },
      {
        id: '6',
        title: 'Negotiation / Revisions',
        stage: '4. Pitch',
        metrics: 'Common',
        desc: 'Adjusting scope to meet budget constraints.',
        targets: ['5', '7']
      },
      {
        id: '7',
        title: 'Contract Signed',
        stage: '5. Close',
        metrics: '50% Deposit',
        desc: 'Formal agreement and upfront payment collected.',
        targets: ['8']
      },
      {
        id: '8',
        title: 'Project Execution',
        stage: '6. Delivery',
        metrics: 'High Quality',
        desc: 'Delivering the actual work on time.',
        targets: ['9']
      },
      {
        id: '9',
        title: 'Offboarding & Review',
        stage: '7. Retention',
        metrics: '5 Stars',
        desc: 'Collecting testimonials and case study data.',
        targets: ['10']
      },
      {
        id: '10',
        title: 'Monthly Retainer',
        stage: '7. Retention',
        metrics: 'MRR',
        desc: 'Converting project into ongoing maintenance.',
        targets: []
      }
    ]
  },
  'mobile-app': {
    name: 'Mobile App Freemium',
    description: 'User acquisition funnel from app store to paid subscription.',
    nodes: [
      {
        id: '1',
        title: 'App Store Ads (ASA)',
        stage: '1. Discovery',
        metrics: '$2.50 CPI',
        desc: 'Search intent ads on Apple App Store.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'TikTok / Snap Ads',
        stage: '1. Discovery',
        metrics: '$1.50 CPI',
        desc: 'Short form video ads driving direct installs.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'App Installed',
        stage: '2. Acquisition',
        metrics: '100% Volume',
        desc: 'User downloads and opens the app.',
        targets: ['4', '5']
      },
      {
        id: '4',
        title: 'Bounced / Uninstalled',
        stage: '2. Acquisition',
        metrics: '30% Drop',
        desc: 'User opens once and uninstalls.',
        targets: []
      },
      {
        id: '5',
        title: 'Onboarding Flow',
        stage: '3. Activation',
        metrics: '70% Completion',
        desc: 'Value-prop screens and permissions request.',
        targets: ['6']
      },
      {
        id: '6',
        title: 'Account Creation',
        stage: '3. Activation',
        metrics: '80% Sign-up',
        desc: 'Free user account created.',
        targets: ['7']
      },
      {
        id: '7',
        title: 'Paywall Screen',
        stage: '4. Monetization',
        metrics: '5% Trial Start',
        desc: 'Hard paywall offering a 7-day free trial.',
        targets: ['8', '9']
      },
      {
        id: '8',
        title: 'Free Tier Usage',
        stage: '4. Monetization',
        metrics: '95% Free',
        desc: 'User dismisses paywall and uses free features.',
        targets: ['7']
      },
      {
        id: '9',
        title: '7-Day Free Trial',
        stage: '4. Monetization',
        metrics: 'Active Trial',
        desc: 'Credit card on file, exploring premium features.',
        targets: ['10', '11']
      },
      {
        id: '10',
        title: 'Trial Cancelled',
        stage: '5. Retention',
        metrics: '40% Churn',
        desc: 'User cancels before being billed.',
        targets: ['8']
      },
      {
        id: '11',
        title: 'Paid Subscription',
        stage: '5. Retention',
        metrics: '$9.99/mo',
        desc: 'Trial converts to active paid user.',
        targets: []
      }
    ]
  },
  'high-ticket-coaching': {
    name: 'High-Ticket Webinar',
    description: 'Classic info-marketing funnel for $2k+ coaching or masterminds.',
    nodes: [
      {
        id: '1',
        title: 'Facebook Ads',
        stage: '1. Traffic',
        metrics: '$15 CPL',
        desc: 'Video ad teasing a secret or framework.',
        targets: ['2']
      },
      {
        id: '2',
        title: 'Registration Page',
        stage: '2. Opt-In',
        metrics: '30% CVR',
        desc: 'Landing page to sign up for the free training.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Webinar Waiting Room',
        stage: '2. Opt-In',
        metrics: 'Email/SMS',
        desc: 'Pre-webinar indoctrination sequences to boost show rate.',
        targets: ['4', '5']
      },
      {
        id: '4',
        title: 'No-Shows',
        stage: '3. Education',
        metrics: '70% Drop',
        desc: 'Registered but did not attend.',
        targets: ['6']
      },
      {
        id: '5',
        title: 'Attended Webinar',
        stage: '3. Education',
        metrics: '30% Show Rate',
        desc: 'Watched the 60-90 minute VSL/Webinar.',
        targets: ['7']
      },
      {
        id: '6',
        title: 'Replay Sequence',
        stage: '3. Education',
        metrics: '3 Days',
        desc: 'Emails driving no-shows back to the replay video.',
        targets: ['5']
      },
      {
        id: '7',
        title: 'Application Page',
        stage: '4. Application',
        metrics: '10% Apply',
        desc: 'Survey to qualify leads (income, commitment).',
        targets: ['8', '9']
      },
      {
        id: '8',
        title: 'Disqualified',
        stage: '4. Application',
        metrics: 'Filtered',
        desc: "Doesn't meet the criteria. Redirect to low-ticket course.",
        targets: []
      },
      {
        id: '9',
        title: 'Strategy Session',
        stage: '5. Sales',
        metrics: '45 Mins',
        desc: '1-on-1 Zoom call with a closer.',
        targets: ['10']
      },
      {
        id: '10',
        title: 'Enrolled',
        stage: '6. Close',
        metrics: '$5,000 LTV',
        desc: 'Client pays in full or takes a payment plan.',
        targets: []
      }
    ]
  },
  'local-service': {
    name: 'Local Service Business',
    description: 'Lead generation for plumbers, roofers, dentists, or law firms.',
    nodes: [
      {
        id: '1',
        title: 'Google Local Services',
        stage: '1. Search',
        metrics: '$40/Lead',
        desc: 'Pay-per-lead ads at the very top of Google.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Organic SEO (Maps)',
        stage: '1. Search',
        metrics: 'Free',
        desc: 'Ranking in the Google Maps 3-Pack.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Website / Landing Page',
        stage: '2. Contact',
        metrics: '15% CVR',
        desc: 'Clear phone number, trust badges, and reviews.',
        targets: ['4', '5']
      },
      {
        id: '4',
        title: 'Inbound Phone Call',
        stage: '2. Contact',
        metrics: 'Hot Lead',
        desc: 'Immediate intent to hire.',
        targets: ['6']
      },
      {
        id: '5',
        title: 'Quote Request Form',
        stage: '2. Contact',
        metrics: 'Warm Lead',
        desc: 'Fills out form for an estimate.',
        targets: ['6']
      },
      {
        id: '6',
        title: 'Dispatch / Consultation',
        stage: '3. Estimate',
        metrics: '80% Book Rate',
        desc: 'Sending a tech to the house or an initial meeting.',
        targets: ['7']
      },
      {
        id: '7',
        title: 'Quote Delivered',
        stage: '3. Estimate',
        metrics: 'Written',
        desc: 'Formal estimate provided to the homeowner/client.',
        targets: ['8', '9']
      },
      {
        id: '8',
        title: 'Follow-up Sequence',
        stage: '4. Decision',
        metrics: 'Automated',
        desc: "Text/Email follow-ups if they don't close on the spot.",
        targets: ['7']
      },
      {
        id: '9',
        title: 'Job Won',
        stage: '5. Revenue',
        metrics: '$1,500 Avg',
        desc: 'Work is approved and scheduled.',
        targets: ['10']
      },
      {
        id: '10',
        title: 'Review Request',
        stage: '6. Referral',
        metrics: 'Reputation',
        desc: 'Automated SMS asking for a 5-star Google review.',
        targets: ['2']
      }
    ]
  },
  'product-led-growth': {
    name: 'Product-Led Growth (PLG)',
    description: 'Self-serve software funnel driven by product usage (like Slack/Figma).',
    nodes: [
      {
        id: '1',
        title: 'Word of Mouth / Invites',
        stage: '1. Acquisition',
        metrics: 'High Viral Coefficient',
        desc: 'Current users inviting teammates.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Organic Search (SEO)',
        stage: '1. Acquisition',
        metrics: 'High Volume',
        desc: 'Template galleries and how-to guides.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Free Sign-up',
        stage: '2. Activation',
        metrics: '15% CVR',
        desc: 'Frictionless email or Google OAuth login.',
        targets: ['4']
      },
      {
        id: '4',
        title: 'In-App Onboarding',
        stage: '2. Activation',
        metrics: '50% Completion',
        desc: 'Guided tour to reach the Aha! moment.',
        targets: ['5']
      },
      {
        id: '5',
        title: 'Core Action (Aha! Moment)',
        stage: '3. Engagement',
        metrics: '40% Active',
        desc: 'User successfully creates their first project/board.',
        targets: ['6']
      },
      {
        id: '6',
        title: 'Usage Limit Reached',
        stage: '4. Monetization',
        metrics: '10% Hit Limit',
        desc: 'User runs out of free credits or needs premium feature.',
        targets: ['7', '8']
      },
      {
        id: '7',
        title: 'Self-Serve Upgrade',
        stage: '4. Monetization',
        metrics: '$15/User/Mo',
        desc: 'User inputs credit card directly in the app.',
        targets: ['9']
      },
      {
        id: '8',
        title: 'Sales Assist (PQL)',
        stage: '4. Monetization',
        metrics: 'Product Qualified',
        desc: 'Sales rep reaches out to high-usage free teams.',
        targets: ['9']
      },
      {
        id: '9',
        title: 'Team Expansion',
        stage: '5. Expansion',
        metrics: 'Negative Churn',
        desc: 'Adding more seats and upgrading to Enterprise tiers.',
        targets: []
      }
    ]
  },
  'real-estate': {
    name: 'Real Estate Sales',
    description: 'High-friction physical asset funnel from listing to closing.',
    nodes: [
      {
        id: '1',
        title: 'Zillow / Redfin',
        stage: '1. Sourcing',
        metrics: 'High Impressions',
        desc: 'Syndicated property listings.',
        targets: ['3']
      },
      {
        id: '2',
        title: 'Social Media Ads',
        stage: '1. Sourcing',
        metrics: 'Targeted Local',
        desc: 'High-quality photography and video tours.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Virtual Tour / Listing Page',
        stage: '2. Interest',
        metrics: '5% Lead CVR',
        desc: 'Prospective buyers viewing the property details.',
        targets: ['4']
      },
      {
        id: '4',
        title: 'Inbound Inquiry',
        stage: '3. Contact',
        metrics: 'Warm Lead',
        desc: 'Buyer agent or direct buyer requests a showing.',
        targets: ['5', '6']
      },
      {
        id: '5',
        title: 'Disqualified',
        stage: '3. Contact',
        metrics: 'No Pre-Approval',
        desc: 'Buyer lacks financing or is just browsing.',
        targets: []
      },
      {
        id: '6',
        title: 'In-Person Showing',
        stage: '4. Evaluation',
        metrics: '10-20 Showings',
        desc: 'Private tour or open house attendance.',
        targets: ['7']
      },
      {
        id: '7',
        title: 'Offer Submitted',
        stage: '5. Negotiation',
        metrics: '2-3 Offers',
        desc: 'Formal purchase agreement drafted.',
        targets: ['8', '9']
      },
      {
        id: '8',
        title: 'Offer Rejected',
        stage: '5. Negotiation',
        metrics: 'Outbid',
        desc: 'Seller accepts a different offer.',
        targets: []
      },
      {
        id: '9',
        title: 'Escrow & Due Diligence',
        stage: '6. Pending',
        metrics: '30-45 Days',
        desc: 'Inspections, appraisals, and loan underwriting.',
        targets: ['10', '11']
      },
      {
        id: '10',
        title: 'Fall Through',
        stage: '6. Pending',
        metrics: '10% Failure',
        desc: 'Financing fails or inspection reveals dealbreakers.',
        targets: ['1']
      },
      {
        id: '11',
        title: 'Closing / Sold',
        stage: '7. Close',
        metrics: '2.5% Commission',
        desc: 'Keys handed over, funds disbursed.',
        targets: []
      }
    ]
  },
  crowdfunding: {
    name: 'Crowdfunding (Kickstarter)',
    description: 'Launch-based funnel relying on pre-campaign momentum and scarcity.',
    nodes: [
      {
        id: '1',
        title: 'Pre-Launch FB Ads',
        stage: '1. Pre-Launch',
        metrics: '$2 CPL',
        desc: 'Building a VIP list before the campaign goes live.',
        targets: ['2']
      },
      {
        id: '2',
        title: 'VIP Landing Page',
        stage: '1. Pre-Launch',
        metrics: '25% Opt-in',
        desc: 'Pay $1 now to secure the best early-bird discount.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Launch Day Email Blast',
        stage: '2. Launch',
        metrics: '40% Open Rate',
        desc: 'Sending the VIP list to the live campaign page.',
        targets: ['4']
      },
      {
        id: '4',
        title: 'Kickstarter Page',
        stage: '3. Conversion',
        metrics: '5% Backer CVR',
        desc: 'High-production video and tier rewards.',
        targets: ['5']
      },
      {
        id: '5',
        title: 'Backed Project',
        stage: '3. Conversion',
        metrics: '$150 Average',
        desc: 'Pledge secured (Early Bird).',
        targets: ['6']
      },
      {
        id: '6',
        title: 'Campaign Funded',
        stage: '4. Post-Campaign',
        metrics: 'Goal Hit',
        desc: 'Funds collected at the end of 30 days.',
        targets: ['7']
      },
      {
        id: '7',
        title: 'Pledge Manager (BackerKit)',
        stage: '5. Upsell',
        metrics: '20% Boost',
        desc: 'Collecting shipping info and offering add-ons.',
        targets: ['8']
      },
      {
        id: '8',
        title: 'Manufacturing & Fulfillment',
        stage: '6. Delivery',
        metrics: '6-12 Months',
        desc: 'Producing the physical product and shipping.',
        targets: []
      }
    ]
  },
  'affiliate-blog': {
    name: 'Affiliate Marketing Blog',
    description: 'Low-friction SEO funnel driven by high-intent product reviews.',
    nodes: [
      {
        id: '1',
        title: 'Google SEO (Long-tail)',
        stage: '1. Traffic',
        metrics: 'Organic',
        desc: 'Ranking for "Best [X] for [Y]" keywords.',
        targets: ['2']
      },
      {
        id: '2',
        title: 'Pinterest Pins',
        stage: '1. Traffic',
        metrics: 'Evergreen',
        desc: 'Visual discovery traffic to articles.',
        targets: ['3']
      },
      {
        id: '3',
        title: 'Review / Listicles',
        stage: '2. Content',
        metrics: 'High Intent',
        desc: 'In-depth comparison article with pros and cons.',
        targets: ['4', '5']
      },
      {
        id: '4',
        title: 'Bounced',
        stage: '2. Content',
        metrics: '80% Bounce',
        desc: 'Reader leaves without clicking links.',
        targets: []
      },
      {
        id: '5',
        title: 'Affiliate Link Click',
        stage: '3. Action',
        metrics: '15% CTR',
        desc: 'Reader clicks "Check Price on Amazon".',
        targets: ['6']
      },
      {
        id: '6',
        title: 'Partner Landing Page',
        stage: '4. Hand-off',
        metrics: 'Cookie Set',
        desc: 'User arrives at Amazon or SaaS partner site.',
        targets: ['7', '8']
      },
      {
        id: '7',
        title: 'No Purchase (Within Cookie)',
        stage: '4. Hand-off',
        metrics: '95% Drop',
        desc: 'User abandons partner site.',
        targets: []
      },
      {
        id: '8',
        title: 'Purchase Made',
        stage: '5. Revenue',
        metrics: '5% CVR',
        desc: 'User buys the product within 24h-30 days.',
        targets: ['9']
      },
      {
        id: '9',
        title: 'Commission Earned',
        stage: '5. Revenue',
        metrics: '3-10% Cut',
        desc: 'Affiliate payout credited to dashboard.',
        targets: []
      }
    ]
  }
};
