(function () {
  function getMainMenuFromTarget(target) {
    var header = target.closest("header");
    if (!header) return document.querySelector(".main-menu");
    return header.querySelector(".main-menu") || document.querySelector(".main-menu");
  }

  function closeMenu(menu) {
    if (!menu) return;
    menu.classList.remove("show-menu");
    document.body.style.overflow = "";
  }

  function openMenu(menu) {
    if (!menu) return;
    menu.classList.add("show-menu");
    document.body.style.overflow = "hidden";
  }

  function setLiOpenState(li, open) {
    if (!li || !(li instanceof Element)) return;

    li.classList.toggle("is-open", open);

    var icon = li.querySelector(
      ":scope > .dropdown-icon.bi-plus, :scope > .dropdown-icon.bi-dash",
    );
    if (icon && icon.classList) {
      icon.classList.toggle("bi-plus", !open);
      icon.classList.toggle("bi-dash", open);
    }
  }

  function closeSiblingDropdowns(li) {
    if (!li || !li.parentElement) return;

    var siblings = li.parentElement.children;
    for (var i = 0; i < siblings.length; i++) {
      var sib = siblings[i];
      if (sib !== li && sib.classList && sib.classList.contains("is-open")) {
        setLiOpenState(sib, false);
      }
    }
  }

  function toggleDropdownFromElement(el) {
    if (!el || !(el instanceof Element)) return;

    var li = el.closest("li.menu-item-has-children");
    if (!li) return;

    var willOpen = !li.classList.contains("is-open");
    closeSiblingDropdowns(li);
    setLiOpenState(li, willOpen);
  }

  document.addEventListener("click", function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;

    var openBtn = target.closest(".mobile-menu-btn");
    if (openBtn) {
      openMenu(getMainMenuFromTarget(openBtn));
      return;
    }

    var closeBtn = target.closest(".menu-close-btn");
    if (closeBtn) {
      closeMenu(getMainMenuFromTarget(closeBtn));
      return;
    }

    var dropdownIcon = target.closest(".dropdown-icon");
    if (dropdownIcon) {
      if (
        dropdownIcon.classList &&
        (dropdownIcon.classList.contains("bi-plus") ||
          dropdownIcon.classList.contains("bi-dash"))
      ) {
        toggleDropdownFromElement(dropdownIcon);
      }
      return;
    }

    var hashLink = target.closest('a[href="#"]');
    if (hashLink) {
      var inDropdown = hashLink.closest("li.menu-item-has-children");
      if (inDropdown) {
        e.preventDefault();
        toggleDropdownFromElement(hashLink);
        return;
      }
    }

    var openDropdown = target.closest("header.header-area li.menu-item-has-children.is-open");
    if (!openDropdown) {
      var allOpen = document.querySelectorAll(
        "header.header-area li.menu-item-has-children.is-open",
      );
      for (var j = 0; j < allOpen.length; j++) {
        setLiOpenState(allOpen[j], false);
      }
    }

    var openMenuEl = document.querySelector(".main-menu.show-menu");
    if (openMenuEl) {
      var clickedInsideMenu = target.closest(".main-menu");
      var clickedMenuButton = target.closest(".mobile-menu-btn");
      if (!clickedInsideMenu && !clickedMenuButton) {
        closeMenu(openMenuEl);
      }
    }
  });
})();