-- Function to atomically increment viewer count
CREATE OR REPLACE FUNCTION increment_viewer_count(event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE live_events
  SET "viewerCount" = "viewerCount" + 1
  WHERE id = event_id
  RETURNING "viewerCount" INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to atomically decrement viewer count (never below 0)
CREATE OR REPLACE FUNCTION decrement_viewer_count(event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE live_events
  SET "viewerCount" = GREATEST("viewerCount" - 1, 0)
  WHERE id = event_id
  RETURNING "viewerCount" INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users and anonymous
GRANT EXECUTE ON FUNCTION increment_viewer_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_viewer_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_viewer_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_viewer_count(UUID) TO anon;
