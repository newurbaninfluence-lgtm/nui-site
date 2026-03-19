-- Run this ONCE in Supabase SQL Editor to give Claude/Monty permanent SQL execution power
-- After this, migrations can be run anytime via the Netlify function

-- Create a secure SQL execution function
CREATE OR REPLACE FUNCTION run_migration(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true, 'message', 'Migration executed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Restrict to service role only (Claude/Monty only, not public)
REVOKE ALL ON FUNCTION run_migration(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION run_migration(text) FROM anon;
REVOKE ALL ON FUNCTION run_migration(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION run_migration(text) TO service_role;
