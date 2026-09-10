export const REGISTER_PATH = '/register';
export const LOGIN_PATH = '/login';

export const landingContent = {
  brand: {
    name: 'FitTrack',
    tagline: 'Track every workout, meal, and win.',
    ariaLabel: 'FitTrack home',
  },

  navbar: {
    links: [
      { id: 'features', label: 'Features', href: '#features' },
      { id: 'how-it-works', label: 'How it works', href: '#how-it-works' },
      { id: 'benefits', label: 'Benefits', href: '#benefits' },
      { id: 'testimonials', label: 'Testimonials', href: '#testimonials' },
    ],
    cta: { label: 'Get started', to: REGISTER_PATH, variant: 'primary' },
    login: { label: 'Log in', to: LOGIN_PATH, variant: 'outline' },
  },

  hero: {
    eyebrow: 'Real tracking, real progress',
    title: 'Make every workout count. See the progress.',
    subhead:
      'FitTrack logs your workouts, nutrition, and measurements — then turns them into clear trends, goals, and reports that show you what is working.',
    primaryCta: { label: 'Get started free', to: REGISTER_PATH, variant: 'primary' },
    secondaryCta: { label: 'Log in', to: LOGIN_PATH, variant: 'outline' },
    visual: {
      label: 'Animated activity rings showing consistency across workouts, nutrition, and measurements',
      chip: { value: 92, suffix: '%', label: 'consistency this month' },
    },
  },

  features: [
    {
      key: 'workouts',
      icon: 'Dumbbell',
      title: 'Workout tracking',
      description: 'Log strength, cardio, flexibility, and hybrid sessions in seconds. Track sets, reps, and weights so every session counts.',
    },
    {
      key: 'nutrition',
      icon: 'Apple',
      title: 'Nutrition logging',
      description: 'Stay on top of calories, protein, carbs, and fat — meal by meal — without fighting a bloated food database.',
    },
    {
      key: 'progress',
      icon: 'TrendingUp',
      title: 'Progress analytics',
      description: 'Charts and summaries that turn raw logs into real trends. See the trajectory, not just the last workout.',
    },
    {
      key: 'goals',
      icon: 'Target',
      title: 'Goals & habits',
      description: 'Set strength, weight, habit, and endurance goals. Track streaks and check-ins until they become second nature.',
    },
    {
      key: 'reports',
      icon: 'BarChart3',
      title: 'Reports & export',
      description: 'Overview, workout, nutrition, and progress reports with one-click CSV and PDF export for the data you own.',
    },
    {
      key: 'reminders',
      icon: 'Bell',
      title: 'Smart reminders',
      description: 'Gentle nudges for workouts, meals, and goals — tuned to your schedule so consistency becomes automatic.',
    },
  ],

  howItWorks: [
    {
      step: '01',
      title: 'Log your day',
      description: 'Add a workout, a meal, or a quick weight check-in. The fast-log form takes seconds, not session planning.',
    },
    {
      step: '02',
      title: 'Watch the trends',
      description: 'Progress, analytics, and reports surface the patterns behind your effort — volume, consistency, PRs, and macros.',
    },
    {
      step: '03',
      title: 'Hit the goal',
      description: 'Goals, streaks, and reminders keep the direction clear. When the numbers move, you know the plan is working.',
    },
  ],

  stats: [
    { prefix: '', value: 250, suffix: 'k+', label: 'workouts logged', illustrative: true },
    { prefix: '', value: 92, suffix: '%', label: 'rate more consistency after a month', illustrative: true },
    { prefix: '', value: 5, suffix: '', label: 'workout categories tracked', illustrative: false },
    { prefix: '', value: 11, suffix: '', label: 'tracking views and reports', illustrative: false },
  ],

  benefits: [
    {
      key: 'consistency',
      title: 'Stay consistent',
      points: ['Streak and check-in tracking that keeps you showing up', 'Smart reminders tuned to your schedule'],
    },
    {
      key: 'real-progress',
      title: 'See real progress',
      points: ['Trends built from your actual logs — not feelings', 'PRs and best-lifts tracked across your full history'],
    },
    {
      key: 'smarter-decisions',
      title: 'Make smarter decisions',
      points: ['Weekly overviews that show what worked', 'CSV and PDF reports you can share or review anywhere'],
    },
    {
      key: 'clear-goals',
      title: 'Set goals that stick',
      points: ['Strengths, weight, habits, and endurance targets', 'Live progress views against every goal'],
    },
    {
      key: 'less-time',
      title: 'Save time every day',
      points: ['Fast-log forms for workouts, food, and measurements', 'One dashboard for your entire week at a glance'],
    },
    {
      key: 'understand-body',
      title: 'Understand your body',
      points: ['Measurements and body stats mapped over time', 'Macro breakdowns tied to your training'],
    },
  ],

  testimonials: [
    {
      quote: 'I used to guess at the gym. FitTrack shows me the trend line, so I finally know the plan is working.',
      name: 'Marcus V.',
      role: 'Strength training · 8 months',
      illustrative: true,
    },
    {
      quote: 'Workouts, meals, and measurements in one place — my consistency now shows up in the numbers, not just the mirror.',
      name: 'Priya S.',
      role: 'Marathon runner',
      illustrative: true,
    },
    {
      quote: 'The weekly report is a game changer. I see exactly what worked and I fix what didn\u2019t.',
      name: 'Marcus T.',
      role: 'CrossFit enthusiast',
      illustrative: true,
    },
  ],

  finalCta: {
    eyebrow: 'Ready when you are',
    headline: 'Your first log is 30 seconds away.',
    subhead: 'Join FitTrack free and start seeing real, measurable progress from your very first workout.',
    primaryCta: { label: 'Create your free account', to: REGISTER_PATH, variant: 'primary' },
  },

  footer: {
    about:
      'FitTrack is a personal fitness tracker for workouts, nutrition, and progress — built for people who want the data to match the effort.',
    navLinks: [
      { id: 'features', label: 'Features', href: '#features' },
      { id: 'how-it-works', label: 'How it works', href: '#how-it-works' },
      { id: 'benefits', label: 'Benefits', href: '#benefits' },
      { id: 'testimonials', label: 'Testimonials', href: '#testimonials' },
    ],
    authLinks: [
      { label: 'Log in', to: LOGIN_PATH },
      { label: 'Sign up', to: REGISTER_PATH },
    ],
    legal: `\u00A9 ${new Date().getFullYear()} FitTrack. All rights reserved.`,
  },
};