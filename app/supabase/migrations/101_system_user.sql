-- Create a fixed System User for Crawled Intents (Nguồn Ngoài)
DO $$
DECLARE
  nguon_ngoai_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = nguon_ngoai_id) THEN
    -- Insert into auth.users bypasses typical signups but creates a valid user
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at
    ) VALUES (
      nguon_ngoai_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
      'crawl-system@canco.vn', crypt('canco-secure-pwd', gen_salt('bf')), now(), 
      now(), now()
    );
    
    -- Delay slightly if triggers are firing? Trigger `on_auth_user_created` in 002_functions.sql 
    -- might auto-create profile. Let's check if profile exists, update, else insert
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = nguon_ngoai_id) THEN
      UPDATE public.profiles 
      SET name = 'Nguồn ngoài', 
          avatar_url = 'https://api.dicebear.com/7.x/initials/svg?seed=NN&backgroundColor=475569',
          trust_score = 0,
          verification_level = 'none'
      WHERE id = nguon_ngoai_id;
    ELSE
      INSERT INTO public.profiles (
        id, name, avatar_url, trust_score, verification_level
      ) VALUES (
        nguon_ngoai_id, 'Nguồn ngoài', 'https://api.dicebear.com/7.x/initials/svg?seed=NN&backgroundColor=475569', 
        0, 'none'
      );
    END IF;
  END IF;
END $$;
