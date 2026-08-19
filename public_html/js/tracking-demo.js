(function () {
    'use strict';

    const unitData = {
        'pv-01': {
            name: 'GR-01 · Sprinter',
            short: 'GR-01',
            color: 'blue',
            colorHex: '#1769e0',
            origin: 'Aeropuerto PVR',
            destination: 'Sayulita Centro',
            eta: 'ETA 10:42 · 18.4 km',
            progress: 68,
            status: 'moving',
            camera: 'GR-01 / CABINA',
            speed: 62,
            signal: 'Última señal 10:27 · Velocidad 62 km/h',
            routeSummary: 'Aeropuerto PVR → Sayulita Centro',
            position: [20.6825, -105.2545],
            travel: 1.2,
            route: [
                [20.6825, -105.2545],
                [20.6910, -105.2628],
                [20.7060, -105.2740],
                [20.7205, -105.2915],
                [20.7380, -105.3140],
                [20.7525, -105.3380],
                [20.7710, -105.3625],
                [20.7985, -105.3920],
                [20.8290, -105.4300],
                [20.8600, -105.4620]
            ],
            minProgress: 60,
            maxProgress: 82
        },
        'pv-02': {
            name: 'GR-02 · Volvo 9700',
            short: 'GR-02',
            color: 'orange',
            colorHex: '#ee8b2b',
            origin: 'Centro Puerto Vallarta',
            destination: 'Punta Mita',
            eta: 'ETA 11:05 · 42.7 km',
            progress: 51,
            status: 'moving',
            camera: 'GR-02 / CABINA',
            speed: 48,
            signal: 'Última señal 10:26 · Velocidad 48 km/h',
            routeSummary: 'Centro PV → Punta Mita',
            position: [20.6520, -105.2260],
            travel: 1.6,
            route: [
                [20.6520, -105.2260],
                [20.6705, -105.2405],
                [20.6890, -105.2590],
                [20.7120, -105.2860],
                [20.7380, -105.3225],
                [20.7585, -105.3740],
                [20.7715, -105.4260],
                [20.7770, -105.4880],
                [20.7820, -105.5420]
            ],
            minProgress: 45,
            maxProgress: 68
        },
        'pv-03': {
            name: 'GR-03 · JAC Sunray',
            short: 'GR-03',
            color: 'purple',
            colorHex: '#8062d9',
            origin: 'Nuevo Vallarta',
            destination: 'Marina Vallarta',
            eta: 'Completada 09:14 · 15.7 km',
            progress: 100,
            status: 'stop',
            camera: 'GR-03 / EXTERIOR',
            speed: 0,
            signal: 'Parada programada · Reanuda 10:36',
            routeSummary: 'Nuevo Vallarta → Marina PV',
            position: [20.7185, -105.2795],
            travel: 1.0,
            route: [
                [20.7185, -105.2795],
                [20.7125, -105.2720],
                [20.7075, -105.2665],
                [20.6990, -105.2580],
                [20.6920, -105.2485]
            ],
            minProgress: 100,
            maxProgress: 100
        }
    };

    const state = {
        selectedUnit: 'pv-01',
        map: null,
        markers: {},
        routes: {}
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function formatClock(date = new Date()) {
        return new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);
    }

    function renderCustomMarker(unitId, isSelected = false) {
        const unit = unitData[unitId];
        if (!unit) return '';
        return `<div class="fleet-marker ${unit.color}${isSelected ? ' selected' : ''}"><span>${unit.short}</span></div>`;
    }

    function updateUnitPositionAlongRoute(unit) {
        if (!unit || unit.status !== 'moving' || !Array.isArray(unit.route) || unit.route.length < 2) return;

        unit.travel = (unit.travel + 0.08) % (unit.route.length - 1);
        const startIndex = Math.floor(unit.travel);
        const endIndex = Math.min(startIndex + 1, unit.route.length - 1);
        const factor = unit.travel - startIndex;

        const start = unit.route[startIndex];
        const end = unit.route[endIndex];

        const lat = start[0] + (end[0] - start[0]) * factor;
        const lng = start[1] + (end[1] - start[1]) * factor;

        unit.position = [lat, lng];
        unit.progress = clamp((unit.travel / (unit.route.length - 1)) * 100, unit.minProgress, unit.maxProgress);
    }

    function buildMap() {
        const mapContainer = document.getElementById('demo-map');
        if (!mapContainer || typeof window.L === 'undefined') return;

        const map = L.map('demo-map', {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            dragging: true
        }).setView([20.75, -105.35], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        state.map = map;

        Object.entries(unitData).forEach(([unitId, unit]) => {
            const route = L.polyline(unit.route, {
                color: unit.colorHex,
                weight: 4,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);

            const marker = L.marker(unit.position, {
                icon: L.divIcon({
                    className: 'fleet-marker-wrap',
                    html: renderCustomMarker(unitId, unitId === state.selectedUnit),
                    iconSize: [68, 30],
                    iconAnchor: [34, 15]
                })
            }).addTo(map);

            marker.bindTooltip(unit.name);
            marker.on('click', () => selectUnit(unitId));
            state.routes[unitId] = route;
            state.markers[unitId] = marker;
        });

        const bounds = L.latLngBounds(Object.values(unitData).flatMap(unit => unit.route));
        map.fitBounds(bounds.pad(0.25));
    }

    function updateMapMarkers() {
        if (!state.map) return;

        Object.entries(unitData).forEach(([unitId, unit]) => {
            const marker = state.markers[unitId];
            const route = state.routes[unitId];
            if (!marker || !route) return;

            marker.setLatLng(unit.position);
            marker.setIcon(L.divIcon({
                className: 'fleet-marker-wrap',
                html: renderCustomMarker(unitId, unitId === state.selectedUnit),
                iconSize: [68, 30],
                iconAnchor: [34, 15]
            }));
            route.setLatLngs(unit.route);
        });
    }

    function updateLiveClock() {
        const clock = $('#live-clock');
        if (clock) clock.textContent = formatClock();
        const modalTime = $('#modal-timecode');
        if (modalTime) modalTime.textContent = formatClock();
    }

    function updateRouteStatusLabel(unitId) {
        const data = unitData[unitId];
        if (!data) return;

        const liveBadge = $('#route-title .route-live-badge');
        if (liveBadge) {
            liveBadge.innerHTML = `<span></span> ${unitId === 'pv-03' ? 'Completada' : 'En vivo'}`;
        }

        const timelineCurrent = document.querySelector('.timeline-item.current');
        const timelineText = timelineCurrent ? timelineCurrent.querySelector('small') : null;
        if (timelineText) {
            timelineText.textContent = data.status === 'moving'
                ? `Última señal ${formatClock()} · Velocidad ${data.speed} km/h`
                : `Parada programada · ${data.signal}`;
        }
    }

    function selectUnit(unitId) {
        const data = unitData[unitId];
        if (!data) return;

        state.selectedUnit = unitId;
        $$('.unit-card').forEach(card => card.classList.toggle('selected', card.dataset.unitCard === unitId));
        if (state.map && state.markers[unitId]) {
            state.map.flyTo(state.markers[unitId].getLatLng(), 10, { duration: 1.2 });
        }

        $('#route-title').innerHTML = `Ruta de ${data.name.split(' · ')[0]} <span class="route-live-badge"><span></span> ${unitId === 'pv-03' ? 'Completada' : 'En vivo'}</span>`;
        $('#route-origin').textContent = data.origin;
        $('#route-destination').textContent = data.destination;
        $('#route-arrival').textContent = data.eta;
        $('#route-progress-bar').style.width = `${data.progress}%`;
        $('#route-progress-text').textContent = `${data.progress}%`;
        $('#video-title').textContent = unitId === 'pv-03' ? 'Video de recorrido' : 'Video en vivo';
        $('#modal-camera-name').textContent = data.camera;
        $('#video-modal-title').textContent = `${data.name} · Cámara`;
        document.querySelector('.video-preview')?.setAttribute('aria-label', `Abrir video en vivo de ${data.name.split(' · ')[0]}`);
        updateRouteStatusLabel(unitId);
        updateMapMarkers();

        const unitCard = document.querySelector(`.unit-card[data-unit-card="${unitId}"]`);
        if (unitCard) {
            const meta = unitCard.querySelector('.unit-card-meta');
            const bottom = unitCard.querySelector('.unit-card-bottom');
            const status = unitCard.querySelector('.status-label');
            if (meta) meta.innerHTML = `<i class="fas fa-route" aria-hidden="true"></i> ${data.routeSummary}`;
            if (bottom) {
                bottom.innerHTML = data.status === 'moving'
                    ? `<span><i class="fas fa-tachometer-alt" aria-hidden="true"></i> ${data.speed} km/h</span><span>ETA ${data.destination === 'Punta Mita' ? '11:05' : '10:42'}</span>`
                    : `<span><i class="fas fa-stopwatch" aria-hidden="true"></i> 04:18 min</span><span>Reanuda 10:36</span>`;
            }
            if (status) {
                status.className = `status-label ${data.status === 'moving' ? 'status-moving' : 'status-stop'}`;
                status.innerHTML = `<span></span> ${data.status === 'moving' ? 'En ruta' : 'En parada'}`;
            }
        }
    }

    function filterUnits(filter) {
        const cards = $$('.unit-card');
        cards.forEach(card => {
            const isStop = card.dataset.unitCard === 'pv-03';
            card.hidden = filter === 'moving' ? isStop : filter === 'stop' ? !isStop : false;
        });
        if (state.map) {
            Object.entries(state.markers).forEach(([unitId, marker]) => {
                const isStop = unitId === 'pv-03';
                marker.setOpacity(filter === 'moving' ? (isStop ? 0 : 1) : filter === 'stop' ? (isStop ? 1 : 0) : 1);
            });
        }
        $$('.map-filter').forEach(button => button.classList.toggle('active', button.dataset.mapFilter === filter));
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        $('[data-close-modal]', modal)?.focus();
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        if (!document.querySelector('.modal-backdrop:not([hidden])')) document.body.classList.remove('modal-open');
    }

    function refreshMap() {
        const sync = $('#last-sync');
        const refresh = $('[data-refresh-map] i');

        if (sync) sync.textContent = 'ahora';
        refresh?.classList.add('fa-spin');

        Object.values(unitData).forEach(unit => {
            if (unit.status !== 'moving') return;
            unit.speed = clamp(unit.speed + (Math.random() - 0.5) * 10, 35, 75);
            updateUnitPositionAlongRoute(unit);
            unit.signal = `Última señal ${formatClock()} · Velocidad ${Math.round(unit.speed)} km/h`;
        });

        updateMapMarkers();
        selectUnit(state.selectedUnit);

        window.setTimeout(() => refresh?.classList.remove('fa-spin'), 650);
        window.setTimeout(() => { if (sync) sync.textContent = '8 s'; }, 2000);
    }

    function downloadCsv() {
        const csv = 'Unidad,Ruta,Inicio,Fin,Distancia,Estado\nGR-01,"Aeropuerto PVR - Sayulita",09:18,,18.4 km,En curso\nGR-02,"Centro PV - Punta Mita",08:42,,42.7 km,En curso\nGR-03,"Nuevo Vallarta - Marina PV",07:55,09:14,15.7 km,Completada';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'gr-travels-rutas-demo.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildMap();
        updateLiveClock();
        selectUnit(state.selectedUnit);

        $$('.unit-card').forEach(card => {
            card.addEventListener('click', () => selectUnit(card.dataset.unitCard));
        });

        $$('.table-action').forEach(button => {
            button.addEventListener('click', () => {
                selectUnit(button.dataset.unitCard);
                window.scrollTo({ top: document.querySelector('.route-panel').offsetTop - 20, behavior: 'smooth' });
            });
        });

        $$('.map-filter').forEach(button => button.addEventListener('click', () => filterUnits(button.dataset.mapFilter)));
        $('[data-refresh-map]')?.addEventListener('click', refreshMap);
        $('[data-open-video]')?.addEventListener('click', () => openModal('video-modal'));
        $$('[data-open-contact]').forEach(button => button.addEventListener('click', () => openModal('contact-modal')));
        $$('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
        $$('.modal-backdrop').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) closeModal(modal); }));
        $('[data-toggle-stream]')?.addEventListener('click', event => {
            const button = event.currentTarget;
            const paused = button.dataset.paused === 'true';
            button.dataset.paused = String(!paused);
            button.innerHTML = paused ? '<i class="fas fa-pause" aria-hidden="true"></i> Pausar señal' : '<i class="fas fa-play" aria-hidden="true"></i> Reanudar señal';
        });
        $('[data-camera-select]')?.addEventListener('change', event => {
            $('#modal-camera-name').textContent = event.target.value.replace('-', ' / ').toUpperCase();
        });
        $('#camera-select')?.addEventListener('change', event => {
            const value = event.target.options[event.target.selectedIndex].textContent;
            $('#modal-camera-name').textContent = value.replace(' · ', ' / ').toUpperCase();
        });
        $('[data-scroll-history]')?.addEventListener('click', () => document.getElementById('history-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }));
        $$('[data-export-history], [data-export-route]').forEach(button => button.addEventListener('click', downloadCsv));
        document.addEventListener('keydown', event => { if (event.key === 'Escape') $$('.modal-backdrop:not([hidden])').forEach(closeModal); });
        $('#pilot-form')?.addEventListener('submit', event => {
            event.preventDefault();
            const status = $('#pilot-form-status');
            status.textContent = '¡Listo! En una implementación real, tu solicitud se enviaría al equipo comercial de GR Travels.';
            event.currentTarget.reset();
        });

        if (state.map) {
            window.setInterval(updateLiveClock, 1000);
            window.setInterval(() => {
                Object.values(unitData).forEach(unit => {
                    if (unit.status !== 'moving') return;
                    unit.speed = clamp(unit.speed + (Math.random() - 0.5) * 10, 38, 78);
                    updateUnitPositionAlongRoute(unit);
                    unit.signal = `Última señal ${formatClock()} · Velocidad ${Math.round(unit.speed)} km/h`;
                    unit.eta = unit.destination === 'Punta Mita' ? 'ETA 11:05 · 42.7 km' : 'ETA 10:42 · 18.4 km';
                });
                updateMapMarkers();
                selectUnit(state.selectedUnit);
                const sync = $('#last-sync');
                if (sync) sync.textContent = 'ahora';
                window.setTimeout(() => { if (sync) sync.textContent = '8 s'; }, 1200);
            }, 5000);
        }
    });
})();
