import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import type { NavItem } from "@/lib/navigation";

export type Metric = {
  label: string;
  value: string;
  note: string;
};

export type ActionCard = {
  title: string;
  description: string;
  meta?: string;
};

type SectionPageProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  eyebrow: string;
  heading: string;
  lead: string;
  metrics?: Metric[];
  actions?: ActionCard[];
  children?: ReactNode;
};

export function SectionPage({
  title,
  subtitle,
  navItems,
  eyebrow,
  heading,
  lead,
  metrics = [],
  actions = [],
  children,
}: SectionPageProps) {
  return (
    <WorkspaceLayout title={title} subtitle={subtitle} navItems={navItems}>
      <section className="ui-panel p-6">
        <p className="ui-kicker">{eyebrow}</p>
        <h1 className="ui-title mt-2">{heading}</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5d665f]">{lead}</p>

        {metrics.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="ui-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#7a817b]">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#1a1a18]">{metric.value}</p>
                <p className="mt-1 text-sm text-[#646d66]">{metric.note}</p>
              </article>
            ))}
          </div>
        ) : null}

        {actions.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <article key={action.title} className="ui-panel p-4 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#1a1a18]">{action.title}</h2>
                  {action.meta ? <span className="rounded-full bg-[#f2f4f0] px-3 py-1 text-xs font-semibold text-[#616862]">{action.meta}</span> : null}
                </div>
                <p className="mt-2 text-sm text-[#5d665f]">{action.description}</p>
              </article>
            ))}
          </div>
        ) : null}

        {children}
      </section>
    </WorkspaceLayout>
  );
}