"use client";

import { useEffect, type RefObject } from "react";

const DROPDOWN_CLOSE_DELAY_MS = 1500;
const DESKTOP_MENU_QUERY = "(min-width: 992px)";

function clearCloseTimer(
  timers: Map<Element, ReturnType<typeof setTimeout>>,
  li: Element,
) {
  const timer = timers.get(li);
  if (!timer) return;
  clearTimeout(timer);
  timers.delete(li);
}

function getAncestorDropdownItems(li: Element): Element[] {
  const ancestors: Element[] = [];
  let parent = li.parentElement?.closest("li.menu-item-has-children");
  while (parent) {
    ancestors.push(parent);
    parent = parent.parentElement?.closest("li.menu-item-has-children");
  }
  return ancestors;
}

function keepAncestorsOpen(timers: Map<Element, ReturnType<typeof setTimeout>>, li: Element) {
  for (const ancestor of getAncestorDropdownItems(li)) {
    clearCloseTimer(timers, ancestor);
    ancestor.classList.add("is-hover-open");
  }
}

function closeDropdown(timers: Map<Element, ReturnType<typeof setTimeout>>, li: Element) {
  clearCloseTimer(timers, li);
  li.classList.remove("is-hover-open");
  li.querySelectorAll("li.menu-item-has-children.is-hover-open").forEach((child) => {
    child.classList.remove("is-hover-open");
    clearCloseTimer(timers, child);
  });
}

function openDropdown(timers: Map<Element, ReturnType<typeof setTimeout>>, li: Element) {
  keepAncestorsOpen(timers, li);

  const parent = li.parentElement;
  if (parent) {
    for (const sibling of parent.children) {
      if (
        sibling !== li &&
        sibling instanceof HTMLElement &&
        sibling.classList.contains("menu-item-has-children")
      ) {
        closeDropdown(timers, sibling);
      }
    }
  }

  clearCloseTimer(timers, li);
  li.classList.add("is-hover-open");
}

function scheduleClose(timers: Map<Element, ReturnType<typeof setTimeout>>, li: Element) {
  clearCloseTimer(timers, li);
  const timer = setTimeout(() => {
    closeDropdown(timers, li);
  }, DROPDOWN_CLOSE_DELAY_MS);
  timers.set(li, timer);
}

/**
 * Délai avant fermeture des menus déroulants desktop (header).
 * Mobile : inchangé (clic + classe is-open).
 */
export function useNavDropdownHoverDelay(
  menuRef: RefObject<HTMLUListElement | null>,
  menuKey: unknown,
) {
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const mediaQuery = window.matchMedia(DESKTOP_MENU_QUERY);
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const cleanups: Array<() => void> = [];

    function bindItem(li: Element) {
      const submenu = li.querySelector(":scope > ul.sub-menu");
      const onEnter = () => {
        if (!mediaQuery.matches) return;
        openDropdown(timers, li);
      };
      const onLeave = () => {
        if (!mediaQuery.matches) return;
        scheduleClose(timers, li);
      };

      li.addEventListener("mouseenter", onEnter);
      li.addEventListener("mouseleave", onLeave);
      submenu?.addEventListener("mouseenter", onEnter);
      submenu?.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        li.removeEventListener("mouseenter", onEnter);
        li.removeEventListener("mouseleave", onLeave);
        submenu?.removeEventListener("mouseenter", onEnter);
        submenu?.removeEventListener("mouseleave", onLeave);
        closeDropdown(timers, li);
      });
    }

    menu.querySelectorAll("li.menu-item-has-children").forEach(bindItem);

    const onMediaChange = () => {
      if (mediaQuery.matches) return;
      menu.querySelectorAll("li.menu-item-has-children.is-hover-open").forEach((li) => {
        closeDropdown(timers, li);
      });
    };

    mediaQuery.addEventListener("change", onMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", onMediaChange);
      cleanups.forEach((cleanup) => cleanup());
      timers.clear();
    };
  }, [menuRef, menuKey]);
}
