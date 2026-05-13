import { NavLink } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
};

type SideNavProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  onLogout?: () => void;
};

export function SideNav({ title, subtitle, navItems, onLogout }: SideNavProps) {
  return (
    <aside className="ui-panel p-5 md:p-6">
      <p className="ui-kicker">
        {title}
      </p>
      <p className="mt-2 text-sm text-[#5d665f]">{subtitle}</p>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            className={({ isActive }) =>
              [
                "block rounded-lg border px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56]"
                  : "border-[#eeeee9] bg-[#f8f8f6] text-[#3f4842] hover:bg-[#f1f3ef]",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {onLogout ? (
        <div className="mt-6 border-t border-[#eeeee9] pt-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-[#eeeee9] px-3 py-2 text-sm font-medium text-[#6a342a] transition hover:bg-[#fff3ef]"
          >
            Log out
          </button>
        </div>
      ) : null}
    </aside>
  );
}