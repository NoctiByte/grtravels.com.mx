(function () {
    'use strict';

    const unitData = {
        'pv-01': { name: 'GR-01 · Sprinter', origin: 'Aeropuerto PVR', destination: 'Sayulita Centro', eta: 'ETA 10:42 · 18.4 km', progress: 68, routeClass: 'route-blue', camera: 'GR-01 / CABINA' },
        'pv-02': { name: 'GR-02 · Volvo 9700', origin: 'Centro Puerto Vallarta', destination: 'Punta Mita', eta: 'ETA 11:05 · 42.7 km', progress: 51, routeClass: 'route-orange', camera: 'GR-02 / CABINA' },
        'pv-03': { name: 'GR-03 · JAC Sunray', origin: 'Nuevo Vallarta', destination: 'Marina Vallarta', eta: 'Completada 09:14 · 15.7 km', progress: 100, routeClass: 'route-purple', camera: 'GR-03 / EXTERIOR' }
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function selectUnit(unitId) {
        const data = unitData[unitId];
        if (!data) return;
        $$('.unit-card').forEach(card => card.classList.toggle('selected', card.dataset.unitCard === unitId));
        $$('.unit-marker').forEach(marker => marker.classList.toggle('is-selected', marker.dataset.unit === unitId));
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
    }

    function filterUnits(filter) {
        const cards = $$('.unit-card');
        const markers = $$('.unit-marker');
        cards.forEach(card => {
            const isStop = card.dataset.unitCard === 'pv-03';
            card.hidden = filter === 'moving' ? isStop : filter === 'stop' ? !isStop : false;
        });
        markers.forEach(marker => {
            const isStop = marker.dataset.unit === 'pv-03';
            marker.hidden = filter === 'moving' ? isStop : filter === 'stop' ? !isStop : false;
        });
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
        window.setTimeout(() => refresh?.classList.remove('fa-spin'), 650);
        window.setTimeout(() => { if (sync) sync.textContent = '8 s'; }, 2500);
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
        $$('.unit-card, .unit-marker').forEach(element => element.addEventListener('click', () => selectUnit(element.dataset.unitCard || element.dataset.unit)));
        $$('.table-action').forEach(button => button.addEventListener('click', () => { selectUnit(button.dataset.unitCard); window.scrollTo({ top: document.querySelector('.route-panel').offsetTop - 20, behavior: 'smooth' }); }));
        $$('.map-filter').forEach(button => button.addEventListener('click', () => filterUnits(button.dataset.mapFilter)));
        $('[data-refresh-map]')?.addEventListener('click', refreshMap);
        $('[data-open-video]')?.addEventListener('click', () => openModal('video-modal'));
        $$('[data-open-contact]').forEach(button => button.addEventListener('click', () => openModal('contact-modal')));
        $$('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
        $$('.modal-backdrop').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) closeModal(modal); }));
        $('[data-toggle-stream]')?.addEventListener('click', event => { const button = event.currentTarget; const paused = button.dataset.paused === 'true'; button.dataset.paused = String(!paused); button.innerHTML = paused ? '<i class="fas fa-pause" aria-hidden="true"></i> Pausar señal' : '<i class="fas fa-play" aria-hidden="true"></i> Reanudar señal'; });
        $('[data-camera-select]')?.addEventListener('change', event => { $('#modal-camera-name').textContent = event.target.value.replace('-', ' / ').toUpperCase(); });
        $('#camera-select')?.addEventListener('change', event => { const value = event.target.options[event.target.selectedIndex].textContent; $('#modal-camera-name').textContent = value.replace(' · ', ' / ').toUpperCase(); });
        $('[data-scroll-history]')?.addEventListener('click', () => document.getElementById('history-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }));
        $$('[data-export-history], [data-export-route]').forEach(button => button.addEventListener('click', downloadCsv));
        document.addEventListener('keydown', event => { if (event.key === 'Escape') $$('.modal-backdrop:not([hidden])').forEach(closeModal); });
        $('#pilot-form')?.addEventListener('submit', event => { event.preventDefault(); const status = $('#pilot-form-status'); status.textContent = '¡Listo! En una implementación real, tu solicitud se enviaría al equipo comercial de GR Travels.'; event.currentTarget.reset(); });
    });
})();
