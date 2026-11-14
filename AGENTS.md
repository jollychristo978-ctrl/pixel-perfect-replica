<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Paalam architecture
- Role-play Scenes persist private server-owned sessions, compare-and-set exchanges, and atomic once-per-session rewards; cache claimed ambience in private storage to avoid repeat generation.
- Share bilingual journey groups and route-to-step mapping between navigation and dashboard; keep the XP call nudge presentation-only so existing booking authorization stays unchanged.
- Store roles separately from profiles; only validated database RPCs may write profiles, links, or roles, preventing client-controlled privilege escalation.
- Keep private pages under the managed client-authenticated layout and revalidate every private server function with auth middleware; public pages stay SSR-enabled.
- Use one root auth subscriber and clear the query cache before signing out so private student data cannot linger.
- Keep password recovery on public pages using Cloud Auth emails and updateUser; the root auth subscriber records recovery events so consumed URL tokens still open the reset form.
- Keep bilingual UI state in the Paalam provider; translated labels share the same screens and profile data.
- Cinema Tutor stores server-scored attempts privately and awards each scene once through a service-only atomic completion RPC; transcript-derived pronunciation scores are explicitly estimates, not acoustic assessment.
- Do not expose learner discovery, partner matching, or messaging before a safeguarding and consent workflow exists, because the audience includes minors.
- Learners enter without a log-in screen via automatic anonymous accounts on /auth; staff keep a hidden email sign-in so protected roles still need real accounts.
- Keep Connect discovery organisation-only with bilingual searchable opportunities and official contact links; publish session times only after partner confirmation, so no learner data or fabricated availability is exposed.
