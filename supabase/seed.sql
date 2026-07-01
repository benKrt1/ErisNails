-- Sample data for local development / first run.

insert into public.services (name_en, name_sv, description_en, description_sv, duration_minutes, price, sort_order, category)
values
  ('Classic Manicure', 'Klassisk Manikyr',
   'A gentle shaping, cuticle care, and polish.',
   'Mjuk formning, nagelbandsvård och lack.',
   30, 350, 1, 'nails'),
  ('Gel Manicure', 'Gelmanikyr',
   'Long-lasting gel colour with a careful finish.',
   'Långhållbar gelfärg med omsorgsfull finish.',
   60, 550, 2, 'nails'),
  ('Spa Pedicure', 'Spa-pedikyr',
   'A restorative soak, exfoliation, and polish.',
   'Återställande fotbad, peeling och lack.',
   75, 650, 3, 'nails'),
  ('Brow Shaping', 'Brynformning',
   'Precise mapping and shaping to suit your features.',
   'Exakt uppmätning och formning som passar dina drag.',
   20, 250, 4, 'brows'),
  ('Brow Tint & Shape', 'Brynfärg & formning',
   'Shaping paired with a soft, natural tint.',
   'Formning tillsammans med en mjuk, naturlig färg.',
   30, 350, 5, 'brows'),
  ('Brow Lamination', 'Bryn-laminering',
   'Brushed-up, full brows that hold for weeks.',
   'Uppborstade, fylliga bryn som håller i veckor.',
   45, 650, 6, 'brows');

-- Working hours: Tuesday–Saturday, 10:00–18:00 (weekday 2..6)
insert into public.working_hours (weekday, start_time, end_time)
values
  (2, '10:00', '18:00'),
  (3, '10:00', '18:00'),
  (4, '10:00', '18:00'),
  (5, '10:00', '18:00'),
  (6, '10:00', '16:00');
