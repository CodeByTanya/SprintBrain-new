export type Priority = 'Low' | 'Medium' | 'High';

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  story_points: number;
  priority: Priority;
  dependencies: string[]; // IDs of other items
  created_at: string;
}

export interface Sprint {
  id: string;
  sprint_name: string;
  start_date: string;
  end_date: string;
  velocity: number;
  capacity: number;
  ai_summary: string;
  created_at: string;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  backlog_item_id: string;
  order: number;
  risk_flag: string | null;
  notes: string | null;
  backlog_item?: BacklogItem; // Joined data
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface AppState {
  user: User | null;
  backlog: BacklogItem[];
  sprints: Sprint[];
  currentView: 'landing' | 'auth' | 'backlog' | 'planner' | 'sprint-detail' | 'reset-password';
  selectedSprintId: string | null;
}

export type ViewName = AppState['currentView'];

// Gemini Prompt Types
export interface ParseBacklogResponse {
  items: Omit<BacklogItem, 'id' | 'created_at'>[];
}

export interface PlanSprintResponse {
  sprint_name: string;
  assignments: {
    backlog_item_title: string; // Used to match back to ID
    risk_flag: string;
    notes: string;
    order: number;
  }[];
  ai_summary: string;
}