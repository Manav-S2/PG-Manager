-- ============================================================================
-- PGManager · seed_mock_data.sql
-- Generates 5 Owners, 10 Managers, 20 PGs, and 1000 Students.
-- Assigns students to rooms, managers to PGs, and generates payments.
-- Run this in the Supabase SQL Editor.
-- ============================================================================

DO $$ 
DECLARE
  v_owner_ids uuid[] := '{}';
  v_manager_ids uuid[] := '{}';
  v_pg_ids uuid[] := '{}';
  v_room_ids uuid[] := '{}';
  i int;
  r int;
  new_id uuid;
  assigned_pg uuid;
  assigned_room uuid;
BEGIN
  -- Clear existing mock data to avoid conflicts if run multiple times
  DELETE FROM auth.users WHERE email LIKE '%@mockpg.com';

  -- 1. Create 5 Owners
  FOR i IN 1..5 LOOP
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
    VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner' || i || '@mockpg.com', crypt('password123', gen_salt('bf')), now());
    
    INSERT INTO public.profiles (id, role, full_name, email, active)
    VALUES (new_id, 'pg_owner', 'Mock Owner ' || i, 'owner' || i || '@mockpg.com', true);
    
    v_owner_ids := array_append(v_owner_ids, new_id);
  END LOOP;

  -- 2. Create 20 PGs (4 per owner)
  FOR i IN 1..20 LOOP
    new_id := gen_random_uuid();
    INSERT INTO public.pgs (id, owner_id, name, city, state, status, gender_policy)
    VALUES (
      new_id, 
      v_owner_ids[((i - 1) % 5) + 1], 
      'Mock Premium PG ' || i, 
      CASE WHEN i % 2 = 0 THEN 'Bangalore' ELSE 'Delhi' END,
      CASE WHEN i % 2 = 0 THEN 'KA' ELSE 'DL' END,
      'approved', 
      'coliving'
    );
    v_pg_ids := array_append(v_pg_ids, new_id);

    -- Create 25 rooms per PG (capacity 2 per room = 50 beds per PG)
    FOR r IN 1..25 LOOP
      INSERT INTO public.rooms (pg_id, number, floor, room_type, capacity, occupied, rent_monthly)
      VALUES (
        new_id, 
        'R' || r, 
        (r/10) + 1, 
        'double', 
        2, 
        0, -- will be updated below
        8000 + (random() * 4000)::int
      )
      RETURNING id INTO assigned_room;
      v_room_ids := array_append(v_room_ids, assigned_room);
    END LOOP;
  END LOOP;

  -- 3. Create 10 Managers and assign them (2 PGs per manager)
  FOR i IN 1..10 LOOP
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
    VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager' || i || '@mockpg.com', crypt('password123', gen_salt('bf')), now());
    
    INSERT INTO public.profiles (id, role, full_name, email, active)
    VALUES (new_id, 'pg_manager', 'Mock Manager ' || i, 'manager' || i || '@mockpg.com', true);
    
    v_manager_ids := array_append(v_manager_ids, new_id);

    -- Assign to 2 PGs
    INSERT INTO public.manager_assignments (pg_id, manager_id, assigned_by)
    VALUES (v_pg_ids[i * 2 - 1], new_id, v_owner_ids[1]);
    
    INSERT INTO public.manager_assignments (pg_id, manager_id, assigned_by)
    VALUES (v_pg_ids[i * 2], new_id, v_owner_ids[1]);
  END LOOP;

  -- 4. Create 1000 Students
  FOR i IN 1..1000 LOOP
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
    VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student' || i || '@mockpg.com', crypt('password123', gen_salt('bf')), now());
    
    INSERT INTO public.profiles (id, role, full_name, email, active)
    VALUES (new_id, 'student', 'Mock Student ' || i, 'student' || i || '@mockpg.com', true);
    
    -- 1000 students / 2 per room = 500 rooms needed. We created 500 rooms (20 PGs * 25 rooms).
    assigned_room := v_room_ids[((i - 1) / 2) + 1];
    
    SELECT pg_id INTO assigned_pg FROM public.rooms WHERE id = assigned_room;

    -- Update room occupied count
    UPDATE public.rooms SET occupied = occupied + 1 WHERE id = assigned_room;

    -- Create tenancy
    INSERT INTO public.tenancies (pg_id, room_id, student_id, rent_monthly, deposit_paid, checkin, status)
    VALUES (
      assigned_pg, 
      assigned_room, 
      new_id, 
      (SELECT rent_monthly FROM public.rooms WHERE id = assigned_room), 
      15000, 
      current_date - (random() * 300)::int, 
      'active'
    );

    -- Create dummy payments for this student (Current Month)
    -- Randomly 85% paid, 15% pending to give realistic collection rates
    IF random() > 0.15 THEN
      INSERT INTO public.payments (pg_id, student_id, amount, pay_type, status, period_month)
      VALUES (
        assigned_pg, 
        new_id, 
        (SELECT rent_monthly FROM public.rooms WHERE id = assigned_room), 
        'rent', 
        'paid', 
        date_trunc('month', now())
      );
    ELSE
      INSERT INTO public.payments (pg_id, student_id, amount, pay_type, status, period_month)
      VALUES (
        assigned_pg, 
        new_id, 
        (SELECT rent_monthly FROM public.rooms WHERE id = assigned_room), 
        'rent', 
        'pending', 
        date_trunc('month', now())
      );
    END IF;
  END LOOP;
END $$;
