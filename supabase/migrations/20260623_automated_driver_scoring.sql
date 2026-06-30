-- Function to calculate and issue monthly driver awards
CREATE OR REPLACE FUNCTION issue_monthly_driver_awards()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    best_driver_id UUID;
    best_score NUMERIC := 0;
    current_score NUMERIC;
    total_fuel_issued NUMERIC;
    total_fuel_consumed NUMERIC;
    fuel_variance_percentage NUMERIC;
    award_title TEXT;
BEGIN
    award_title := 'Driver of the Month - ' || to_char(CURRENT_DATE - INTERVAL '1 day', 'Month YYYY');

    -- Loop through all active drivers
    FOR rec IN 
        SELECT 
            d.id as driver_id,
            COALESCE(SUM(t.distance_traveled_km), 0) as distance,
            COALESCE(SUM(t.fuel_consumed_liters), 0) as consumed,
            COALESCE(SUM(t.incidents), 0) as incidents,
            COALESCE(SUM(t.speeding_events), 0) as speeding,
            COALESCE(SUM(t.route_deviations), 0) as route_deviations,
            COALESCE(SUM(t.policy_violations), 0) as policy_violations,
            COALESCE(SUM(GREATEST(0, t.idling_time_hours - 2)), 0) as excess_idling
        FROM drivers d
        LEFT JOIN trip_logs t ON d.id = t.driver_id AND t.date >= (CURRENT_DATE - INTERVAL '1 month')
        WHERE d.status = 'Active'
        GROUP BY d.id
    LOOP
        -- Calculate total fuel issued for this driver in the last month
        SELECT COALESCE(SUM(liters), 0) INTO total_fuel_issued
        FROM fuel_collections
        WHERE driver_id = rec.driver_id AND date >= (CURRENT_DATE - INTERVAL '1 month');

        total_fuel_consumed := rec.consumed;

        -- Base Score
        current_score := 100;

        -- Apply Penalties
        current_score := current_score - (rec.speeding * 5);
        current_score := current_score - (rec.route_deviations * 5);
        current_score := current_score - (rec.policy_violations * 15);
        current_score := current_score - (rec.excess_idling * 3);
        current_score := current_score - (rec.incidents * 50);

        -- Strict Fuel Variance Detection
        -- If fuel issued exceeds consumed by more than 10%, disqualify
        IF total_fuel_consumed > 0 THEN
            fuel_variance_percentage := (total_fuel_issued - total_fuel_consumed) / total_fuel_consumed;
            IF fuel_variance_percentage > 0.10 THEN
                current_score := 0; -- Disqualified due to high fuel variance (potential theft)
            END IF;
        END IF;

        -- Minimum score floor
        IF current_score < 0 THEN
            current_score := 0;
        END IF;

        -- Keep track of the highest score (must be > 90 to win)
        IF current_score > best_score AND current_score > 90 AND rec.distance > 100 THEN
            best_score := current_score;
            best_driver_id := rec.driver_id;
        END IF;
    END LOOP;

    -- Issue award to the best driver
    IF best_driver_id IS NOT NULL THEN
        UPDATE drivers 
        SET awards = array_append(COALESCE(awards, '{}'), award_title)
        WHERE id = best_driver_id;
    END IF;
END;
$$;

-- Enable pg_cron if not already enabled (Requires Supabase superuser, but often enabled by default)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run on the 1st of every month at 00:00
-- NOTE: We must remove any existing job with the same name to avoid duplicates
SELECT cron.unschedule('monthly_driver_award') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'monthly_driver_award');

SELECT cron.schedule(
    'monthly_driver_award',
    '0 0 1 * *', 
    $$SELECT issue_monthly_driver_awards()$$
);
