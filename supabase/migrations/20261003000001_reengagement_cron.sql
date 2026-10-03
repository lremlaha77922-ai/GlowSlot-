-- Migration: Register Daily Cron Job for 30-Day Customer Re-engagement
-- Runs once per day at 02:00 AM UTC

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule any existing duplicate job first
SELECT cron.unschedule('daily-30day-reengagement-check') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-30day-reengagement-check'
);

-- Schedule daily re-engagement automation processor at 02:00 AM UTC
SELECT cron.schedule(
  'daily-30day-reengagement-check',
  '0 2 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.edge_function_url', true) || '/functions/v1/process-reengagement-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('scheduled_run', true, 'test_mode', true)
    );
  $$
);
