-- enable the 'unaccent` extension which provides the `unaccent` function
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION generate_page_slug (page_name TEXT, audit_u_id TEXT) RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    slug_rank INT;
BEGIN
    -- Transverse elements page, slug is always 'elements-transverses'
    IF audit_u_id IS NULL THEN
        RETURN 'elements-transverses';
    END IF;

    -- Generate the initial slug by processing the name
    base_slug := lower(
                      regexp_replace(
                          regexp_replace(
                              regexp_replace(
                                -- remove diacritics from characters
                                unaccent(page_name),
                                '\s+', '-', 'g'),
                              '[^a-zA-Z0-9\-]', '', 'g'
                          ),
                      '-+', '-', 'g')
                  );

    -- Check if this slug already exists and if so, append a number to ensure uniqueness
    SELECT COUNT(*) INTO slug_rank
    FROM "AuditedPage"
    WHERE "auditUniqueId" = audit_u_id AND "slug" LIKE base_slug || '%';

    -- if generated slug is the same as the "Transverses Elements" page, add one to counter
    -- in order to not collide with transverse page
    if base_slug = 'elements-transverses' THEN
        slug_rank := slug_rank + 1;
    END IF;

    IF slug_rank = 0 THEN
        -- No duplicates found, assign base slug
        final_slug := base_slug;
    ELSE
        -- Duplicates found, append the count as a suffix
        final_slug := base_slug || '-' || slug_rank;
    END IF;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- reset slugs as generate_page_slug assumes that slugs are not generated yet
UPDATE "AuditedPage"
SET
  "slug" = NULL;

UPDATE "AuditedPage"
SET
  "slug" = generate_page_slug ("name", "auditUniqueId");
