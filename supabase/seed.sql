-- Sample data for local development / first run.

insert into public.services (name_en, name_sv, description_en, description_sv, duration_minutes, price, sort_order)
values
  ('Classic Manicure', 'Klassisk Manikyr',
   'A gentle shaping, cuticle care, and polish.',
   'Mjuk formning, nagelbandsvård och lack.',
   30, 350, 1),
  ('Gel Manicure', 'Gelmanikyr',
   'Long-lasting gel colour with a careful finish.',
   'Långhållbar gelfärg med omsorgsfull finish.',
   60, 550, 2),
  ('Spa Pedicure', 'Spa-pedikyr',
   'A restorative soak, exfoliation, and polish.',
   'Återställande fotbad, peeling och lack.',
   75, 650, 3);

-- Working hours: Tuesday–Saturday, 10:00–18:00 (weekday 2..6)
insert into public.working_hours (weekday, start_time, end_time)
values
  (2, '10:00', '18:00'),
  (3, '10:00', '18:00'),
  (4, '10:00', '18:00'),
  (5, '10:00', '18:00'),
  (6, '10:00', '16:00');
