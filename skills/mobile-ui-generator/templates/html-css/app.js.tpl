const fixtures = {{FIXTURE_JSON}};
const content = document.querySelector('#screen-content');
const action = document.querySelector('#primary-action');
const render = (state = '{{DEFAULT_STATE}}') => {
  const value = fixtures[state] ?? fixtures.default;
  content.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = value.title;
  const body = document.createElement('p');
  body.textContent = value.body;
  content.append(heading, body);
  action.disabled = state === 'loading' || state === 'disabled';
  action.setAttribute('aria-busy', String(state === 'loading'));
};
action.addEventListener('click', () => render('{{ACTION_SUCCESS_STATE}}'));
render();
