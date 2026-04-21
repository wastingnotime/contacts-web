export function ContactsBootstrapFailure(props) {
  return (
    <main class="app-shell">
      <section class="panel">
        <p class="eyebrow">Contacts</p>
        <p class="runtime-badge runtime-badge-isolated">Isolated mode</p>
        <h1>Isolated mode could not start.</h1>
        <div class="error-banner" role="alert">
          <p>{props.message}</p>
        </div>
        <p>Restart the dev server or switch back to live mode.</p>
      </section>
    </main>
  );
}
