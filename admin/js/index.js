function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const isOpen = !sidebar.classList.contains("-translate-x-full");
  
  if (isOpen) {
    // Close sidebar
    sidebar.classList.add("-translate-x-full");
    if (backdrop) {
      backdrop.classList.add("hidden");
    }
  } else {
    // Open sidebar
    sidebar.classList.remove("-translate-x-full");
    if (backdrop && window.innerWidth < 1024) {
      backdrop.classList.remove("hidden");
    }
  }
}

// Function to close sidebar on mobile
function closeSidebarMobile() {
  if (window.innerWidth < 1024) {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    sidebar.classList.add("-translate-x-full");
    if (backdrop) {
      backdrop.classList.add("hidden");
    }
  }
}

// Close sidebar on mobile when clicking outside
document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const isClickInside = sidebar.contains(event.target);
  const isMenuButton = event.target.closest("button");
  const isBackdrop = event.target.id === "sidebarBackdrop";

  if ((!isClickInside && !isMenuButton && !isBackdrop) && window.innerWidth < 1024) {
    sidebar.classList.add("-translate-x-full");
    if (backdrop) {
      backdrop.classList.add("hidden");
    }
  }
});

// Handle responsive sidebar
window.addEventListener("resize", function () {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (window.innerWidth >= 1024) {
    sidebar.classList.remove("-translate-x-full");
    if (backdrop) {
      backdrop.classList.add("hidden");
    }
  } else {
    // Only hide backdrop if sidebar is closed
    if (sidebar.classList.contains("-translate-x-full") && backdrop) {
      backdrop.classList.add("hidden");
    }
  }
});

// Initialize sidebar state on load
if (window.innerWidth < 1024) {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  sidebar.classList.add("-translate-x-full");
  if (backdrop) {
    backdrop.classList.add("hidden");
  }
}

// Active link handling
document.querySelectorAll(".sidebar-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".sidebar-link").forEach((l) => {
      l.classList.remove("active", "bg-white");
      l.classList.add("text-white");
      l.querySelector(".sidebar-icon").classList.remove("text-gray-800");
      l.querySelector(".sidebar-text").classList.remove("text-gray-800");
    });
    this.classList.add("active", "bg-white");
    this.classList.remove("text-white");
    this.querySelector(".sidebar-icon").classList.add("text-gray-800");
    this.querySelector(".sidebar-text").classList.add("text-gray-800");
  });
});
// Function to load page content
async function loadPage(pageName) {
  const container = document.getElementById("content-container");

  if (!container) {
    console.error("Content container not found");
    return;
  }

  // Show loading state
  container.innerHTML =
    '<div class="flex items-center justify-center h-64"><div class="text-primary">Memuat...</div></div>';

  try {
    const response = await fetch(`pages/${pageName}.html`);

    if (!response.ok) {
      throw new Error(`Failed to load page: ${pageName}`);
    }

    const html = await response.text();
    container.innerHTML = html;

    // Execute any scripts in the loaded content
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Update active sidebar link
    updateActiveSidebarLink(pageName);
    
    // Close sidebar on mobile after page loads
    closeSidebarMobile();
  } catch (error) {
    console.error("Error loading page:", error);
    container.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Gagal memuat halaman: ${pageName}</p>
        </div>
      </div>
    `;
  }
}

// Function to update active sidebar link
function updateActiveSidebarLink(pageName) {
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    const linkPage = link.getAttribute("data-page");

    if (linkPage === pageName) {
      link.classList.add("active", "bg-white");
      link.classList.remove("text-white");
      link.querySelector(".sidebar-icon").classList.add("text-gray-800");
      link.querySelector(".sidebar-text").classList.add("text-gray-800");
    } else {
      link.classList.remove("active", "bg-white");
      link.classList.add("text-white");
      link.querySelector(".sidebar-icon").classList.remove("text-gray-800");
      link.querySelector(".sidebar-text").classList.remove("text-gray-800");
    }
  });
}

// Initialize page navigation
document.addEventListener("DOMContentLoaded", function () {
  // Add click handlers to sidebar links
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageName = this.getAttribute("data-page");
      if (pageName) {
        // Close sidebar on mobile before loading page
        closeSidebarMobile();
        loadPage(pageName);
        // Update URL without reloading
        window.history.pushState({ page: pageName }, "", `?page=${pageName}`);
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener("popstate", function (e) {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || "dashboard";
    loadPage(page);
  });

  // Load initial page from URL or default to dashboard
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = urlParams.get("page") || "dashboard";
  loadPage(initialPage);
});
