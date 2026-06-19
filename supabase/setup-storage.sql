-- Run this in the Supabase SQL Editor to enable venue photo storage.

insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', true)
on conflict (id) do update set public = excluded.public;

-- Public read access for venue images shown on the site.
create policy "Public read venue photos"
on storage.objects for select
to public
using (bucket_id = 'venue-photos');
