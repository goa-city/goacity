--
-- PostgreSQL database dump
--

\restrict fUyS0abiM0y5y2TbuDEBNqVOZq0hmdiF5ITr6oVTEC7CkcCZfDSKAONBM2m20Q2

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    full_name character varying(255),
    email character varying(255),
    password_hash character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    meeting_id integer,
    user_id integer,
    status character varying(50) DEFAULT 'absent'::character varying,
    marked_by integer,
    marked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    user_id integer,
    business_name character varying(255),
    business_type character varying(100),
    industry character varying(100),
    years_in_operation integer,
    employees_count integer,
    website character varying(255),
    summary text
);


--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: collaboration_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collaboration_requests (
    id text NOT NULL,
    requester_id integer NOT NULL,
    provider_id integer NOT NULL,
    type character varying(50) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'Pending_Admin'::character varying NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- Name: form_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_answers (
    id integer NOT NULL,
    response_id integer,
    field_key character varying(100) NOT NULL,
    answer_value text
);


--
-- Name: form_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_answers_id_seq OWNED BY public.form_answers.id;


--
-- Name: form_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_fields (
    id integer NOT NULL,
    form_id integer,
    field_key character varying(100) NOT NULL,
    field_type character varying(50) NOT NULL,
    label character varying(255),
    subtitle text,
    placeholder character varying(255),
    options jsonb,
    is_required smallint DEFAULT 0,
    is_optional smallint DEFAULT 0,
    is_profile smallint DEFAULT 0,
    sort_order integer DEFAULT 0,
    section character varying(100),
    conditions jsonb,
    group_fields jsonb,
    button_text character varying(50) DEFAULT 'Next'::character varying
);


--
-- Name: form_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_fields_id_seq OWNED BY public.form_fields.id;


--
-- Name: form_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_responses (
    id integer NOT NULL,
    form_id integer,
    user_id integer,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'draft'::character varying,
    meeting_id integer
);


--
-- Name: form_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_responses_id_seq OWNED BY public.form_responses.id;


--
-- Name: forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forms (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    is_active smallint DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


--
-- Name: forms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;


--
-- Name: idea_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_feedback (
    id text NOT NULL,
    idea_id text NOT NULL,
    contributor_id integer NOT NULL,
    comment text,
    type character varying(50) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: incubator_ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incubator_ideas (
    id text NOT NULL,
    founder_id integer NOT NULL,
    title character varying(255) NOT NULL,
    problem_statement text,
    vision_purpose text,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    needs_json jsonb,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    category character varying(100),
    type character varying(50) DEFAULT 'Full Time'::character varying,
    description text,
    url character varying(500),
    contact_email character varying(255),
    posted_by integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: meeting_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_resources (
    id integer NOT NULL,
    meeting_id integer NOT NULL,
    title character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    type character varying(50) DEFAULT 'link'::character varying,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: meeting_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meeting_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_resources_id_seq OWNED BY public.meeting_resources.id;


--
-- Name: meeting_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_responses (
    id integer NOT NULL,
    meeting_id integer,
    user_id integer,
    rsvp_status character varying(50) DEFAULT 'none'::character varying,
    checked_in smallint DEFAULT 0,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    paid_amount numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: meeting_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meeting_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_responses_id_seq OWNED BY public.meeting_responses.id;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meetings (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    meeting_date date,
    start_time time without time zone,
    end_time time without time zone,
    location_name character varying(255),
    map_link text,
    is_paid smallint DEFAULT 0,
    payment_qr_image character varying(255),
    feedback_form_id integer,
    archived smallint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stream_id integer,
    payment_amount numeric(10,2) DEFAULT 0.00,
    recap_content text,
    zoom_link character varying(500),
    google_event_id character varying(255)
);


--
-- Name: meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meetings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;


--
-- Name: member_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_profiles (
    id integer NOT NULL,
    user_id integer,
    profile_key character varying(100) NOT NULL,
    profile_value text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: member_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_profiles_id_seq OWNED BY public.member_profiles.id;


--
-- Name: member_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_services (
    id text NOT NULL,
    member_id integer NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL
);


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id integer NOT NULL,
    email character varying(255),
    phone character varying(50),
    dob date,
    gender character varying(50),
    location character varying(255),
    role character varying(50) DEFAULT 'member'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash text,
    is_onboarded smallint DEFAULT 0,
    bio text,
    profile_photo character varying(255),
    linkedin_url character varying(255),
    intro_video character varying(255),
    village character varying(100),
    address text,
    age integer,
    first_name character varying(255),
    last_name character varying(255)
);


--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: mentorship_relations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mentorship_relations (
    id text NOT NULL,
    mentor_id integer NOT NULL,
    mentee_id integer NOT NULL,
    status character varying(50) DEFAULT 'Requested'::character varying NOT NULL,
    type character varying(50) NOT NULL,
    focus_area character varying(255),
    goals_json jsonb,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: needs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.needs (
    id integer NOT NULL,
    user_id integer,
    need_type character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: needs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.needs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: needs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.needs_id_seq OWNED BY public.needs.id;


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    user_id integer,
    offer_type character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offers_id_seq OWNED BY public.offers.id;


--
-- Name: otp_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_table (
    id integer NOT NULL,
    email_or_phone character varying(255) NOT NULL,
    otp_code character varying(10) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    attempts integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: otp_table_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_table_id_seq OWNED BY public.otp_table.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id integer,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer,
    content text,
    media_url character varying(255),
    media_type character varying(50) DEFAULT 'none'::character varying,
    link_title character varying(255),
    link_desc character varying(255),
    link_image character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    author character varying(255) NOT NULL,
    url character varying(500),
    file_path character varying(500),
    file_name character varying(255),
    description text,
    submitted_by integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    content text,
    image_url character varying(500)
);


--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    skill_name character varying(100)
);


--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: stewardship_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stewardship_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    recipient_id integer,
    amount numeric(10,2),
    hours numeric(10,2),
    date date,
    skill_category character varying(100),
    status character varying(50) DEFAULT 'Pending'::character varying NOT NULL,
    impact_note text,
    impact_image_url character varying(255),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stewardship_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stewardship_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stewardship_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stewardship_logs_id_seq OWNED BY public.stewardship_logs.id;


--
-- Name: stewardship_orgs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stewardship_orgs (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    org_type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stewardship_orgs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stewardship_orgs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stewardship_orgs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stewardship_orgs_id_seq OWNED BY public.stewardship_orgs.id;


--
-- Name: stream_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stream_members (
    stream_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: streams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.streams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#6366f1'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    form_id integer
);


--
-- Name: streams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.streams_id_seq OWNED BY public.streams.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- Name: form_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_answers ALTER COLUMN id SET DEFAULT nextval('public.form_answers_id_seq'::regclass);


--
-- Name: form_fields id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fields ALTER COLUMN id SET DEFAULT nextval('public.form_fields_id_seq'::regclass);


--
-- Name: form_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_responses ALTER COLUMN id SET DEFAULT nextval('public.form_responses_id_seq'::regclass);


--
-- Name: forms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: meeting_resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resources ALTER COLUMN id SET DEFAULT nextval('public.meeting_resources_id_seq'::regclass);


--
-- Name: meeting_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_responses ALTER COLUMN id SET DEFAULT nextval('public.meeting_responses_id_seq'::regclass);


--
-- Name: meetings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings ALTER COLUMN id SET DEFAULT nextval('public.meetings_id_seq'::regclass);


--
-- Name: member_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles ALTER COLUMN id SET DEFAULT nextval('public.member_profiles_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: needs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs ALTER COLUMN id SET DEFAULT nextval('public.needs_id_seq'::regclass);


--
-- Name: offers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers ALTER COLUMN id SET DEFAULT nextval('public.offers_id_seq'::regclass);


--
-- Name: otp_table id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_table ALTER COLUMN id SET DEFAULT nextval('public.otp_table_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: post_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: stewardship_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stewardship_logs ALTER COLUMN id SET DEFAULT nextval('public.stewardship_logs_id_seq'::regclass);


--
-- Name: stewardship_orgs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stewardship_orgs ALTER COLUMN id SET DEFAULT nextval('public.stewardship_orgs_id_seq'::regclass);


--
-- Name: streams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streams ALTER COLUMN id SET DEFAULT nextval('public.streams_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, full_name, email, password_hash, role, created_at, updated_at) FROM stdin;
2	Atasha - Admin	atashadmello@gmail.com	$2b$10$vO5snT1Q4Oeo7sYMjVmDhOF9n3jewhXoLBDzzq2A/BlXKGcamGYZy	admin	2026-02-26 15:05:44.189	2026-02-26 15:05:44.189
1	Super Admin	admin@goa.city	$2b$10$FHMv/fOcS/RF6xx3vSxyoeQU1uBr57WOWBXjU6hiAERxgPSh1SjTK	admin	2026-02-13 08:12:22	2026-02-26 18:06:34.307969
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance (id, meeting_id, user_id, status, marked_by, marked_at) FROM stdin;
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.businesses (id, user_id, business_name, business_type, industry, years_in_operation, employees_count, website, summary) FROM stdin;
\.


--
-- Data for Name: collaboration_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.collaboration_requests (id, requester_id, provider_id, type, description, status, created_at) FROM stdin;
8dba3adf-4f34-428e-9053-0577b3eded45	5	3	Gifted	Test data\n	Approved	2026-02-24 11:25:59.01
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_templates (id, title, subject, message, created_at, updated_at) FROM stdin;
1	OTP Login	Your Goa.City Login Code	<p>Hello {{first_name}} {{last_name}},</p><p><br></p><p>To Login to your Goa.City dashboard, please enter the following one-time pass-code:  </p><p><br></p><h1><strong>{{otp_code}}</strong></h1><p><br></p><p>This code will expire in 10 minutes.</p><p>If you did not request this code, you can safely ignore this email.</p><p><br></p><p>Thanks,</p><p>Goa.City</p>	2026-03-09 14:11:34.916748	2026-03-09 14:18:48.863
2	Meeting Notification	New Update: {{meeting_title}}	<p>Hello {{first_name}} {{last_name}}</p><p><br></p><h1>{{meeting_title}}</h1><p><br></p><p style="color: rgb(51, 51, 51); font-family: sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">The meeting&nbsp;<strong>Youth Stream Intro Meeting</strong>&nbsp;scheduled for {{meeting_date}} {{meeting_time}}</p><p style="color: rgb(51, 51, 51); font-family: sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><br></p><p>{{location_name}}</p><p>{{map_link}}</p><p>{{zoom_link}}</p><p><br></p><p>Please confirm your participation here: {{meeting_url}}</p><p><br></p>	2026-03-09 14:51:35.599353	2026-03-09 14:58:31.292
\.


--
-- Data for Name: form_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_answers (id, response_id, field_key, answer_value) FROM stdin;
152	15	business_summary	
153	15	professional_role	
154	15	specialisation	
155	15	skills	[]
156	15	mentoring_interest	
157	15	mentoring_areas	
158	15	share_testimony	false
159	15	conduct_workshop	false
160	15	spiritual_gifts	
161	15	support_interest_types	[]
162	15	target_support_group	
163	15	struggles_overcome	
164	15	business_needs	[]
165	15	marketplace_offers	[]
166	15	profile_photo	null
167	15	linkedin_url	
168	15	awards	
169	15	challenges_overcome	
142	15	dob	2026-03-10
143	15	gender	
144	15	address	
288	20	full_name	Fiona Dsouza
145	15	village	
146	15	business_name	
147	15	business_type	
148	15	industry	
149	15	years_in_operation	
246	18	mentoring_areas	Start ups. Leadership, career
180	16	website	
181	16	business_summary	
182	16	professional_role	
183	16	specialisation	
184	16	skills	[]
185	16	mentoring_interest	
186	16	mentoring_areas	
187	16	share_testimony	false
188	16	conduct_workshop	false
189	16	spiritual_gifts	
190	16	support_interest_types	[]
191	16	target_support_group	
192	16	struggles_overcome	
193	16	business_needs	[]
194	16	marketplace_offers	[]
195	16	profile_photo	null
196	16	linkedin_url	
197	16	awards	
198	16	challenges_overcome	
199	16	youth_role	Pastor 
200	16	age_group	19-25
215	17	skills	[]
216	17	mentoring_interest	
217	17	mentoring_areas	
218	17	share_testimony	true
219	17	conduct_workshop	false
220	17	spiritual_gifts	Teaching
221	17	support_interest_types	["Time","Resources"]
222	17	target_support_group	Young start up
257	18	awards	
170	16	full_name	Stevens Dumpalas
171	16	dob	
172	16	gender	
173	16	address	
174	16	village	
175	16	business_name	
176	16	business_type	
177	16	industry	
178	16	years_in_operation	
179	16	employees_count	
236	18	business_type	Partnership
223	17	struggles_overcome	Shdhjd
224	17	business_needs	[]
225	17	marketplace_offers	["Discounts","Training"]
227	17	linkedin_url	Dhdjdn
228	17	awards	Shhdhd
229	17	challenges_overcome	Shehbd
258	18	challenges_overcome	
226	17	profile_photo	null
255	18	profile_photo	null
150	15	employees_count	
259	19	full_name	John  Samuel
201	17	full_name	Lynnisha Dumpala
231	18	dob	1967-06-24
202	17	dob	2026-02-10
232	18	gender	Male
203	17	gender	Female
204	17	address	Hshs
205	17	village	
206	17	business_name	Shjs
207	17	business_type	Professional
208	17	industry	
209	17	years_in_operation	
210	17	employees_count	
211	17	website	Shshd
212	17	business_summary	Snns
213	17	professional_role	
214	17	specialisation	
239	18	employees_count	16
240	18	website	synergyhospitality.net
242	18	professional_role	Director
243	18	specialisation	Restaurant and Food Business 
245	18	mentoring_interest	Yes
151	15	website	
247	18	share_testimony	true
248	18	conduct_workshop	false
249	18	spiritual_gifts	Teaching, leading
251	18	target_support_group	Young sart up, career guidance
253	18	business_needs	["Branding","Operations","Networking","Manpower"]
254	18	marketplace_offers	["Jobs","Training","Insights","Prayer"]
256	18	linkedin_url	
234	18	village	Panjim
237	18	industry	Hospitality, Food
238	18	years_in_operation	38
289	20	dob	
290	20	gender	
260	19	dob	
261	19	gender	
262	19	address	
263	19	village	
264	19	business_name	
265	19	business_type	
266	19	industry	
267	19	years_in_operation	
268	19	employees_count	
269	19	website	
270	19	business_summary	
271	19	professional_role	
272	19	specialisation	
273	19	skills	[]
308	20	support_interest_types	[]
309	20	target_support_group	
310	20	struggles_overcome	
274	19	mentoring_interest	
275	19	mentoring_areas	
276	19	share_testimony	false
277	19	conduct_workshop	false
278	19	spiritual_gifts	
279	19	support_interest_types	[]
280	19	target_support_group	
281	19	struggles_overcome	
282	19	business_needs	[]
283	19	marketplace_offers	[]
284	19	profile_photo	null
285	19	linkedin_url	
286	19	awards	
287	19	challenges_overcome	
311	20	business_needs	[]
312	20	marketplace_offers	[]
313	20	profile_photo	null
314	20	linkedin_url	
315	20	awards	
316	20	challenges_overcome	
141	15	full_name	Stevens Dumpala
230	18	full_name	Prasad   Paul
233	18	address	H No: B-359/1&2  Hill Town, Old Goa
235	18	business_name	Synergy Hospitality Management Services 
241	18	business_summary	Chef, Consultant, Restaurateur 
244	18	skills	["Leadership","Operations","Project Management"]
250	18	support_interest_types	["Knowledge","Networking","Resources"]
252	18	struggles_overcome	During pandemic, I suffered business loss badly. The Lord redeemed me from all damages
291	20	address	
292	20	village	
293	20	business_name	
294	20	business_type	
295	20	industry	
296	20	years_in_operation	
297	20	employees_count	
298	20	website	
299	20	business_summary	
300	20	professional_role	
301	20	specialisation	
302	20	skills	[]
303	20	mentoring_interest	
304	20	mentoring_areas	
305	20	share_testimony	false
306	20	conduct_workshop	false
307	20	spiritual_gifts	
\.


--
-- Data for Name: form_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_fields (id, form_id, field_key, field_type, label, subtitle, placeholder, options, is_required, is_optional, is_profile, sort_order, section, conditions, group_fields, button_text) FROM stdin;
690	1	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
691	1	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
692	1	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
693	1	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Aldona", "Anjuna", "Aquem", "Arambol", "Bambolim", "Calangute", "Calangute", "Candolim", "Chicalim", "Cortalim", "Davorli", "Mapusa", "Margao", "Navelim", "Panjim", "Ponda", "Porvorim", "Sancoale", "Siolim", "Vasco"]	0	0	1	4	\N	\N	\N	Next
694	1	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
695	1	business_name	text	Business Name	\N	Type your business name...	\N	1	0	1	6	\N	\N	\N	Next
696	1	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant", "NGO"]	1	0	1	7	\N	\N	\N	Next
697	1	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
698	1	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
699	1	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
700	1	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	1	11	\N	\N	\N	Next
701	1	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	1	0	1	12	\N	\N	\N	Next
702	1	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	1	13	\N	\N	\N	Next
703	1	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	1	14	\N	\N	\N	Next
704	1	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	1	15	\N	\N	\N	Next
705	1	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	1	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
706	1	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
707	1	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
708	1	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
709	1	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
710	1	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
711	1	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
712	1	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
713	1	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
714	1	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	25	\N	\N	\N	Next
715	1	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	26	\N	\N	\N	Next
716	1	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	27	\N	\N	\N	Complete
36	3	youth_intro	intro	Welcome to Youth Stream	This is a specific form for Youth members.		\N	0	0	0	0	\N	\N	\N	Next
37	3	youth_role	text	What is your role in the Youth ministry?	\N	e.g. Leader, Member, Volunteer	\N	0	0	1	10	\N	\N	\N	Next
38	3	age_group	dropdown_choice	Which age group do you work with?	\N		["13-15", "16-18", "19-25", "25+"]	0	0	0	20	\N	\N	\N	Next
39	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	0	\N	\N	\N	Start
40	\N	dob	date	When were you born?	\N		\N	1	0	1	10	\N	\N	\N	Next
41	\N	gender	choice	What is your gender?	\N		["Male", "Female", "Other"]	0	0	1	20	\N	\N	\N	Next
42	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	30	\N	\N	\N	Next
43	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	40	\N	\N	\N	Next
44	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	50	\N	\N	\N	Next
45	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	60	\N	\N	\N	Next
46	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	70	\N	\N	\N	Next
47	\N	stats	group_inputs	Scale	\N		\N	0	0	0	80	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
48	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	90	\N	\N	\N	Next
49	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	100	\N	\N	\N	Next
50	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	110	\N	\N	\N	Next
51	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	120	\N	\N	\N	Next
52	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	130	\N	\N	\N	Next
53	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	140	\N	\N	\N	Next
54	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	150	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
55	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	160	\N	\N	\N	Next
56	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	170	\N	\N	\N	Next
57	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	180	\N	\N	\N	Next
58	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	190	\N	\N	\N	Next
59	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	200	\N	\N	\N	Next
60	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	210	\N	\N	\N	Next
61	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	220	\N	\N	\N	Next
62	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	230	\N	\N	\N	Next
63	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	240	\N	\N	\N	Next
64	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	250	\N	\N	\N	Next
65	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	260	\N	\N	\N	Next
66	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	270	\N	\N	\N	Complete
67	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	0	\N	\N	\N	Start
68	\N	dob	date	When were you born?	\N		\N	1	0	1	10	\N	\N	\N	Next
69	\N	gender	choice	What is your gender?	\N		["Male", "Female", "Other"]	0	0	1	20	\N	\N	\N	Next
70	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	30	\N	\N	\N	Next
71	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	40	\N	\N	\N	Next
72	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	50	\N	\N	\N	Next
73	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	60	\N	\N	\N	Next
74	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	70	\N	\N	\N	Next
75	\N	stats	group_inputs	Scale	\N		\N	0	0	0	80	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
76	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	90	\N	\N	\N	Next
77	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	100	\N	\N	\N	Next
78	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	110	\N	\N	\N	Next
79	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	120	\N	\N	\N	Next
80	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	130	\N	\N	\N	Next
81	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	140	\N	\N	\N	Next
82	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	150	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
83	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	160	\N	\N	\N	Next
84	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	170	\N	\N	\N	Next
85	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	180	\N	\N	\N	Next
86	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	190	\N	\N	\N	Next
87	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	200	\N	\N	\N	Next
88	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	210	\N	\N	\N	Next
89	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	220	\N	\N	\N	Next
90	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	230	\N	\N	\N	Next
91	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	240	\N	\N	\N	Next
92	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	250	\N	\N	\N	Next
93	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	260	\N	\N	\N	Next
94	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	270	\N	\N	\N	Complete
95	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	0	\N	\N	\N	Start
96	\N	dob	date	When were you born?	\N		\N	1	0	1	10	\N	\N	\N	Next
97	\N	gender	choice	What is your gender?	\N		["Male", "Female", "Other"]	0	0	1	20	\N	\N	\N	Next
98	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	30	\N	\N	\N	Next
99	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	40	\N	\N	\N	Next
100	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	50	\N	\N	\N	Next
101	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	60	\N	\N	\N	Next
102	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	70	\N	\N	\N	Next
103	\N	stats	group_inputs	Scale	\N		\N	0	0	0	80	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
104	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	90	\N	\N	\N	Next
105	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	100	\N	\N	\N	Next
106	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	110	\N	\N	\N	Next
107	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	120	\N	\N	\N	Next
108	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	130	\N	\N	\N	Next
717	1	profile_photo	file	Profile Photo	\N		\N	0	1	0	28	\N	\N	\N	Next
109	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	140	\N	\N	\N	Next
110	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	150	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
111	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	160	\N	\N	\N	Next
112	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	170	\N	\N	\N	Next
113	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	180	\N	\N	\N	Next
114	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	190	\N	\N	\N	Next
115	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	200	\N	\N	\N	Next
116	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	210	\N	\N	\N	Next
117	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	220	\N	\N	\N	Next
118	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	230	\N	\N	\N	Next
119	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	240	\N	\N	\N	Next
120	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	250	\N	\N	\N	Next
121	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	260	\N	\N	\N	Next
122	\N	challenges_overcome	textarea	Challenges that you faced	\N	Inspire others with your story...	\N	0	1	0	270	\N	\N	\N	Complete
123	\N	q_1771588768719	intro	Hi, Please fill the form	\N		[]	0	0	0	0	\N	\N	\N	Next
124	\N	q_1771588782898	choice	How did you like the program?	Please rate		["Excellent", "Horrible", "It was ok"]	0	0	0	0	\N	\N	\N	Next
126	\N	test_q	text	Test	\N		\N	0	0	0	1	\N	\N	\N	Next
127	\N	q_1771597392360	choice	New Question	\N		[]	0	0	0	2	\N	\N	\N	Next
128	\N	test_q	text	Test	\N		\N	0	0	0	1	\N	\N	\N	Next
129	\N	test_q	text	Testsdsd	\N		\N	0	0	0	1	\N	\N	\N	Next
158	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
159	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
160	\N	gender	choice	What is your gender?	\N		["Male", "Female", "Other"]	0	0	1	3	\N	\N	\N	Next
161	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
162	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
163	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
164	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
165	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
166	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
167	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
168	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
169	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
170	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
171	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
172	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	1	15	\N	\N	\N	Next
173	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	1	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
174	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
175	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
176	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
177	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
178	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
179	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
180	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
181	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
182	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
183	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
184	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
185	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
186	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
187	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
188	\N	gender	choice	What is your gender?	\N		["Male", "Female", "Other"]	0	0	1	3	\N	\N	\N	Next
189	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Aldona", "Anjuna", "Aquem", "Arambol", "Bambolim", "Calangute", "Calangute", "Candolim", "Chicalim", "Cortalim", "Davorli", "Mapusa", "Margao", "Navelim", "Panjim", "Ponda", "Porvorim", "Sancoale", "Siolim", "Vasco"]	1	0	1	4	\N	\N	\N	Next
190	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
191	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	1	6	\N	\N	\N	Next
192	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
193	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	1	8	\N	\N	\N	Next
194	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
195	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
196	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	1	11	\N	\N	\N	Next
197	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	1	12	\N	\N	\N	Next
198	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	1	13	\N	\N	\N	Next
199	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	1	14	\N	\N	\N	Next
200	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	1	15	\N	\N	\N	Next
201	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	1	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
202	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
203	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
204	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
205	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
206	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
207	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	1	22	\N	\N	\N	Next
208	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	1	23	\N	\N	\N	Next
209	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	1	24	\N	\N	\N	Next
210	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	25	\N	\N	\N	Next
211	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	26	\N	\N	\N	Next
212	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	27	\N	\N	\N	Complete
213	\N	profile_photo	file	Profile Photo	\N		\N	0	1	1	28	\N	\N	\N	Next
214	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
215	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
216	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
217	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
218	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
219	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
220	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
221	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
222	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
223	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
224	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
225	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
226	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
227	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
228	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
229	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
230	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
231	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
232	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
233	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
234	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
235	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
236	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
237	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
238	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
239	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
240	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
241	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
242	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
243	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
244	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
245	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
246	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
247	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
248	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
249	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
250	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
251	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
252	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
253	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
254	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
255	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
256	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
257	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
258	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
259	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
260	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
261	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
262	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
263	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
264	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
265	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
266	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
267	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
268	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
269	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
270	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
271	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
272	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
273	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
274	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
275	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
276	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
277	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
278	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
279	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
280	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
281	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
282	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
283	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
284	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
285	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
286	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
287	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
288	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
289	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
290	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
291	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
292	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
293	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
294	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
295	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
296	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
297	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
298	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
299	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
300	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
301	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
302	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
303	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
304	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
305	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
306	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
307	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
308	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
309	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
310	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
311	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
312	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
313	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
314	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
315	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
316	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
317	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
318	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
319	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
320	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
321	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
322	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
323	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
324	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
325	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
326	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
327	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
328	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
329	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
330	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
331	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
332	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
333	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
334	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
335	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
336	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
337	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
338	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
339	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
340	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
341	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
342	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
343	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
344	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
345	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
346	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
347	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
348	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
349	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
350	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
351	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
352	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
353	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
354	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
355	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
356	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
357	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
358	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
359	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
360	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
361	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
362	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
363	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
364	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
365	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
366	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
367	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
368	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
369	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
370	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
371	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
372	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
373	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
374	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
375	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
376	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
377	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
378	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
379	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
380	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
381	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
382	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
383	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
384	\N	gender	choice	What is your gender?	\N		["Male", "Female", "Other"]	0	0	1	3	\N	\N	\N	Next
385	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
386	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
387	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
388	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
389	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
390	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
391	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
392	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
393	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
394	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
395	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
396	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
397	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
398	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
399	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
400	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
401	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
402	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
403	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
404	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
405	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
406	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
407	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
408	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
409	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
410	\N	welcome	intro	Welcome to the Market Place Onboarding	Let's build your profile for the Goa Marketplace. 		\N	0	0	0	1	\N	\N	\N	Start
411	\N	dob	date	When were you born?	\N		\N	1	0	1	2	\N	\N	\N	Next
412	\N	gender	choice	What is your gender?	\N		["Male", "Female"]	0	0	1	3	\N	\N	\N	Next
413	\N	village	dropdown_choice	Where are you based?	Select your location	Select your Village / Town	["Panjim", "Margao", "Vasco", "Mapusa", "Porvorim", "Ponda", "Calangute", "Other"]	0	0	1	4	\N	\N	\N	Next
414	\N	address	text	Full Address	\N	House No, Street / Ward...	\N	0	1	0	5	\N	\N	\N	Next
415	\N	business_name	text	Business Name	\N	Type your business name...	\N	1	0	0	6	\N	\N	\N	Next
416	\N	business_type	choice	Structure	\N		["Proprietor", "Partnership", "Pvt Ltd", "LLP", "Professional", "Consultant"]	0	0	0	7	\N	\N	\N	Next
417	\N	industry	text	Industry	\N	e.g. Tourism, Tech, Logistics...	\N	1	0	0	8	\N	\N	\N	Next
418	\N	stats	group_inputs	Scale	\N		\N	0	0	0	9	\N	\N	[{"name": "years_in_operation", "type": "number", "label": "Years Active"}, {"name": "employees_count", "type": "number", "label": "Team Size"}]	Next
419	\N	website	text	Website	\N	https://yourwebsite.com	\N	0	1	0	10	\N	\N	\N	Next
420	\N	business_summary	textarea	Professional Summary	\N	A brief 3-line description...	\N	1	0	0	11	\N	\N	\N	Next
421	\N	professional_role	choice	Your Role	\N		["Founder", "CEO", "Director", "CXO", "Employee", "Freelancer"]	0	0	0	12	\N	\N	\N	Next
422	\N	specialisation	text	Specialisation	\N	e.g., UI/UX, Tax Law...	\N	1	0	0	13	\N	\N	\N	Next
423	\N	skills	multiselect	Skills & Talents	Select all that apply		["Leadership", "Strategic Thinking", "Finance Management", "Budgeting", "People Development", "Sales & Negotiation", "Marketing", "Digital / Tech Skills", "Operations", "Project Management", "Legal & Compliance", "Public Speaking", "Mentoring", "Creativity", "Problem Solving", "Networking"]	0	0	0	14	\N	\N	\N	Next
424	\N	mentoring_interest	choice	Willing to Mentor?	\N		["Yes", "No", "Occasionally"]	0	0	0	15	\N	\N	\N	Next
425	\N	mentoring_areas	text	Mentoring Areas	\N	e.g., Startups, Leadership...	\N	0	0	0	16	\N	{"field": "mentoring_interest", "value": "No", "operator": "neq"}	\N	Next
426	\N	share_testimony	choice_bool	Share your testimony?	\N		["Yes", "No"]	0	1	0	17	\N	\N	\N	Next
427	\N	conduct_workshop	choice_bool	Conduct a workshop?	\N		["Yes", "No"]	0	1	0	18	\N	\N	\N	Next
428	\N	spiritual_gifts	text	Spiritual Gifts	\N	e.g., Teaching, Giving...	\N	0	1	1	19	\N	\N	\N	Next
429	\N	target_support_group	text	Who would you support?	\N	e.g., Young startups...	\N	0	0	0	20	\N	\N	\N	Next
430	\N	struggles_overcome	textarea	Struggles Overcome	\N	Briefly share a challenge God helped you through...	\N	0	1	0	21	\N	\N	\N	Next
431	\N	support_interest_types	multiselect	Support you can give	\N		["Time", "Resources", "Knowledge", "Networking", "Internships"]	0	1	0	22	\N	\N	\N	Next
432	\N	business_needs	multiselect	Your Needs	\N		["Funding", "Manpower", "Mentorship", "Branding", "Operations", "Networking"]	0	1	0	23	\N	\N	\N	Next
433	\N	marketplace_offers	multiselect	Your Offers	\N		["Investments", "Discounts", "Jobs", "Training", "Insights", "Prayer", "Hosting"]	0	1	0	24	\N	\N	\N	Next
434	\N	profile_photo	file	Profile Photo	\N		\N	0	1	0	25	\N	\N	\N	Next
435	\N	linkedin_url	text	LinkedIn	\N	https://linkedin.com/in/...	\N	0	1	1	26	\N	\N	\N	Next
436	\N	awards	text	Awards	\N	Any key recognition...	\N	0	1	0	27	\N	\N	\N	Next
437	\N	challenges_overcome	textarea	Challenges	\N	Inspire others with your story...	\N	0	1	0	28	\N	\N	\N	Complete
\.


--
-- Data for Name: form_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_responses (id, form_id, user_id, submitted_at, status, meeting_id) FROM stdin;
17	1	3	2026-02-27 01:24:46.395031	completed	\N
18	1	6	2026-02-27 02:45:40.776413	completed	\N
20	1	10	2026-03-07 14:15:08.887202	draft	\N
15	1	5	2026-02-26 15:38:20.044917	draft	\N
16	3	5	2026-02-27 00:27:27.567553	completed	\N
19	1	9	2026-02-27 03:10:49.327823	draft	\N
\.


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forms (id, code, title, description, is_active, created_at, updated_at, created_by) FROM stdin;
3	youth	Youth-Onboarding Form	youthonboarding\n	1	2026-02-14 07:18:49	2026-02-14 07:18:49	1
1	mp-onboarding	MP-Onboarding Form	Marketplace onboarding questionnaire for new members	1	2026-02-14 05:20:40	2026-03-06 11:20:24.506473	1
\.


--
-- Data for Name: idea_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.idea_feedback (id, idea_id, contributor_id, comment, type, created_at) FROM stdin;
\.


--
-- Data for Name: incubator_ideas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incubator_ideas (id, founder_id, title, problem_statement, vision_purpose, status, needs_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, title, company, location, category, type, description, url, contact_email, posted_by, status, created_at, updated_at) FROM stdin;
2	Testing New Job Title	Imagefile	Panjim	\N	Full Time	\N	\N	\N	5	approved	2026-02-20 14:17:22.348387	2026-02-20 15:50:16.007715
1	Some job title	Imagefile2	Porvorim	Marketing	Full Time	This is the job description		stevens@s.com	3	approved	2026-02-19 13:31:49	2026-02-20 15:50:42.099524
\.


--
-- Data for Name: meeting_resources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_resources (id, meeting_id, title, url, type, created_at) FROM stdin;
\.


--
-- Data for Name: meeting_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_responses (id, meeting_id, user_id, rsvp_status, checked_in, payment_status, paid_amount, created_at, updated_at) FROM stdin;
3	3	5	\N	1	pending	0.00	2026-02-20 10:50:29.12084	2026-02-20 14:30:50.237858
1	1	5	\N	1	paid_cash	0.00	2026-02-19 08:45:53	2026-02-24 10:15:21.482917
2	2	5	\N	1	pending	0.00	2026-02-19 08:45:56	2026-02-24 10:22:48.829793
6	7	5	going	0	pending	0.00	2026-02-25 09:04:21.896333	2026-02-26 18:01:10.790758
7	7	9	going	0	pending	0.00	2026-02-27 04:00:49.511191	2026-02-27 04:00:49.511191
8	7	6	going	0	pending	0.00	2026-02-27 10:54:17.53284	2026-02-27 10:54:17.53284
9	6	6	going	0	pending	0.00	2026-02-27 10:55:05.945366	2026-02-27 10:55:05.945366
10	8	5	none	1	paid_online	500.00	2026-02-27 14:24:53.816589	2026-02-27 14:24:53.940376
5	6	5	cant_go	0	pending	0.00	2026-02-24 13:11:54.85496	2026-03-06 09:49:29.966202
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meetings (id, title, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_qr_image, feedback_form_id, archived, created_at, updated_at, stream_id, payment_amount, recap_content, zoom_link, google_event_id) FROM stdin;
2	Youth Stream Intro Meeting	\N	2026-02-20	09:00:00	10:00:00	Online	\N	0	\N	3	0	2026-02-19 08:08:17	2026-02-20 14:38:56.585408	2	0.00	\N	\N	\N
1	Monthly Market Place meeting	\N	2026-02-20	09:00:00	10:00:00	GCCI Hall	\N	1	1771487678_Tbc_QR_scan.jpeg	5	0	2026-02-19 07:54:38	2026-02-20 14:49:57.989818	1	500.00	\N	\N	\N
3	Sahaya Sangam CASS	\N	2026-03-05	09:00:00	10:00:00	Methodist Church	\N	0	\N	\N	0	2026-02-19 08:31:05	2026-02-20 14:50:36.33356	7	0.00	\N	\N	\N
5	Final Test Meeting 2	\N	2026-02-20	09:00:00	10:00:00	Test Office 2	null	0	\N	\N	1	2026-02-20 14:40:56.615114	2026-02-23 17:52:12.654165	3	0.00	\N	\N	\N
7	Test paid meeting	\N	2026-04-01	08:00:00	09:00:00	GCCI Hall	\N	1	\N	5	0	2026-02-25 09:03:08.031119	2026-02-25 09:03:08.031119	1	500.00	\N	\N	\N
6	Test meeting	\N	2026-04-03	08:00:00	10:00:00	GCCI Hall	\N	0	\N	5	0	2026-02-24 10:45:32.279048	2026-02-25 09:47:32.135252	1	0.00	\N	\N	\N
8	Market Place Monthly Meeting	\N	2026-02-27	18:30:00	21:30:00	GCCI Hall, Panjim	\N	1	payment_qr_image-1772201609156-863742172.jpeg	5	0	2026-02-27 13:35:43.1741	2026-02-27 14:13:29.156982	1	500.00	\N	\N	\N
11	Youth stream meeting	\N	2026-03-26	19:00:00	21:00:00	\N	\N	0	\N	\N	0	2026-03-09 16:03:54.802075	2026-03-09 16:03:55.661415	2	0.00	\N	\N	g7om4im4e65oqlb3dnuip5rvgk
\.


--
-- Data for Name: member_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_profiles (id, user_id, profile_key, profile_value, updated_at) FROM stdin;
269	6	mentoring_interest	Yes	2026-02-27 02:45:40.812374
294	10	dob		2026-03-07 14:15:08.892965
260	6	dob	1967-06-24	2026-02-27 02:45:40.78175
261	6	gender	Male	2026-02-27 02:45:40.784897
265	6	business_summary	Chef, Consultant, Restaurateur 	2026-02-27 02:45:40.802323
244	3	specialisation		2026-02-27 00:38:51.706664
230	5	youth_role	Pastor 	2026-02-27 00:27:34.05205
201	11	full_name	Atasha Dmello	2026-02-26 18:07:41.37856
202	11	dob	1994-11-26	2026-02-26 18:07:41.380529
203	11	gender	Female	2026-02-26 18:07:41.381985
204	11	address		2026-02-26 18:07:41.383245
205	11	village	Panjim	2026-02-26 18:07:41.384371
206	11	business_name		2026-02-26 18:07:41.385588
245	3	skills	[]	2026-02-27 00:38:51.70771
246	3	mentoring_interest		2026-02-27 00:38:51.708765
247	3	mentoring_areas		2026-02-27 00:38:51.70981
231	3	full_name	Lynnisha Dumpala	2026-02-27 00:38:51.691198
250	3	spiritual_gifts	Teaching	2026-02-27 00:38:51.712998
257	3	linkedin_url	Dhdjdn	2026-02-27 00:38:51.721029
256	3	profile_photo	null	2026-02-27 00:38:51.71991
234	3	address	884/9	2026-02-27 00:38:51.695451
238	3	industry	Charity	2026-02-27 00:38:51.699956
239	3	years_in_operation	2017	2026-02-27 00:38:51.701409
240	3	employees_count	10	2026-02-27 00:38:51.702451
241	3	website	http//:littlelight.in	2026-02-27 00:38:51.703496
207	11	business_type		2026-02-26 18:07:41.386836
208	11	industry		2026-02-26 18:07:41.388289
209	11	years_in_operation		2026-02-26 18:07:41.389701
210	11	employees_count		2026-02-26 18:07:41.390922
211	11	website		2026-02-26 18:07:41.392095
212	11	business_summary		2026-02-26 18:07:41.39317
213	11	professional_role		2026-02-26 18:07:41.394363
214	11	specialisation		2026-02-26 18:07:41.395424
215	11	skills	[]	2026-02-26 18:07:41.396587
216	11	mentoring_interest		2026-02-26 18:07:41.397814
217	11	mentoring_areas		2026-02-26 18:07:41.398858
218	11	share_testimony	false	2026-02-26 18:07:41.400067
219	11	conduct_workshop	false	2026-02-26 18:07:41.401167
220	11	spiritual_gifts		2026-02-26 18:07:41.402439
221	11	support_interest_types	[]	2026-02-26 18:07:41.403583
222	11	target_support_group		2026-02-26 18:07:41.405009
223	11	struggles_overcome		2026-02-26 18:07:41.40621
224	11	business_needs	[]	2026-02-26 18:07:41.407331
225	11	marketplace_offers	[]	2026-02-26 18:07:41.408545
226	11	profile_photo	null	2026-02-26 18:07:41.409659
227	11	linkedin_url		2026-02-26 18:07:41.410791
228	11	awards		2026-02-26 18:07:41.411868
229	11	challenges_overcome		2026-02-26 18:07:41.412902
248	3	share_testimony	false	2026-02-27 00:38:51.710872
249	3	conduct_workshop	true	2026-02-27 00:38:51.711926
251	3	support_interest_types	["Time","Resources","Networking","Knowledge"]	2026-02-27 00:38:51.714026
252	3	target_support_group	Young start ups	2026-02-27 00:38:51.715136
253	3	struggles_overcome	Challenge	2026-02-27 00:38:51.716286
254	3	business_needs	["Operations","Manpower","Funding"]	2026-02-27 00:38:51.717576
255	3	marketplace_offers	["Training","Prayer","Hosting","Jobs"]	2026-02-27 00:38:51.718741
270	6	mentoring_areas	Start ups. Leadership, career	2026-02-27 02:45:40.814779
258	3	awards	Woman award 	2026-02-27 00:38:51.722248
259	3	challenges_overcome	My story	2026-02-27 00:38:51.723476
292	5	mentoring_interest		2026-02-27 03:23:33.75155
196	5	dob	2026-03-10	2026-02-26 15:38:20.051302
262	6	village	Panjim	2026-02-27 02:45:40.788976
263	6	business_name	Synergy Hospitality Management Services 	2026-02-27 02:45:40.791616
293	5	mentoring_areas		2026-02-27 03:23:33.754037
273	9	dob		2026-02-27 03:10:49.33355
274	9	gender		2026-02-27 03:10:49.336299
275	9	village		2026-02-27 03:10:49.340255
232	3	dob	2026-02-10	2026-02-27 00:38:51.69292
276	9	business_name		2026-02-27 03:10:49.342817
233	3	gender	Female	2026-02-27 00:38:51.69418
235	3	village		2026-02-27 00:38:51.696579
236	3	business_name	Shjs	2026-02-27 00:38:51.697755
266	6	professional_role	Director	2026-02-27 02:45:40.804797
271	6	spiritual_gifts	Teaching, leading	2026-02-27 02:45:40.819973
199	5	spiritual_gifts		2026-02-26 15:38:20.083795
237	3	business_type	Professional	2026-02-27 00:38:51.698874
277	9	business_type		2026-02-27 03:10:49.3453
267	6	specialisation	Restaurant and Food Business 	2026-02-27 02:45:40.807403
278	9	business_summary		2026-02-27 03:10:49.353288
242	3	business_summary	Snns	2026-02-27 00:38:51.704452
243	3	professional_role		2026-02-27 00:38:51.705585
200	5	linkedin_url		2026-02-26 15:38:20.096062
197	5	gender		2026-02-26 15:38:20.05487
279	9	professional_role		2026-02-27 03:10:49.355753
280	9	specialisation		2026-02-27 03:10:49.358372
281	9	skills	[]	2026-02-27 03:10:49.360749
282	9	mentoring_interest		2026-02-27 03:10:49.363147
283	9	mentoring_areas		2026-02-27 03:10:49.365634
284	9	spiritual_gifts		2026-02-27 03:10:49.370704
285	9	linkedin_url		2026-02-27 03:10:49.381814
198	5	village		2026-02-26 15:38:20.059506
268	6	skills	["Leadership","Operations","Project Management"]	2026-02-27 02:45:40.809834
272	6	linkedin_url		2026-02-27 02:45:40.830723
264	6	business_type	Partnership	2026-02-27 02:45:40.794182
295	10	gender		2026-03-07 14:15:08.895847
296	10	village		2026-03-07 14:15:08.900375
297	10	business_name		2026-03-07 14:15:08.90317
287	5	business_type		2026-02-27 03:23:33.733817
288	5	business_summary		2026-02-27 03:23:33.741405
289	5	professional_role		2026-02-27 03:23:33.743859
290	5	specialisation		2026-02-27 03:23:33.746531
291	5	skills	[]	2026-02-27 03:23:33.749134
298	10	business_type		2026-03-07 14:15:08.90587
299	10	business_summary		2026-03-07 14:15:08.914909
300	10	professional_role		2026-03-07 14:15:08.917656
301	10	specialisation		2026-03-07 14:15:08.920355
302	10	skills	[]	2026-03-07 14:15:08.922873
303	10	mentoring_interest		2026-03-07 14:15:08.925452
304	10	mentoring_areas		2026-03-07 14:15:08.928035
305	10	spiritual_gifts		2026-03-07 14:15:08.933401
306	10	linkedin_url		2026-03-07 14:15:08.944995
286	5	business_name		2026-02-27 03:23:33.731122
\.


--
-- Data for Name: member_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_services (id, member_id, title, type, description, status) FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, email, phone, dob, gender, location, role, created_at, updated_at, password_hash, is_onboarded, bio, profile_photo, linkedin_url, intro_video, village, address, age, first_name, last_name) FROM stdin;
4	nickybraganza45@gmail.com	9035592114	\N	\N	\N	member	2026-02-13 08:12:22	2026-02-20 12:31:42.262614	\N	0	\N	\N	\N	\N	\N	\N	\N	Nicky	Braganza
7	pradeepjninan@gmail.com	9486840960	\N	\N	\N	member	2026-02-26 14:52:50.847	2026-02-26 14:52:50.847	\N	0	\N	\N	\N	\N	\N	\N	\N	Pradeep 	Ninan
6	chefrprasadpaul@gmail.com	8888867639	\N	\N	\N	member	2026-02-26 14:52:36.17	2026-02-26 14:53:32.025264	\N	0	\N	\N	\N	\N	\N	\N	\N	Prasad  	Paul
11	atashadmello@gmail.com	77670 41857	\N	\N	\N	member	2026-02-26 14:55:46.572	2026-02-26 14:55:46.572	\N	0	\N	\N	\N	\N	\N	\N	\N	Atasha	Dmello 
9	advjohnjsamuel@gmail.com	8412062158	\N	\N	\N	member	2026-02-26 14:53:25.11	2026-02-27 01:33:01.846492	\N	0	\N	\N	\N	\N	\N	\N	\N	John 	Samuel
3	lynnishadumpala@gmail.com	7774955187	\N	\N	\N	member	2026-02-13 08:12:22	2026-02-27 02:32:25.623667	\N	1	\N	\N	\N	\N	\N	\N	\N	Lynnisha	Dumpala
8	caesar@woodenhomesindia.com	8805021234	\N	\N	\N	member	2026-02-26 14:53:10.016	2026-02-27 03:08:00.900922	\N	0	\N	\N	\N	\N	\N	\N	\N	Caesar	Fernandes
10	fiona.f.desouza@gmail.com	98203 41170	\N	\N	\N	member	2026-02-26 14:55:01.521	2026-03-06 10:44:10.551884	\N	0	\N	\N	\N	\N	\N	\N	\N	Fiona	Dsouza
5	stevensdumpala@gmail.com	7773989325	\N	\N	\N	member	2026-02-19 07:06:15	2026-03-06 12:08:23.630713	\N	1	\N	\N	\N	\N	\N	\N	\N	Stevens	Dumpala
\.


--
-- Data for Name: mentorship_relations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mentorship_relations (id, mentor_id, mentee_id, status, type, focus_area, goals_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: needs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.needs (id, user_id, need_type, description, created_at) FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offers (id, user_id, offer_type, description, created_at) FROM stdin;
\.


--
-- Data for Name: otp_table; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otp_table (id, email_or_phone, otp_code, expires_at, attempts, created_at) FROM stdin;
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pages (id, slug, title, content, created_at, updated_at) FROM stdin;
1	credits	Credits	<p>Goa.City is a modern, full-stack community platform built for the Goa Transformation Network and Coalition. It offers a comprehensive set of tools that enable networking, professional development, and community engagement across the various streams within the coalition.\n</p><h2><strong>Community Contributors</strong></h2><p>Many ideas, feature discussions, and practical insights emerged through conversations with members of the <strong>Marketplace Core Team</strong>. Their feedback and experience helped shape several of the platform’s features and direction.\n</p><p>\n</p><p><strong>Special thanks to: </strong>Caesar Fernandes, Pradeep Ninan, Prasad Paul, Fiona Dsouza, Atasha Dmello, John Samuel and the entire Goa Marketplace team. </p><p class="p1">\n</p><h2><strong>Product &amp; Development</strong></h2><p class="p1">Goa.City was designed and built from scratch by Stevens Dumpala, who serves as the founder and lead developer of the platform. He developed the system architecture, data structures, and core features that power the platform today, turning community conversations and ideas into a functional digital infrastructure for the city movement.\n\nThe platform continues to evolve as new ideas and needs emerge within the community. \n\n</p><p class="p1"><br></p><p class="p1">© 2026 Goa.City. All rights reserved.</p><p class="p1">Built with love for the cities of Goa.</p><p>\n\n\n</p><p>\n\n\n</p><p><br></p>	2026-03-06 07:54:15.943291	2026-03-06 12:25:20.67
2	terms	Terms & Conditions	<p><strong>1. About Goa.City</strong></p>\n<p> Goa.City is a digital platform designed to help individuals, organisations, and initiatives across Goa connect, collaborate, and share information for the benefit of the wider community. </p>\n<p> The platform may include member profiles, community directories, networking tools, project collaboration spaces, and other related features.</p>\n<p> <strong>2. Use of the Platform</strong></p>\n<p> By using Goa.City, you agree to:</p>\n<ul>\n  <li>Use the platform in a lawful and respectful manner</li>\n  <li>Provide accurate information when creating an account or profile</li>\n  <li>Respect other members of the community</li>\n  <li>Avoid posting harmful, misleading, or inappropriate content</li>\n</ul>\n<p>You agree not to use the platform to:</p>\n<ul>\n  <li>Engage in illegal activity</li>\n  <li>Harass, abuse, or harm other users</li>\n  <li>Upload malicious software or harmful code</li>\n  <li>Misrepresent your identity or organisation<br>\n  </li>\n</ul>\n<p>Goa.City reserves the right to remove content or restrict access if these guidelines are violated.</p>\n<p> <strong>3. User Accounts</strong> </p>\n<p>Some features of Goa.City may require users to create an account.</p>\n<p> You are responsible for: </p>\n<ul>\n  <li> Maintaining the confidentiality of your login credentials</li>\n  <li>All activity that occurs under your account </li>\n  <li>Ensuring the information you provide is accurate and up to date </li>\n</ul>\n<p>Goa.City reserves the right to suspend or terminate accounts that violate these Terms.</p>\n<p><strong>4. Community Content</strong></p>\n<p>Users may contribute information, profiles, ideas, and other content to the platform.</p>\n<p>By submitting content to Goa.City, you grant Goa.City a non-exclusive permission to display and use that content within the platform for the purpose of operating and improving the service.</p>\n<p> You remain responsible for the content you submit.</p>\n<p> Goa.City reserves the right to remove content that is inappropriate, inaccurate, or harmful to the community.</p>\n<p><strong>5. Platform Availability</strong></p>\n<p>We aim to keep Goa.City available and functioning smoothly. However:</p>\n<p>The platform is provided “as is”</p>\n<ul>\n  <li>We do not guarantee uninterrupted access</li>\n  <li>Features may change or evolve over time </li>\n</ul>\n<p> Goa.City may temporarily suspend or modify services for maintenance, improvements, or operational reasons.</p>\n<p> <strong>6. Third-Party Links</strong></p>\n<p> Goa.City may contain links to external websites or services operated by third parties.</p>\n<p>We are not responsible for:</p>\n<p>The content of those websites</p>\n<ul>\n  <li>Their privacy practices</li>\n  <li>Any transactions or interactions you have with them</li>\n</ul>\n<p><strong>7. Limitation of Liability</strong> </p>\n<p>While we strive to maintain a reliable platform, Goa.City and its operators are not liable for:</p>\n<ul>\n  <li>Loss of data</li>\n  <li>Service interruptions</li>\n  <li>Any damages arising from the use of the platform</li>\n  <li>Use of the platform is at your own risk.</li>\n</ul>\n<p><strong>8. Changes to the Terms</strong></p>\n<p> These Terms and Conditions may be updated periodically as the platform evolves.\n  When changes are made, the updated version will be posted on this page with the revised date. </p>\n<p> Continued use of the platform constitutes acceptance of the updated Terms.</p>\n<p><strong>9. Contact</strong></p>\n<p>If you have questions regarding these Terms, please contact: </p>\n<p>Goa.City </p>\n<p>Website: https://goa.city </p>\n<p>Email: admin@goa.city </p>\n	2026-03-06 07:54:15.943291	2026-03-06 13:23:48.009
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_likes (id, post_id, user_id, created_at) FROM stdin;
1	3	5	2026-02-19 10:05:34
3	4	3	2026-02-19 10:05:53
5	2	5	2026-02-19 16:34:04
8	4	5	2026-02-20 12:44:54.173115
9	7	5	2026-02-20 14:17:00.311502
11	6	5	2026-02-20 14:17:03.053583
12	9	5	2026-02-23 16:51:41.951427
13	8	5	2026-02-27 03:24:26.118715
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (id, user_id, content, media_url, media_type, link_title, link_desc, link_image, created_at) FROM stdin;
8	5	Market Core meeting	uploads/file-1771865119896-753740124.jpeg	image	\N	\N	\N	2026-02-23 16:45:19.902875
9	5		uploads/file-1771865483267-831522733.mov	video	\N	\N	\N	2026-02-23 16:51:23.305802
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resources (id, title, category, author, url, file_path, file_name, description, submitted_by, status, created_at, updated_at, content, image_url) FROM stdin;
1	Some new resource	Community	Stevens	http://stevensdumpala.com	uploads/resources/69970b26f30cf_Announcements pdf.pdf	Announcements pdf.pdf	this is a great resource	3	approved	2026-02-19 13:07:50	2026-02-20 15:45:01.649856	\N	\N
3	The Gospel Story: Why Your Work Matters	Faith and Work	GOSPEL CITY NETWORK	https://redeemercitytocity.com/articles-stories/the-gospel-story-why-your-work-matters	\N	\N	Picture the slice of toast you had for breakfast this morning. How did it get to your table? Farmers tilled the soil, companies produced fertilizers, and logistics teams transported…	1	approved	2026-02-23 17:03:23.88	2026-02-23 17:03:23.88	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1751384096503-WMQU4L4OF07N4YWEK4RO/dibakar-roy-CaXvurXMJ0g-unsplash.jpg
4	The Outward Look and Feel of Humility	Faith and Work	ABRAHAM CHO	https://redeemercitytocity.com/articles-stories/the-outward-look-and-feel-of-humility	\N	\N	By all accounts, humility ranks as one of the most important virtues of the Christian life. In his classic book Humility: The Beauty of Holiness, Andrew Murray famously…	1	approved	2026-02-23 17:03:23.883	2026-02-23 17:03:23.883	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1707330112503-MQKU3WWCA5S8HUGAQZ6X/victor-grabarczyk-0YZWBH2z34M-unsplash.jpg
5	Marketplace Ministry and the Church	Faith and Work	SIBS SIBANDA	https://redeemercitytocity.com/articles-stories/marketplace-ministry-and-the-church	\N	\N	After completing my engineering degree, I responded to God’s call to become a pastor. The first eight years…	1	approved	2026-02-23 17:03:23.884	2026-02-23 17:03:23.884	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1700502643090-GW3ECL4KEW0RTS4R53N4/pieter-van-noorden-yQ9NNBelr0Y-unsplash.jpg
6	One Easy Thing" to Help Pastors Engage Their Audience	Faith and Work	MISSY WALLACE	https://redeemercitytocity.com/articles-stories/one-easy-thing-to-help-pastors-engage-their-audience	\N	\N	Pastors, finding one topic your congregation can identify with is usually pretty simple—it’s their work. But how often do you talk about their careers from the pulpit? Despite clear data that…	1	approved	2026-02-23 17:03:23.885	2026-02-23 17:03:23.885	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1657216937533-5JJ3FKTPV5J86YKVZC9S/calle-macarone-D7rdbx8w6Og-unsplash.jpeg
7	A Holistic Understanding of Creative Goodness in the Workplace	Faith and Work	MISSY WALLACE	https://redeemercitytocity.com/articles-stories/a-holistic-understanding-of-creative-goodness-in-the-workplace	\N	\N	They found what they say is the single largest finding in the history of Gallup—that people care more about work than anything else…	1	approved	2026-02-23 17:03:23.886	2026-02-23 17:03:23.886	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1638935236609-DQYJJAXWEYOJJD6KKH01/unsplash-image-YI_9SivVt_s.jpg
8	The Complex Idolatries of Africa	Faith and Work	SIBS SIBANDA	https://redeemercitytocity.com/articles-stories/an-african-perspective-on-how-to-reach-the-west-again	\N	\N	This discussion is premised on two basic ideas about African society. The first is this: unlike Western society, which Tim Keller observes has rejected the idea of a “sacred order,” the African conception…	1	approved	2026-02-23 17:03:23.888	2026-02-23 17:03:23.888	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1583255248764-KDSOOMFM2ZISKNFOOHA7/_DSC6463.jpg
9	Three Simple Principles of Faith and Work	Faith and Work	MATT ARONEY	https://redeemercitytocity.com/articles-stories/three-simple-principles-of-faith-and-work	\N	\N	It was not my intention as a pastor to spend a lot of time thinking about the intersection of faith and work. However, what I fell into has now become a firm conviction about discipleship…	1	approved	2026-02-23 17:03:23.889	2026-02-23 17:03:23.889	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1574116423119-G1X44UQG2QAV89SOR1TC/scaffolding-blog.jpg
10	It Was God All Along	Faith and Work	ANKE STEINBACH	https://redeemercitytocity.com/articles-stories/it-was-god-all-along	\N	\N	You never know when God is going to use something as small as an email to change your life forever. I grew up in Eastern Germany. I was seventeen when the Berlin Wall came down…	1	approved	2026-02-23 17:03:23.89	2026-02-23 17:03:23.89	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1572988456356-F0R0R44BD1MXBCPB06KT/hamburg-1-crop.jpg
11	Your Vocation is Bigger Than Your Job	Faith and Work	BART GARRETT	https://redeemercitytocity.com/articles-stories/your-vocation-is-bigger-than-your-job	\N	\N	“Is who I am merely what I do?” We sat in a coffee shop taking stock of the past decade. I met Kurt as a promising PhD student at Cal-Berkeley, and now…	1	approved	2026-02-23 17:03:23.891	2026-02-23 17:03:23.891	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1568233780963-QPQSR8FY2UAKPXCYOM9W/vocation-1.jpeg
12	Shaping an Imagination for Faith and Work: An Interview with Russell Joyce	Faith and Work	CITY TO CITY	https://redeemercitytocity.com/articles-stories/shaping-an-imagination-for-faith-and-work-an-interview-with-russell-joyce	\N	\N	Integrating faith and work is rarely a priority in the early stages of church planting. However, Russell Joyce and his team at Hope Brooklyn have been intentional about…	1	approved	2026-02-23 17:03:23.892	2026-02-23 17:03:23.892	\N	https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1568032066948-CTXF70V9RC378CQY0I6T/1_L1eAL2tDXvtjwLRE5s4umg.jpeg
2	A Test Article	Awards	My Author	 	\N	\N	\N	5	approved	2026-02-20 14:17:34.429477	2026-02-23 17:08:03.156517	\N	\N
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skills (id, skill_name) FROM stdin;
\.


--
-- Data for Name: stewardship_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stewardship_logs (id, user_id, type, recipient_id, amount, hours, date, skill_category, status, impact_note, impact_image_url, created_at, updated_at) FROM stdin;
3	5	Financial	1	500.00	\N	2026-02-10	\N	Verified	\N	\N	2026-02-23 18:43:55.372	2026-02-23 18:43:55.372
2	5	Skill	4	\N	1.50	2026-02-23	Business Mentoring	Verified	Amazing	\N	2026-02-23 18:42:04.415	2026-02-23 18:42:04.415
1	5	Skill	3	\N	2.00	2026-02-23	Business Mentoring	Verified	\N	\N	2026-02-23 18:41:11.424	2026-02-23 18:41:11.424
4	5	Skill	4	\N	2.00	2026-02-23	Tech Support	Pending	\N	\N	2026-02-23 18:49:20.01	2026-02-23 18:49:20.01
\.


--
-- Data for Name: stewardship_orgs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stewardship_orgs (id, name, org_type, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stream_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stream_members (stream_id, user_id) FROM stdin;
1	8
1	6
1	4
1	3
1	11
3	11
5	11
1	7
5	7
7	7
1	9
4	9
1	5
2	5
4	5
1	10
5	10
7	10
\.


--
-- Data for Name: streams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.streams (id, name, description, color, created_at, form_id) FROM stdin;
2	Youth	Youth Activities and Programs	#10b981	2026-02-14 06:27:43	3
3	Mental Health	Community Gatherings	#f59e0b	2026-02-14 06:27:43	\N
4	Prayer	Arts and Culture	#8b5cf6	2026-02-14 06:27:43	\N
5	Environment	Business and Trade	#1fa418	2026-02-14 06:29:34	\N
8	Arts 	Arts and Culture	#f63d2e	2026-02-14 06:29:34	\N
1	Marketplace	Business and Trade	#3b82f6	2026-02-14 06:27:43	1
7	Sahaya Sangam	DW	#f546a0	2026-02-14 06:29:34	\N
6	Children	Children Activities and Programs	#8b5e9a	2026-02-14 06:29:34	\N
9	Sports & Fitness		#275513	2026-02-14 06:34:54	\N
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 2, true);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.businesses_id_seq', 1, false);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 2, true);


--
-- Name: form_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_answers_id_seq', 316, true);


--
-- Name: form_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_fields_id_seq', 717, true);


--
-- Name: form_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_responses_id_seq', 20, true);


--
-- Name: forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forms_id_seq', 5, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobs_id_seq', 2, true);


--
-- Name: meeting_resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meeting_resources_id_seq', 1, false);


--
-- Name: meeting_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meeting_responses_id_seq', 10, true);


--
-- Name: meetings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meetings_id_seq', 11, true);


--
-- Name: member_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_profiles_id_seq', 306, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 11, true);


--
-- Name: needs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.needs_id_seq', 1, false);


--
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offers_id_seq', 1, false);


--
-- Name: otp_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.otp_table_id_seq', 37, true);


--
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pages_id_seq', 2, true);


--
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 13, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.posts_id_seq', 9, true);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resources_id_seq', 12, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.skills_id_seq', 1, false);


--
-- Name: stewardship_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stewardship_logs_id_seq', 4, true);


--
-- Name: stewardship_orgs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stewardship_orgs_id_seq', 1, false);


--
-- Name: streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.streams_id_seq', 11, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: collaboration_requests collaboration_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaboration_requests
    ADD CONSTRAINT collaboration_requests_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: form_answers form_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_answers
    ADD CONSTRAINT form_answers_pkey PRIMARY KEY (id);


--
-- Name: form_fields form_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fields
    ADD CONSTRAINT form_fields_pkey PRIMARY KEY (id);


--
-- Name: form_responses form_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_pkey PRIMARY KEY (id);


--
-- Name: forms forms_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_code_key UNIQUE (code);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: idea_feedback idea_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_feedback
    ADD CONSTRAINT idea_feedback_pkey PRIMARY KEY (id);


--
-- Name: incubator_ideas incubator_ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incubator_ideas
    ADD CONSTRAINT incubator_ideas_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: meeting_resources meeting_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resources
    ADD CONSTRAINT meeting_resources_pkey PRIMARY KEY (id);


--
-- Name: meeting_responses meeting_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_responses
    ADD CONSTRAINT meeting_responses_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: member_profiles member_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_pkey PRIMARY KEY (id);


--
-- Name: member_services member_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_services
    ADD CONSTRAINT member_services_pkey PRIMARY KEY (id);


--
-- Name: members members_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_email_key UNIQUE (email);


--
-- Name: members members_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key UNIQUE (phone);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: mentorship_relations mentorship_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentorship_relations
    ADD CONSTRAINT mentorship_relations_pkey PRIMARY KEY (id);


--
-- Name: needs needs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs
    ADD CONSTRAINT needs_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: otp_table otp_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_table
    ADD CONSTRAINT otp_table_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: stewardship_logs stewardship_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stewardship_logs
    ADD CONSTRAINT stewardship_logs_pkey PRIMARY KEY (id);


--
-- Name: stewardship_orgs stewardship_orgs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stewardship_orgs
    ADD CONSTRAINT stewardship_orgs_pkey PRIMARY KEY (id);


--
-- Name: stream_members stream_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stream_members
    ADD CONSTRAINT stream_members_pkey PRIMARY KEY (stream_id, user_id);


--
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (id);


--
-- Name: email_templates_title_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email_templates_title_key ON public.email_templates USING btree (title);


--
-- Name: pages_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug);


--
-- Name: admins update_admins_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: forms update_forms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jobs update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: meeting_responses update_meeting_responses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meeting_responses_updated_at BEFORE UPDATE ON public.meeting_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: meetings update_meetings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: members update_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: resources update_resources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: businesses businesses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: collaboration_requests collaboration_requests_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaboration_requests
    ADD CONSTRAINT collaboration_requests_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: collaboration_requests collaboration_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaboration_requests
    ADD CONSTRAINT collaboration_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: form_responses form_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: idea_feedback idea_feedback_contributor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_feedback
    ADD CONSTRAINT idea_feedback_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: idea_feedback idea_feedback_idea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_feedback
    ADD CONSTRAINT idea_feedback_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.incubator_ideas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: incubator_ideas incubator_ideas_founder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incubator_ideas
    ADD CONSTRAINT incubator_ideas_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_resources meeting_resources_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_resources
    ADD CONSTRAINT meeting_resources_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_profiles member_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_services member_services_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_services
    ADD CONSTRAINT member_services_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mentorship_relations mentorship_relations_mentee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentorship_relations
    ADD CONSTRAINT mentorship_relations_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mentorship_relations mentorship_relations_mentor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentorship_relations
    ADD CONSTRAINT mentorship_relations_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stewardship_logs stewardship_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stewardship_logs
    ADD CONSTRAINT stewardship_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stream_members stream_members_stream_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stream_members
    ADD CONSTRAINT stream_members_stream_id_fkey FOREIGN KEY (stream_id) REFERENCES public.streams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stream_members stream_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stream_members
    ADD CONSTRAINT stream_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fUyS0abiM0y5y2TbuDEBNqVOZq0hmdiF5ITr6oVTEC7CkcCZfDSKAONBM2m20Q2

