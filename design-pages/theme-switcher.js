/**
 * MultiForms Theme Switcher
 *
 * Provides hover preview theme switching functionality for static HTML pages.
 * Include this script in any page that needs theme switching.
 *
 * Usage:
 * 1. Include this script in your HTML: <script src="theme-switcher.js"></script>
 * 2. Add a theme switcher container with id="themeSwitcher" in your HTML
 * 3. Or call initThemeSwitcher(containerId) after DOM is ready
 */

(function() {
  'use strict';

  // Theme configuration
  const themes = [
    { id: 'nebula', name: '星云紫', nameEn: 'Nebula Purple', desc: '神秘优雅，适合通用场景', gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)' },
    { id: 'ocean', name: '海洋蓝', nameEn: 'Ocean Blue', desc: '清新专业，适合商务场景', gradient: 'linear-gradient(135deg, #0EA5E9, #06B6D4)' },
    { id: 'sunset', name: '日落橙', nameEn: 'Sunset Orange', desc: '热情活力，适合年轻人', gradient: 'linear-gradient(135deg, #F97316, #EC4899)' },
    { id: 'forest', name: '森林绿', nameEn: 'Forest Green', desc: '自然清新，适合健康环保', gradient: 'linear-gradient(135deg, #10B981, #06B6D4)' },
    { id: 'sakura', name: '樱花粉', nameEn: 'Sakura Pink', desc: '柔美浪漫，适合女性用户', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
    { id: 'cyber', name: '赛博霓虹', nameEn: 'Cyber Neon', desc: '科技炫酷，适合游戏科技', gradient: 'linear-gradient(135deg, #22D3EE, #A855F7)' },
    { id: 'minimal', name: '极简灰', nameEn: 'Minimal Gray', desc: '简约低调，适合正式场合', gradient: 'linear-gradient(135deg, #64748B, #94A3B8)' },
    { id: 'royal', name: '皇家金', nameEn: 'Royal Gold', desc: '尊贵奢华，适合高端品牌', gradient: 'linear-gradient(135deg, #F59E0B, #EAB308)' }
  ];

  // State
  let currentTheme = localStorage.getItem('multiforms-theme') || 'nebula';
  let previewTheme = null;
  let closeTimeout = null;

  /**
   * Initialize theme switcher in a container
   * @param {string} containerId - ID of the container element
   */
  function initThemeSwitcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('[ThemeSwitcher] Container not found:', containerId);
      return;
    }

    // Check if container has the required structure
    const switcherBtn = container.querySelector('.theme-switcher-btn, #themeSwitcherBtn');
    const dropdown = container.querySelector('.theme-dropdown, #themeDropdown');
    const currentDot = container.querySelector('.theme-current-dot, #themeCurrentDot');
    const currentName = container.querySelector('.theme-current-name, #themeCurrentName');

    if (!switcherBtn || !dropdown) {
      console.warn('[ThemeSwitcher] Required elements not found in container:', containerId);
      return;
    }

    // Apply saved theme on page load
    document.body.dataset.theme = currentTheme;

    // Build theme dropdown
    buildThemeDropdown(dropdown, container);

    // Update current theme display
    if (currentDot && currentName) {
      updateCurrentThemeDisplay(currentDot, currentName);
    }

    // Set up event listeners
    setupEventListeners(container, switcherBtn, dropdown, currentDot, currentName);

    console.log('[ThemeSwitcher] Initialized:', containerId, 'with theme:', currentTheme);
  }

  /**
   * Build theme dropdown rows
   */
  function buildThemeDropdown(dropdown, container) {
    const hint = dropdown.querySelector('.theme-dropdown-hint');
    dropdown.innerHTML = '';

    themes.forEach(theme => {
      const row = document.createElement('div');
      row.className = 'theme-row';
      if (theme.id === currentTheme) {
        row.classList.add('active');
      }
      row.dataset.themeId = theme.id;

      row.innerHTML = `
        <div class="theme-row-dot" style="background: ${theme.gradient};"></div>
        <div class="theme-row-info">
          <div class="theme-row-name">
            ${theme.name}
            ${theme.id === currentTheme ? '<span class="theme-row-current-badge">当前</span>' : ''}
          </div>
          <div class="theme-row-desc">${theme.nameEn} · ${theme.desc}</div>
        </div>
        ${theme.id === currentTheme ? '<div class="theme-row-indicator"></div>' : ''}
      `;

      // Hover to preview theme
      row.addEventListener('mouseenter', () => {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }

        if (previewTheme !== theme.id) {
          previewTheme = theme.id;
          document.body.dataset.theme = theme.id;
          console.log('[ThemeSwitcher] Hover preview:', theme.id);
        }
      });

      // Click to confirm theme selection
      row.addEventListener('click', () => {
        currentTheme = theme.id;
        previewTheme = null;
        document.body.dataset.theme = theme.id;
        localStorage.setItem('multiforms-theme', theme.id);

        // Rebuild dropdown to update active states
        buildThemeDropdown(dropdown, container);

        // Update current theme display
        const currentDot = container.querySelector('.theme-current-dot, #themeCurrentDot');
        const currentName = container.querySelector('.theme-current-name, #themeCurrentName');
        if (currentDot && currentName) {
          updateCurrentThemeDisplay(currentDot, currentName);
        }

        // Close dropdown
        dropdown.classList.remove('show');

        console.log('[ThemeSwitcher] Theme selected:', theme.id);

        // Trigger custom event for other components to react
        container.dispatchEvent(new CustomEvent('themechange', { detail: { themeId: theme.id } }));
      });

      dropdown.appendChild(row);
    });

    // Add hint back
    if (hint) {
      dropdown.appendChild(hint);
    } else {
      const newHint = document.createElement('div');
      newHint.className = 'theme-dropdown-hint';
      newHint.textContent = 'Hover 预览，点击选中';
      dropdown.appendChild(newHint);
    }
  }

  /**
   * Update current theme display
   */
  function updateCurrentThemeDisplay(dotEl, nameEl) {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      if (dotEl) dotEl.style.background = theme.gradient;
      if (nameEl) nameEl.textContent = theme.name;
    }
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners(container, switcherBtn, dropdown, currentDot, currentName) {
    // Show dropdown
    function showDropdown() {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      dropdown.classList.add('show');
    }

    // Hide dropdown (with delay)
    function hideDropdown() {
      closeTimeout = setTimeout(() => {
        dropdown.classList.remove('show');
        // Restore original theme if previewing
        if (previewTheme && previewTheme !== currentTheme) {
          document.body.dataset.theme = currentTheme;
          previewTheme = null;
          console.log('[ThemeSwitcher] Restored to:', currentTheme);
        }
      }, 150);
    }

    // Button hover to show dropdown
    switcherBtn.addEventListener('mouseenter', showDropdown);

    // Mouse leave to hide dropdown
    container.addEventListener('mouseleave', hideDropdown);

    // Prevent dropdown close when hovering over dropdown content
    dropdown.addEventListener('mouseenter', () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
    });

    dropdown.addEventListener('mouseleave', hideDropdown);
  }

  /**
   * Get current theme
   */
  function getCurrentTheme() {
    return currentTheme;
  }

  /**
   * Set theme programmatically
   */
  function setTheme(themeId) {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      currentTheme = themeId;
      document.body.dataset.theme = themeId;
      localStorage.setItem('multiforms-theme', themeId);
      console.log('[ThemeSwitcher] Theme set to:', themeId);
    }
  }

  /**
   * Get all available themes
   */
  function getAllThemes() {
    return themes;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Try to find default theme switcher container
      const defaultContainer = document.getElementById('themeSwitcher');
      if (defaultContainer) {
        initThemeSwitcher('themeSwitcher');
      }
    });
  } else {
    // DOM already ready
    const defaultContainer = document.getElementById('themeSwitcher');
    if (defaultContainer) {
      initThemeSwitcher('themeSwitcher');
    }
  }

  // Export to global scope
  window.MultiFormsThemeSwitcher = {
    init: initThemeSwitcher,
    getCurrentTheme: getCurrentTheme,
    setTheme: setTheme,
    getAllThemes: getAllThemes
  };

})();
