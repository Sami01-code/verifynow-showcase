
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  headline TEXT,
  bio TEXT,
  country TEXT,
  city TEXT,
  avatar_url TEXT,
  goals TEXT[] NOT NULL DEFAULT '{}',
  experience_level TEXT,
  proof_types TEXT[] NOT NULL DEFAULT '{}',
  opportunity_preferences TEXT[] NOT NULL DEFAULT '{}',
  opportunity_locations TEXT[] NOT NULL DEFAULT '{}',
  reputation_score INT NOT NULL DEFAULT 0,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- USER SKILLS
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  rating NUMERIC(2,1) NOT NULL DEFAULT 3.0,
  evidence_count INT NOT NULL DEFAULT 0,
  verification_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT ON public.user_skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_public_read" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "skills_own_write" ON public.user_skills FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PROOFS
CREATE TABLE public.proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  links TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  project_type TEXT NOT NULL DEFAULT 'Personal',
  verifier_type TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  appreciations INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proofs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proofs TO authenticated;
GRANT ALL ON public.proofs TO service_role;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proofs_public_read" ON public.proofs FOR SELECT USING (true);
CREATE POLICY "proofs_own_write" ON public.proofs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- VERIFICATIONS
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID NOT NULL REFERENCES public.proofs(id) ON DELETE CASCADE,
  verifier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verifier_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Client',
  status TEXT NOT NULL DEFAULT 'verified',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.verifications TO anon;
GRANT SELECT, INSERT ON public.verifications TO authenticated;
GRANT ALL ON public.verifications TO service_role;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verifications_public_read" ON public.verifications FOR SELECT USING (true);
CREATE POLICY "verifications_insert_auth" ON public.verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = verifier_id);

-- OPPORTUNITIES
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  remote BOOLEAN NOT NULL DEFAULT false,
  compensation TEXT,
  type TEXT NOT NULL DEFAULT 'Project',
  deadline DATE,
  verified_poster BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opps_public_read" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "opps_own_write" ON public.opportunities FOR ALL TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- CONNECTIONS
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, receiver_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_read" ON public.connections FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "connections_insert" ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "connections_update" ON public.connections FOR UPDATE TO authenticated USING (auth.uid() = receiver_id OR auth.uid() = requester_id);
CREATE POLICY "connections_delete" ON public.connections FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_read" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    split_part(NEW.email, '@', 1) || '-' || substr(NEW.id::text, 1, 4)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notifications (user_id, type, title, body) VALUES
    (NEW.id, 'system', 'Welcome to SkillGraph', 'Proof. Trust. Opportunity. Add your first proof to start building reputation.'),
    (NEW.id, 'opportunity', 'New opportunities near you', 'We found open opportunities matching new members in your region.'),
    (NEW.id, 'skill', 'Skill recommendation', 'Add proof to unlock verified skill ratings on your profile.');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DEMO DATA
INSERT INTO public.profiles (id, name, username, headline, bio, country, city, avatar_url, goals, experience_level, proof_types, opportunity_preferences, opportunity_locations, reputation_score, onboarding_complete, is_demo) VALUES
('11111111-1111-4111-8111-000000000001','Amanuel Tesfaye','amanuel','Full Stack Developer','I build web and mobile products for local businesses in Addis Ababa.','Ethiopia','Addis Ababa','https://i.pravatar.cc/300?img=12','{Find Work,Find Collaborators}','Advanced','{Projects,Client work,GitHub / code}','{Freelance projects,Full-time jobs}','{My city,Remote only}',82,true,true),
('11111111-1111-4111-8111-000000000002','Selam Gebre','selam','UI/UX Designer','Product designer focused on clear, accessible interfaces.','Ethiopia','Addis Ababa','https://i.pravatar.cc/300?img=45','{Find Work,Mentor Others}','Expert','{Portfolio,Client work}','{Freelance projects,Students to mentor}','{Worldwide}',91,true,true),
('11111111-1111-4111-8111-000000000003','Daniel Mekonen','daniel','Web Developer','React and Python developer. I ship real systems for shops and schools.','Ethiopia','Addis Ababa','https://i.pravatar.cc/300?img=33','{Find Work}','Intermediate','{Projects,University projects}','{Freelance projects,Internships}','{My country}',74,true,true),
('11111111-1111-4111-8111-000000000004','Yonas Alemu','yonas','GIS Specialist','Mapping and spatial analysis for agriculture and urban planning.','Ethiopia','Addis Ababa','https://i.pravatar.cc/300?img=52','{Find Work,Find Collaborators}','Advanced','{Employment experience,Publications}','{Full-time jobs,Collaborators}','{Anywhere in Africa}',78,true,true),
('11111111-1111-4111-8111-000000000005','Amina Hussein','amina','Graphic Designer','Brand identity and print design for growing businesses.','Kenya','Nairobi','https://i.pravatar.cc/300?img=47','{Find Work}','Intermediate','{Portfolio,Client work}','{Freelance projects}','{My city,Remote only}',69,true,true),
('11111111-1111-4111-8111-000000000006','Kalkidan Bekele','kalkidan','Photographer','Event and product photography across East Africa.','Ethiopia','Addis Ababa','https://i.pravatar.cc/300?img=31','{Find Work,Mentor Others}','Advanced','{Portfolio,Competition results}','{Freelance projects,Students to mentor}','{Anywhere in Africa}',80,true,true),
('11111111-1111-4111-8111-000000000007','Grace Nakato','grace','Marketing Specialist','Growth marketing for small businesses and NGOs.','Uganda','Kampala','https://i.pravatar.cc/300?img=26','{Hire Talent,Find Work}','Expert','{Employment experience,Client work}','{Full-time jobs,Collaborators}','{Worldwide}',85,true,true),
('11111111-1111-4111-8111-000000000008','Chidi Okafor','chidi','Mechanical Engineer','Machine design and maintenance systems for manufacturing.','Nigeria','Lagos','https://i.pravatar.cc/300?img=15','{Find Work,Build My Skills}','Advanced','{Employment experience,Certificates}','{Full-time jobs}','{My country}',77,true,true),
('11111111-1111-4111-8111-000000000009','Aline Uwase','aline','Mathematics Teacher','I teach and publish open learning materials for secondary schools.','Rwanda','Kigali','https://i.pravatar.cc/300?img=44','{Mentor Others,Build My Skills}','Expert','{Teaching experience,Community work}','{Students to mentor,Learning opportunities}','{My country}',88,true,true),
('11111111-1111-4111-8111-000000000010','Kwame Mensah','kwame','Video Editor','Documentary and commercial editing.','Ghana','Accra','https://i.pravatar.cc/300?img=59','{Find Work,Find Collaborators}','Intermediate','{Portfolio,Client work}','{Freelance projects,Collaborators}','{Remote only}',66,true,true),
('11111111-1111-4111-8111-000000000011','Hanna Girma','hanna','Accountant','Bookkeeping and financial systems for SMEs.','Ethiopia','Addis Ababa','https://i.pravatar.cc/300?img=48','{Find Work}','Advanced','{Employment experience,Certificates}','{Part-time work,Freelance projects}','{My city}',72,true,true),
('11111111-1111-4111-8111-000000000012','Peter Kamau','peter','Entrepreneur','Building a logistics startup in Nairobi. Hiring verified talent.','Kenya','Nairobi','https://i.pravatar.cc/300?img=68','{Hire Talent,Find Collaborators}','Expert','{Employment experience,Community work}','{Co-founders,Collaborators}','{Anywhere in Africa}',90,true,true);

INSERT INTO public.user_skills (user_id, name, category, rating, evidence_count, verification_count) VALUES
('11111111-1111-4111-8111-000000000001','Python','Technology',4.5,4,3),
('11111111-1111-4111-8111-000000000001','Web Development','Technology',4.2,5,4),
('11111111-1111-4111-8111-000000000001','UI/UX','Design',3.8,2,1),
('11111111-1111-4111-8111-000000000002','UI/UX','Design',4.9,7,6),
('11111111-1111-4111-8111-000000000002','Graphic Design','Design',4.4,4,3),
('11111111-1111-4111-8111-000000000003','React','Technology',4.1,3,2),
('11111111-1111-4111-8111-000000000003','Python','Technology',4.0,3,2),
('11111111-1111-4111-8111-000000000004','GIS','Technology',4.7,5,4),
('11111111-1111-4111-8111-000000000005','Graphic Design','Design',4.3,4,3),
('11111111-1111-4111-8111-000000000006','Photography','Design',4.6,6,5),
('11111111-1111-4111-8111-000000000007','Marketing','Business',4.8,5,4),
('11111111-1111-4111-8111-000000000008','Mechanical','Practical Skills',4.5,4,3),
('11111111-1111-4111-8111-000000000009','Teaching','Creative',4.9,6,5),
('11111111-1111-4111-8111-000000000010','Video Editing','Design',4.2,5,3),
('11111111-1111-4111-8111-000000000011','Accounting','Business',4.4,4,3),
('11111111-1111-4111-8111-000000000012','Entrepreneurship','Business',4.7,3,2);

INSERT INTO public.proofs (id, user_id, title, description, media_urls, links, skills, project_type, verifier_type, verification_status, appreciations, created_at) VALUES
('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000001','Restaurant POS System','Built a full point-of-sale system for a restaurant in Bole: orders, inventory and daily sales reports.','{https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200}','{https://github.com}','{Python,Web Development}','Freelance','Client','verified',124,now() - interval '2 days'),
('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000002','Fintech Mobile App Redesign','Redesigned onboarding and payment flows, reducing drop-off by 34%.','{https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200}','{}','{UI/UX}','Professional','Employer','verified',210,now() - interval '4 days'),
('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-000000000003','School Management System','Student records, attendance and grading for a secondary school in Addis Ababa.','{https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200}','{}','{React,Python}','Freelance','Client','verified',88,now() - interval '6 days'),
('22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-000000000004','Crop Yield Mapping — Oromia','Satellite based yield mapping used by a regional agriculture office.','{https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200}','{}','{GIS}','Professional','Employer','verified',65,now() - interval '9 days'),
('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-000000000005','Brand Identity for Local Coffee Roaster','Logo, packaging and full brand guidelines.','{https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200}','{}','{Graphic Design}','Freelance','Client','verified',142,now() - interval '3 days'),
('22222222-2222-4222-8222-000000000006','11111111-1111-4111-8111-000000000006','Wedding Photography Series','Full day coverage and edited album delivered in 5 days.','{https://images.unsplash.com/photo-1519741497674-611481863552?w=1200}','{}','{Photography}','Freelance','Client','verified',176,now() - interval '11 days'),
('22222222-2222-4222-8222-000000000007','11111111-1111-4111-8111-000000000007','Growth Campaign for NGO','Tripled qualified sign-ups in one quarter with a targeted campaign.','{https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200}','{}','{Marketing}','Professional','Employer','verified',97,now() - interval '7 days'),
('22222222-2222-4222-8222-000000000008','11111111-1111-4111-8111-000000000008','Conveyor Maintenance Redesign','Cut unplanned downtime by 40% at a Lagos plant.','{https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200}','{}','{Mechanical}','Professional','Employer','verified',54,now() - interval '14 days'),
('22222222-2222-4222-8222-000000000009','11111111-1111-4111-8111-000000000009','Open Math Curriculum','Free curriculum now used by 12 schools in Rwanda.','{https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200}','{}','{Teaching}','Community','Community','verified',188,now() - interval '5 days'),
('22222222-2222-4222-8222-000000000010','11111111-1111-4111-8111-000000000010','Documentary Short — Accra Markets','12 minute documentary, official selection at a regional festival.','{https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200}','{}','{Video Editing}','Personal','Community','verified',131,now() - interval '8 days'),
('22222222-2222-4222-8222-000000000011','11111111-1111-4111-8111-000000000011','Bookkeeping System for 9 SMEs','Standardised monthly reporting across nine small businesses.','{https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200}','{}','{Accounting}','Professional','Client','verified',43,now() - interval '16 days'),
('22222222-2222-4222-8222-000000000012','11111111-1111-4111-8111-000000000012','Last-Mile Delivery Pilot','Ran a 3 month pilot serving 400 deliveries per week in Nairobi.','{https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200}','{}','{Entrepreneurship}','Professional','Team member','verified',119,now() - interval '10 days'),
('22222222-2222-4222-8222-000000000013','11111111-1111-4111-8111-000000000001','Inventory App for Retail Shop','Offline-first mobile inventory tracker for a shop with poor connectivity.','{https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200}','{}','{Web Development,Python}','Freelance','Client','verified',72,now() - interval '18 days'),
('22222222-2222-4222-8222-000000000014','11111111-1111-4111-8111-000000000002','Design System for Health Startup','Component library adopted by three product teams.','{https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200}','{}','{UI/UX}','Professional','Employer','verified',158,now() - interval '20 days'),
('22222222-2222-4222-8222-000000000015','11111111-1111-4111-8111-000000000003','University Final Year Project','Machine learning model predicting bus demand in Addis Ababa.','{https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200}','{}','{Python}','Academic','Teacher','verified',61,now() - interval '22 days'),
('22222222-2222-4222-8222-000000000016','11111111-1111-4111-8111-000000000004','Urban Flood Risk Map','Flood risk layers for city planning department.','{https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200}','{}','{GIS}','Professional','Client','pending',22,now() - interval '1 day'),
('22222222-2222-4222-8222-000000000017','11111111-1111-4111-8111-000000000005','Packaging for Spice Brand','Retail packaging line refresh.','{https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200}','{}','{Graphic Design}','Freelance','Client','pending',31,now() - interval '1 day'),
('22222222-2222-4222-8222-000000000018','11111111-1111-4111-8111-000000000006','Product Shoot for E-commerce','120 product images shot and retouched.','{https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200}','{}','{Photography}','Freelance','Client','verified',84,now() - interval '25 days'),
('22222222-2222-4222-8222-000000000019','11111111-1111-4111-8111-000000000007','Market Research Report','Consumer research across three East African markets.','{https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200}','{}','{Marketing}','Professional','Client','verified',49,now() - interval '28 days'),
('22222222-2222-4222-8222-000000000020','11111111-1111-4111-8111-000000000009','Teacher Training Workshop','Trained 60 teachers on active learning methods.','{https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200}','{}','{Teaching}','Community','Community','verified',103,now() - interval '30 days'),
('22222222-2222-4222-8222-000000000021','11111111-1111-4111-8111-000000000010','Music Video Edit','Colour grading and edit for an Afrobeats release.','{https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200}','{}','{Video Editing}','Freelance','Client','verified',95,now() - interval '32 days');

INSERT INTO public.verifications (proof_id, verifier_id, verifier_name, type, status, comment) VALUES
('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000012','Peter Kamau','Client','verified','Delivered on time and the system is still running daily.'),
('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000007','Grace Nakato','Employer','verified','Measurable impact on our conversion numbers.'),
('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-000000000009','Aline Uwase','Teacher','verified','Used by our school administration since last term.'),
('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-000000000012','Peter Kamau','Client','verified','Excellent brand work, very responsive.'),
('22222222-2222-4222-8222-000000000009','11111111-1111-4111-8111-000000000002','Selam Gebre','Community','verified','Genuinely useful open material.');

INSERT INTO public.opportunities (creator_id, organization, title, description, required_skills, location, remote, compensation, type, deadline, verified_poster) VALUES
('11111111-1111-4111-8111-000000000012','Kamau Logistics','Build website for local restaurant','Simple ordering website with menu and delivery form.','{Web Development}','Addis Ababa',false,'$120','Project', current_date + 14, true),
('11111111-1111-4111-8111-000000000012','Kamau Logistics','Frontend Developer (Full-time)','React developer to join our logistics product team.','{React,Web Development}','Nairobi',false,'$1,400/mo','Job', current_date + 30, true),
('11111111-1111-4111-8111-000000000007','BrightPath NGO','Marketing Coordinator','Run campaigns for education programmes across East Africa.','{Marketing}','Kampala',true,'$900/mo','Job', current_date + 21, true),
('11111111-1111-4111-8111-000000000002','Selam Studio','Junior Designer Mentorship','Six week mentorship for designers building their first portfolio.','{UI/UX,Graphic Design}','Remote',true,'Free','Mentorship', current_date + 20, true),
('11111111-1111-4111-8111-000000000004','GeoWorks','GIS Analyst — Contract','Flood mapping contract for a municipal planning office.','{GIS}','Addis Ababa',false,'$700','Project', current_date + 12, false),
('11111111-1111-4111-8111-000000000006','Kalkidan Studio','Product photographer for e-commerce','Shoot 80 products over two days.','{Photography}','Addis Ababa',false,'$300','Project', current_date + 9, true),
('11111111-1111-4111-8111-000000000009','Kigali Learning Hub','Teach Python basics','Weekend classes for secondary students.','{Python,Teaching}','Kigali',false,'$250','Learning', current_date + 18, true),
('11111111-1111-4111-8111-000000000010','Accra Films','Video editor collaboration','Co-edit a short documentary series.','{Video Editing}','Accra',true,'Revenue share','Collaboration', current_date + 25, false),
('11111111-1111-4111-8111-000000000011','Girma Consulting','Part-time bookkeeper','Monthly bookkeeping for three SMEs.','{Accounting}','Addis Ababa',true,'$200/mo','Job', current_date + 16, false),
('11111111-1111-4111-8111-000000000008','LagosWorks','Mechanical maintenance lead','Lead maintenance planning at a manufacturing plant.','{Mechanical}','Lagos',false,'$1,100/mo','Job', current_date + 28, true),
('11111111-1111-4111-8111-000000000012','Kamau Logistics','Technical co-founder','Looking for a co-founder to build our routing platform.','{Web Development,Entrepreneurship}','Nairobi',true,'Equity','Collaboration', current_date + 45, true),
('11111111-1111-4111-8111-000000000005','Amina Design','Fix WordPress site','Small fixes and speed improvements.','{Web Development}','Nairobi',true,'$50','Project', current_date + 7, false);
