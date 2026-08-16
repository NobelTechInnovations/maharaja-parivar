export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-panel-soft">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-display text-[17px] text-ink">Maharaja Parivar</div>
            <p className="mt-1.5 max-w-sm text-sm text-muted">
              An independent, verified community for alumni of University Maharaja&rsquo;s
              College, Jaipur. Not affiliated with the University of Rajasthan.
            </p>
          </div>
          <div className="text-sm text-muted">
            <div>
              An initiative of the <span className="text-ink">Maharaja College Buddies Samiti</span>
            </div>
            <a href="mailto:info@maharajaparivar.com" className="mt-1 inline-block hover:text-maroon">
              info@maharajaparivar.com
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-line/70 pt-5 text-xs text-muted">
          © {new Date().getFullYear()} Maharaja College Buddies Samiti.
        </div>
      </div>
    </footer>
  );
}
