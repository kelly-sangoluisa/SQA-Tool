-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.criteria (
  criterion_id integer NOT NULL DEFAULT nextval('criteria_criterion_id_seq'::regclass),
  standard_id integer,
  name character varying NOT NULL,
  description text,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT criteria_pkey PRIMARY KEY (criterion_id),
  CONSTRAINT criteria_standard_id_fkey FOREIGN KEY (standard_id) REFERENCES public.standards(standard_id)
);
CREATE TABLE public.evaluation_criteria (
  eval_criterion_id integer NOT NULL DEFAULT nextval('evaluation_criteria_eval_criterion_id_seq'::regclass),
  evaluation_id integer,
  criterion_id integer,
  importance_level USER-DEFINED NOT NULL,
  importance_percentage numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_criteria_pkey PRIMARY KEY (eval_criterion_id),
  CONSTRAINT evaluation_criteria_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.evaluations(evaluation_id),
  CONSTRAINT evaluation_criteria_criterion_id_fkey FOREIGN KEY (criterion_id) REFERENCES public.criteria(criterion_id)
);
CREATE TABLE public.evaluation_criteria_result (
  criteria_result_id integer NOT NULL DEFAULT nextval('evaluation_criteria_result_criteria_result_id_seq'::regclass),
  eval_criterion_id integer,
  final_score numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_criteria_result_pkey PRIMARY KEY (criteria_result_id),
  CONSTRAINT evaluation_criteria_result_eval_criterion_id_fkey FOREIGN KEY (eval_criterion_id) REFERENCES public.evaluation_criteria(eval_criterion_id)
);
CREATE TABLE public.evaluation_metrics (
  eval_metric_id integer NOT NULL DEFAULT nextval('evaluation_metrics_eval_metric_id_seq'::regclass),
  eval_criterion_id integer,
  metric_id integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_metrics_pkey PRIMARY KEY (eval_metric_id),
  CONSTRAINT evaluation_metrics_eval_criterion_id_fkey FOREIGN KEY (eval_criterion_id) REFERENCES public.evaluation_criteria(eval_criterion_id),
  CONSTRAINT evaluation_metrics_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metrics(metric_id)
);
CREATE TABLE public.evaluation_metrics_result (
  metric_result_id integer NOT NULL DEFAULT nextval('evaluation_metrics_result_metric_result_id_seq'::regclass),
  eval_metric_id integer,
  calculated_value numeric,
  weighted_value numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_metrics_result_pkey PRIMARY KEY (metric_result_id),
  CONSTRAINT evaluation_metrics_result_eval_metric_id_fkey FOREIGN KEY (eval_metric_id) REFERENCES public.evaluation_metrics(eval_metric_id)
);
CREATE TABLE public.evaluation_result (
  evaluation_result_id integer NOT NULL DEFAULT nextval('evaluation_result_evaluation_result_id_seq'::regclass),
  evaluation_id integer,
  evaluation_score numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  conclusion text,
  CONSTRAINT evaluation_result_pkey PRIMARY KEY (evaluation_result_id),
  CONSTRAINT evaluation_result_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.evaluations(evaluation_id)
);
CREATE TABLE public.evaluation_variables (
  eval_variable_id integer NOT NULL DEFAULT nextval('evaluation_variables_eval_variable_id_seq'::regclass),
  eval_metric_id integer,
  variable_id integer,
  value numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluation_variables_pkey PRIMARY KEY (eval_variable_id),
  CONSTRAINT evaluation_variables_eval_metric_id_fkey FOREIGN KEY (eval_metric_id) REFERENCES public.evaluation_metrics(eval_metric_id),
  CONSTRAINT evaluation_variables_variable_id_fkey FOREIGN KEY (variable_id) REFERENCES public.formula_variables(variable_id)
);
CREATE TABLE public.evaluations (
  evaluation_id integer NOT NULL DEFAULT nextval('evaluations_evaluation_id_seq'::regclass),
  project_id integer,
  standard_id integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluations_pkey PRIMARY KEY (evaluation_id),
  CONSTRAINT evaluations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id),
  CONSTRAINT evaluations_standard_id_fkey FOREIGN KEY (standard_id) REFERENCES public.standards(standard_id)
);
CREATE TABLE public.formula_variables (
  variable_id integer NOT NULL DEFAULT nextval('formula_variables_variable_id_seq'::regclass),
  metric_id integer,
  symbol character varying,
  description text,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT formula_variables_pkey PRIMARY KEY (variable_id),
  CONSTRAINT formula_variables_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metrics(metric_id)
);
CREATE TABLE public.metrics (
  metric_id integer NOT NULL DEFAULT nextval('metrics_metric_id_seq'::regclass),
  sub_criterion_id integer,
  code character varying,
  name character varying NOT NULL,
  description text,
  formula character varying,
  desired_threshold numeric,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT metrics_pkey PRIMARY KEY (metric_id),
  CONSTRAINT metrics_sub_criterion_id_fkey FOREIGN KEY (sub_criterion_id) REFERENCES public.sub_criteria(sub_criterion_id)
);
CREATE TABLE public.project_result (
  project_result_id integer NOT NULL DEFAULT nextval('project_result_project_result_id_seq'::regclass),
  project_id integer,
  final_project_score numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_result_pkey PRIMARY KEY (project_result_id),
  CONSTRAINT project_result_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
);
CREATE TABLE public.projects (
  project_id integer NOT NULL DEFAULT nextval('projects_project_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  creator_user_id integer,
  status USER-DEFINED DEFAULT 'in_progress'::project_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  minimum_threshold numeric,
  CONSTRAINT projects_pkey PRIMARY KEY (project_id),
  CONSTRAINT projects_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.roles (
  role_id integer NOT NULL DEFAULT nextval('roles_role_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.standards (
  standard_id integer NOT NULL DEFAULT nextval('standards_standard_id_seq'::regclass),
  name character varying NOT NULL,
  version character varying,
  description text,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT standards_pkey PRIMARY KEY (standard_id)
);
CREATE TABLE public.sub_criteria (
  sub_criterion_id integer NOT NULL DEFAULT nextval('sub_criteria_sub_criterion_id_seq'::regclass),
  criterion_id integer,
  name character varying NOT NULL,
  description text,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sub_criteria_pkey PRIMARY KEY (sub_criterion_id),
  CONSTRAINT sub_criteria_criterion_id_fkey FOREIGN KEY (criterion_id) REFERENCES public.criteria(criterion_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  role_id integer,
  state USER-DEFINED NOT NULL DEFAULT 'active'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id)
);