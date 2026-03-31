create unique index if not exists family_partner_links_partner_email_unique_idx
  on public.family_partner_links (lower(partner_email));
