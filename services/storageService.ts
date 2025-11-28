import { BacklogItem, Sprint, Assignment } from "../types";
import { supabase } from "./supabaseClient";

export const storageService = {
  // Backlog CRUD
  getBacklog: async (): Promise<BacklogItem[]> => {
    const { data, error } = await supabase
      .from('backlog')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  addBacklogItem: async (item: Omit<BacklogItem, 'id' | 'created_at'>): Promise<BacklogItem> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('backlog')
      .insert([{
        ...item,
        user_id: userData.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateBacklogItem: async (id: string, updates: Partial<BacklogItem>): Promise<void> => {
    const { error } = await supabase
      .from('backlog')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  deleteBacklogItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('backlog')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Sprints
  getSprints: async (): Promise<Sprint[]> => {
    // We fetch sprints and join assignments, and then join backlog items to assignments
    // Note: The structure requires mapping because Supabase returns nested objects
    const { data, error } = await supabase
      .from('sprints')
      .select(`
        *,
        assignments (
          *,
          backlog_item:backlog (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  },

  saveSprint: async (sprint: Partial<Sprint> & { assignments: Partial<Assignment>[] }): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // 1. Insert Sprint
    const { data: sprintData, error: sprintError } = await supabase
      .from('sprints')
      .insert([{
        sprint_name: sprint.sprint_name,
        velocity: sprint.velocity,
        capacity: sprint.capacity,
        ai_summary: sprint.ai_summary,
        user_id: userData.user.id
      }])
      .select()
      .single();

    if (sprintError) throw sprintError;
    if (!sprintData) throw new Error("Failed to create sprint");

    // 2. Insert Assignments
    // We need to map the assignments to include the new sprint_id and user_id
    const assignmentsToInsert = sprint.assignments.map(a => ({
      sprint_id: sprintData.id,
      backlog_item_id: a.backlog_item_id,
      order: a.order,
      risk_flag: a.risk_flag,
      notes: a.notes,
      user_id: userData.user.id
    }));

    const { error: assignmentError } = await supabase
      .from('assignments')
      .insert(assignmentsToInsert);

    if (assignmentError) throw assignmentError;
  }
};