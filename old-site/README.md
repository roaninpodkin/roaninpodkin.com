# Old site (WordPress) — archive

Snapshot of roaninpodkin.com taken 2026-10-01, right before DNS was moved to GitHub Pages.

The old site was WordPress on an AWS server at `34.199.192.119`, behind Cloudflare (proxied).
That server was **not** touched — it keeps running until you shut it down.

## What's here

| Path                | Contents                                                              |
| ------------------- | --------------------------------------------------------------------- |
| `dns-records.json`  | Every Cloudflare DNS record as it was (with proxy status)             |
| `dns-records.zone`  | Same records as a BIND zone file (importable into Cloudflare)         |
| `content/*.md`      | Clean Markdown of every page and post, with front matter              |
| `pages/*.html`      | Full rendered HTML of every page (`index.json` maps URL → file)       |
| `media/`            | Every image from `wp-content/uploads` referenced on the site          |

## Point the domain back at the old site

In Cloudflare → roaninpodkin.com → DNS → Records:

1. Delete the four GitHub `A` records on `roaninpodkin.com` (`185.199.108–111.153`).
2. Add `A` · `roaninpodkin.com` → `34.199.192.119` · **Proxied**.
3. Edit `www` CNAME → `roaninpodkin.com` · **Proxied**.

The email records (`_amazonses`, `_dmarc`, SPF TXT) were never changed.
Only works while the AWS server at that IP is still running.
