import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface text-surface-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <h3 className="font-display text-lg font-semibold">CivicWatch NG</h3>
          <p className="mt-2 max-w-sm text-sm text-surface-foreground/70">
            A secure civic tip-off channel for reporting crime, corruption and public-safety
            concerns to the relevant authorities — anonymously, with evidence, and trackable.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-surface-foreground/60">
            Platform
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/report" className="text-surface-foreground/80 hover:text-surface-foreground">
                Submit a tip-off
              </Link>
            </li>
            <li>
              <Link to="/track" className="text-surface-foreground/80 hover:text-surface-foreground">
                Track a report
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-surface-foreground/80 hover:text-surface-foreground">
                Authority login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-surface-foreground/60">
            Information
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-surface-foreground/80 hover:text-surface-foreground">
                About & data protection
              </Link>
            </li>
            <li className="text-surface-foreground/60">
              Emergency? Call 112 — this platform is not a live emergency line.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-foreground/10 py-5 text-center text-xs text-surface-foreground/60">
        Handled in line with the Nigeria Data Protection Act, 2023. Academic prototype.
      </div>
    </footer>
  );
}
