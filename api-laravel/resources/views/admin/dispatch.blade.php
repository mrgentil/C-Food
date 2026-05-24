@extends('layouts.app')

@section('head')
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <style>
        /* Ajustement de l'interface pour le plein écran avec sidebar */
        #admin-main { padding: 0 !important; display: flex; flex-direction: column; overflow: hidden; }
        .leaflet-container { background: #000 !important; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #1c1c1e; color: #fff; border: 1px solid #27272a; }
        .leaflet-popup-content p { margin: 4px 0; }
        
        .pulse-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(249, 115, 22, 0.2); /* brand-500 */
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .pulse-icon::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(249, 115, 22, 0.5);
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
        .pulse-icon svg { width: 16px; height: 16px; color: #f97316; z-index: 2; }

        .restaurant-icon { background: rgba(34, 197, 94, 0.2); }
        .restaurant-icon::after { background: rgba(34, 197, 94, 0.5); }
        .restaurant-icon svg { color: #22c55e; }

        .client-icon { background: rgba(59, 130, 246, 0.2); }
        .client-icon::after { background: rgba(59, 130, 246, 0.5); }
        .client-icon svg { color: #3b82f6; }

        @keyframes pulse {
            0% { transform: scale(0.9); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
        }
    </style>
@endsection

@section('header')
    <div class="flex items-center justify-between px-8 py-5">
        <x-admin.page-header title="Dispatch Live" subtitle="Suivez les livreurs et les commandes en temps réel." />
        <div class="flex gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dark-bg border border-dark-border text-white">
                <span class="w-2 h-2 rounded-full bg-brand-500"></span> Livreurs
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dark-bg border border-dark-border text-white">
                <span class="w-2 h-2 rounded-full bg-green-500"></span> Établissements
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dark-bg border border-dark-border text-white">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span> Clients
            </span>
        </div>
    </div>
@endsection

@section('content')
    <div class="flex flex-1 overflow-hidden">
        
        <!-- Sidebar Liste des commandes -->
        <div class="w-80 bg-dark-card border-r border-dark-border flex flex-col shrink-0">
            <div class="p-4 border-b border-dark-border">
                <h3 class="font-bold text-white mb-1">Commandes Actives</h3>
                <p class="text-xs text-dark-muted">Mise à jour automatique</p>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3" id="orders-list">
                <p class="text-sm text-dark-muted text-center py-4">Chargement...</p>
            </div>
        </div>

        <!-- Carte -->
        <div class="flex-1 relative">
            <div id="map" class="absolute inset-0 z-0"></div>
        </div>
        
    </div>
@endsection

@section('scripts')
    <script>
        const map = L.map('map').setView([-4.4419, 15.2663], 12); // Centré sur Kinshasa par défaut

        // Utilisation d'un fond de carte sombre (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        let markers = {};

        const iconSvg = {
            driver: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`,
            restaurant: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`,
            client: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h12"></path></svg>`
        };

        function createDivIcon(type) {
            let className = 'pulse-icon';
            if(type === 'restaurant') className += ' restaurant-icon';
            if(type === 'client') className += ' client-icon';
            return L.divIcon({
                html: `<div class="${className}">${iconSvg[type]}</div>`,
                className: '',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
        }

        async function fetchDispatchData() {
            try {
                const res = await fetch('/admin/dispatch-data', { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }});
                const data = await res.json();
                
                if (data.success) {
                    updateMap(data.orders);
                    updateList(data.orders);
                }
            } catch (e) {
                console.error("Erreur de polling:", e);
            }
        }

        function updateMap(orders) {
            // Nettoyer les marqueurs obsolètes
            const currentIds = [];
            
            orders.forEach(order => {
                // Restaurant Marker
                if (order.restaurant.lat && order.restaurant.lng) {
                    const id = `rest_${order.id}`;
                    currentIds.push(id);
                    if (!markers[id]) {
                        markers[id] = L.marker([order.restaurant.lat, order.restaurant.lng], { icon: createDivIcon('restaurant') })
                            .addTo(map)
                            .bindPopup(`<b>${order.restaurant.name}</b><br>Commande #${order.short_id}`);
                    }
                }

                // Client Marker
                if (order.client.lat && order.client.lng) {
                    const id = `client_${order.id}`;
                    currentIds.push(id);
                    if (!markers[id]) {
                        markers[id] = L.marker([order.client.lat, order.client.lng], { icon: createDivIcon('client') })
                            .addTo(map)
                            .bindPopup(`<b>${order.client.name}</b><br>Tél: ${order.client.phone}`);
                    }
                }

                // Driver Marker
                if (order.driver && order.driver.lat && order.driver.lng) {
                    const id = `driver_${order.id}`;
                    currentIds.push(id);
                    if (!markers[id]) {
                        markers[id] = L.marker([order.driver.lat, order.driver.lng], { icon: createDivIcon('driver') })
                            .addTo(map)
                            .bindPopup(`<b>Livreur: ${order.driver.name}</b><br>Tél: ${order.driver.phone}<br><span style="font-size:10px;color:#888;">MAJ: ${order.driver.last_update}</span>`);
                    } else {
                        // Mettre à jour la position
                        markers[id].setLatLng([order.driver.lat, order.driver.lng]);
                        markers[id].getPopup().setContent(`<b>Livreur: ${order.driver.name}</b><br>Tél: ${order.driver.phone}<br><span style="font-size:10px;color:#888;">MAJ: ${order.driver.last_update}</span>`);
                    }
                }
            });

            // Supprimer ceux qui ne sont plus dans la liste
            Object.keys(markers).forEach(id => {
                if (!currentIds.includes(id)) {
                    map.removeLayer(markers[id]);
                    delete markers[id];
                }
            });

            // Auto-fit bounds s'il y a des marqueurs et que la carte n'a pas été bougée manuellement récemment
            // Pour ne pas gêner l'utilisateur, on le fait juste à l'init
            if (Object.keys(markers).length > 0 && !window.hasFitted) {
                const group = new L.featureGroup(Object.values(markers));
                map.fitBounds(group.getBounds().pad(0.2));
                window.hasFitted = true;
            }
        }

        function updateList(orders) {
            const list = document.getElementById('orders-list');
            if (orders.length === 0) {
                list.innerHTML = '<p class="text-sm text-dark-muted text-center py-4">Aucune commande active.</p>';
                return;
            }

            const html = orders.map(order => {
                let badge = '';
                if(order.status === 'preparing') badge = '<span class="text-amber-500">En préparation</span>';
                if(order.status === 'picked_up') badge = '<span class="text-brand-500">Pris en charge</span>';
                if(order.status === 'delivering') badge = '<span class="text-indigo-500">En route</span>';

                let driverInfo = order.driver 
                    ? `<p class="text-xs mt-1 text-white flex items-center gap-1"><svg class="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> ${order.driver.name}</p>`
                    : `<p class="text-xs mt-1 text-dark-muted italic">En attente livreur</p>`;

                return `
                    <a href="/admin/orders/${order.id}" class="block bg-dark-bg border border-dark-border p-3 rounded-xl hover:border-brand-500/50 transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-white text-sm">#${order.short_id}</span>
                            <span class="text-[10px] font-bold uppercase tracking-wider">${badge}</span>
                        </div>
                        <p class="text-xs text-dark-muted truncate">📍 ${order.restaurant.name}</p>
                        <p class="text-xs text-dark-muted truncate">🏠 ${order.client.name}</p>
                        ${driverInfo}
                    </a>
                `;
            }).join('');

            list.innerHTML = html;
        }

        // Lancer le polling
        fetchDispatchData();
        setInterval(fetchDispatchData, 10000); // Toutes les 10 secondes
    </script>
@endsection
