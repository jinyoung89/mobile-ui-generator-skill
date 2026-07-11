<!doctype html>
<html lang="{{LANGUAGE}}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>{{SCREEN_TITLE}}</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main id="app" data-screen-id="{{SPEC_ID}}" aria-labelledby="screen-title">
      <header class="app-bar"><h1 id="screen-title">{{SCREEN_TITLE}}</h1></header>
      <section id="screen-content" class="screen-content" aria-live="polite"></section>
      <footer class="fixed-action" data-safe-area="bottom">
        <button id="primary-action" class="primary-action" type="button">{{PRIMARY_LABEL}}</button>
      </footer>
    </main>
    <script type="module" src="app.js"></script>
  </body>
</html>
