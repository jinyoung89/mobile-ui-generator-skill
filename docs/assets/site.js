const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function updateFilters() {
  const search = $('[data-filter="search"]')?.value.trim().toLowerCase() || '';
  const category = $('[data-filter="category"]')?.value || '';
  const pattern = $('[data-filter="pattern"]')?.value || '';
  let visible = 0;
  $$('[data-example]').forEach((card) => {
    const match = (!search || card.dataset.search.includes(search)) && (!category || card.dataset.category === category) && (!pattern || card.dataset.patterns.split(' ').includes(pattern));
    card.hidden = !match;
    if (match) visible += 1;
  });
  const count = $('[data-result-count]');
  if (count) count.textContent = String(visible);
  const empty = $('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (category) params.set('category', category);
  if (pattern) params.set('pattern', pattern);
  history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
}

$$('[data-filter]').forEach((control) => control.addEventListener('input', updateFilters));
$('.filters')?.addEventListener('reset', () => requestAnimationFrame(updateFilters));

const params = new URLSearchParams(location.search);
if ($('[data-filter="search"]')) $('[data-filter="search"]').value = params.get('q') || '';
if ($('[data-filter="category"]')) $('[data-filter="category"]').value = params.get('category') || '';
if ($('[data-filter="pattern"]')) $('[data-filter="pattern"]').value = params.get('pattern') || '';
if ($('[data-example]')) updateFilters();

$$('[role="tab"]').forEach((tab) => tab.addEventListener('click', () => {
  const tablist = tab.closest('[role="tablist"]');
  $$('[role="tab"]', tablist).forEach((item) => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
  $$('[role="tabpanel"]').forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
}));

$('.source-tabs')?.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const tabs = $$('[role="tab"]', event.currentTarget);
  const current = tabs.indexOf(document.activeElement);
  const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].focus();
  tabs[next].click();
});

$$('[data-copy-source]').forEach((button) => button.addEventListener('click', async () => {
  const code = document.getElementById(button.dataset.copySource)?.textContent || '';
  await navigator.clipboard.writeText(code);
  const previous = button.textContent;
  button.textContent = 'Copied';
  setTimeout(() => { button.textContent = previous; }, 1400);
}));

$$('[data-preview-width]').forEach((button) => button.addEventListener('click', () => {
  $$('[data-preview-width]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  $('[data-preview-container]')?.style.setProperty('--preview-width', `${button.dataset.previewWidth}px`);
}));
