export const fixtures = {
  {{DEFAULT_STATE}}: { title: '{{DEFAULT_TITLE}}', body: '{{DEFAULT_BODY}}', success: '{{SUCCESS_ANNOUNCEMENT}}' },
  {{ACTION_SUCCESS_STATE}}: { title: '{{SUCCESS_TITLE}}', body: '{{SUCCESS_BODY}}', success: '{{SUCCESS_ANNOUNCEMENT}}' },
  loading: { title: '{{LOADING_TITLE}}', body: '{{LOADING_BODY}}', success: '{{LOADING_ANNOUNCEMENT}}' },
  error: { title: '{{ERROR_TITLE}}', body: '{{ERROR_BODY}}', success: '{{ERROR_ANNOUNCEMENT}}' },
} as const;
