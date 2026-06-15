export const trendData = [
  { month: "Jan", actual: 742, target: 700, forecast: null },
  { month: "Feb", actual: 705, target: 675, forecast: null },
  { month: "Mar", actual: 681, target: 650, forecast: null },
  { month: "Apr", actual: 644, target: 625, forecast: null },
  { month: "May", actual: 612, target: 600, forecast: null },
  { month: "Jun", actual: null, target: 575, forecast: 584 },
  { month: "Jul", actual: null, target: 550, forecast: 552 }
];

export const categoryData = [
  { name: "Transport", value: 238, color: "#f2a93b" },
  { name: "Energy", value: 151, color: "#2f7d5c" },
  { name: "Food", value: 143, color: "#85b957" },
  { name: "Lifestyle", value: 80, color: "#517e92" }
];

export const monthlyBreakdownData: Record<string, typeof categoryData> = {
  Jan: [
    { name: "Transport", value: 310, color: "#f2a93b" },
    { name: "Energy", value: 180, color: "#2f7d5c" },
    { name: "Food", value: 160, color: "#85b957" },
    { name: "Lifestyle", value: 92, color: "#517e92" }
  ],
  Feb: [
    { name: "Transport", value: 290, color: "#f2a93b" },
    { name: "Energy", value: 172, color: "#2f7d5c" },
    { name: "Food", value: 155, color: "#85b957" },
    { name: "Lifestyle", value: 88, color: "#517e92" }
  ],
  Mar: [
    { name: "Transport", value: 275, color: "#f2a93b" },
    { name: "Energy", value: 168, color: "#2f7d5c" },
    { name: "Food", value: 150, color: "#85b957" },
    { name: "Lifestyle", value: 88, color: "#517e92" }
  ],
  Apr: [
    { name: "Transport", value: 255, color: "#f2a93b" },
    { name: "Energy", value: 158, color: "#2f7d5c" },
    { name: "Food", value: 148, color: "#85b957" },
    { name: "Lifestyle", value: 83, color: "#517e92" }
  ],
  May: [
    { name: "Transport", value: 238, color: "#f2a93b" },
    { name: "Energy", value: 151, color: "#2f7d5c" },
    { name: "Food", value: 143, color: "#85b957" },
    { name: "Lifestyle", value: 80, color: "#517e92" }
  ],
  Jun: [
    { name: "Transport", value: 225, color: "#f2a93b" },
    { name: "Energy", value: 145, color: "#2f7d5c" },
    { name: "Food", value: 138, color: "#85b957" },
    { name: "Lifestyle", value: 76, color: "#517e92" }
  ],
  Jul: [
    { name: "Transport", value: 210, color: "#f2a93b" },
    { name: "Energy", value: 140, color: "#2f7d5c" },
    { name: "Food", value: 132, color: "#85b957" },
    { name: "Lifestyle", value: 70, color: "#517e92" }
  ]
};


export const challenges = [
  { title: "No-Car Week", progress: 71, members: 1240, reward: 350, accent: "sun" },
  { title: "Plastic-Free Week", progress: 46, members: 816, reward: 250, accent: "leaf" },
  { title: "Energy Saving Month", progress: 63, members: 2094, reward: 500, accent: "sky" }
];

export const leaderboard = [
  { rank: 1, name: "Maya R.", points: 6840, initials: "MR" },
  { rank: 2, name: "Arjun S.", points: 6420, initials: "AS" },
  { rank: 3, name: "You", points: 5980, initials: "AM" },
  { rank: 4, name: "Lena K.", points: 5710, initials: "LK" }
];
