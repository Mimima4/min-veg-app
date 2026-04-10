import Link from "next/link";

type Props = {
  locale: string;
  currentPath: string;
};

type NavItem = {
  label: string;
  href: string;
  matchPrefix?: string;
};

function isActive(currentPath: string, item: NavItem) {
  if (item.matchPrefix) {
    return currentPath.startsWith(item.matchPrefix);
  }

  return currentPath === item.href;
}

export default function AppPrivateNav({ locale, currentPath }: Props) {
  const items: NavItem[] = [
    {
      label: "Profile",
      href: `/${locale}/app/profile`,
      matchPrefix: "/app/profile",
    },
    {
      label: "Family",
      href: `/${locale}/app/family`,
      matchPrefix: "/app/family",
    },
    {
      label: "Professions",
      href: `/${locale}/app/professions`,
      matchPrefix: "/app/professions",
    },
    {
      label: "Route",
      href: `/${locale}/app/route`,
      matchPrefix: "/app/route",
    },
  ];

  return (
    <nav className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = isActive(currentPath, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-stone-900 text-white"
                : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}