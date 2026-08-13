(function () {
    'use strict';

    const STORAGE_KEY = 'grtravels_cookie_consent';
    const VALID_CHOICES = ['accepted', 'rejected'];

    function getStoredChoice() {
        try {
            const choice = localStorage.getItem(STORAGE_KEY);
            return VALID_CHOICES.includes(choice) ? choice : null;
        } catch (error) {
            return null;
        }
    }

    function storeChoice(choice) {
        try {
            localStorage.setItem(STORAGE_KEY, choice);
        } catch (error) {
            // El banner seguirá funcionando durante la sesión si el almacenamiento está bloqueado.
        }
    }

    function getAnalyticsId() {
        const meta = document.querySelector('meta[name="google-analytics-id"]');
        const id = meta ? meta.content.trim() : '';
        return /^G-[A-Z0-9]{6,}$/i.test(id) && !/^G-X+$/i.test(id) ? id : null;
    }

    function loadAnalytics() {
        const analyticsId = getAnalyticsId();
        if (!analyticsId || document.querySelector('script[data-gr-analytics]')) {
            return;
        }

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        window.gtag('config', analyticsId, {
            send_page_view: true,
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        const script = document.createElement('script');
        script.async = true;
        script.dataset.grAnalytics = 'true';
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analyticsId);
        document.head.appendChild(script);
    }

    function disableAnalytics() {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', { analytics_storage: 'denied' });
        }

        document.cookie.split(';').forEach(function (item) {
            const name = item.split('=')[0].trim();
            if (name === '_ga' || name.indexOf('_ga_') === 0) {
                document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
            }
        });
    }

    function createBanner() {
        const banner = document.createElement('aside');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Preferencias de cookies');
        banner.setAttribute('aria-live', 'polite');
        banner.innerHTML =
            '<div>' +
                '<h2>Tu privacidad importa</h2>' +
                '<p>Usamos almacenamiento necesario para recordar tu elección. Solo cargaremos cookies analíticas de Google Analytics si las aceptas. <a href="cookies.html">Consulta el aviso de cookies</a>.</p>' +
            '</div>' +
            '<div class="cookie-actions">' +
                '<button type="button" class="cookie-button cookie-button-secondary" data-cookie-reject>Rechazar analíticas</button>' +
                '<button type="button" class="cookie-button cookie-button-primary" data-cookie-accept>Aceptar analíticas</button>' +
            '</div>';

        document.body.appendChild(banner);

        banner.querySelector('[data-cookie-accept]').addEventListener('click', function () {
            storeChoice('accepted');
            loadAnalytics();
            banner.classList.remove('is-visible');
        });

        banner.querySelector('[data-cookie-reject]').addEventListener('click', function () {
            storeChoice('rejected');
            disableAnalytics();
            banner.classList.remove('is-visible');
        });

        return banner;
    }

    document.addEventListener('DOMContentLoaded', function () {
        const banner = createBanner();
        const choice = getStoredChoice();

        if (choice === 'accepted') {
            loadAnalytics();
        } else if (!choice) {
            banner.classList.add('is-visible');
        }

        document.querySelectorAll('[data-cookie-settings]').forEach(function (button) {
            button.addEventListener('click', function () {
                banner.classList.add('is-visible');
                banner.querySelector('button').focus();
            });
        });
    });
})();
