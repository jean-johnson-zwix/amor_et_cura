-- Allow manually created follow_ups (without a visit)
ALTER TABLE public.follow_ups ALTER COLUMN visit_id DROP NOT NULL;

-- Staff can insert follow_ups directly (manual task creation)
CREATE POLICY "follow_ups: authenticated insert"
  ON public.follow_ups FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Staff can delete follow_ups (e.g. manually created ones)
CREATE POLICY "follow_ups: authenticated delete"
  ON public.follow_ups FOR DELETE
  TO authenticated
  USING (true);
