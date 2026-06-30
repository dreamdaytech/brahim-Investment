import { supabase } from './supabase';

export const handleSupabaseSync = async (tableName: string, prev: any[], next: any[], mapToDb: (item: any) => any) => {
  const prevMap = new Map(prev.map(item => [item.id, item]));
  const nextMap = new Map(next.map(item => [item.id, item]));

  // Find Additions & Updates
  for (const item of next) {
    const prevItem = prevMap.get(item.id);
    try {
      if (!prevItem) {
        // It's new
        await supabase.from(tableName).insert(mapToDb(item));
      } else if (JSON.stringify(prevItem) !== JSON.stringify(item)) {
        // It's updated
        await supabase.from(tableName).update(mapToDb(item)).eq('id', item.id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Find Deletions
  for (const item of prev) {
    if (!nextMap.has(item.id)) {
      try {
        await supabase.from(tableName).delete().eq('id', item.id);
      } catch (err) {
        console.error(err);
      }
    }
  }
};
