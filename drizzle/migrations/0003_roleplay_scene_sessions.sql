CREATE TABLE public.roleplay_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, scene_id text NOT NULL CHECK(scene_id IN ('auto','kothu','wedding')), level text NOT NULL DEFAULT 'beginner', turns jsonb NOT NULL DEFAULT '[]', exchanges integer NOT NULL DEFAULT 0 CHECK(exchanges BETWEEN 0 AND 6), ended boolean NOT NULL DEFAULT false, stars integer CHECK(stars BETWEEN 1 AND 5), feedback jsonb, awarded boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.roleplay_sessions TO authenticated;
GRANT ALL ON public.roleplay_sessions TO service_role;
ALTER TABLE public.roleplay_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Learners read own roleplay" ON public.roleplay_sessions FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE TABLE public.roleplay_ambience (scene_id text PRIMARY KEY CHECK(scene_id IN ('auto','kothu','wedding')), status text NOT NULL CHECK(status IN ('generating','ready','failed')), path text, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.roleplay_ambience TO service_role;
ALTER TABLE public.roleplay_ambience ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.finish_roleplay_session(p_session_id uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.roleplay_sessions; points integer;
BEGIN
 SELECT * INTO s FROM public.roleplay_sessions WHERE id=p_session_id FOR UPDATE;
 IF s.id IS NULL OR NOT s.ended OR s.stars IS NULL THEN RAISE EXCEPTION 'Scene is not complete'; END IF;
 IF s.awarded THEN RETURN 0; END IF;
 points:=s.stars*10;
 INSERT INTO public.xp_events(user_id,points,reason) VALUES(s.user_id,points,'roleplay_'||s.scene_id);
 UPDATE public.impact_counters SET bricks_laid=bricks_laid+points WHERE id=1;
 UPDATE public.roleplay_sessions SET awarded=true WHERE id=s.id;
 RETURN points;
END; $$;
REVOKE ALL ON FUNCTION public.finish_roleplay_session(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_roleplay_session(uuid) TO service_role;
CREATE POLICY "Signed in learners read scene ambience" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='scene-ambience');