ALTER FUNCTION public.record_attempt(text,text,int,int) RENAME TO record_attempt_internal;
CREATE FUNCTION public.record_attempt(p_user_id uuid,p_task_id text,p_answer text,p_time_spent_sec int,p_self_points int DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 PERFORM set_config('request.jwt.claim.sub',p_user_id::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',p_user_id)::text,true);
 RETURN public.record_attempt_internal(p_task_id,p_answer,p_time_spent_sec,p_self_points);
END $$;
REVOKE ALL ON FUNCTION public.record_attempt_internal(text,text,int,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_attempt_internal(text,text,int,int) TO service_role;
REVOKE ALL ON FUNCTION public.record_attempt(uuid,text,text,int,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_attempt(uuid,text,text,int,int) TO service_role;
ALTER FUNCTION public.learning_leaderboard() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.learning_leaderboard() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.learning_leaderboard() TO service_role;