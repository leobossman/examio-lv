import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLearning } from './learning.functions';

export const learningQuery = queryOptions({
  queryKey: ['learning'],
  queryFn: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user ? getLearning() : null;
  },
  staleTime: 0,
});