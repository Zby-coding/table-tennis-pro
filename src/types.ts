export type LevelType = 'L1 萌新' | 'L2 进阶' | 'L3 高级' | 'Pro 大神';

export interface MatchPost {
  id: string;
  organizerName: string;
  organizerAvatar: string;
  organizerLevel: LevelType;
  title: string;
  locationName: string;
  timeStr: string;
  joinedCount: number;
  totalCapacity: number;
  feeType: 'AA制' | '免费' | '付费';
  feeValue: number;
  description: string;
  status: '招募中' | '最后1席' | '已满员';
  participants: string[]; // List of avatar image URLs
  isJoinedByMe?: boolean;
}

export interface CourtReview {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerLevel: string;
  timeStr: string;
  rating: number;
  content: string;
  images: string[];
}

export interface Court {
  id: string;
  name: string;
  isFree: boolean;
  activePlayers: number;
  distanceStr: string;
  courtCount: number;
  material: string;
  hasLighting: boolean;
  openHours: string;
  image: string;
  galleryImages: string[];
  lat: number; // percentage top (0-100) for local simulation
  lng: number; // percentage left (0-100) for local simulation
  rating: number;
  address: string;
  features: string[];
  reviews: CourtReview[];
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface UserProfile {
  username: string;
  level: LevelType;
  levelBadge: string;
  avatarUrl: string;
  hoursPlayed: number;
  winRate: number;
  points: number;
  achievements: Achievement[];
}

export interface CustomIcon {
  id: string;
  name: string;
  dataUrl: string; // Base64 representation of image
  type: 'marker' | 'badge' | 'avatar';
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface GameRecord {
  id: string;
  opponentName: string;
  opponentLevel: LevelType;
  opponentAvatar: string;
  matchTime: string;
  myScore: number;
  opponentScore: number;
  isWin: boolean;
  locationName: string;
}
