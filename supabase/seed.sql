SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."games" ("id", "started_at", "finished_at", "status", "scheduled_at", "table_type", "location", "notes", "created_at", "updated_at") VALUES
	('7d0189eb-841c-5b75-a9e7-794e8b1026d6', '2022-02-16 01:00:00+00', '2022-02-16 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:53.665848+00', '2025-07-26 22:15:53.665848+00'),
	('665307c6-fb2e-5cc6-880a-32e9b3b05b1b', '2022-03-02 01:00:00+00', '2022-03-02 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:54.382842+00', '2025-07-26 22:15:54.382842+00'),
	('81f365b6-d57b-50be-a7a3-74aa92fa6cb6', '2022-03-16 01:00:00+00', '2022-03-16 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:54.766757+00', '2025-07-26 22:15:54.766757+00'),
	('f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', '2022-06-24 02:00:00+00', '2022-06-24 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:55.403985+00', '2025-07-26 22:15:55.403985+00'),
	('725e8d47-8e87-584c-9686-419cc0f4f5d2', '2022-06-24 03:00:00+00', '2022-06-24 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:55.714826+00', '2025-07-26 22:15:55.714826+00'),
	('65891a41-3406-5aa1-a515-c350ac77af7d', '2022-06-27 02:00:00+00', '2022-06-27 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:56.336367+00', '2025-07-26 22:15:56.336367+00'),
	('89017112-f4cb-5e64-9b72-30afd2a4c7a3', '2022-07-01 01:00:00+00', '2022-07-01 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:56.683717+00', '2025-07-26 22:15:56.683717+00'),
	('8cd9475a-9305-53a0-ab3c-5a0222e70002', '2022-07-01 03:00:00+00', '2022-07-01 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:57.496427+00', '2025-07-26 22:15:57.496427+00'),
	('921bfb46-38fa-50a7-a2cf-3493764f40bb', '2022-07-06 01:00:00+00', '2022-07-06 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:57.899922+00', '2025-07-26 22:15:57.899922+00'),
	('837b1bc9-9443-5b3e-99de-140420614004', '2022-08-03 01:00:00+00', '2022-08-03 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:58.663518+00', '2025-07-26 22:15:58.663518+00'),
	('e067b234-69ed-5901-a447-bbeec3b7d9a5', '2022-08-03 02:00:00+00', '2022-08-03 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:59.010633+00', '2025-07-26 22:15:59.010633+00'),
	('97e1b390-3567-5ca5-a5dc-db247cf1130b', '2022-08-26 02:00:00+00', '2022-08-26 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:59.704636+00', '2025-07-26 22:15:59.704636+00'),
	('95ea9da3-7669-50e9-9be2-da28f4fd8e89', '2022-08-31 01:00:00+00', '2022-08-31 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:00.037179+00', '2025-07-26 22:16:00.037179+00'),
	('b662c79b-6c94-5ab8-af06-d639c3fbc752', '2022-09-17 01:00:00+00', '2022-09-17 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:00.813093+00', '2025-07-26 22:16:00.813093+00'),
	('13933ee7-a2ab-56ef-a29b-7e82107d5534', '2022-09-17 03:00:00+00', '2022-09-17 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:01.546229+00', '2025-07-26 22:16:01.546229+00'),
	('f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', '2022-09-21 01:00:00+00', '2022-09-21 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:01.882339+00', '2025-07-26 22:16:01.882339+00'),
	('2c4becaf-1a3d-5600-9cd9-b01c3f901faf', '2022-10-17 01:00:00+00', '2022-10-17 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:02.689698+00', '2025-07-26 22:16:02.689698+00'),
	('2e76a9a0-439c-5595-a5c0-fe64d102ace1', '2022-10-24 01:00:00+00', '2022-10-24 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:03.477727+00', '2025-07-26 22:16:03.477727+00'),
	('5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', '2022-11-12 02:00:00+00', '2022-11-12 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:04.218665+00', '2025-07-26 22:16:04.218665+00'),
	('dbab9273-281f-5d15-a826-75a17761fb93', '2022-11-12 03:00:00+00', '2022-11-12 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:04.562698+00', '2025-07-26 22:16:04.562698+00'),
	('11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', '2023-01-16 02:00:00+00', '2023-01-16 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:05.394174+00', '2025-07-26 22:16:05.394174+00'),
	('f5dd37db-c259-5150-8bb5-0c892f428202', '2023-03-04 01:00:00+00', '2023-03-04 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:05.778391+00', '2025-07-26 22:16:05.778391+00'),
	('bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', '2023-04-01 01:00:00+00', '2023-04-01 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:06.421142+00', '2025-07-26 22:16:06.421142+00'),
	('dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', '2023-06-23 01:00:00+00', '2023-06-23 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:06.80239+00', '2025-07-26 22:16:06.80239+00'),
	('fa572b89-217a-5a39-ac92-116264a44421', '2023-06-23 03:00:00+00', '2023-06-23 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:07.572965+00', '2025-07-26 22:16:07.572965+00'),
	('ac4f28f1-eacf-5a01-92d0-c84995f2af28', '2023-07-03 01:00:00+00', '2023-07-03 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:08.216756+00', '2025-07-26 22:16:08.216756+00'),
	('1e64cd97-9855-5e48-a18a-3d2365f35e44', '2023-07-03 02:00:00+00', '2023-07-03 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:08.550213+00', '2025-07-26 22:16:08.550213+00'),
	('e2189703-9dc9-587c-ac9e-dc6222fd9dde', '2024-05-18 01:00:00+00', '2024-05-18 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:09.196047+00', '2025-07-26 22:16:09.196047+00'),
	('6eb38f09-3535-59b6-96fa-da624df9cf07', '2024-05-18 02:00:00+00', '2024-05-18 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:09.562409+00', '2025-07-26 22:16:09.562409+00'),
	('d9e38d15-c693-5be6-af88-e00a73b2b026', '2024-11-09 01:00:00+00', '2024-11-09 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:10.272463+00', '2025-07-26 22:16:10.272463+00'),
	('d76cf4fb-25ed-5edc-b030-096d6dda995a', '2024-11-09 02:00:00+00', '2024-11-09 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:10.60531+00', '2025-07-26 22:16:10.60531+00'),
	('c222c83a-c3fa-5d08-bdf5-31b334096494', '2025-06-07 02:00:00+00', '2025-06-07 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:11.278599+00', '2025-07-26 22:16:11.278599+00'),
	('318e215a-1803-5b6e-95f8-5a67ec15ed3e', '2025-06-15 01:00:00+00', '2025-06-15 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:12.078909+00', '2025-07-26 22:16:12.078909+00'),
	('686b01f7-ab01-52f5-bd21-d1a3a2461336', '2025-06-16 01:00:00+00', '2025-06-16 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:12.449372+00', '2025-07-26 22:16:12.449372+00'),
	('940e2b02-0412-548c-8d4e-cc6c0831709c', '2025-06-21 01:00:00+00', '2025-06-21 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:13.174034+00', '2025-07-26 22:16:13.174034+00'),
	('0dae0e21-fbc4-5335-a2a0-b86adb38d416', '2025-06-22 01:00:00+00', '2025-06-22 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:13.582045+00', '2025-07-26 22:16:13.582045+00'),
	('25003272-4012-52fd-a4ef-d9f199ec9df0', '2025-06-28 01:00:00+00', '2025-06-28 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:14.457447+00', '2025-07-26 22:16:14.457447+00'),
	('24354d65-e884-5972-bba0-d8b62f8404f8', '2025-06-29 03:00:00+00', '2025-06-29 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:15.178714+00', '2025-07-26 22:16:15.178714+00'),
	('cf400b5f-0704-50cd-8e72-ec50152558ca', '2025-07-04 01:00:00+00', '2025-07-04 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:15.561021+00', '2025-07-26 22:16:15.561021+00'),
	('569b3f5c-9390-5815-a777-464b58a36d03', '2025-07-04 03:00:00+00', '2025-07-04 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:16.28195+00', '2025-07-26 22:16:16.28195+00'),
	('8ca74cf4-6317-5054-ab0a-6662b05edbae', '2025-07-04 04:00:00+00', '2025-07-04 04:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:16.622042+00', '2025-07-26 22:16:16.622042+00'),
	('64185acd-eb59-5bcc-ba91-24d06652ae4b', '2025-07-04 06:00:00+00', '2025-07-04 06:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:17.44931+00', '2025-07-26 22:16:17.44931+00'),
	('c0719e9f-8918-5c27-bd4b-4330b9b685d3', '2025-07-04 07:00:00+00', '2025-07-04 07:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:17.898106+00', '2025-07-26 22:16:17.898106+00'),
	('6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', '2025-07-05 02:00:00+00', '2025-07-05 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:18.637779+00', '2025-07-26 22:16:18.637779+00'),
	('de3de582-51f6-5bde-a77d-50a8d8f1340f', '2025-07-05 03:00:00+00', '2025-07-05 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:19.0486+00', '2025-07-26 22:16:19.0486+00'),
	('8ac6794c-0218-590d-8c14-b125517f3842', '2025-07-05 05:00:00+00', '2025-07-05 05:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:19.696343+00', '2025-07-26 22:16:19.696343+00'),
	('afa41ab0-b245-5c00-afdd-2a2dd831e7d8', '2025-07-07 01:00:00+00', '2025-07-07 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:20.010369+00', '2025-07-26 22:16:20.010369+00'),
	('68a4aa20-5756-53df-afac-89ebd5914a31', '2025-07-07 03:00:00+00', '2025-07-07 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:20.672462+00', '2025-07-26 22:16:20.672462+00'),
	('337edf01-4b3b-5adf-b680-854f079e09f5', '2025-07-08 01:00:00+00', '2025-07-08 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:21.161146+00', '2025-07-26 22:16:21.161146+00'),
	('bfa57cca-b9f6-5900-a55a-1d4c85b42c04', '2025-07-10 01:00:00+00', '2025-07-10 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:21.610813+00', '2025-07-26 22:16:21.610813+00'),
	('2433425c-fea3-5cf2-b773-d2b9deb14816', '2025-07-11 02:00:00+00', '2025-07-11 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:22.330529+00', '2025-07-26 22:16:22.330529+00'),
	('6eccc1df-f587-56a5-b98b-4802ae8de5c5', '2025-07-11 03:00:00+00', '2025-07-11 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:22.679099+00', '2025-07-26 22:16:22.679099+00'),
	('16f861b3-561b-5449-9fc8-0132a453342f', '2025-07-12 02:00:00+00', '2025-07-12 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:23.3633+00', '2025-07-26 22:16:23.3633+00'),
	('a043432a-12fb-50d3-8028-e9c98d9c60bf', '2025-07-12 03:00:00+00', '2025-07-12 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:23.683141+00', '2025-07-26 22:16:23.683141+00'),
	('0023192b-2952-5d5a-8bb5-480d68c696f0', '2025-07-13 01:00:00+00', '2025-07-13 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:24.354746+00', '2025-07-26 22:16:24.354746+00'),
	('3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', '2025-07-13 02:00:00+00', '2025-07-13 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:24.749971+00', '2025-07-26 22:16:24.749971+00'),
	('bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', '2025-07-21 03:00:00+00', '2025-07-21 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:29.762739+00', '2025-07-26 22:16:29.762739+00'),
	('620d1dac-a9dd-519c-937f-76ef71d90692', '2025-07-21 04:00:00+00', '2025-07-21 04:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:30.140433+00', '2025-07-26 22:16:30.140433+00'),
	('d037a1a5-7b25-50a4-8463-f3fcaebb447a', '2025-07-22 01:00:00+00', '2025-07-22 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:30.494357+00', '2025-07-26 22:16:30.494357+00'),
	('1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '2025-07-24 01:00:00+00', '2025-07-24 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:30.845914+00', '2025-07-26 22:16:30.845914+00'),
	('db8e2173-19ae-51eb-ab30-4624f440a0aa', '2025-07-26 01:00:00+00', '2025-07-26 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:31.185862+00', '2025-07-26 22:16:31.185862+00'),
	('8003fc6a-dd76-48f7-b8e8-cb40cd9899c9', '2025-08-15 03:35:03.694981+00', NULL, 'ongoing', NULL, 'manual', 'Test Game', 'Created for hand recording testing', '2025-08-15 03:35:03.694981+00', '2025-08-15 03:35:03.694981+00'),
	('7f45b742-9d84-56d2-a1ca-78fb16ceefc6', '2022-02-16 02:00:00+00', '2022-02-16 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:54.021187+00', '2025-07-26 22:15:54.021187+00'),
	('5d17816d-6a56-5949-b242-f2e5b0101ea1', '2022-06-24 01:00:00+00', '2022-06-24 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:55.096377+00', '2025-07-26 22:15:55.096377+00'),
	('07e55756-4c60-5bf6-a0b9-bbd6e5607582', '2022-06-27 01:00:00+00', '2022-06-27 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:56.017504+00', '2025-07-26 22:15:56.017504+00'),
	('19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', '2022-07-01 02:00:00+00', '2022-07-01 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:57.035052+00', '2025-07-26 22:15:57.035052+00'),
	('e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', '2022-07-06 02:00:00+00', '2022-07-06 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:58.317715+00', '2025-07-26 22:15:58.317715+00'),
	('e8350662-7801-5854-8b51-06e97afc0234', '2022-08-26 01:00:00+00', '2022-08-26 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:15:59.398677+00', '2025-07-26 22:15:59.398677+00'),
	('5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', '2022-09-15 01:00:00+00', '2022-09-15 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:00.452663+00', '2025-07-26 22:16:00.452663+00'),
	('884293c8-ef53-5e5a-a6ff-58a15a4a81fa', '2022-09-17 02:00:00+00', '2022-09-17 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:01.164435+00', '2025-07-26 22:16:01.164435+00'),
	('4ec5075e-1429-537e-96c3-3c4065f81169', '2022-10-12 01:00:00+00', '2022-10-12 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:02.293607+00', '2025-07-26 22:16:02.293607+00'),
	('432cd5d2-9a84-5e50-83b9-8750002b4e1a', '2022-10-17 02:00:00+00', '2022-10-17 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:03.082488+00', '2025-07-26 22:16:03.082488+00'),
	('fe8f46f4-7f20-5b2c-92a8-b6334db3db53', '2022-11-12 01:00:00+00', '2022-11-12 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:03.867613+00', '2025-07-26 22:16:03.867613+00'),
	('1d5ac978-b268-546a-8cc8-85b42e977488', '2023-01-16 01:00:00+00', '2023-01-16 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:05.076199+00', '2025-07-26 22:16:05.076199+00'),
	('1872b77b-bb96-55d4-a8ff-25a717bbf802', '2023-03-04 02:00:00+00', '2023-03-04 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:06.08396+00', '2025-07-26 22:16:06.08396+00'),
	('484d6094-bec7-5a51-b572-65f589543f08', '2023-06-23 02:00:00+00', '2023-06-23 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:07.231181+00', '2025-07-26 22:16:07.231181+00'),
	('88eb74af-41b4-53fd-ad49-1b94d8c8fa05', '2023-07-03 01:00:00+00', '2023-07-03 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:07.885993+00', '2025-07-26 22:16:07.885993+00'),
	('439c525f-39e5-5350-9567-5d133f705ff3', '2023-07-20 01:00:00+00', '2023-07-20 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:08.862396+00', '2025-07-26 22:16:08.862396+00'),
	('f2dd1e4e-7118-54df-ae7e-09e82896a33f', '2024-05-18 03:00:00+00', '2024-05-18 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:09.954434+00', '2025-07-26 22:16:09.954434+00'),
	('a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', '2025-06-07 01:00:00+00', '2025-06-07 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:10.957404+00', '2025-07-26 22:16:10.957404+00'),
	('e53af200-a15c-5ae8-b492-d37f3731fbba', '2025-06-07 03:00:00+00', '2025-06-07 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:11.697468+00', '2025-07-26 22:16:11.697468+00'),
	('5866e64e-3e79-516e-acd4-5f03c9ce4683', '2025-06-17 01:00:00+00', '2025-06-17 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:12.844367+00', '2025-07-26 22:16:12.844367+00'),
	('13677aba-ae2d-563a-aedd-60ab8bf265ab', '2025-06-24 01:00:00+00', '2025-06-24 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:13.939201+00', '2025-07-26 22:16:13.939201+00'),
	('3932216e-62be-5fce-a18b-090cdd53a602', '2025-06-29 02:00:00+00', '2025-06-29 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:14.82265+00', '2025-07-26 22:16:14.82265+00'),
	('409e800a-9475-5b12-a626-fd867f87fc8b', '2025-07-04 02:00:00+00', '2025-07-04 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:15.92251+00', '2025-07-26 22:16:15.92251+00'),
	('6e629696-25f5-5eee-a8d1-343a0036243c', '2025-07-04 05:00:00+00', '2025-07-04 05:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:17.03056+00', '2025-07-26 22:16:17.03056+00'),
	('c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', '2025-07-05 01:00:00+00', '2025-07-05 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:18.269084+00', '2025-07-26 22:16:18.269084+00'),
	('cb102789-b201-5736-81ae-a100609af52c', '2025-07-05 04:00:00+00', '2025-07-05 04:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:19.363819+00', '2025-07-26 22:16:19.363819+00'),
	('c810907a-47be-58a8-8324-2b65af37c6a2', '2025-07-07 02:00:00+00', '2025-07-07 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:20.347678+00', '2025-07-26 22:16:20.347678+00'),
	('08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', '2025-07-11 01:00:00+00', '2025-07-11 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:21.959654+00', '2025-07-26 22:16:21.959654+00'),
	('05312148-5044-5883-9e31-13df14ae493c', '2025-07-12 01:00:00+00', '2025-07-12 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:22.994209+00', '2025-07-26 22:16:22.994209+00'),
	('ae412872-7421-520e-92d1-9529cb07b68b', '2025-07-12 04:00:00+00', '2025-07-12 04:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:24.023775+00', '2025-07-26 22:16:24.023775+00'),
	('9a756395-d775-5c33-97cb-3e0463e0d8e9', '2025-07-14 01:00:00+00', '2025-07-14 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:25.108828+00', '2025-07-26 22:16:25.108828+00'),
	('75cf6929-633c-5e31-af5e-c08c17f98281', '2025-07-14 02:00:00+00', '2025-07-14 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:25.452098+00', '2025-07-26 22:16:25.452098+00'),
	('e15238a8-22ae-533c-8774-4ebe8af3e1ae', '2025-07-15 01:00:00+00', '2025-07-15 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:25.829996+00', '2025-07-26 22:16:25.829996+00'),
	('4b857ba1-a75c-5e1c-a687-36483afe4686', '2025-07-17 01:00:00+00', '2025-07-17 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:26.230168+00', '2025-07-26 22:16:26.230168+00'),
	('6529487a-8c53-5cb7-96fe-779c808c5dda', '2025-07-17 02:00:00+00', '2025-07-17 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:26.607921+00', '2025-07-26 22:16:26.607921+00'),
	('ed751f6b-8a62-5ef1-8647-504f340863f7', '2025-07-17 03:00:00+00', '2025-07-17 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:26.959991+00', '2025-07-26 22:16:26.959991+00'),
	('4ce633c1-013d-56d3-8769-34f5d6c47e1c', '2025-07-18 01:00:00+00', '2025-07-18 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:27.318837+00', '2025-07-26 22:16:27.318837+00'),
	('27fbc1cf-7f08-531a-b808-7384f372268e', '2025-07-18 02:00:00+00', '2025-07-18 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:27.666971+00', '2025-07-26 22:16:27.666971+00'),
	('fb892ad0-1278-513c-8a86-b644168d7b16', '2025-07-18 03:00:00+00', '2025-07-18 03:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:28.022383+00', '2025-07-26 22:16:28.022383+00'),
	('d10bbe7a-ed83-552e-a52f-72d4cfafb2bc', '2025-07-18 04:00:00+00', '2025-07-18 04:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:28.357971+00', '2025-07-26 22:16:28.357971+00'),
	('ee8a3866-67b8-56b3-adcf-dbe7b485217b', '2025-07-20 01:00:00+00', '2025-07-20 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:28.718428+00', '2025-07-26 22:16:28.718428+00'),
	('a3525cc8-7143-5356-8c1e-208b4dacb47a', '2025-07-21 01:00:00+00', '2025-07-21 01:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:29.099809+00', '2025-07-26 22:16:29.099809+00'),
	('ad580682-6aff-5440-94d9-80dec4baef50', '2025-07-21 02:00:00+00', '2025-07-21 02:00:00+00', 'finished', NULL, 'manual', 'Legacy Import', 'Imported from legacy CSV data', '2025-07-26 22:16:29.44683+00', '2025-07-26 22:16:29.44683+00');


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."players" ("id", "display_name", "auth_user_id", "email", "phone", "timezone", "notification_preferences", "created_at", "updated_at") VALUES
	('4648919d-82d6-57f5-ba59-453f3a2863f6', 'Koki', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:15:53.227205+00', '2025-07-26 22:15:53.227205+00'),
	('e0f959ee-eb77-57de-b3af-acdecf679e70', 'Mikey', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:15:53.332866+00', '2025-07-26 22:15:53.332866+00'),
	('37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'Joseph', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:15:53.440606+00', '2025-07-26 22:15:53.440606+00'),
	('41fb9cad-7e28-5e8f-82aa-04f46375556f', 'Josh', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:15:53.545919+00', '2025-07-26 22:15:53.545919+00'),
	('25893192-bd36-596c-874d-1a9cdb6ea3cb', 'Rayshone', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:00.582571+00', '2025-07-26 22:16:00.582571+00'),
	('4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'Hyun', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:11.584157+00', '2025-07-26 22:16:11.584157+00'),
	('1280a159-acb0-50e1-ad87-1ed0ff1e3f45', 'Jackie', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:14.206948+00', '2025-07-26 22:16:14.206948+00'),
	('a9ba7c65-bc70-51dc-9999-bcb9a7e5bf13', 'Stephan', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:20.947519+00', '2025-07-26 22:16:20.947519+00'),
	('98fd574d-56a3-5fe3-9176-5f152bade922', 'Eric', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:21.046693+00', '2025-07-26 22:16:21.046693+00'),
	('1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 'William', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:21.306531+00', '2025-07-26 22:16:21.306531+00'),
	('6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 'Justin', NULL, NULL, NULL, 'America/Los_Angeles', '{}', '2025-07-26 22:16:21.473544+00', '2025-07-26 22:16:21.473544+00');


--
-- Data for Name: rating_configurations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."rating_configurations" ("config_hash", "config_data", "name", "description", "is_official", "created_by", "created_at", "last_used_at") VALUES
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '"{\"qualification\": {\"dropWorst\": 2, \"minGames\": 8}, \"rating\": {\"confidenceFactor\": 2.0, \"decayRate\": 0.02, \"initialMu\": 25.0, \"initialSigma\": 8.33}, \"scoring\": {\"oka\": 20000, \"uma\": [10000, 5000, -5000, -10000]}, \"timeRange\": {\"endDate\": \"2025-12-31\", \"name\": \"Season 4\", \"startDate\": \"2025-07-23\"}, \"weights\": {\"divisor\": 40, \"max\": 1.5, \"min\": 0.5}}"', 'Season 4', 'Official Season 4 - New system era with web app integration', true, NULL, '2025-07-14 05:07:13.550373+00', '2025-07-14 05:07:13.550373+00'),
	('aa0a262ecfea4993b0536e0dede1e4a6d18ec4db979581140ee9aa19845cf3c1', '"{\"qualification\": {\"dropWorst\": 1, \"minGames\": 12}, \"rating\": {\"confidenceFactor\": 2.5, \"decayRate\": 0.03, \"initialMu\": 25.0, \"initialSigma\": 10.0}, \"scoring\": {\"oka\": 20000, \"uma\": [10000, 5000, -5000, -10000]}, \"timeRange\": {\"endDate\": \"2025-12-31\", \"name\": \"High Stakes Experimental\", \"startDate\": \"2025-01-01\"}, \"weights\": {\"divisor\": 30, \"max\": 2.0, \"min\": 0.3}}"', 'High Stakes', 'Experimental configuration for high-stakes games with increased volatility', false, NULL, '2025-07-14 05:07:13.60886+00', '2025-07-14 05:07:13.60886+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '"{\"qualification\": {\"dropWorst\": 2, \"minGames\": 8}, \"rating\": {\"confidenceFactor\": 2.0, \"decayRate\": 0.02, \"initialMu\": 25.0, \"initialSigma\": 8.33}, \"scoring\": {\"oka\": 20000, \"uma\": [10000, 5000, -5000, -10000]}, \"timeRange\": {\"endDate\": \"2025-07-26\", \"name\": \"Season 3\", \"startDate\": \"2022-02-16\"}, \"weights\": {\"divisor\": 40, \"max\": 1.5, \"min\": 0.5}}"', 'Season 3', 'Official Season 3 - Special carry-over season covering legacy games', true, NULL, '2025-07-26 19:44:54.06594+00', '2025-07-26 19:44:54.06594+00');


--
-- Data for Name: cached_game_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cached_game_results" ("config_hash", "game_id", "player_id", "seat", "final_score", "placement", "plus_minus", "rating_weight", "mu_before", "sigma_before", "mu_after", "sigma_after", "computed_at") VALUES
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 11800, 3, -13200, 0.50, 25.0000, 8.3300, 24.8448, 8.2066, '2025-07-26 22:18:37.197482+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 36800, 2, 21800, 1.50, 25.0000, 8.3300, 28.1043, 8.0194, '2025-07-26 22:18:37.197498+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 6800, 4, -23200, 0.50, 25.0000, 8.3300, 22.9822, 8.2066, '2025-07-26 22:18:37.197502+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 44600, 1, 34600, 1.50, 25.0000, 8.3300, 30.5878, 8.1895, '2025-07-26 22:18:37.197505+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', 'db8e2173-19ae-51eb-ab30-4624f440a0aa', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 59200, 1, 49200, 1.50, 24.8448, 8.2066, 30.5523, 8.0778, '2025-07-26 22:18:37.197508+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', 'db8e2173-19ae-51eb-ab30-4624f440a0aa', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 10600, 3, -14400, 0.50, 28.1043, 8.0194, 27.7855, 7.9068, '2025-07-26 22:18:37.197511+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', 'db8e2173-19ae-51eb-ab30-4624f440a0aa', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 3800, 4, -26200, 0.50, 22.9822, 8.2066, 21.3397, 8.0957, '2025-07-26 22:18:37.197513+00'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', 'db8e2173-19ae-51eb-ab30-4624f440a0aa', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 26400, 2, 11400, 1.50, 30.5878, 8.1895, 32.7770, 7.8526, '2025-07-26 22:18:37.197516+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7d0189eb-841c-5b75-a9e7-794e8b1026d6', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 21400, 2, 6400, 1.50, 25.0000, 8.3300, 28.1043, 8.0194, '2025-07-26 22:18:51.802044+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7d0189eb-841c-5b75-a9e7-794e8b1026d6', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', -2000, 4, -32000, 0.50, 25.0000, 8.3300, 22.9822, 8.2066, '2025-07-26 22:18:51.802062+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7d0189eb-841c-5b75-a9e7-794e8b1026d6', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 21000, 3, -4000, 0.50, 25.0000, 8.3300, 24.8448, 8.2066, '2025-07-26 22:18:51.802067+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7d0189eb-841c-5b75-a9e7-794e8b1026d6', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 59600, 1, 49600, 1.50, 25.0000, 8.3300, 30.5878, 8.1895, '2025-07-26 22:18:51.802071+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7f45b742-9d84-56d2-a1ca-78fb16ceefc6', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 30200, 3, 5200, 1.50, 24.8448, 8.2066, 24.7437, 8.0890, '2025-07-26 22:18:51.802074+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7f45b742-9d84-56d2-a1ca-78fb16ceefc6', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 35400, 1, 25400, 1.50, 28.1043, 8.0194, 33.2482, 7.8868, '2025-07-26 22:18:51.802078+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7f45b742-9d84-56d2-a1ca-78fb16ceefc6', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 34900, 2, 19900, 1.50, 30.5878, 8.1895, 32.6050, 7.8492, '2025-07-26 22:18:51.802081+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '7f45b742-9d84-56d2-a1ca-78fb16ceefc6', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', -500, 4, -30500, 0.50, 22.9822, 8.2066, 21.2301, 8.0936, '2025-07-26 22:18:51.802084+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '665307c6-fb2e-5cc6-880a-32e9b3b05b1b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 27700, 3, 2700, 1.50, 33.2482, 7.8868, 32.8424, 7.7689, '2025-07-26 22:18:51.802087+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '665307c6-fb2e-5cc6-880a-32e9b3b05b1b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 30000, 2, 15000, 1.50, 21.2301, 8.0936, 25.7967, 7.8687, '2025-07-26 22:18:51.80209+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '665307c6-fb2e-5cc6-880a-32e9b3b05b1b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 41800, 1, 31800, 1.50, 24.7437, 8.0890, 30.5508, 7.9707, '2025-07-26 22:18:51.802093+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '665307c6-fb2e-5cc6-880a-32e9b3b05b1b', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 500, 4, -29500, 0.50, 32.6050, 7.8492, 30.5661, 7.7347, '2025-07-26 22:18:51.802096+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '81f365b6-d57b-50be-a7a3-74aa92fa6cb6', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 20900, 3, -4100, 0.50, 32.8424, 7.7689, 32.3640, 7.6569, '2025-07-26 22:18:51.802099+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '81f365b6-d57b-50be-a7a3-74aa92fa6cb6', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 23500, 2, 8500, 1.50, 30.5508, 7.9707, 33.4097, 7.6647, '2025-07-26 22:18:51.802102+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '81f365b6-d57b-50be-a7a3-74aa92fa6cb6', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 57000, 1, 47000, 1.50, 30.5661, 7.7347, 35.5790, 7.6122, '2025-07-26 22:18:51.802105+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '81f365b6-d57b-50be-a7a3-74aa92fa6cb6', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', -1400, 4, -31400, 0.50, 25.7967, 7.8687, 24.2939, 7.7670, '2025-07-26 22:18:51.802108+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5d17816d-6a56-5949-b242-f2e5b0101ea1', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 52900, 1, 42900, 1.50, 32.3640, 7.6569, 37.3534, 7.5333, '2025-07-26 22:18:51.802111+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5d17816d-6a56-5949-b242-f2e5b0101ea1', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', -4800, 4, -34800, 0.50, 33.4097, 7.6647, 31.2786, 7.5568, '2025-07-26 22:18:51.802114+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5d17816d-6a56-5949-b242-f2e5b0101ea1', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 25000, 3, 0, 1.00, 24.2939, 7.7670, 26.0076, 7.3897, '2025-07-26 22:18:51.802117+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5d17816d-6a56-5949-b242-f2e5b0101ea1', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 26900, 2, 11900, 1.50, 35.5790, 7.6122, 37.4096, 7.3195, '2025-07-26 22:18:51.80212+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 21000, 3, -4000, 0.50, 37.3534, 7.5333, 36.7714, 7.4189, '2025-07-26 22:18:51.802123+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 33500, 1, 23500, 1.50, 37.4096, 7.3195, 41.7295, 7.1951, '2025-07-26 22:18:51.802126+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 17600, 4, -12400, 0.50, 31.2786, 7.5568, 29.6964, 7.4536, '2025-07-26 22:18:51.802129+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 27900, 2, 12900, 1.50, 26.0076, 7.3897, 29.8963, 7.2004, '2025-07-26 22:18:51.802132+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '725e8d47-8e87-584c-9686-419cc0f4f5d2', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 17600, 3, -7400, 0.50, 29.6964, 7.4536, 31.3159, 7.0873, '2025-07-26 22:18:51.802134+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '725e8d47-8e87-584c-9686-419cc0f4f5d2', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 17400, 4, -12600, 0.50, 41.7295, 7.1951, 39.3601, 7.0963, '2025-07-26 22:18:51.802138+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '725e8d47-8e87-584c-9686-419cc0f4f5d2', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 40600, 1, 30600, 1.50, 36.7714, 7.4189, 41.5240, 7.2925, '2025-07-26 22:18:51.802141+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '725e8d47-8e87-584c-9686-419cc0f4f5d2', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 24400, 2, 9400, 1.50, 29.8963, 7.2004, 33.3998, 7.0094, '2025-07-26 22:18:51.802143+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '07e55756-4c60-5bf6-a0b9-bbd6e5607582', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 14000, 3, -11000, 0.50, 31.3159, 7.0873, 32.6463, 6.7689, '2025-07-26 22:18:51.802146+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '07e55756-4c60-5bf6-a0b9-bbd6e5607582', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 44300, 1, 34300, 1.50, 33.3998, 7.0094, 38.1521, 6.9227, '2025-07-26 22:18:51.802149+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '07e55756-4c60-5bf6-a0b9-bbd6e5607582', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', -100, 4, -30100, 0.50, 39.3601, 7.0963, 37.4187, 7.0013, '2025-07-26 22:18:51.802152+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '07e55756-4c60-5bf6-a0b9-bbd6e5607582', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 41800, 2, 26800, 1.50, 41.5240, 7.2925, 43.1722, 6.9950, '2025-07-26 22:18:51.802155+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '65891a41-3406-5aa1-a515-c350ac77af7d', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 60200, 1, 50200, 1.50, 38.1521, 6.9227, 42.6125, 6.8210, '2025-07-26 22:18:51.802158+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '65891a41-3406-5aa1-a515-c350ac77af7d', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 16200, 3, -8800, 0.50, 37.4187, 7.0013, 37.2281, 6.9099, '2025-07-26 22:18:51.802161+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '65891a41-3406-5aa1-a515-c350ac77af7d', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 24100, 2, 9100, 1.50, 43.1722, 6.9950, 44.4530, 6.7227, '2025-07-26 22:18:51.802164+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '65891a41-3406-5aa1-a515-c350ac77af7d', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', -500, 4, -30500, 0.50, 32.6463, 6.7689, 31.4585, 6.6982, '2025-07-26 22:18:51.802167+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '89017112-f4cb-5e64-9b72-30afd2a4c7a3', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 36600, 1, 26600, 1.50, 31.4585, 6.6982, 36.2524, 6.6353, '2025-07-26 22:18:51.80217+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '89017112-f4cb-5e64-9b72-30afd2a4c7a3', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 11700, 4, -18300, 0.50, 37.2281, 6.9099, 35.9065, 6.8253, '2025-07-26 22:18:51.802173+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '89017112-f4cb-5e64-9b72-30afd2a4c7a3', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 17200, 3, -7800, 0.50, 42.6125, 6.8210, 42.2672, 6.7296, '2025-07-26 22:18:51.802175+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '89017112-f4cb-5e64-9b72-30afd2a4c7a3', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 34500, 2, 19500, 1.50, 44.4530, 6.7227, 45.9699, 6.4852, '2025-07-26 22:18:51.802178+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', -4900, 4, -34900, 0.50, 42.2672, 6.7296, 40.7425, 6.6411, '2025-07-26 22:18:51.802181+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 35700, 2, 20700, 1.50, 35.9065, 6.8253, 39.3887, 6.6413, '2025-07-26 22:18:51.802184+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 20600, 3, -4400, 0.50, 45.9699, 6.4852, 45.5151, 6.4035, '2025-07-26 22:18:51.802187+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 40900, 1, 30900, 1.50, 36.2524, 6.6353, 40.7945, 6.5591, '2025-07-26 22:18:51.80219+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8cd9475a-9305-53a0-ab3c-5a0222e70002', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 23000, 3, -2000, 0.50, 45.5151, 6.4035, 45.1095, 6.3248, '2025-07-26 22:18:51.802193+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8cd9475a-9305-53a0-ab3c-5a0222e70002', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 47300, 1, 37300, 1.50, 40.7425, 6.6411, 45.0910, 6.5482, '2025-07-26 22:18:51.802195+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8cd9475a-9305-53a0-ab3c-5a0222e70002', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 29900, 2, 14900, 1.50, 39.3887, 6.6413, 42.2619, 6.4476, '2025-07-26 22:18:51.802198+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8cd9475a-9305-53a0-ab3c-5a0222e70002', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', -200, 4, -30200, 0.50, 40.7945, 6.5591, 39.4590, 6.4808, '2025-07-26 22:18:51.802201+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '921bfb46-38fa-50a7-a2cf-3493764f40bb', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 22000, 3, -3000, 0.50, 45.1095, 6.3248, 44.9065, 6.2490, '2025-07-26 22:18:51.802204+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '921bfb46-38fa-50a7-a2cf-3493764f40bb', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 51200, 1, 41200, 1.50, 42.2619, 6.4476, 46.3986, 6.3615, '2025-07-26 22:18:51.802207+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '921bfb46-38fa-50a7-a2cf-3493764f40bb', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', -1000, 4, -31000, 0.50, 45.0910, 6.5482, 43.4793, 6.4611, '2025-07-26 22:18:51.80221+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '921bfb46-38fa-50a7-a2cf-3493764f40bb', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 27800, 2, 12800, 1.50, 39.4590, 6.4808, 42.4466, 6.3091, '2025-07-26 22:18:51.802213+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 49000, 1, 39000, 1.50, 42.4466, 6.3091, 46.5365, 6.2314, '2025-07-26 22:18:51.802216+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 47900, 2, 32900, 1.50, 46.3986, 6.3615, 48.2560, 6.1546, '2025-07-26 22:18:51.802219+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', -900, 4, -30900, 0.50, 44.9065, 6.2490, 43.4736, 6.1769, '2025-07-26 22:18:51.802222+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 4000, 3, -21000, 0.50, 43.4793, 6.4611, 43.4598, 6.3814, '2025-07-26 22:18:51.802225+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '837b1bc9-9443-5b3e-99de-140420614004', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 30000, 2, 15000, 1.50, 43.4736, 6.1769, 45.8782, 6.0096, '2025-07-26 22:18:51.802228+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '837b1bc9-9443-5b3e-99de-140420614004', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 7600, 4, -22400, 0.50, 46.5365, 6.2314, 44.9859, 6.1557, '2025-07-26 22:18:51.802231+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '837b1bc9-9443-5b3e-99de-140420614004', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 37000, 1, 27000, 1.50, 48.2560, 6.1546, 51.7969, 6.0654, '2025-07-26 22:18:51.802234+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '837b1bc9-9443-5b3e-99de-140420614004', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 25400, 3, 400, 1.50, 43.4598, 6.3814, 43.5913, 6.0639, '2025-07-26 22:18:51.802237+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e067b234-69ed-5901-a447-bbeec3b7d9a5', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 10200, 3, -14800, 0.50, 51.7969, 6.0654, 51.2777, 5.9901, '2025-07-26 22:18:51.80224+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e067b234-69ed-5901-a447-bbeec3b7d9a5', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 26700, 2, 11700, 1.50, 43.5913, 6.0639, 46.2894, 5.9136, '2025-07-26 22:18:51.802243+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e067b234-69ed-5901-a447-bbeec3b7d9a5', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 59800, 1, 49800, 1.50, 45.8782, 6.0096, 49.6394, 5.9368, '2025-07-26 22:18:51.802246+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e067b234-69ed-5901-a447-bbeec3b7d9a5', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 3300, 4, -26700, 0.50, 44.9859, 6.1557, 43.8390, 6.0871, '2025-07-26 22:18:51.802249+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e8350662-7801-5854-8b51-06e97afc0234', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 13900, 3, -11100, 0.50, 49.6394, 5.9368, 49.3474, 5.8679, '2025-07-26 22:18:51.802252+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e8350662-7801-5854-8b51-06e97afc0234', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', -200, 4, -30200, 0.50, 46.2894, 5.9136, 45.1060, 5.8510, '2025-07-26 22:18:51.802255+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e8350662-7801-5854-8b51-06e97afc0234', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 44500, 1, 34500, 1.50, 51.2777, 5.9901, 54.6640, 5.9009, '2025-07-26 22:18:51.802258+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e8350662-7801-5854-8b51-06e97afc0234', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 41500, 2, 26500, 1.50, 43.8390, 6.0871, 46.5852, 5.9304, '2025-07-26 22:18:51.802261+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '97e1b390-3567-5ca5-a5dc-db247cf1130b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', -7200, 4, -37200, 0.50, 46.5852, 5.9304, 45.3600, 5.8677, '2025-07-26 22:18:51.802264+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '97e1b390-3567-5ca5-a5dc-db247cf1130b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 45600, 1, 35600, 1.50, 49.3474, 5.8679, 52.9332, 5.7942, '2025-07-26 22:18:51.802266+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '97e1b390-3567-5ca5-a5dc-db247cf1130b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 23700, 3, -1300, 0.50, 45.1060, 5.8510, 45.5475, 5.6179, '2025-07-26 22:18:51.802269+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '97e1b390-3567-5ca5-a5dc-db247cf1130b', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 37900, 2, 22900, 1.50, 54.6640, 5.9009, 55.4408, 5.7043, '2025-07-26 22:18:51.802272+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '95ea9da3-7669-50e9-9be2-da28f4fd8e89', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 14800, 3, -10200, 0.50, 52.9332, 5.7942, 52.5945, 5.7282, '2025-07-26 22:18:51.802275+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '95ea9da3-7669-50e9-9be2-da28f4fd8e89', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 6600, 4, -23400, 0.50, 45.3600, 5.8677, 44.4449, 5.8117, '2025-07-26 22:18:51.802278+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '95ea9da3-7669-50e9-9be2-da28f4fd8e89', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 25000, 2, 10000, 1.50, 55.4408, 5.7043, 56.4363, 5.5268, '2025-07-26 22:18:51.802281+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '95ea9da3-7669-50e9-9be2-da28f4fd8e89', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 53600, 1, 43600, 1.50, 45.5475, 5.6179, 49.2110, 5.5677, '2025-07-26 22:18:51.802284+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 30200, 2, 15200, 1.50, 49.2110, 5.5677, 51.3716, 5.4364, '2025-07-26 22:18:51.802287+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 38200, 1, 28200, 1.50, 52.5945, 5.7282, 55.9883, 5.6513, '2025-07-26 22:18:51.80229+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 10000, 4, -20000, 0.50, 44.4449, 5.8117, 43.6490, 5.7602, '2025-07-26 22:18:51.802293+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 21600, 3, -3400, 0.50, 56.4363, 5.5268, 55.8340, 5.4692, '2025-07-26 22:18:51.802296+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'b662c79b-6c94-5ab8-af06-d639c3fbc752', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'east', 2400, 4, -27600, 0.50, 25.0000, 8.3300, 24.4175, 8.2515, '2025-07-26 22:18:51.802299+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'b662c79b-6c94-5ab8-af06-d639c3fbc752', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 23300, 3, -1700, 0.50, 55.9883, 5.6513, 54.9962, 5.6103, '2025-07-26 22:18:51.802302+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'b662c79b-6c94-5ab8-af06-d639c3fbc752', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 42000, 1, 32000, 1.50, 51.3716, 5.4364, 54.0060, 5.3836, '2025-07-26 22:18:51.802305+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'b662c79b-6c94-5ab8-af06-d639c3fbc752', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 32300, 2, 17300, 1.50, 43.6490, 5.7602, 45.9284, 5.6491, '2025-07-26 22:18:51.802308+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '884293c8-ef53-5e5a-a6ff-58a15a4a81fa', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 42400, 1, 32400, 1.50, 54.9962, 5.6103, 58.2488, 5.5344, '2025-07-26 22:18:51.802311+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '884293c8-ef53-5e5a-a6ff-58a15a4a81fa', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 38800, 2, 23800, 1.50, 45.9284, 5.6491, 48.9036, 5.5374, '2025-07-26 22:18:51.802314+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '884293c8-ef53-5e5a-a6ff-58a15a4a81fa', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 2600, 4, -27400, 0.50, 55.8340, 5.4692, 54.4748, 5.4102, '2025-07-26 22:18:51.802317+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '884293c8-ef53-5e5a-a6ff-58a15a4a81fa', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 16200, 3, -8800, 0.50, 54.0060, 5.3836, 53.8986, 5.3304, '2025-07-26 22:18:51.80232+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13933ee7-a2ab-56ef-a29b-7e82107d5534', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 11100, 3, -13900, 0.50, 48.9036, 5.5374, 50.1025, 5.3385, '2025-07-26 22:18:51.802323+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13933ee7-a2ab-56ef-a29b-7e82107d5534', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 6400, 4, -23600, 0.50, 58.2488, 5.5344, 56.6360, 5.4718, '2025-07-26 22:18:51.802326+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13933ee7-a2ab-56ef-a29b-7e82107d5534', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 25000, 2, 10000, 1.50, 53.8986, 5.3304, 55.6822, 5.2034, '2025-07-26 22:18:51.802329+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13933ee7-a2ab-56ef-a29b-7e82107d5534', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 57500, 1, 47500, 1.50, 54.4748, 5.4102, 57.6581, 5.3477, '2025-07-26 22:18:51.802332+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 19500, 4, -10500, 0.50, 50.1025, 5.3385, 49.2809, 5.2937, '2025-07-26 22:18:51.802335+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 20200, 3, -4800, 0.50, 56.6360, 5.4718, 56.3433, 5.4118, '2025-07-26 22:18:51.802338+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 28200, 2, 13200, 1.50, 57.6581, 5.3477, 58.9364, 5.1986, '2025-07-26 22:18:51.802341+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 32100, 1, 22100, 1.50, 55.6822, 5.2034, 58.6528, 5.1475, '2025-07-26 22:18:51.802344+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ec5075e-1429-537e-96c3-3c4065f81169', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 34600, 2, 19600, 1.50, 56.3433, 5.4118, 58.0432, 5.2622, '2025-07-26 22:18:51.802347+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ec5075e-1429-537e-96c3-3c4065f81169', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 46300, 1, 36300, 1.50, 58.9364, 5.1986, 61.7392, 5.1351, '2025-07-26 22:18:51.80235+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ec5075e-1429-537e-96c3-3c4065f81169', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', -600, 4, -30600, 0.50, 49.2809, 5.2937, 48.5576, 5.2524, '2025-07-26 22:18:51.802353+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ec5075e-1429-537e-96c3-3c4065f81169', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 16800, 3, -8200, 0.50, 58.6528, 5.1475, 58.2653, 5.0989, '2025-07-26 22:18:51.802356+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2c4becaf-1a3d-5600-9cd9-b01c3f901faf', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 51100, 1, 41100, 1.50, 58.0432, 5.2622, 61.1179, 5.1996, '2025-07-26 22:18:51.802359+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2c4becaf-1a3d-5600-9cd9-b01c3f901faf', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', -1200, 4, -31200, 0.50, 48.5576, 5.2524, 47.9078, 5.2146, '2025-07-26 22:18:51.802361+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2c4becaf-1a3d-5600-9cd9-b01c3f901faf', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 21100, 3, -3900, 0.50, 58.2653, 5.0989, 57.9721, 5.0531, '2025-07-26 22:18:51.802364+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2c4becaf-1a3d-5600-9cd9-b01c3f901faf', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 29000, 2, 14000, 1.50, 61.7392, 5.1351, 62.4850, 4.9936, '2025-07-26 22:18:51.802367+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '432cd5d2-9a84-5e50-83b9-8750002b4e1a', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 17200, 3, -7800, 0.50, 47.9078, 5.2146, 49.8707, 5.0773, '2025-07-26 22:18:51.80237+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '432cd5d2-9a84-5e50-83b9-8750002b4e1a', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 5800, 4, -24200, 0.50, 62.4850, 4.9936, 60.9913, 4.9494, '2025-07-26 22:18:51.802373+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '432cd5d2-9a84-5e50-83b9-8750002b4e1a', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 23900, 2, 8900, 1.50, 57.9721, 5.0531, 59.5619, 4.9361, '2025-07-26 22:18:51.802376+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '432cd5d2-9a84-5e50-83b9-8750002b4e1a', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 53100, 1, 43100, 1.50, 61.1179, 5.1996, 63.9608, 5.1322, '2025-07-26 22:18:51.802379+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2e76a9a0-439c-5595-a5c0-fe64d102ace1', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 1600, 4, -28400, 0.50, 63.9608, 5.1322, 62.5268, 5.0764, '2025-07-26 22:18:51.802382+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2e76a9a0-439c-5595-a5c0-fe64d102ace1', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 31500, 2, 16500, 1.50, 49.8707, 5.0773, 52.6963, 5.0049, '2025-07-26 22:18:51.802385+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2e76a9a0-439c-5595-a5c0-fe64d102ace1', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 11500, 3, -13500, 0.50, 59.5619, 4.9361, 59.5482, 4.8927, '2025-07-26 22:18:51.802387+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2e76a9a0-439c-5595-a5c0-fe64d102ace1', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 54400, 1, 44400, 1.50, 60.9913, 4.9494, 63.6959, 4.8954, '2025-07-26 22:18:51.80239+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fe8f46f4-7f20-5b2c-92a8-b6334db3db53', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 45400, 1, 35400, 1.50, 63.6959, 4.8954, 65.6489, 4.8511, '2025-07-26 22:18:51.802393+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fe8f46f4-7f20-5b2c-92a8-b6334db3db53', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'south', 19000, 3, -6000, 0.50, 24.4175, 8.2515, 32.4379, 8.0482, '2025-07-26 22:18:51.802396+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fe8f46f4-7f20-5b2c-92a8-b6334db3db53', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 42900, 2, 27900, 1.50, 52.6963, 5.0049, 54.3713, 4.9293, '2025-07-26 22:18:51.802399+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fe8f46f4-7f20-5b2c-92a8-b6334db3db53', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', -7300, 4, -37300, 0.50, 62.5268, 5.0764, 60.8120, 5.0485, '2025-07-26 22:18:51.802402+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'east', 18800, 4, -11200, 0.50, 32.4379, 8.0482, 31.7925, 7.9608, '2025-07-26 22:18:51.802405+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 31500, 1, 21500, 1.50, 60.8120, 5.0485, 63.2375, 5.0021, '2025-07-26 22:18:51.802407+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 28800, 2, 13800, 1.50, 65.6489, 4.8511, 65.5815, 4.8297, '2025-07-26 22:18:51.80241+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 19900, 3, -5100, 0.50, 54.3713, 4.9293, 54.1049, 4.9045, '2025-07-26 22:18:51.802413+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbab9273-281f-5d15-a826-75a17761fb93', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 33100, 2, 18100, 1.50, 65.5815, 4.8297, 65.5278, 4.8086, '2025-07-26 22:18:51.802416+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbab9273-281f-5d15-a826-75a17761fb93', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'south', 31300, 3, 6300, 1.50, 31.7925, 7.9608, 38.2090, 7.6274, '2025-07-26 22:18:51.802419+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbab9273-281f-5d15-a826-75a17761fb93', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 40900, 1, 30900, 1.50, 63.2375, 5.0021, 65.4915, 4.9538, '2025-07-26 22:18:51.802422+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbab9273-281f-5d15-a826-75a17761fb93', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', -6300, 4, -36300, 0.50, 54.1049, 4.9045, 53.0096, 4.8804, '2025-07-26 22:18:51.802425+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1d5ac978-b268-546a-8cc8-85b42e977488', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', -6300, 4, -36300, 0.50, 53.0096, 4.8804, 52.4643, 4.8501, '2025-07-26 22:18:51.802428+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1d5ac978-b268-546a-8cc8-85b42e977488', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 33000, 2, 18000, 1.50, 59.5482, 4.8927, 61.3303, 4.7893, '2025-07-26 22:18:51.802431+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1d5ac978-b268-546a-8cc8-85b42e977488', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 52600, 1, 42600, 1.50, 65.4915, 4.9538, 68.0448, 4.8910, '2025-07-26 22:18:51.802434+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1d5ac978-b268-546a-8cc8-85b42e977488', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 20700, 3, -4300, 0.50, 65.5278, 4.8086, 65.0253, 4.7667, '2025-07-26 22:18:51.802437+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 36200, 2, 21200, 1.50, 65.0253, 4.7667, 66.3563, 4.6592, '2025-07-26 22:18:51.80244+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', -1700, 4, -31700, 0.50, 61.3303, 4.7893, 60.5742, 4.7523, '2025-07-26 22:18:51.802443+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 26500, 3, 1500, 1.50, 68.0448, 4.8910, 67.6481, 4.8423, '2025-07-26 22:18:51.802446+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 39000, 1, 29000, 1.50, 52.4643, 4.8501, 55.7486, 4.8246, '2025-07-26 22:18:51.802448+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f5dd37db-c259-5150-8bb5-0c892f428202', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', -1400, 4, -31400, 0.50, 55.7486, 4.8246, 55.0957, 4.7972, '2025-07-26 22:18:51.802451+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f5dd37db-c259-5150-8bb5-0c892f428202', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 16000, 3, -9000, 0.50, 66.3563, 4.6592, 65.8328, 4.6304, '2025-07-26 22:18:51.802454+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f5dd37db-c259-5150-8bb5-0c892f428202', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 46500, 1, 36500, 1.50, 67.6481, 4.8423, 69.6372, 4.7945, '2025-07-26 22:18:51.802457+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f5dd37db-c259-5150-8bb5-0c892f428202', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'north', 37900, 2, 22900, 1.50, 38.2090, 7.6274, 45.4122, 7.4737, '2025-07-26 22:18:51.80246+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1872b77b-bb96-55d4-a8ff-25a717bbf802', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 30200, 2, 15200, 1.50, 55.0957, 4.7972, 57.1400, 4.7367, '2025-07-26 22:18:51.802463+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1872b77b-bb96-55d4-a8ff-25a717bbf802', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'south', -3700, 4, -33700, 0.50, 45.4122, 7.4737, 44.7290, 7.3866, '2025-07-26 22:18:51.802466+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1872b77b-bb96-55d4-a8ff-25a717bbf802', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 44100, 1, 34100, 1.50, 65.8328, 4.6304, 67.8946, 4.5928, '2025-07-26 22:18:51.802468+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1872b77b-bb96-55d4-a8ff-25a717bbf802', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 29400, 3, 4400, 1.50, 69.6372, 4.7945, 68.8553, 4.7655, '2025-07-26 22:18:51.802471+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 24800, 2, 9800, 1.50, 67.8946, 4.5928, 68.5247, 4.5125, '2025-07-26 22:18:51.802474+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', -1200, 4, -31200, 0.50, 68.8553, 4.7655, 67.4535, 4.7362, '2025-07-26 22:18:51.802477+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'west', 19100, 3, -5900, 0.50, 44.7290, 7.3866, 50.2936, 7.0824, '2025-07-26 22:18:51.80248+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 57300, 1, 47300, 1.50, 60.5742, 4.7523, 63.1718, 4.7211, '2025-07-26 22:18:51.802483+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 33600, 1, 23600, 1.50, 57.1400, 4.7367, 60.2369, 4.7074, '2025-07-26 22:18:51.802486+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 20500, 4, -9500, 0.50, 68.5247, 4.5125, 67.4432, 4.4762, '2025-07-26 22:18:51.802489+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 23700, 2, 8700, 1.50, 67.4535, 4.7362, 68.6501, 4.6222, '2025-07-26 22:18:51.802492+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 22200, 3, -2800, 0.50, 63.1718, 4.7211, 63.6418, 4.5678, '2025-07-26 22:18:51.802494+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '484d6094-bec7-5a51-b572-65f589543f08', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', -4100, 4, -34100, 0.50, 63.6418, 4.5678, 62.8644, 4.5329, '2025-07-26 22:18:51.802497+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '484d6094-bec7-5a51-b572-65f589543f08', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 10900, 3, -14100, 0.50, 68.6501, 4.6222, 68.3196, 4.5804, '2025-07-26 22:18:51.8025+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '484d6094-bec7-5a51-b572-65f589543f08', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 63100, 1, 53100, 1.50, 67.4432, 4.4762, 69.7235, 4.4330, '2025-07-26 22:18:51.802503+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '484d6094-bec7-5a51-b572-65f589543f08', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 30100, 2, 15100, 1.50, 60.2369, 4.7074, 62.3883, 4.6260, '2025-07-26 22:18:51.802506+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fa572b89-217a-5a39-ac92-116264a44421', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 23800, 3, -1200, 0.50, 68.3196, 4.5804, 68.0166, 4.5404, '2025-07-26 22:18:51.802509+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fa572b89-217a-5a39-ac92-116264a44421', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 39200, 1, 29200, 1.50, 69.7235, 4.4330, 71.8553, 4.3879, '2025-07-26 22:18:51.802512+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fa572b89-217a-5a39-ac92-116264a44421', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 24000, 2, 9000, 1.50, 62.8644, 4.5329, 64.6172, 4.4524, '2025-07-26 22:18:51.802514+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fa572b89-217a-5a39-ac92-116264a44421', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 11100, 4, -18900, 0.50, 62.3883, 4.6260, 61.6607, 4.5909, '2025-07-26 22:18:51.802518+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ac4f28f1-eacf-5a01-92d0-c84995f2af28', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 1300, 4, -28700, 0.50, 61.6607, 4.5909, 60.9271, 4.5571, '2025-07-26 22:18:51.80252+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ac4f28f1-eacf-5a01-92d0-c84995f2af28', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 29800, 2, 14800, 1.50, 68.0166, 4.5404, 69.0472, 4.4382, '2025-07-26 22:18:51.802523+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ac4f28f1-eacf-5a01-92d0-c84995f2af28', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 45900, 1, 35900, 1.50, 71.8553, 4.3879, 73.8428, 4.3416, '2025-07-26 22:18:51.802526+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ac4f28f1-eacf-5a01-92d0-c84995f2af28', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 23000, 3, -2000, 0.50, 64.6172, 4.4524, 64.5479, 4.4196, '2025-07-26 22:18:51.802529+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '88eb74af-41b4-53fd-ad49-1b94d8c8fa05', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 73300, 1, 63300, 1.50, 73.8428, 4.3416, 75.6943, 4.2948, '2025-07-26 22:18:51.802532+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '88eb74af-41b4-53fd-ad49-1b94d8c8fa05', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 7200, 3, -17800, 0.50, 69.0472, 4.4382, 68.7915, 4.4019, '2025-07-26 22:18:51.802535+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '88eb74af-41b4-53fd-ad49-1b94d8c8fa05', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 18900, 2, 3900, 1.50, 60.9271, 4.5571, 63.0692, 4.4860, '2025-07-26 22:18:51.802538+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '88eb74af-41b4-53fd-ad49-1b94d8c8fa05', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', -24000, 4, -54000, 0.50, 64.5479, 4.4196, 63.8182, 4.3881, '2025-07-26 22:18:51.802541+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1e64cd97-9855-5e48-a18a-3d2365f35e44', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 30100, 3, 5100, 1.50, 68.7915, 4.4019, 68.5633, 4.3670, '2025-07-26 22:18:51.802544+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1e64cd97-9855-5e48-a18a-3d2365f35e44', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', -6300, 4, -36300, 0.50, 63.8182, 4.3881, 63.1404, 4.3583, '2025-07-26 22:18:51.802547+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1e64cd97-9855-5e48-a18a-3d2365f35e44', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 39900, 1, 29900, 1.50, 75.6943, 4.2948, 77.4127, 4.2482, '2025-07-26 22:18:51.802549+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1e64cd97-9855-5e48-a18a-3d2365f35e44', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 36300, 2, 21300, 1.50, 63.0692, 4.4860, 64.9761, 4.4112, '2025-07-26 22:18:51.802552+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '439c525f-39e5-5350-9567-5d133f705ff3', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 8400, 3, -16600, 0.50, 64.9761, 4.4112, 65.2854, 4.2804, '2025-07-26 22:18:51.802555+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '439c525f-39e5-5350-9567-5d133f705ff3', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 6800, 4, -23200, 0.50, 68.5633, 4.3670, 67.5985, 4.3332, '2025-07-26 22:18:51.802558+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '439c525f-39e5-5350-9567-5d133f705ff3', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 46100, 1, 36100, 1.50, 77.4127, 4.2482, 79.0108, 4.2024, '2025-07-26 22:18:51.802561+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '439c525f-39e5-5350-9567-5d133f705ff3', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 38700, 2, 23700, 1.50, 63.1404, 4.3583, 65.0002, 4.2928, '2025-07-26 22:18:51.802564+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e2189703-9dc9-587c-ac9e-dc6222fd9dde', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 17400, 3, -7600, 0.50, 67.5985, 4.3332, 67.2537, 4.3113, '2025-07-26 22:18:51.802567+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e2189703-9dc9-587c-ac9e-dc6222fd9dde', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 21300, 2, 6300, 1.50, 65.2854, 4.2804, 66.4368, 4.2236, '2025-07-26 22:18:51.802569+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e2189703-9dc9-587c-ac9e-dc6222fd9dde', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 46100, 1, 36100, 1.50, 79.0108, 4.2024, 80.2698, 4.1693, '2025-07-26 22:18:51.802572+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e2189703-9dc9-587c-ac9e-dc6222fd9dde', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'north', 15200, 4, -14800, 0.50, 50.2936, 7.0824, 49.5329, 6.9907, '2025-07-26 22:18:51.802575+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eb38f09-3535-59b6-96fa-da624df9cf07', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 52300, 1, 42300, 1.50, 67.2537, 4.3113, 69.5091, 4.2872, '2025-07-26 22:18:51.802578+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eb38f09-3535-59b6-96fa-da624df9cf07', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'south', 56, 4, -29944, 0.50, 49.5329, 6.9907, 49.1472, 6.9402, '2025-07-26 22:18:51.802581+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eb38f09-3535-59b6-96fa-da624df9cf07', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 10200, 3, -14800, 0.50, 80.2698, 4.1693, 79.5041, 4.1520, '2025-07-26 22:18:51.802584+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eb38f09-3535-59b6-96fa-da624df9cf07', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 31900, 2, 16900, 1.50, 66.4368, 4.2236, 67.9788, 4.1765, '2025-07-26 22:18:51.802587+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f2dd1e4e-7118-54df-ae7e-09e82896a33f', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'east', 21900, 3, -3100, 0.50, 49.1472, 6.9402, 54.0061, 6.6299, '2025-07-26 22:18:51.80259+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f2dd1e4e-7118-54df-ae7e-09e82896a33f', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 34300, 1, 24300, 1.50, 79.5041, 4.1520, 80.8088, 4.1194, '2025-07-26 22:18:51.802593+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f2dd1e4e-7118-54df-ae7e-09e82896a33f', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 21200, 4, -8800, 0.50, 67.9788, 4.1765, 67.0161, 4.1580, '2025-07-26 22:18:51.802596+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'f2dd1e4e-7118-54df-ae7e-09e82896a33f', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 22600, 2, 7600, 1.50, 69.5091, 4.2872, 70.3209, 4.2224, '2025-07-26 22:18:51.802599+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd9e38d15-c693-5be6-af88-e00a73b2b026', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 42500, 1, 32500, 1.50, 70.3209, 4.2224, 72.4509, 4.1965, '2025-07-26 22:18:51.802602+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd9e38d15-c693-5be6-af88-e00a73b2b026', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 31100, 2, 16100, 1.50, 80.8088, 4.1194, 80.6733, 4.1044, '2025-07-26 22:18:51.802613+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd9e38d15-c693-5be6-af88-e00a73b2b026', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', -4200, 4, -34200, 0.50, 67.0161, 4.1580, 66.2458, 4.1405, '2025-07-26 22:18:51.802616+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd9e38d15-c693-5be6-af88-e00a73b2b026', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'north', 30600, 3, 5600, 1.50, 54.0061, 6.6299, 57.9916, 6.3198, '2025-07-26 22:18:51.802619+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd76cf4fb-25ed-5edc-b030-096d6dda995a', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 16800, 3, -8200, 0.50, 66.2458, 4.1405, 67.3910, 4.0743, '2025-07-26 22:18:51.802622+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd76cf4fb-25ed-5edc-b030-096d6dda995a', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 10800, 4, -19200, 0.50, 80.6733, 4.1044, 79.4801, 4.0815, '2025-07-26 22:18:51.802625+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd76cf4fb-25ed-5edc-b030-096d6dda995a', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 24200, 2, 9200, 1.50, 72.4509, 4.1965, 73.7178, 4.1368, '2025-07-26 22:18:51.802628+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd76cf4fb-25ed-5edc-b030-096d6dda995a', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'north', 48200, 1, 38200, 1.50, 57.9916, 6.3198, 63.7639, 6.2605, '2025-07-26 22:18:51.802631+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 22400, 3, -2600, 0.50, 67.3910, 4.0743, 68.5121, 3.9937, '2025-07-26 22:18:51.802634+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 35300, 2, 20300, 1.50, 73.7178, 4.1368, 74.9358, 4.0628, '2025-07-26 22:18:51.802637+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 41000, 1, 31000, 1.50, 65.0002, 4.2928, 67.7311, 4.2701, '2025-07-26 22:18:51.80264+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 1300, 4, -28700, 0.50, 79.4801, 4.0815, 78.2853, 4.0527, '2025-07-26 22:18:51.802644+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c222c83a-c3fa-5d08-bdf5-31b334096494', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 25000, 3, 0, 1.00, 78.2853, 4.0527, 77.8440, 4.0240, '2025-07-26 22:18:51.802647+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c222c83a-c3fa-5d08-bdf5-31b334096494', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 8700, 4, -21300, 0.50, 68.5121, 3.9937, 68.0306, 3.9733, '2025-07-26 22:18:51.80265+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c222c83a-c3fa-5d08-bdf5-31b334096494', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 38800, 1, 28800, 1.50, 74.9358, 4.0628, 76.9423, 4.0283, '2025-07-26 22:18:51.802653+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c222c83a-c3fa-5d08-bdf5-31b334096494', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 27500, 2, 12500, 1.50, 67.7311, 4.2701, 69.6759, 4.2071, '2025-07-26 22:18:51.802656+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e53af200-a15c-5ae8-b492-d37f3731fbba', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 39700, 1, 29700, 1.50, 77.8440, 4.0240, 79.0595, 3.9995, '2025-07-26 22:18:51.802659+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e53af200-a15c-5ae8-b492-d37f3731fbba', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 1100, 4, -28900, 0.50, 69.6759, 4.2071, 68.5479, 4.1933, '2025-07-26 22:18:51.802662+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e53af200-a15c-5ae8-b492-d37f3731fbba', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 36600, 2, 21600, 1.50, 68.0306, 3.9733, 68.7255, 3.9326, '2025-07-26 22:18:51.802665+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e53af200-a15c-5ae8-b492-d37f3731fbba', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 22600, 3, -2400, 0.50, 25.0000, 8.3300, 34.4247, 8.2073, '2025-07-26 22:18:51.802668+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '318e215a-1803-5b6e-95f8-5a67ec15ed3e', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 23900, 2, 8900, 1.50, 68.7255, 3.9326, 70.3140, 3.8845, '2025-07-26 22:18:51.802671+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '318e215a-1803-5b6e-95f8-5a67ec15ed3e', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 10900, 4, -19100, 0.50, 76.9423, 4.0283, 75.8979, 4.0002, '2025-07-26 22:18:51.802674+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '318e215a-1803-5b6e-95f8-5a67ec15ed3e', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 22500, 3, -2500, 0.50, 68.5479, 4.1933, 69.3822, 4.0870, '2025-07-26 22:18:51.802677+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '318e215a-1803-5b6e-95f8-5a67ec15ed3e', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 42700, 1, 32700, 1.50, 79.0595, 3.9995, 80.7755, 3.9617, '2025-07-26 22:18:51.80268+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '686b01f7-ab01-52f5-bd21-d1a3a2461336', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 25000, 2, 10000, 1.50, 69.3822, 4.0870, 70.0427, 4.0381, '2025-07-26 22:18:51.802683+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '686b01f7-ab01-52f5-bd21-d1a3a2461336', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 10300, 4, -19700, 0.50, 34.4247, 8.2073, 34.1214, 8.1550, '2025-07-26 22:18:51.802686+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '686b01f7-ab01-52f5-bd21-d1a3a2461336', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 42200, 1, 32200, 1.50, 75.8979, 4.0002, 77.2426, 3.9759, '2025-07-26 22:18:51.802688+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '686b01f7-ab01-52f5-bd21-d1a3a2461336', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 22500, 3, -2500, 0.50, 70.3140, 3.8845, 69.9157, 3.8737, '2025-07-26 22:18:51.802691+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5866e64e-3e79-516e-acd4-5f03c9ce4683', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 20800, 3, -4200, 0.50, 77.2426, 3.9759, 76.8357, 3.9586, '2025-07-26 22:18:51.802694+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5866e64e-3e79-516e-acd4-5f03c9ce4683', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 32000, 1, 22000, 1.50, 69.9157, 3.8737, 71.5506, 3.8569, '2025-07-26 22:18:51.802697+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5866e64e-3e79-516e-acd4-5f03c9ce4683', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'west', 29500, 2, 14500, 1.50, 34.1214, 8.1550, 43.5190, 8.0782, '2025-07-26 22:18:51.8027+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '5866e64e-3e79-516e-acd4-5f03c9ce4683', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 17700, 4, -12300, 0.50, 70.0427, 4.0381, 69.4421, 4.0213, '2025-07-26 22:18:51.802703+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '940e2b02-0412-548c-8d4e-cc6c0831709c', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'east', 33700, 2, 18700, 1.50, 63.7639, 6.2605, 68.5542, 6.0949, '2025-07-26 22:18:51.802706+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '940e2b02-0412-548c-8d4e-cc6c0831709c', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 38900, 1, 28900, 1.50, 69.4421, 4.0213, 71.5935, 4.0033, '2025-07-26 22:18:51.802708+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '940e2b02-0412-548c-8d4e-cc6c0831709c', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 14300, 3, -10700, 0.50, 76.8357, 3.9586, 76.7764, 3.9378, '2025-07-26 22:18:51.802711+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '940e2b02-0412-548c-8d4e-cc6c0831709c', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 13100, 4, -16900, 0.50, 80.7755, 3.9617, 79.8331, 3.9392, '2025-07-26 22:18:51.802714+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0dae0e21-fbc4-5335-a2a0-b86adb38d416', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 43300, 1, 33300, 1.50, 76.7764, 3.9378, 78.7261, 3.9064, '2025-07-26 22:18:51.802717+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0dae0e21-fbc4-5335-a2a0-b86adb38d416', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 32400, 3, 7400, 1.50, 71.5506, 3.8569, 72.1992, 3.7758, '2025-07-26 22:18:51.80272+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0dae0e21-fbc4-5335-a2a0-b86adb38d416', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', -9600, 4, -39600, 0.50, 79.8331, 3.9392, 78.7868, 3.9119, '2025-07-26 22:18:51.802723+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0dae0e21-fbc4-5335-a2a0-b86adb38d416', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 33900, 2, 18900, 1.50, 71.5935, 4.0033, 73.2021, 3.9470, '2025-07-26 22:18:51.802726+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13677aba-ae2d-563a-aedd-60ab8bf265ab', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 33000, 2, 18000, 1.50, 73.2021, 3.9470, 73.7302, 3.9021, '2025-07-26 22:18:51.802729+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13677aba-ae2d-563a-aedd-60ab8bf265ab', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 41200, 1, 31200, 1.50, 78.7261, 3.9064, 80.0339, 3.8835, '2025-07-26 22:18:51.802732+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13677aba-ae2d-563a-aedd-60ab8bf265ab', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 9100, 4, -20900, 0.50, 72.1992, 3.7758, 71.3420, 3.7654, '2025-07-26 22:18:51.802735+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '13677aba-ae2d-563a-aedd-60ab8bf265ab', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 16700, 3, -8300, 0.50, 43.5190, 8.0782, 51.4046, 7.7635, '2025-07-26 22:18:51.802738+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '25003272-4012-52fd-a4ef-d9f199ec9df0', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 16600, 3, -8400, 0.50, 73.7302, 3.9021, 73.3934, 3.8926, '2025-07-26 22:18:51.802741+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '25003272-4012-52fd-a4ef-d9f199ec9df0', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 29000, 2, 14000, 1.50, 80.0339, 3.8835, 80.0375, 3.8409, '2025-07-26 22:18:51.802744+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '25003272-4012-52fd-a4ef-d9f199ec9df0', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 38100, 1, 28100, 1.50, 78.7868, 3.9119, 80.2374, 3.8913, '2025-07-26 22:18:51.802746+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '25003272-4012-52fd-a4ef-d9f199ec9df0', '1280a159-acb0-50e1-ad87-1ed0ff1e3f45', 'north', 16300, 4, -13700, 0.50, 25.0000, 8.3300, 24.8869, 8.3095, '2025-07-26 22:18:51.802749+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3932216e-62be-5fce-a18b-090cdd53a602', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 8600, 3, -16400, 0.50, 80.2374, 3.8913, 79.9166, 3.8645, '2025-07-26 22:18:51.802752+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3932216e-62be-5fce-a18b-090cdd53a602', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 3400, 4, -26600, 0.50, 73.3934, 3.8926, 72.8523, 3.8707, '2025-07-26 22:18:51.802755+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3932216e-62be-5fce-a18b-090cdd53a602', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 46200, 1, 36200, 1.50, 80.0375, 3.8409, 81.7833, 3.8087, '2025-07-26 22:18:51.802758+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3932216e-62be-5fce-a18b-090cdd53a602', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 41800, 2, 26800, 1.50, 71.3420, 3.7654, 72.8907, 3.7240, '2025-07-26 22:18:51.802761+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '24354d65-e884-5972-bba0-d8b62f8404f8', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 28100, 2, 13100, 1.50, 72.8907, 3.7240, 74.4549, 3.6852, '2025-07-26 22:18:51.802764+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '24354d65-e884-5972-bba0-d8b62f8404f8', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 17400, 4, -12600, 0.50, 79.9166, 3.8645, 79.1668, 3.8385, '2025-07-26 22:18:51.802767+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '24354d65-e884-5972-bba0-d8b62f8404f8', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 24000, 3, -1000, 0.50, 81.7833, 3.8087, 81.5663, 3.7831, '2025-07-26 22:18:51.802769+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '24354d65-e884-5972-bba0-d8b62f8404f8', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 30500, 1, 20500, 1.50, 72.8523, 3.8707, 75.0680, 3.8501, '2025-07-26 22:18:51.802772+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cf400b5f-0704-50cd-8e72-ec50152558ca', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 26900, 2, 11900, 1.50, 79.1668, 3.8385, 80.1625, 3.7742, '2025-07-26 22:18:51.802775+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cf400b5f-0704-50cd-8e72-ec50152558ca', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 20300, 3, -4700, 0.50, 81.5663, 3.7831, 81.3077, 3.7588, '2025-07-26 22:18:51.802778+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cf400b5f-0704-50cd-8e72-ec50152558ca', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 11600, 4, -18400, 0.50, 75.0680, 3.8501, 74.5478, 3.8292, '2025-07-26 22:18:51.802781+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cf400b5f-0704-50cd-8e72-ec50152558ca', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 41200, 1, 31200, 1.50, 74.4549, 3.6852, 76.4249, 3.6668, '2025-07-26 22:18:51.802784+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '409e800a-9475-5b12-a626-fd867f87fc8b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 35600, 2, 20600, 1.50, 81.3077, 3.7588, 81.9856, 3.6941, '2025-07-26 22:18:51.802787+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '409e800a-9475-5b12-a626-fd867f87fc8b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 15100, 3, -9900, 0.50, 74.5478, 3.8292, 75.1291, 3.7448, '2025-07-26 22:18:51.80279+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '409e800a-9475-5b12-a626-fd867f87fc8b', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 10700, 4, -19300, 0.50, 80.1625, 3.7742, 79.3482, 3.7508, '2025-07-26 22:18:51.802793+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '409e800a-9475-5b12-a626-fd867f87fc8b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 38600, 1, 28600, 1.50, 76.4249, 3.6668, 78.3213, 3.6465, '2025-07-26 22:18:51.802795+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '569b3f5c-9390-5815-a777-464b58a36d03', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'east', 49600, 1, 39600, 1.50, 68.5542, 6.0949, 72.9124, 6.0189, '2025-07-26 22:18:51.802798+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '569b3f5c-9390-5815-a777-464b58a36d03', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 6600, 4, -23400, 0.50, 78.3213, 3.6465, 77.7010, 3.6355, '2025-07-26 22:18:51.802801+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '569b3f5c-9390-5815-a777-464b58a36d03', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 18700, 3, -6300, 0.50, 79.3482, 3.7508, 79.1467, 3.7382, '2025-07-26 22:18:51.802804+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '569b3f5c-9390-5815-a777-464b58a36d03', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 25100, 2, 10100, 1.50, 51.4046, 7.7635, 59.0284, 7.6128, '2025-07-26 22:18:51.802807+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ca74cf4-6317-5054-ab0a-6662b05edbae', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', -1000, 4, -31000, 0.50, 59.0284, 7.6128, 58.1031, 7.4796, '2025-07-26 22:18:51.80281+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ca74cf4-6317-5054-ab0a-6662b05edbae', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 43000, 1, 33000, 1.50, 79.1467, 3.7382, 80.5420, 3.7187, '2025-07-26 22:18:51.802813+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ca74cf4-6317-5054-ab0a-6662b05edbae', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 33000, 2, 18000, 1.50, 77.7010, 3.6355, 78.1066, 3.5991, '2025-07-26 22:18:51.802815+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ca74cf4-6317-5054-ab0a-6662b05edbae', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 25000, 3, 0, 1.00, 75.1291, 3.7448, 74.8954, 3.7321, '2025-07-26 22:18:51.802818+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6e629696-25f5-5eee-a8d1-343a0036243c', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 29400, 2, 14400, 1.50, 80.5420, 3.7187, 80.8065, 3.6760, '2025-07-26 22:18:51.802821+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6e629696-25f5-5eee-a8d1-343a0036243c', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 28800, 3, 3800, 1.50, 78.1066, 3.5991, 77.8295, 3.5882, '2025-07-26 22:18:51.802824+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6e629696-25f5-5eee-a8d1-343a0036243c', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'west', 8800, 4, -21200, 0.50, 58.1031, 7.4796, 57.3900, 7.3749, '2025-07-26 22:18:51.802827+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6e629696-25f5-5eee-a8d1-343a0036243c', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 33000, 1, 23000, 1.50, 74.8954, 3.7321, 76.5309, 3.7163, '2025-07-26 22:18:51.80283+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '64185acd-eb59-5bcc-ba91-24d06652ae4b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 56500, 1, 46500, 1.50, 77.8295, 3.5882, 79.2640, 3.5731, '2025-07-26 22:18:51.802833+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '64185acd-eb59-5bcc-ba91-24d06652ae4b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 21500, 3, -3500, 0.50, 81.9856, 3.6941, 81.6890, 3.6790, '2025-07-26 22:18:51.802836+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '64185acd-eb59-5bcc-ba91-24d06652ae4b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', -1500, 4, -31500, 0.50, 76.5309, 3.7163, 75.9826, 3.7021, '2025-07-26 22:18:51.802838+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '64185acd-eb59-5bcc-ba91-24d06652ae4b', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 23500, 2, 8500, 1.50, 57.3900, 7.3749, 64.6946, 7.1907, '2025-07-26 22:18:51.802841+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c0719e9f-8918-5c27-bd4b-4330b9b685d3', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 38700, 1, 28700, 1.50, 79.2640, 3.5731, 80.6665, 3.5571, '2025-07-26 22:18:51.802844+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c0719e9f-8918-5c27-bd4b-4330b9b685d3', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 9400, 4, -20600, 0.50, 81.6890, 3.6790, 80.7902, 3.6654, '2025-07-26 22:18:51.802847+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c0719e9f-8918-5c27-bd4b-4330b9b685d3', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 33400, 2, 18400, 1.50, 75.9826, 3.7021, 76.9120, 3.6659, '2025-07-26 22:18:51.80285+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c0719e9f-8918-5c27-bd4b-4330b9b685d3', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 18500, 3, -6500, 0.50, 64.6946, 7.1907, 69.2410, 6.6896, '2025-07-26 22:18:51.802853+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 20300, 4, -9700, 0.50, 69.2410, 6.6896, 68.2074, 6.5716, '2025-07-26 22:18:51.802856+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 24200, 2, 9200, 1.50, 80.8065, 3.6760, 81.3764, 3.6329, '2025-07-26 22:18:51.802859+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 21900, 3, -3100, 0.50, 80.7902, 3.6654, 80.5449, 3.6507, '2025-07-26 22:18:51.802861+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 33600, 1, 23600, 1.50, 76.9120, 3.6659, 78.5687, 3.6500, '2025-07-26 22:18:51.802864+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', -3700, 4, -33700, 0.50, 68.2074, 6.5716, 67.1911, 6.4593, '2025-07-26 22:18:51.802867+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 14700, 3, -10300, 0.50, 78.5687, 3.6500, 78.3824, 3.6357, '2025-07-26 22:18:51.80287+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 28600, 2, 13600, 1.50, 80.6665, 3.5571, 81.1477, 3.5183, '2025-07-26 22:18:51.802873+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 60400, 1, 50400, 1.50, 80.5449, 3.6507, 82.0384, 3.6313, '2025-07-26 22:18:51.802876+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'de3de582-51f6-5bde-a77d-50a8d8f1340f', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 21400, 3, -3600, 0.50, 78.3824, 3.6357, 78.4443, 3.5757, '2025-07-26 22:18:51.802879+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'de3de582-51f6-5bde-a77d-50a8d8f1340f', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 35300, 1, 25300, 1.50, 67.1911, 6.4593, 73.3232, 6.3738, '2025-07-26 22:18:51.802882+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'de3de582-51f6-5bde-a77d-50a8d8f1340f', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 19300, 4, -10700, 0.50, 81.1477, 3.5183, 80.5321, 3.5049, '2025-07-26 22:18:51.802884+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'de3de582-51f6-5bde-a77d-50a8d8f1340f', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 24000, 2, 9000, 1.50, 82.0384, 3.6313, 82.6610, 3.5887, '2025-07-26 22:18:51.802887+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cb102789-b201-5736-81ae-a100609af52c', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 13600, 4, -16400, 0.50, 82.6610, 3.5887, 81.9674, 3.5731, '2025-07-26 22:18:51.80289+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cb102789-b201-5736-81ae-a100609af52c', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 15500, 3, -9500, 0.50, 80.5321, 3.5049, 80.4818, 3.4916, '2025-07-26 22:18:51.802893+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cb102789-b201-5736-81ae-a100609af52c', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 47400, 1, 37400, 1.50, 78.4443, 3.5757, 80.0532, 3.5603, '2025-07-26 22:18:51.802896+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'cb102789-b201-5736-81ae-a100609af52c', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 23500, 2, 8500, 1.50, 73.3232, 6.3738, 77.6265, 6.1015, '2025-07-26 22:18:51.802899+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ac6794c-0218-590d-8c14-b125517f3842', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 14400, 3, -10600, 0.50, 77.6265, 6.1015, 78.3351, 5.6094, '2025-07-26 22:18:51.802902+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ac6794c-0218-590d-8c14-b125517f3842', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 40100, 2, 25100, 1.50, 81.9674, 3.5731, 82.6818, 3.5330, '2025-07-26 22:18:51.802905+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ac6794c-0218-590d-8c14-b125517f3842', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 42700, 1, 32700, 1.50, 80.0532, 3.5603, 81.6448, 3.5443, '2025-07-26 22:18:51.802907+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '8ac6794c-0218-590d-8c14-b125517f3842', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 2800, 4, -27200, 0.50, 81.3764, 3.6329, 80.7147, 3.6171, '2025-07-26 22:18:51.80291+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'afa41ab0-b245-5c00-afdd-2a2dd831e7d8', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 11300, 3, -13700, 0.50, 80.7147, 3.6171, 80.7042, 3.5970, '2025-07-26 22:18:51.802913+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'afa41ab0-b245-5c00-afdd-2a2dd831e7d8', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 28800, 2, 13800, 1.50, 82.6818, 3.5330, 83.4921, 3.4820, '2025-07-26 22:18:51.802916+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'afa41ab0-b245-5c00-afdd-2a2dd831e7d8', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 9300, 4, -20700, 0.50, 81.6448, 3.5443, 81.0086, 3.5253, '2025-07-26 22:18:51.802919+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'afa41ab0-b245-5c00-afdd-2a2dd831e7d8', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 50600, 1, 40600, 1.50, 80.4818, 3.4916, 82.1991, 3.4724, '2025-07-26 22:18:51.802922+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c810907a-47be-58a8-8324-2b65af37c6a2', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 16700, 4, -13300, 0.50, 81.0086, 3.5253, 80.4849, 3.5109, '2025-07-26 22:18:51.802925+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c810907a-47be-58a8-8324-2b65af37c6a2', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 24900, 2, 9900, 1.50, 82.1991, 3.4724, 83.0251, 3.4356, '2025-07-26 22:18:51.802927+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c810907a-47be-58a8-8324-2b65af37c6a2', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 24100, 3, -900, 0.50, 83.4921, 3.4820, 83.3778, 3.4672, '2025-07-26 22:18:51.80293+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'c810907a-47be-58a8-8324-2b65af37c6a2', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 34300, 1, 24300, 1.50, 78.3351, 5.6094, 82.6697, 5.5138, '2025-07-26 22:18:51.802933+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '68a4aa20-5756-53df-afac-89ebd5914a31', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 15700, 2, 700, 1.50, 82.6697, 5.5138, 84.7318, 5.2656, '2025-07-26 22:18:51.802936+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '68a4aa20-5756-53df-afac-89ebd5914a31', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 64300, 1, 54300, 1.50, 83.3778, 3.4672, 84.8817, 3.4502, '2025-07-26 22:18:51.802939+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '68a4aa20-5756-53df-afac-89ebd5914a31', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 14800, 3, -10200, 0.50, 80.4849, 3.5109, 80.5968, 3.4520, '2025-07-26 22:18:51.802942+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '68a4aa20-5756-53df-afac-89ebd5914a31', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 5200, 4, -24800, 0.50, 83.0251, 3.4356, 82.4289, 3.4218, '2025-07-26 22:18:51.802945+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '337edf01-4b3b-5adf-b680-854f079e09f5', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 22600, 3, -2400, 0.50, 84.7318, 5.2656, 84.2115, 5.2292, '2025-07-26 22:18:51.802947+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '337edf01-4b3b-5adf-b680-854f079e09f5', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 6100, 4, -23900, 0.50, 82.4289, 3.4218, 81.9175, 3.4162, '2025-07-26 22:18:51.80295+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '337edf01-4b3b-5adf-b680-854f079e09f5', 'a9ba7c65-bc70-51dc-9999-bcb9a7e5bf13', 'west', 30200, 2, 15200, 1.50, 25.0000, 8.3300, 33.6100, 8.3014, '2025-07-26 22:18:51.802953+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '337edf01-4b3b-5adf-b680-854f079e09f5', '98fd574d-56a3-5fe3-9176-5f152bade922', 'north', 41100, 1, 31100, 1.50, 25.0000, 8.3300, 33.7151, 8.3160, '2025-07-26 22:18:51.802956+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bfa57cca-b9f6-5900-a55a-1d4c85b42c04', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 'east', 70500, 1, 60500, 1.50, 25.0000, 8.3300, 33.5326, 8.3124, '2025-07-26 22:18:51.802959+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bfa57cca-b9f6-5900-a55a-1d4c85b42c04', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 'south', 20400, 2, 5400, 1.50, 72.9124, 6.0189, 74.5979, 5.8802, '2025-07-26 22:18:51.802962+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bfa57cca-b9f6-5900-a55a-1d4c85b42c04', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 'west', -1500, 4, -31500, 0.50, 25.0000, 8.3300, 24.8815, 8.3147, '2025-07-26 22:18:51.802965+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bfa57cca-b9f6-5900-a55a-1d4c85b42c04', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 4600, 3, -20400, 0.50, 84.8817, 3.4502, 84.3974, 3.4471, '2025-07-26 22:18:51.802968+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 13100, 4, -16900, 0.50, 80.5968, 3.4520, 80.0431, 3.4355, '2025-07-26 22:18:51.802971+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 36100, 1, 26100, 1.50, 81.9175, 3.4162, 83.5357, 3.3973, '2025-07-26 22:18:51.802974+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 26800, 2, 11800, 1.50, 84.3974, 3.4471, 84.9993, 3.3973, '2025-07-26 22:18:51.802977+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 24000, 3, -1000, 0.50, 80.7042, 3.5970, 80.6931, 3.5773, '2025-07-26 22:18:51.80298+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2433425c-fea3-5cf2-b773-d2b9deb14816', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 28300, 2, 13300, 1.50, 83.5357, 3.3973, 84.4071, 3.3625, '2025-07-26 22:18:51.802982+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2433425c-fea3-5cf2-b773-d2b9deb14816', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 39600, 1, 29600, 1.50, 80.0431, 3.4355, 81.7153, 3.4225, '2025-07-26 22:18:51.802985+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2433425c-fea3-5cf2-b773-d2b9deb14816', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 12300, 4, -17700, 0.50, 84.9993, 3.3973, 84.4150, 3.3832, '2025-07-26 22:18:51.802988+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '2433425c-fea3-5cf2-b773-d2b9deb14816', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 19800, 3, -5200, 0.50, 84.2115, 5.2292, 84.1111, 5.1465, '2025-07-26 22:18:51.802991+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eccc1df-f587-56a5-b98b-4802ae8de5c5', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 15600, 4, -14400, 0.50, 84.4150, 3.3832, 83.7520, 3.3662, '2025-07-26 22:18:51.802994+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eccc1df-f587-56a5-b98b-4802ae8de5c5', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 39600, 1, 29600, 1.50, 84.4071, 3.3625, 85.9012, 3.3427, '2025-07-26 22:18:51.802997+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eccc1df-f587-56a5-b98b-4802ae8de5c5', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 27600, 2, 12600, 1.50, 80.6931, 3.5773, 81.9064, 3.5304, '2025-07-26 22:18:51.803+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6eccc1df-f587-56a5-b98b-4802ae8de5c5', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 17200, 3, -7800, 0.50, 81.7153, 3.4225, 81.7709, 3.3536, '2025-07-26 22:18:51.803003+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '05312148-5044-5883-9e31-13df14ae493c', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 24100, 2, 9100, 1.50, 83.7520, 3.3662, 84.5116, 3.3307, '2025-07-26 22:18:51.803006+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '05312148-5044-5883-9e31-13df14ae493c', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 16500, 3, -8500, 0.50, 84.1111, 5.1465, 83.8944, 5.0673, '2025-07-26 22:18:51.803008+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '05312148-5044-5883-9e31-13df14ae493c', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 58300, 1, 48300, 1.50, 81.9064, 3.5304, 83.5876, 3.5131, '2025-07-26 22:18:51.803011+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '05312148-5044-5883-9e31-13df14ae493c', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', -9000, 4, -39000, 0.50, 81.7709, 3.3536, 81.2952, 3.3414, '2025-07-26 22:18:51.803014+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '16f861b3-561b-5449-9fc8-0132a453342f', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 22400, 3, -2600, 0.50, 84.5116, 3.3307, 84.4062, 3.3176, '2025-07-26 22:18:51.803017+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '16f861b3-561b-5449-9fc8-0132a453342f', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 27000, 2, 12000, 1.50, 83.8944, 5.0673, 85.6437, 4.8765, '2025-07-26 22:18:51.80302+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '16f861b3-561b-5449-9fc8-0132a453342f', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 3700, 4, -26300, 0.50, 81.2952, 3.3414, 80.8455, 3.3295, '2025-07-26 22:18:51.803023+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '16f861b3-561b-5449-9fc8-0132a453342f', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 46900, 1, 36900, 1.50, 83.5876, 3.5131, 85.2040, 3.4944, '2025-07-26 22:18:51.803025+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a043432a-12fb-50d3-8028-e9c98d9c60bf', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 57000, 1, 47000, 1.50, 85.9012, 3.3427, 87.3197, 3.3257, '2025-07-26 22:18:51.803028+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a043432a-12fb-50d3-8028-e9c98d9c60bf', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 600, 4, -29400, 0.50, 85.6437, 4.8765, 84.3750, 4.8082, '2025-07-26 22:18:51.803031+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a043432a-12fb-50d3-8028-e9c98d9c60bf', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 12600, 3, -12400, 0.50, 84.4062, 3.3176, 84.3696, 3.3044, '2025-07-26 22:18:51.803034+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a043432a-12fb-50d3-8028-e9c98d9c60bf', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 29800, 2, 14800, 1.50, 80.8455, 3.3295, 81.9522, 3.3010, '2025-07-26 22:18:51.803037+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ae412872-7421-520e-92d1-9529cb07b68b', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 35400, 2, 20400, 1.50, 85.2040, 3.4944, 86.0416, 3.4432, '2025-07-26 22:18:51.80304+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ae412872-7421-520e-92d1-9529cb07b68b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 22900, 3, -2100, 0.50, 84.3696, 3.3044, 84.2972, 3.2895, '2025-07-26 22:18:51.803043+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ae412872-7421-520e-92d1-9529cb07b68b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 39000, 1, 29000, 1.50, 87.3197, 3.3257, 88.7385, 3.3052, '2025-07-26 22:18:51.803045+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ae412872-7421-520e-92d1-9529cb07b68b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', -5300, 4, -35300, 0.50, 81.9522, 3.3010, 81.4882, 3.2874, '2025-07-26 22:18:51.803048+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0023192b-2952-5d5a-8bb5-480d68c696f0', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 23000, 2, 8000, 1.50, 88.7385, 3.3052, 89.2502, 3.2601, '2025-07-26 22:18:51.803051+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0023192b-2952-5d5a-8bb5-480d68c696f0', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 23000, 3, -2000, 0.50, 84.2972, 3.2895, 84.3904, 3.2302, '2025-07-26 22:18:51.803054+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0023192b-2952-5d5a-8bb5-480d68c696f0', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 34700, 1, 24700, 1.50, 81.4882, 3.2874, 83.1658, 3.2748, '2025-07-26 22:18:51.803057+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '0023192b-2952-5d5a-8bb5-480d68c696f0', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 19300, 4, -10700, 0.50, 86.0416, 3.4432, 85.4171, 3.4251, '2025-07-26 22:18:51.80306+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 36900, 2, 21900, 1.50, 89.2502, 3.2601, 89.6492, 3.2162, '2025-07-26 22:18:51.803063+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 37100, 1, 27100, 1.50, 85.4171, 3.4251, 87.0936, 3.4050, '2025-07-26 22:18:51.803065+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', -100, 4, -30100, 0.50, 84.3904, 3.2302, 83.8818, 3.2171, '2025-07-26 22:18:51.803068+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 26100, 3, 1100, 1.50, 83.1658, 3.2748, 83.3215, 3.2181, '2025-07-26 22:18:51.803071+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '9a756395-d775-5c33-97cb-3e0463e0d8e9', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', 18100, 3, -6900, 0.50, 83.8818, 3.2171, 83.8648, 3.2057, '2025-07-26 22:18:51.803074+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '9a756395-d775-5c33-97cb-3e0463e0d8e9', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 40400, 1, 30400, 1.50, 89.6492, 3.2162, 90.8421, 3.1993, '2025-07-26 22:18:51.803077+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '9a756395-d775-5c33-97cb-3e0463e0d8e9', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'west', 6000, 4, -24000, 0.50, 84.3750, 4.8082, 83.2482, 4.7452, '2025-07-26 22:18:51.80308+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '9a756395-d775-5c33-97cb-3e0463e0d8e9', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 35500, 2, 20500, 1.50, 83.3215, 3.2181, 84.2149, 3.1894, '2025-07-26 22:18:51.803083+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '75cf6929-633c-5e31-af5e-c08c17f98281', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 22800, 3, -2200, 0.50, 90.8421, 3.1993, 90.4201, 3.1945, '2025-07-26 22:18:51.803086+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '75cf6929-633c-5e31-af5e-c08c17f98281', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 'south', 17100, 4, -12900, 0.50, 24.8815, 8.3147, 24.8469, 8.3080, '2025-07-26 22:18:51.803088+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '75cf6929-633c-5e31-af5e-c08c17f98281', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 28400, 2, 13400, 1.50, 84.2149, 3.1894, 84.7657, 3.1701, '2025-07-26 22:18:51.803091+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '75cf6929-633c-5e31-af5e-c08c17f98281', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 31700, 1, 21700, 1.50, 83.8648, 3.2057, 85.0237, 3.1973, '2025-07-26 22:18:51.803094+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e15238a8-22ae-533c-8774-4ebe8af3e1ae', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 47000, 1, 37000, 1.50, 84.7657, 3.1701, 85.4543, 3.1638, '2025-07-26 22:18:51.803097+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e15238a8-22ae-533c-8774-4ebe8af3e1ae', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 'south', 19400, 3, -5600, 0.50, 24.8469, 8.3080, 30.4555, 7.9448, '2025-07-26 22:18:51.8031+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e15238a8-22ae-533c-8774-4ebe8af3e1ae', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 'west', 11100, 4, -18900, 0.50, 33.5326, 8.3124, 31.9588, 8.2162, '2025-07-26 22:18:51.803103+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e15238a8-22ae-533c-8774-4ebe8af3e1ae', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 22500, 2, 7500, 1.50, 85.0237, 3.1973, 84.8737, 3.1962, '2025-07-26 22:18:51.803106+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4b857ba1-a75c-5e1c-a687-36483afe4686', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 46300, 1, 36300, 1.50, 85.4543, 3.1638, 86.8472, 3.1518, '2025-07-26 22:18:51.803109+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4b857ba1-a75c-5e1c-a687-36483afe4686', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 30600, 2, 15600, 1.50, 84.8737, 3.1962, 85.7912, 3.1682, '2025-07-26 22:18:51.803112+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4b857ba1-a75c-5e1c-a687-36483afe4686', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'west', -1500, 4, -31500, 0.50, 83.2482, 4.7452, 82.4562, 4.6929, '2025-07-26 22:18:51.803114+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4b857ba1-a75c-5e1c-a687-36483afe4686', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 24600, 3, -400, 0.50, 90.4201, 3.1945, 90.1950, 3.1820, '2025-07-26 22:18:51.803117+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6529487a-8c53-5cb7-96fe-779c808c5dda', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 25600, 3, 600, 1.50, 82.4562, 4.6929, 83.0531, 4.4808, '2025-07-26 22:18:51.80312+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6529487a-8c53-5cb7-96fe-779c808c5dda', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 14500, 4, -15500, 0.50, 86.8472, 3.1518, 86.2816, 3.1406, '2025-07-26 22:18:51.803123+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6529487a-8c53-5cb7-96fe-779c808c5dda', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 28400, 2, 13400, 1.50, 85.7912, 3.1682, 86.5078, 3.1384, '2025-07-26 22:18:51.803126+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6529487a-8c53-5cb7-96fe-779c808c5dda', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 31500, 1, 21500, 1.50, 87.0936, 3.4050, 88.5920, 3.3860, '2025-07-26 22:18:51.803129+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ed751f6b-8a62-5ef1-8647-504f340863f7', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 23700, 2, 8700, 1.50, 86.2816, 3.1406, 87.0887, 3.1119, '2025-07-26 22:18:51.803131+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ed751f6b-8a62-5ef1-8647-504f340863f7', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 18500, 3, -6500, 0.50, 83.0531, 4.4808, 83.9578, 4.3080, '2025-07-26 22:18:51.803134+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ed751f6b-8a62-5ef1-8647-504f340863f7', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 40300, 1, 30300, 1.50, 86.5078, 3.1384, 87.8729, 3.1257, '2025-07-26 22:18:51.803137+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ed751f6b-8a62-5ef1-8647-504f340863f7', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 15500, 4, -14500, 0.50, 90.1950, 3.1820, 89.5230, 3.1693, '2025-07-26 22:18:51.80314+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ce633c1-013d-56d3-8769-34f5d6c47e1c', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'east', 23200, 2, 8200, 1.50, 88.5920, 3.3860, 89.4349, 3.3390, '2025-07-26 22:18:51.803143+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ce633c1-013d-56d3-8769-34f5d6c47e1c', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 35200, 1, 25200, 1.50, 89.5230, 3.1693, 90.8991, 3.1528, '2025-07-26 22:18:51.803146+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ce633c1-013d-56d3-8769-34f5d6c47e1c', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 18900, 4, -11100, 0.50, 87.8729, 3.1257, 87.3650, 3.1133, '2025-07-26 22:18:51.803149+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4ce633c1-013d-56d3-8769-34f5d6c47e1c', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 22700, 3, -2300, 0.50, 87.0887, 3.1119, 87.0825, 3.1001, '2025-07-26 22:18:51.803151+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '27fbc1cf-7f08-531a-b808-7384f372268e', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 18000, 3, -7000, 0.50, 83.9578, 4.3080, 84.8568, 4.1627, '2025-07-26 22:18:51.803154+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '27fbc1cf-7f08-531a-b808-7384f372268e', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'south', 33300, 2, 18300, 1.50, 89.4349, 3.3390, 90.1615, 3.2980, '2025-07-26 22:18:51.803157+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '27fbc1cf-7f08-531a-b808-7384f372268e', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 7800, 4, -22200, 0.50, 90.8991, 3.1528, 90.2637, 3.1407, '2025-07-26 22:18:51.80316+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '27fbc1cf-7f08-531a-b808-7384f372268e', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 40900, 1, 30900, 1.50, 87.0825, 3.1001, 88.4475, 3.0886, '2025-07-26 22:18:51.803163+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fb892ad0-1278-513c-8a86-b644168d7b16', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', 14300, 4, -15700, 0.50, 84.8568, 4.1627, 84.2150, 4.1298, '2025-07-26 22:18:51.803166+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fb892ad0-1278-513c-8a86-b644168d7b16', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 27800, 2, 12800, 1.50, 88.4475, 3.0886, 89.1703, 3.0600, '2025-07-26 22:18:51.803169+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fb892ad0-1278-513c-8a86-b644168d7b16', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'west', 19400, 3, -5600, 0.50, 90.2637, 3.1407, 90.1175, 3.1287, '2025-07-26 22:18:51.803171+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'fb892ad0-1278-513c-8a86-b644168d7b16', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 38500, 1, 28500, 1.50, 90.1615, 3.2980, 91.5944, 3.2799, '2025-07-26 22:18:51.803174+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd10bbe7a-ed83-552e-a52f-72d4cfafb2bc', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 22700, 3, -2300, 0.50, 90.1175, 3.1287, 89.9934, 3.1166, '2025-07-26 22:18:51.803177+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd10bbe7a-ed83-552e-a52f-72d4cfafb2bc', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'south', 32800, 2, 17800, 1.50, 84.2150, 4.1298, 86.0737, 4.0553, '2025-07-26 22:18:51.80318+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd10bbe7a-ed83-552e-a52f-72d4cfafb2bc', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 7200, 4, -22800, 0.50, 87.3650, 3.1133, 86.9218, 3.1025, '2025-07-26 22:18:51.803183+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd10bbe7a-ed83-552e-a52f-72d4cfafb2bc', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 37300, 1, 27300, 1.50, 91.5944, 3.2799, 92.9343, 3.2606, '2025-07-26 22:18:51.803186+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ee8a3866-67b8-56b3-adcf-dbe7b485217b', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'east', 28200, 2, 13200, 1.50, 89.1703, 3.0600, 89.8210, 3.0304, '2025-07-26 22:18:51.803189+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ee8a3866-67b8-56b3-adcf-dbe7b485217b', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', -4800, 4, -34800, 0.50, 89.9934, 3.1166, 89.4173, 3.1044, '2025-07-26 22:18:51.803192+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ee8a3866-67b8-56b3-adcf-dbe7b485217b', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 43400, 1, 33400, 1.50, 86.9218, 3.1025, 88.3205, 3.0905, '2025-07-26 22:18:51.803195+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ee8a3866-67b8-56b3-adcf-dbe7b485217b', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'north', 25200, 3, 200, 1.50, 86.0737, 4.0553, 86.4426, 3.9216, '2025-07-26 22:18:51.803197+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a3525cc8-7143-5356-8c1e-208b4dacb47a', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'east', -5600, 4, -35600, 0.50, 86.4426, 3.9216, 85.7946, 3.8927, '2025-07-26 22:18:51.8032+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a3525cc8-7143-5356-8c1e-208b4dacb47a', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'south', 25300, 2, 10300, 1.50, 89.4173, 3.1044, 90.0911, 3.0724, '2025-07-26 22:18:51.803203+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a3525cc8-7143-5356-8c1e-208b4dacb47a', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'west', 66800, 1, 56800, 1.50, 88.3205, 3.0905, 89.6787, 3.0776, '2025-07-26 22:18:51.803206+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a3525cc8-7143-5356-8c1e-208b4dacb47a', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 13500, 3, -11500, 0.50, 89.8210, 3.0304, 89.7211, 3.0196, '2025-07-26 22:18:51.803209+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ad580682-6aff-5440-94d9-80dec4baef50', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'east', -8300, 4, -38300, 0.50, 89.6787, 3.0776, 89.2492, 3.0662, '2025-07-26 22:18:51.803212+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ad580682-6aff-5440-94d9-80dec4baef50', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 62600, 1, 52600, 1.50, 89.7211, 3.0196, 91.0768, 3.0077, '2025-07-26 22:18:51.803215+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ad580682-6aff-5440-94d9-80dec4baef50', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'west', 14500, 3, -10500, 0.50, 92.9343, 3.2606, 92.7865, 3.2441, '2025-07-26 22:18:51.803218+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'ad580682-6aff-5440-94d9-80dec4baef50', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'north', 31200, 2, 16200, 1.50, 90.0911, 3.0724, 90.9249, 3.0422, '2025-07-26 22:18:51.80322+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 1900, 4, -28100, 0.50, 90.9249, 3.0422, 90.3630, 3.0312, '2025-07-26 22:18:51.803223+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'south', 32100, 2, 17100, 1.50, 91.0768, 3.0077, 91.6290, 2.9782, '2025-07-26 22:18:51.803226+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'west', 28300, 3, 3300, 1.50, 85.7946, 3.8927, 86.3884, 3.7838, '2025-07-26 22:18:51.803229+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'north', 37700, 1, 27700, 1.50, 89.2492, 3.0662, 90.5896, 3.0536, '2025-07-26 22:18:51.803232+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '620d1dac-a9dd-519c-937f-76ef71d90692', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', -200, 4, -30200, 0.50, 90.3630, 3.0312, 89.8726, 3.0201, '2025-07-26 22:18:51.803235+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '620d1dac-a9dd-519c-937f-76ef71d90692', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 10900, 3, -14100, 0.50, 90.5896, 3.0536, 90.5236, 3.0420, '2025-07-26 22:18:51.803238+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '620d1dac-a9dd-519c-937f-76ef71d90692', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 'west', 44100, 2, 29100, 1.50, 86.3884, 3.7838, 87.9312, 3.7254, '2025-07-26 22:18:51.803241+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '620d1dac-a9dd-519c-937f-76ef71d90692', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'north', 45200, 1, 35200, 1.50, 91.6290, 2.9782, 92.8177, 2.9654, '2025-07-26 22:18:51.803244+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd037a1a5-7b25-50a4-8463-f3fcaebb447a', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 'east', 19500, 3, -5500, 0.50, 30.4555, 7.9448, 37.4385, 7.8802, '2025-07-26 22:18:51.803247+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd037a1a5-7b25-50a4-8463-f3fcaebb447a', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 14500, 4, -15500, 0.50, 90.5236, 3.0420, 89.7370, 3.0425, '2025-07-26 22:18:51.80325+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd037a1a5-7b25-50a4-8463-f3fcaebb447a', 'a9ba7c65-bc70-51dc-9999-bcb9a7e5bf13', 'west', 19700, 2, 4700, 1.50, 33.6100, 8.3014, 41.3662, 8.2408, '2025-07-26 22:18:51.803252+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'd037a1a5-7b25-50a4-8463-f3fcaebb447a', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 'north', 46300, 1, 36300, 1.50, 31.9588, 8.2162, 39.8313, 8.1904, '2025-07-26 22:18:51.803255+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 'east', 11800, 3, -13200, 0.50, 89.8726, 3.0201, 89.9672, 2.9740, '2025-07-26 22:18:51.803258+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '4648919d-82d6-57f5-ba59-453f3a2863f6', 'south', 36800, 2, 21800, 1.50, 89.7370, 3.0425, 90.6134, 3.0143, '2025-07-26 22:18:51.803261+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 'west', 6800, 4, -23200, 0.50, 92.8177, 2.9654, 92.2831, 2.9545, '2025-07-26 22:18:51.803264+00'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 'north', 44600, 1, 34600, 1.50, 92.7865, 3.2441, 94.2402, 3.2247, '2025-07-26 22:18:51.803266+00');


--
-- Data for Name: cached_player_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cached_player_ratings" ("config_hash", "player_id", "games_start_date", "games_end_date", "mu", "sigma", "display_rating", "games_played", "total_plus_minus", "best_game_plus", "worst_game_minus", "longest_first_streak", "longest_fourth_free_streak", "last_game_date", "last_decay_applied", "tsumo_rate", "ron_rate", "riichi_rate", "deal_in_rate", "computed_at", "source_data_hash") VALUES
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', '2025-07-23', '2025-12-31', 30.5523, 8.0778, 14.40, 2, 36000, 49200, -13200, 0, 0, '2025-07-26 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:37.136701+00', '79d2c76c4a98de6681b51c9bafe443e9e44e41a7ac3b646f1e5cfdfe768219e3'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', 'e0f959ee-eb77-57de-b3af-acdecf679e70', '2025-07-23', '2025-12-31', 21.3397, 8.0957, 5.15, 2, -49400, NULL, -26200, 0, 0, '2025-07-26 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:37.13671+00', '79d2c76c4a98de6681b51c9bafe443e9e44e41a7ac3b646f1e5cfdfe768219e3'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '4648919d-82d6-57f5-ba59-453f3a2863f6', '2025-07-23', '2025-12-31', 27.7855, 7.9068, 11.97, 2, 7400, 21800, -14400, 0, 0, '2025-07-26 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:37.136714+00', '79d2c76c4a98de6681b51c9bafe443e9e44e41a7ac3b646f1e5cfdfe768219e3'),
	('bec5a5c1e6bde467f35db3c111cd9fd819086afcbd053ad47905ff9eba99145d', '41fb9cad-7e28-5e8f-82aa-04f46375556f', '2025-07-23', '2025-12-31', 32.7770, 7.8526, 17.07, 2, 46000, 34600, NULL, 0, 0, '2025-07-26 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:37.136716+00', '79d2c76c4a98de6681b51c9bafe443e9e44e41a7ac3b646f1e5cfdfe768219e3'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '98fd574d-56a3-5fe3-9176-5f152bade922', '2022-02-16', '2025-07-26', 33.7151, 8.3160, 17.08, 1, 31100, 31100, NULL, 0, 0, '2025-07-08 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733938+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1280a159-acb0-50e1-ad87-1ed0ff1e3f45', '2022-02-16', '2025-07-26', 24.8869, 8.3095, 8.27, 1, -13700, NULL, -13700, 0, 0, '2025-06-28 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733948+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'e0f959ee-eb77-57de-b3af-acdecf679e70', '2022-02-16', '2025-07-26', 92.2831, 2.9545, 86.37, 88, 234000, 52600, -54000, 0, 0, '2025-07-24 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733951+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', '2022-02-16', '2025-07-26', 39.8313, 8.1904, 23.45, 3, 77900, 60500, -18900, 0, 0, '2025-07-22 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733954+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '41fb9cad-7e28-5e8f-82aa-04f46375556f', '2022-02-16', '2025-07-26', 94.2402, 3.2247, 87.79, 78, 981700, 63300, -39600, 0, 0, '2025-07-24 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733957+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', 'a9ba7c65-bc70-51dc-9999-bcb9a7e5bf13', '2022-02-16', '2025-07-26', 41.3662, 8.2408, 24.88, 2, 19900, 15200, NULL, 0, 0, '2025-07-22 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.73396+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', '2022-02-16', '2025-07-26', 87.9312, 3.7254, 80.48, 32, -154000, 29100, -35600, 0, 0, '2025-07-21 04:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733963+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', '2022-02-16', '2025-07-26', 37.4385, 7.8802, 21.68, 4, -55500, NULL, -31500, 0, 0, '2025-07-22 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733966+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '4648919d-82d6-57f5-ba59-453f3a2863f6', '2022-02-16', '2025-07-26', 90.6134, 3.0143, 84.58, 96, 748900, 56800, -38300, 0, 0, '2025-07-24 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733968+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '25893192-bd36-596c-874d-1a9cdb6ea3cb', '2022-02-16', '2025-07-26', 74.5979, 5.8802, 62.84, 15, 4456, 39600, -33700, 0, 0, '2025-07-10 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733971+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819'),
	('f5bae0d7a2078f90450925c6f1b5a258df10c0d78b79e2fe8ac374e4c450444f', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', '2022-02-16', '2025-07-26', 89.9672, 2.9740, 84.02, 92, 104200, 47000, -37200, 0, 0, '2025-07-24 01:00:00+00', NULL, NULL, NULL, NULL, NULL, '2025-07-26 22:18:51.733974+00', '722dfedcccc236332e8ef18fde8d8736cb90a105220d1892350dbd41a9ea1819');


--
-- Data for Name: current_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: game_seats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."game_seats" ("game_id", "seat", "player_id", "final_score") VALUES
	('bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 1900),
	('bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 32100),
	('bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', 'west', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 28300),
	('bf9e7f6c-c9c1-5716-b737-5c86fe82d1fd', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 37700),
	('1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 11800),
	('1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 36800),
	('1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 6800),
	('1267036f-0c35-5aa2-bc7c-ac9c3ac3ea79', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 44600),
	('665307c6-fb2e-5cc6-880a-32e9b3b05b1b', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 27700),
	('665307c6-fb2e-5cc6-880a-32e9b3b05b1b', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 30000),
	('665307c6-fb2e-5cc6-880a-32e9b3b05b1b', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 41800),
	('665307c6-fb2e-5cc6-880a-32e9b3b05b1b', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 500),
	('f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 21000),
	('f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 33500),
	('f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 17600),
	('f1849c8f-e8d4-5689-8b5b-5efb37c0a37e', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 27900),
	('65891a41-3406-5aa1-a515-c350ac77af7d', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 60200),
	('65891a41-3406-5aa1-a515-c350ac77af7d', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 16200),
	('65891a41-3406-5aa1-a515-c350ac77af7d', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 24100),
	('65891a41-3406-5aa1-a515-c350ac77af7d', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -500),
	('8cd9475a-9305-53a0-ab3c-5a0222e70002', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 23000),
	('8cd9475a-9305-53a0-ab3c-5a0222e70002', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 47300),
	('8cd9475a-9305-53a0-ab3c-5a0222e70002', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 29900),
	('8cd9475a-9305-53a0-ab3c-5a0222e70002', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -200),
	('837b1bc9-9443-5b3e-99de-140420614004', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 30000),
	('837b1bc9-9443-5b3e-99de-140420614004', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 7600),
	('837b1bc9-9443-5b3e-99de-140420614004', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 37000),
	('837b1bc9-9443-5b3e-99de-140420614004', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 25400),
	('97e1b390-3567-5ca5-a5dc-db247cf1130b', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -7200),
	('97e1b390-3567-5ca5-a5dc-db247cf1130b', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 45600),
	('97e1b390-3567-5ca5-a5dc-db247cf1130b', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 23700),
	('97e1b390-3567-5ca5-a5dc-db247cf1130b', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 37900),
	('620d1dac-a9dd-519c-937f-76ef71d90692', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -200),
	('620d1dac-a9dd-519c-937f-76ef71d90692', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 10900),
	('620d1dac-a9dd-519c-937f-76ef71d90692', 'west', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 44100),
	('620d1dac-a9dd-519c-937f-76ef71d90692', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 45200),
	('db8e2173-19ae-51eb-ab30-4624f440a0aa', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 59200),
	('db8e2173-19ae-51eb-ab30-4624f440a0aa', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 10600),
	('db8e2173-19ae-51eb-ab30-4624f440a0aa', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 3800),
	('db8e2173-19ae-51eb-ab30-4624f440a0aa', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 26400),
	('13933ee7-a2ab-56ef-a29b-7e82107d5534', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 11100),
	('13933ee7-a2ab-56ef-a29b-7e82107d5534', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 6400),
	('13933ee7-a2ab-56ef-a29b-7e82107d5534', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 25000),
	('13933ee7-a2ab-56ef-a29b-7e82107d5534', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 57500),
	('2c4becaf-1a3d-5600-9cd9-b01c3f901faf', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 51100),
	('2c4becaf-1a3d-5600-9cd9-b01c3f901faf', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -1200),
	('2c4becaf-1a3d-5600-9cd9-b01c3f901faf', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 21100),
	('2c4becaf-1a3d-5600-9cd9-b01c3f901faf', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 29000),
	('5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', 'east', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 18800),
	('5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 31500),
	('5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 28800),
	('5e4098cd-2aae-5b3f-809e-01e73d1ef2fb', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 19900),
	('11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 36200),
	('11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -1700),
	('11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 26500),
	('11c8e494-1e5b-57c1-9dba-1ebdae97e5aa', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 39000),
	('bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 24800),
	('bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', -1200),
	('bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', 'west', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 19100),
	('bcd29df1-dd0d-5103-8d26-13bf83e0a7ef', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 57300),
	('ac4f28f1-eacf-5a01-92d0-c84995f2af28', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 1300),
	('ac4f28f1-eacf-5a01-92d0-c84995f2af28', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 29800),
	('ac4f28f1-eacf-5a01-92d0-c84995f2af28', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 45900),
	('ac4f28f1-eacf-5a01-92d0-c84995f2af28', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 23000),
	('e2189703-9dc9-587c-ac9e-dc6222fd9dde', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 17400),
	('e2189703-9dc9-587c-ac9e-dc6222fd9dde', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 21300),
	('e2189703-9dc9-587c-ac9e-dc6222fd9dde', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 46100),
	('e2189703-9dc9-587c-ac9e-dc6222fd9dde', 'north', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 15200),
	('d9e38d15-c693-5be6-af88-e00a73b2b026', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 42500),
	('d9e38d15-c693-5be6-af88-e00a73b2b026', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 31100),
	('d9e38d15-c693-5be6-af88-e00a73b2b026', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -4200),
	('d9e38d15-c693-5be6-af88-e00a73b2b026', 'north', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 30600),
	('c222c83a-c3fa-5d08-bdf5-31b334096494', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 25000),
	('c222c83a-c3fa-5d08-bdf5-31b334096494', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 8700),
	('c222c83a-c3fa-5d08-bdf5-31b334096494', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 38800),
	('c222c83a-c3fa-5d08-bdf5-31b334096494', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 27500),
	('318e215a-1803-5b6e-95f8-5a67ec15ed3e', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 23900),
	('318e215a-1803-5b6e-95f8-5a67ec15ed3e', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 10900),
	('318e215a-1803-5b6e-95f8-5a67ec15ed3e', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 22500),
	('318e215a-1803-5b6e-95f8-5a67ec15ed3e', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 42700),
	('940e2b02-0412-548c-8d4e-cc6c0831709c', 'east', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 33700),
	('940e2b02-0412-548c-8d4e-cc6c0831709c', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 38900),
	('940e2b02-0412-548c-8d4e-cc6c0831709c', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 14300),
	('940e2b02-0412-548c-8d4e-cc6c0831709c', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 13100),
	('24354d65-e884-5972-bba0-d8b62f8404f8', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 28100),
	('24354d65-e884-5972-bba0-d8b62f8404f8', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 17400),
	('d037a1a5-7b25-50a4-8463-f3fcaebb447a', 'east', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 19500),
	('d037a1a5-7b25-50a4-8463-f3fcaebb447a', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 14500),
	('d037a1a5-7b25-50a4-8463-f3fcaebb447a', 'west', 'a9ba7c65-bc70-51dc-9999-bcb9a7e5bf13', 19700),
	('d037a1a5-7b25-50a4-8463-f3fcaebb447a', 'north', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 46300),
	('7d0189eb-841c-5b75-a9e7-794e8b1026d6', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 21400),
	('7d0189eb-841c-5b75-a9e7-794e8b1026d6', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -2000),
	('7d0189eb-841c-5b75-a9e7-794e8b1026d6', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 21000),
	('7d0189eb-841c-5b75-a9e7-794e8b1026d6', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 59600),
	('81f365b6-d57b-50be-a7a3-74aa92fa6cb6', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 20900),
	('81f365b6-d57b-50be-a7a3-74aa92fa6cb6', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 23500),
	('81f365b6-d57b-50be-a7a3-74aa92fa6cb6', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 57000),
	('81f365b6-d57b-50be-a7a3-74aa92fa6cb6', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -1400),
	('725e8d47-8e87-584c-9686-419cc0f4f5d2', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 17600),
	('725e8d47-8e87-584c-9686-419cc0f4f5d2', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 17400),
	('725e8d47-8e87-584c-9686-419cc0f4f5d2', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 40600),
	('725e8d47-8e87-584c-9686-419cc0f4f5d2', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 24400),
	('89017112-f4cb-5e64-9b72-30afd2a4c7a3', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 36600),
	('89017112-f4cb-5e64-9b72-30afd2a4c7a3', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 11700),
	('89017112-f4cb-5e64-9b72-30afd2a4c7a3', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 17200),
	('89017112-f4cb-5e64-9b72-30afd2a4c7a3', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 34500),
	('921bfb46-38fa-50a7-a2cf-3493764f40bb', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 22000),
	('921bfb46-38fa-50a7-a2cf-3493764f40bb', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 51200),
	('921bfb46-38fa-50a7-a2cf-3493764f40bb', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -1000),
	('921bfb46-38fa-50a7-a2cf-3493764f40bb', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 27800),
	('e067b234-69ed-5901-a447-bbeec3b7d9a5', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 10200),
	('e067b234-69ed-5901-a447-bbeec3b7d9a5', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 26700),
	('e067b234-69ed-5901-a447-bbeec3b7d9a5', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 59800),
	('e067b234-69ed-5901-a447-bbeec3b7d9a5', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 3300),
	('95ea9da3-7669-50e9-9be2-da28f4fd8e89', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 14800),
	('95ea9da3-7669-50e9-9be2-da28f4fd8e89', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 6600),
	('95ea9da3-7669-50e9-9be2-da28f4fd8e89', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 25000),
	('95ea9da3-7669-50e9-9be2-da28f4fd8e89', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 53600),
	('b662c79b-6c94-5ab8-af06-d639c3fbc752', 'east', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 2400),
	('b662c79b-6c94-5ab8-af06-d639c3fbc752', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 23300),
	('b662c79b-6c94-5ab8-af06-d639c3fbc752', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 42000),
	('b662c79b-6c94-5ab8-af06-d639c3fbc752', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 32300),
	('f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 19500),
	('f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 20200),
	('f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 28200),
	('f0b033a1-bc8a-5c5b-a706-3a1e69ca4bb1', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 32100),
	('2e76a9a0-439c-5595-a5c0-fe64d102ace1', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 1600),
	('2e76a9a0-439c-5595-a5c0-fe64d102ace1', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 31500),
	('2e76a9a0-439c-5595-a5c0-fe64d102ace1', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 11500),
	('2e76a9a0-439c-5595-a5c0-fe64d102ace1', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 54400),
	('dbab9273-281f-5d15-a826-75a17761fb93', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 33100),
	('dbab9273-281f-5d15-a826-75a17761fb93', 'south', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 31300),
	('dbab9273-281f-5d15-a826-75a17761fb93', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 40900),
	('dbab9273-281f-5d15-a826-75a17761fb93', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -6300),
	('f5dd37db-c259-5150-8bb5-0c892f428202', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -1400),
	('f5dd37db-c259-5150-8bb5-0c892f428202', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 16000),
	('f5dd37db-c259-5150-8bb5-0c892f428202', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 46500),
	('f5dd37db-c259-5150-8bb5-0c892f428202', 'north', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 37900),
	('dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 33600),
	('dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 20500),
	('dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 23700),
	('dbd77ca2-ef1c-56be-8e26-0f87c8d9a052', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 22200),
	('fa572b89-217a-5a39-ac92-116264a44421', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 23800),
	('fa572b89-217a-5a39-ac92-116264a44421', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 39200),
	('fa572b89-217a-5a39-ac92-116264a44421', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 24000),
	('fa572b89-217a-5a39-ac92-116264a44421', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 11100),
	('1e64cd97-9855-5e48-a18a-3d2365f35e44', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 30100),
	('1e64cd97-9855-5e48-a18a-3d2365f35e44', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -6300),
	('1e64cd97-9855-5e48-a18a-3d2365f35e44', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 39900),
	('1e64cd97-9855-5e48-a18a-3d2365f35e44', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 36300),
	('6eb38f09-3535-59b6-96fa-da624df9cf07', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 52300),
	('6eb38f09-3535-59b6-96fa-da624df9cf07', 'south', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 56),
	('6eb38f09-3535-59b6-96fa-da624df9cf07', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 10200),
	('6eb38f09-3535-59b6-96fa-da624df9cf07', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 31900),
	('d76cf4fb-25ed-5edc-b030-096d6dda995a', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 16800),
	('d76cf4fb-25ed-5edc-b030-096d6dda995a', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 10800),
	('d76cf4fb-25ed-5edc-b030-096d6dda995a', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 24200),
	('d76cf4fb-25ed-5edc-b030-096d6dda995a', 'north', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 48200),
	('686b01f7-ab01-52f5-bd21-d1a3a2461336', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 25000),
	('686b01f7-ab01-52f5-bd21-d1a3a2461336', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 10300),
	('686b01f7-ab01-52f5-bd21-d1a3a2461336', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 42200),
	('686b01f7-ab01-52f5-bd21-d1a3a2461336', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 22500),
	('0dae0e21-fbc4-5335-a2a0-b86adb38d416', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 43300),
	('0dae0e21-fbc4-5335-a2a0-b86adb38d416', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 32400),
	('0dae0e21-fbc4-5335-a2a0-b86adb38d416', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', -9600),
	('0dae0e21-fbc4-5335-a2a0-b86adb38d416', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 33900),
	('25003272-4012-52fd-a4ef-d9f199ec9df0', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 16600),
	('25003272-4012-52fd-a4ef-d9f199ec9df0', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 29000),
	('25003272-4012-52fd-a4ef-d9f199ec9df0', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 38100),
	('25003272-4012-52fd-a4ef-d9f199ec9df0', 'north', '1280a159-acb0-50e1-ad87-1ed0ff1e3f45', 16300),
	('24354d65-e884-5972-bba0-d8b62f8404f8', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 24000),
	('24354d65-e884-5972-bba0-d8b62f8404f8', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 30500),
	('cf400b5f-0704-50cd-8e72-ec50152558ca', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 26900),
	('cf400b5f-0704-50cd-8e72-ec50152558ca', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 20300),
	('cf400b5f-0704-50cd-8e72-ec50152558ca', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 11600),
	('cf400b5f-0704-50cd-8e72-ec50152558ca', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 41200),
	('569b3f5c-9390-5815-a777-464b58a36d03', 'east', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 49600),
	('569b3f5c-9390-5815-a777-464b58a36d03', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 6600),
	('569b3f5c-9390-5815-a777-464b58a36d03', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 18700),
	('569b3f5c-9390-5815-a777-464b58a36d03', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 25100),
	('8ca74cf4-6317-5054-ab0a-6662b05edbae', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', -1000),
	('8ca74cf4-6317-5054-ab0a-6662b05edbae', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 43000),
	('8ca74cf4-6317-5054-ab0a-6662b05edbae', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 33000),
	('8ca74cf4-6317-5054-ab0a-6662b05edbae', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 25000),
	('64185acd-eb59-5bcc-ba91-24d06652ae4b', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 56500),
	('64185acd-eb59-5bcc-ba91-24d06652ae4b', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 21500),
	('64185acd-eb59-5bcc-ba91-24d06652ae4b', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -1500),
	('64185acd-eb59-5bcc-ba91-24d06652ae4b', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 23500),
	('c0719e9f-8918-5c27-bd4b-4330b9b685d3', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 38700),
	('c0719e9f-8918-5c27-bd4b-4330b9b685d3', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 9400),
	('c0719e9f-8918-5c27-bd4b-4330b9b685d3', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 33400),
	('c0719e9f-8918-5c27-bd4b-4330b9b685d3', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 18500),
	('6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', -3700),
	('6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 14700),
	('6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 28600),
	('6b322655-3e69-5cfa-a88f-cfcfd8f0aeab', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 60400),
	('de3de582-51f6-5bde-a77d-50a8d8f1340f', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 21400),
	('de3de582-51f6-5bde-a77d-50a8d8f1340f', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 35300),
	('de3de582-51f6-5bde-a77d-50a8d8f1340f', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 19300),
	('de3de582-51f6-5bde-a77d-50a8d8f1340f', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 24000),
	('cb102789-b201-5736-81ae-a100609af52c', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 23500),
	('8ac6794c-0218-590d-8c14-b125517f3842', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 14400),
	('8ac6794c-0218-590d-8c14-b125517f3842', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 40100),
	('8ac6794c-0218-590d-8c14-b125517f3842', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 42700),
	('8ac6794c-0218-590d-8c14-b125517f3842', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 2800),
	('afa41ab0-b245-5c00-afdd-2a2dd831e7d8', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 11300),
	('afa41ab0-b245-5c00-afdd-2a2dd831e7d8', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 28800),
	('afa41ab0-b245-5c00-afdd-2a2dd831e7d8', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 9300),
	('afa41ab0-b245-5c00-afdd-2a2dd831e7d8', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 50600),
	('c810907a-47be-58a8-8324-2b65af37c6a2', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 16700),
	('7f45b742-9d84-56d2-a1ca-78fb16ceefc6', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 30200),
	('7f45b742-9d84-56d2-a1ca-78fb16ceefc6', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 35400),
	('7f45b742-9d84-56d2-a1ca-78fb16ceefc6', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 34900),
	('7f45b742-9d84-56d2-a1ca-78fb16ceefc6', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -500),
	('5d17816d-6a56-5949-b242-f2e5b0101ea1', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 52900),
	('5d17816d-6a56-5949-b242-f2e5b0101ea1', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -4800),
	('5d17816d-6a56-5949-b242-f2e5b0101ea1', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 25000),
	('5d17816d-6a56-5949-b242-f2e5b0101ea1', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 26900),
	('07e55756-4c60-5bf6-a0b9-bbd6e5607582', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 14000),
	('07e55756-4c60-5bf6-a0b9-bbd6e5607582', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 44300),
	('07e55756-4c60-5bf6-a0b9-bbd6e5607582', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', -100),
	('07e55756-4c60-5bf6-a0b9-bbd6e5607582', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 41800),
	('19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -4900),
	('19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 35700),
	('19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 20600),
	('19fefdc0-6bb2-5e3b-b91b-c7a0444a33ab', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 40900),
	('e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 49000),
	('e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 47900),
	('e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', -900),
	('e6f81cac-b3cd-5dc4-98a9-54dddbd72ff6', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 4000),
	('e8350662-7801-5854-8b51-06e97afc0234', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 13900),
	('e8350662-7801-5854-8b51-06e97afc0234', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -200),
	('e8350662-7801-5854-8b51-06e97afc0234', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 44500),
	('e8350662-7801-5854-8b51-06e97afc0234', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 41500),
	('5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 30200),
	('5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 38200),
	('5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 10000),
	('5cb6bbfd-ced3-592b-a5a5-8000c6435e4b', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 21600),
	('884293c8-ef53-5e5a-a6ff-58a15a4a81fa', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 42400),
	('884293c8-ef53-5e5a-a6ff-58a15a4a81fa', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 38800),
	('884293c8-ef53-5e5a-a6ff-58a15a4a81fa', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 2600),
	('884293c8-ef53-5e5a-a6ff-58a15a4a81fa', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 16200),
	('4ec5075e-1429-537e-96c3-3c4065f81169', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 34600),
	('4ec5075e-1429-537e-96c3-3c4065f81169', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 46300),
	('4ec5075e-1429-537e-96c3-3c4065f81169', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -600),
	('4ec5075e-1429-537e-96c3-3c4065f81169', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 16800),
	('432cd5d2-9a84-5e50-83b9-8750002b4e1a', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 17200),
	('432cd5d2-9a84-5e50-83b9-8750002b4e1a', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 5800),
	('432cd5d2-9a84-5e50-83b9-8750002b4e1a', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 23900),
	('432cd5d2-9a84-5e50-83b9-8750002b4e1a', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 53100),
	('fe8f46f4-7f20-5b2c-92a8-b6334db3db53', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 45400),
	('fe8f46f4-7f20-5b2c-92a8-b6334db3db53', 'south', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 19000),
	('fe8f46f4-7f20-5b2c-92a8-b6334db3db53', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 42900),
	('fe8f46f4-7f20-5b2c-92a8-b6334db3db53', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', -7300),
	('1d5ac978-b268-546a-8cc8-85b42e977488', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -6300),
	('1d5ac978-b268-546a-8cc8-85b42e977488', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 33000),
	('1d5ac978-b268-546a-8cc8-85b42e977488', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 52600),
	('1d5ac978-b268-546a-8cc8-85b42e977488', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 20700),
	('1872b77b-bb96-55d4-a8ff-25a717bbf802', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 30200),
	('1872b77b-bb96-55d4-a8ff-25a717bbf802', 'south', '25893192-bd36-596c-874d-1a9cdb6ea3cb', -3700),
	('1872b77b-bb96-55d4-a8ff-25a717bbf802', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 44100),
	('1872b77b-bb96-55d4-a8ff-25a717bbf802', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 29400),
	('484d6094-bec7-5a51-b572-65f589543f08', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -4100),
	('484d6094-bec7-5a51-b572-65f589543f08', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 10900),
	('484d6094-bec7-5a51-b572-65f589543f08', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 63100),
	('484d6094-bec7-5a51-b572-65f589543f08', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 30100),
	('439c525f-39e5-5350-9567-5d133f705ff3', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 8400),
	('439c525f-39e5-5350-9567-5d133f705ff3', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 6800),
	('439c525f-39e5-5350-9567-5d133f705ff3', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 46100),
	('439c525f-39e5-5350-9567-5d133f705ff3', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 38700),
	('f2dd1e4e-7118-54df-ae7e-09e82896a33f', 'east', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 21900),
	('f2dd1e4e-7118-54df-ae7e-09e82896a33f', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 34300),
	('f2dd1e4e-7118-54df-ae7e-09e82896a33f', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 21200),
	('f2dd1e4e-7118-54df-ae7e-09e82896a33f', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 22600),
	('a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 22400),
	('a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 35300),
	('a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 41000),
	('a2d5ad46-fadc-5817-aec3-4eb2b6e2eaa8', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 1300),
	('e53af200-a15c-5ae8-b492-d37f3731fbba', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 39700),
	('e53af200-a15c-5ae8-b492-d37f3731fbba', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 1100),
	('e53af200-a15c-5ae8-b492-d37f3731fbba', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 36600),
	('e53af200-a15c-5ae8-b492-d37f3731fbba', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 22600),
	('5866e64e-3e79-516e-acd4-5f03c9ce4683', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 20800),
	('5866e64e-3e79-516e-acd4-5f03c9ce4683', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 32000),
	('5866e64e-3e79-516e-acd4-5f03c9ce4683', 'west', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 29500),
	('5866e64e-3e79-516e-acd4-5f03c9ce4683', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 17700),
	('13677aba-ae2d-563a-aedd-60ab8bf265ab', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 33000),
	('13677aba-ae2d-563a-aedd-60ab8bf265ab', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 41200),
	('13677aba-ae2d-563a-aedd-60ab8bf265ab', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 9100),
	('13677aba-ae2d-563a-aedd-60ab8bf265ab', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 16700),
	('3932216e-62be-5fce-a18b-090cdd53a602', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 8600),
	('3932216e-62be-5fce-a18b-090cdd53a602', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 3400),
	('3932216e-62be-5fce-a18b-090cdd53a602', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 46200),
	('3932216e-62be-5fce-a18b-090cdd53a602', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 41800),
	('409e800a-9475-5b12-a626-fd867f87fc8b', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 35600),
	('409e800a-9475-5b12-a626-fd867f87fc8b', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 15100),
	('409e800a-9475-5b12-a626-fd867f87fc8b', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 10700),
	('409e800a-9475-5b12-a626-fd867f87fc8b', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 38600),
	('6e629696-25f5-5eee-a8d1-343a0036243c', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 29400),
	('6e629696-25f5-5eee-a8d1-343a0036243c', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 28800),
	('6e629696-25f5-5eee-a8d1-343a0036243c', 'west', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 8800),
	('6e629696-25f5-5eee-a8d1-343a0036243c', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 33000),
	('c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 20300),
	('c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 24200),
	('c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 21900),
	('c5eede50-73e0-5b6a-ab0e-7d0f89274c7a', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 33600),
	('cb102789-b201-5736-81ae-a100609af52c', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 13600),
	('cb102789-b201-5736-81ae-a100609af52c', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 15500),
	('cb102789-b201-5736-81ae-a100609af52c', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 47400),
	('8003fc6a-dd76-48f7-b8e8-cb40cd9899c9', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', NULL),
	('8003fc6a-dd76-48f7-b8e8-cb40cd9899c9', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', NULL),
	('8003fc6a-dd76-48f7-b8e8-cb40cd9899c9', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', NULL),
	('8003fc6a-dd76-48f7-b8e8-cb40cd9899c9', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', NULL),
	('c810907a-47be-58a8-8324-2b65af37c6a2', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 24900),
	('c810907a-47be-58a8-8324-2b65af37c6a2', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 24100),
	('c810907a-47be-58a8-8324-2b65af37c6a2', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 34300),
	('08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 13100),
	('08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 36100),
	('08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 26800),
	('08b5ce58-bb23-5ad8-84ad-fbfbb8405e6b', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 24000),
	('05312148-5044-5883-9e31-13df14ae493c', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 24100),
	('05312148-5044-5883-9e31-13df14ae493c', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 16500),
	('05312148-5044-5883-9e31-13df14ae493c', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 58300),
	('05312148-5044-5883-9e31-13df14ae493c', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -9000),
	('ae412872-7421-520e-92d1-9529cb07b68b', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 35400),
	('ae412872-7421-520e-92d1-9529cb07b68b', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 22900),
	('ae412872-7421-520e-92d1-9529cb07b68b', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 39000),
	('ae412872-7421-520e-92d1-9529cb07b68b', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', -5300),
	('9a756395-d775-5c33-97cb-3e0463e0d8e9', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 18100),
	('9a756395-d775-5c33-97cb-3e0463e0d8e9', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 40400),
	('9a756395-d775-5c33-97cb-3e0463e0d8e9', 'west', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 6000),
	('9a756395-d775-5c33-97cb-3e0463e0d8e9', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 35500),
	('4b857ba1-a75c-5e1c-a687-36483afe4686', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 46300),
	('4b857ba1-a75c-5e1c-a687-36483afe4686', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 30600),
	('4b857ba1-a75c-5e1c-a687-36483afe4686', 'west', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', -1500),
	('4b857ba1-a75c-5e1c-a687-36483afe4686', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 24600),
	('4ce633c1-013d-56d3-8769-34f5d6c47e1c', 'east', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 23200),
	('4ce633c1-013d-56d3-8769-34f5d6c47e1c', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 35200),
	('4ce633c1-013d-56d3-8769-34f5d6c47e1c', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 18900),
	('4ce633c1-013d-56d3-8769-34f5d6c47e1c', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 22700),
	('d10bbe7a-ed83-552e-a52f-72d4cfafb2bc', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 22700),
	('d10bbe7a-ed83-552e-a52f-72d4cfafb2bc', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 32800),
	('d10bbe7a-ed83-552e-a52f-72d4cfafb2bc', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 7200),
	('d10bbe7a-ed83-552e-a52f-72d4cfafb2bc', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 37300),
	('68a4aa20-5756-53df-afac-89ebd5914a31', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 15700),
	('68a4aa20-5756-53df-afac-89ebd5914a31', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 64300),
	('68a4aa20-5756-53df-afac-89ebd5914a31', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 14800),
	('68a4aa20-5756-53df-afac-89ebd5914a31', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 5200),
	('337edf01-4b3b-5adf-b680-854f079e09f5', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 22600),
	('337edf01-4b3b-5adf-b680-854f079e09f5', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 6100),
	('337edf01-4b3b-5adf-b680-854f079e09f5', 'west', 'a9ba7c65-bc70-51dc-9999-bcb9a7e5bf13', 30200),
	('337edf01-4b3b-5adf-b680-854f079e09f5', 'north', '98fd574d-56a3-5fe3-9176-5f152bade922', 41100),
	('bfa57cca-b9f6-5900-a55a-1d4c85b42c04', 'east', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 70500),
	('bfa57cca-b9f6-5900-a55a-1d4c85b42c04', 'south', '25893192-bd36-596c-874d-1a9cdb6ea3cb', 20400),
	('bfa57cca-b9f6-5900-a55a-1d4c85b42c04', 'west', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', -1500),
	('bfa57cca-b9f6-5900-a55a-1d4c85b42c04', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 4600),
	('2433425c-fea3-5cf2-b773-d2b9deb14816', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 28300),
	('2433425c-fea3-5cf2-b773-d2b9deb14816', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 39600),
	('2433425c-fea3-5cf2-b773-d2b9deb14816', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 12300),
	('2433425c-fea3-5cf2-b773-d2b9deb14816', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 19800),
	('16f861b3-561b-5449-9fc8-0132a453342f', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 22400),
	('16f861b3-561b-5449-9fc8-0132a453342f', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 27000),
	('16f861b3-561b-5449-9fc8-0132a453342f', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 3700),
	('16f861b3-561b-5449-9fc8-0132a453342f', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 46900),
	('0023192b-2952-5d5a-8bb5-480d68c696f0', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 23000),
	('0023192b-2952-5d5a-8bb5-480d68c696f0', 'south', '4648919d-82d6-57f5-ba59-453f3a2863f6', 23000),
	('0023192b-2952-5d5a-8bb5-480d68c696f0', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 34700),
	('0023192b-2952-5d5a-8bb5-480d68c696f0', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 19300),
	('75cf6929-633c-5e31-af5e-c08c17f98281', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 22800),
	('75cf6929-633c-5e31-af5e-c08c17f98281', 'south', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 17100),
	('75cf6929-633c-5e31-af5e-c08c17f98281', 'west', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 28400),
	('75cf6929-633c-5e31-af5e-c08c17f98281', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 31700),
	('6529487a-8c53-5cb7-96fe-779c808c5dda', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 25600),
	('6529487a-8c53-5cb7-96fe-779c808c5dda', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 14500),
	('6529487a-8c53-5cb7-96fe-779c808c5dda', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 28400),
	('6529487a-8c53-5cb7-96fe-779c808c5dda', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 31500),
	('27fbc1cf-7f08-531a-b808-7384f372268e', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 18000),
	('27fbc1cf-7f08-531a-b808-7384f372268e', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 33300),
	('27fbc1cf-7f08-531a-b808-7384f372268e', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 7800),
	('27fbc1cf-7f08-531a-b808-7384f372268e', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 40900),
	('ee8a3866-67b8-56b3-adcf-dbe7b485217b', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 28200),
	('ee8a3866-67b8-56b3-adcf-dbe7b485217b', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', -4800),
	('ee8a3866-67b8-56b3-adcf-dbe7b485217b', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 43400),
	('ee8a3866-67b8-56b3-adcf-dbe7b485217b', 'north', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 25200),
	('ad580682-6aff-5440-94d9-80dec4baef50', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', -8300),
	('ad580682-6aff-5440-94d9-80dec4baef50', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 62600),
	('ad580682-6aff-5440-94d9-80dec4baef50', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 14500),
	('ad580682-6aff-5440-94d9-80dec4baef50', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 31200),
	('6eccc1df-f587-56a5-b98b-4802ae8de5c5', 'east', '4648919d-82d6-57f5-ba59-453f3a2863f6', 15600),
	('6eccc1df-f587-56a5-b98b-4802ae8de5c5', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 39600),
	('6eccc1df-f587-56a5-b98b-4802ae8de5c5', 'west', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 27600),
	('6eccc1df-f587-56a5-b98b-4802ae8de5c5', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 17200),
	('a043432a-12fb-50d3-8028-e9c98d9c60bf', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 57000),
	('a043432a-12fb-50d3-8028-e9c98d9c60bf', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 600),
	('a043432a-12fb-50d3-8028-e9c98d9c60bf', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 12600),
	('a043432a-12fb-50d3-8028-e9c98d9c60bf', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 29800),
	('3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', 'east', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 36900),
	('3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', 'south', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 37100),
	('3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', -100),
	('3d5ba90e-5fb9-5712-8ec2-7e9622e3ea43', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 26100),
	('e15238a8-22ae-533c-8774-4ebe8af3e1ae', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 47000),
	('e15238a8-22ae-533c-8774-4ebe8af3e1ae', 'south', '6e568bf9-78b4-5a2b-b33e-2c6dc5aacb6e', 19400),
	('e15238a8-22ae-533c-8774-4ebe8af3e1ae', 'west', '1815ed78-7ddf-5d2b-93dc-3428eda5ab80', 11100),
	('e15238a8-22ae-533c-8774-4ebe8af3e1ae', 'north', '4648919d-82d6-57f5-ba59-453f3a2863f6', 22500),
	('ed751f6b-8a62-5ef1-8647-504f340863f7', 'east', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 23700),
	('ed751f6b-8a62-5ef1-8647-504f340863f7', 'south', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 18500),
	('ed751f6b-8a62-5ef1-8647-504f340863f7', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 40300),
	('ed751f6b-8a62-5ef1-8647-504f340863f7', 'north', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 15500),
	('fb892ad0-1278-513c-8a86-b644168d7b16', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', 14300),
	('fb892ad0-1278-513c-8a86-b644168d7b16', 'south', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 27800),
	('fb892ad0-1278-513c-8a86-b644168d7b16', 'west', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 19400),
	('fb892ad0-1278-513c-8a86-b644168d7b16', 'north', '41fb9cad-7e28-5e8f-82aa-04f46375556f', 38500),
	('a3525cc8-7143-5356-8c1e-208b4dacb47a', 'east', '4887d8a0-0f71-5ec5-a8c0-ab8c4b967cd6', -5600),
	('a3525cc8-7143-5356-8c1e-208b4dacb47a', 'south', '37bf47c9-0f0f-58c4-8bdf-48cd8d90cef6', 25300),
	('a3525cc8-7143-5356-8c1e-208b4dacb47a', 'west', '4648919d-82d6-57f5-ba59-453f3a2863f6', 66800),
	('a3525cc8-7143-5356-8c1e-208b4dacb47a', 'north', 'e0f959ee-eb77-57de-b3af-acdecf679e70', 13500);


--
-- Data for Name: hands; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: hand_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: materialization_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: rating_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
