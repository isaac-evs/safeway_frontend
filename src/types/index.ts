export interface NewsItem {
  id: number;
  title: string;
  description: string;
  coordinates: [number, number] | string; // Can be [longitude, latitude] or "POINT (longitude latitude)"
  type: 'crime' | 'infrastructure' | 'hazard' | 'social';
  date: string;
  url?: string; // Optional URL for the news source
  news_source?: string; // Source of the news
  processed_at?: string; // Processing date
} 