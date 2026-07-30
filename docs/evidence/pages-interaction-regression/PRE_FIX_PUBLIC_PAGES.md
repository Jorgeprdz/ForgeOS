# Pre-fix public Pages reproduction

Public build: `a45147cc8da8a06ed6bda3e52ba6fe4103556699`

The owner-provided Samsung Browser screenshots are the primary production
evidence. They show NASH and Combat markup in normal flow, native gray
controls, duplicate Combat headings and multiple close buttons.

Read-only network verification found:

- `build-info.json`: deployed SHA matched `a45147cc…`.
- `pipeline-referral-modal.css?v=ui-m06-referral-003`: HTTP 200,
  `text/css`.
- The CSS existed publicly but was not guaranteed before NASH/Combat/NBA
  visibility.

The public anonymous smoke correctly stopped before remote mutation. No
Timeline or Supabase write was attempted.
