import Link from "next/link";

type Props = {
  locale: string;
  currentPath: string;
};

const navItems = [
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Profile", href: "/app/profile" },
  { label: "Family", href: "/app/family" },
  { label: "Professions", href: "/app/professions" },
];

export default function AppPrivateNav({ locale, currentPath }: Props) {
  return (
    <nav className="mb-6 flex flex-wrap gap-3">
      {navItems.map((item) => {
        const fullHref = `/${locale}${item.href}`;
        const isActive = currentPath === item.href;

        if (isActive) {
          return (
            <span
              key={item.href}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white"
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={fullHref}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
