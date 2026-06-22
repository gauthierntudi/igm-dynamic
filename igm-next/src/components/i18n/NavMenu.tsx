"use client";

import { DenoncerOpenTrigger } from "@/components/signalement/DenoncerOpenTrigger";
import { useSiteNavigation } from "@/components/providers/SiteSettingsProvider";
import type { RuntimeNavItem } from "@/lib/cms/navigationTypes";

function NavMenuItem({ item, nested = false }: { item: RuntimeNavItem; nested?: boolean }) {
  if (item.kind === "link") {
    return (
      <li className={item.className}>
        <a
          href={item.href}
          {...(item.openInNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {item.label}
        </a>
      </li>
    );
  }

  if (item.kind === "report") {
    return (
      <li className={item.className}>
        <DenoncerOpenTrigger variant="navSubmenu" />
      </li>
    );
  }

  const useCaretIcon = nested && item.iconStyle === "caret";

  return (
    <li className={["menu-item-has-children", item.className].filter(Boolean).join(" ")}>
      <a className="drop-down" href="#">
        {item.label}
      </a>
      <i
        className={
          useCaretIcon
            ? "d-lg-flex d-none bi-caret-right-fill dropdown-icon"
            : "bi bi-plus dropdown-icon"
        }
      />
      <ul className="sub-menu none">
        {item.children.map((child, index) => (
          <NavMenuItem key={`${item.label}-${index}`} item={child} nested />
        ))}
      </ul>
    </li>
  );
}

export function NavMenu() {
  const { headerNav } = useSiteNavigation();

  return (
    <ul className="menu-list">
      {headerNav.map((item, index) => (
        <NavMenuItem key={index} item={item} />
      ))}
    </ul>
  );
}
