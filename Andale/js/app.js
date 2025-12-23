// Inicializar la aplicación
function initApp() {
    // Cargar datos desde localStorage si existen
    loadFromLocalStorage();
    
    renderCategories();
    renderHomeItems();
    renderFavoriteItems();
    navigation.initNavigation();
    updateUI();
    lucide.createIcons();
    
    // Actualizar contador de reservas
    updateReservationsCount();
    
    // Configurar event listeners
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('notificationBtn').addEventListener('click', showNotifications);
    
    // Cargar promociones inicialmente
    renderPromotions();
}

// Cargar datos desde localStorage
function loadFromLocalStorage() {
    const savedFavorites = localStorage.getItem('andaleYaFavorites');
    const savedReservations = localStorage.getItem('andaleYaReservations');
    
    if (savedFavorites) {
        sampleData.favorites = JSON.parse(savedFavorites);
    }
    
    if (savedReservations) {
        sampleData.reservations = JSON.parse(savedReservations);
    }
}

// Guardar datos en localStorage
function saveToLocalStorage() {
    localStorage.setItem('andaleYaFavorites', JSON.stringify(sampleData.favorites));
    localStorage.setItem('andaleYaReservations', JSON.stringify(sampleData.reservations));
}

// Renderizar categorías
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';
    
    const state = navigation.getState();
    
    sampleData.categories.forEach(category => {
        const isSelected = state.selectedCategory === category.name;
        const chip = document.createElement('button');
        chip.className = `category-chip ${isSelected ? 'active' : ''}`;
        chip.innerHTML = `
            <i data-lucide="${category.icon}" class="category-icon"></i>
            <span class="category-name">${category.name}</span>
        `;
        chip.onclick = () => setSelectedCategory(category.name);
        container.appendChild(chip);
    });
    
    lucide.createIcons();
}

// Renderizar elementos de inicio
function renderHomeItems() {
    const container = document.getElementById('homeItems');
    const categoryTitle = document.getElementById('categoryTitle');
    container.innerHTML = '';
    
    const state = navigation.getState();
    
    // Mostrar indicador de carga
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
        </div>
    `;
    
    // Simular carga de datos
    setTimeout(() => {
        container.innerHTML = '';
        
        const items = sampleData.items[state.selectedCategory] || [];
        
        // Actualizar título de categoría
        categoryTitle.textContent = state.selectedCategory === 'Lugares' 
            ? 'Destinos populares' 
            : state.selectedCategory;
        
        if (items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                    <i data-lucide="map-pin" style="height: 48px; width: 48px; margin-bottom: 16px;"></i>
                    <p>No hay elementos en esta categoría</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'place-card';
            card.onclick = () => showItemDetail(item);
            card.innerHTML = `
                <div class="place-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzNCAxMDAgMTE4IDExNiAxMTggMTQwQzExOCAxNjQgMTM0IDE4MCAxNTAgMTgwQzE2NiAxODAgMTgyIDE2NCAxODIgMTQwQzE4MiAxMTYgMTY2IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'">
                    <div class="rating-badge">
                        <i data-lucide="star" class="icon"></i>
                        <span>${item.rating}</span>
                    </div>
                    <button style="position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.95); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;" onclick="event.stopPropagation(); toggleFavorite(${item.id})">
                        <i data-lucide="heart" style="height: 16px; width: 16px; ${isFavorite(item.id) ? 'color: #ef4444; fill: #ef4444;' : 'color: #6b7280;'}"></i>
                    </button>
                </div>
                <div class="place-content">
                    <div class="place-name">${item.name}</div>
                    <div class="place-location">
                        <i data-lucide="map-pin" class="icon"></i>
                        <span>${item.distance}</span>
                    </div>
                    ${item.type ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${item.type}</div>` : ''}
                </div>
            `;
            container.appendChild(card);
        });
        
        lucide.createIcons();
    }, 500);
}

// Renderizar elementos favoritos
function renderFavoriteItems() {
    const container = document.getElementById('favoriteItems');
    container.innerHTML = '';
    
    if (sampleData.favorites.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; color: #6b7280;">
                <i data-lucide="heart" style="height: 64px; width: 64px; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">No tienes favoritos</h3>
                <p style="margin-bottom: 24px;">Agrega lugares a tus favoritos para verlos aquí</p>
                <button class="action-button" onclick="navigation.setActiveTab('home')">Explorar lugares</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    sampleData.favorites.forEach(item => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.onclick = () => showItemDetail(item);
        card.innerHTML = `
            <div class="place-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzNCAxMDAgMTE4IDExNiAxMTggMTQwQzExOCAxNjQgMTM0IDE4MCAxNTAgMTgwQzE2NiAxODAgMTgyIDE2NCAxODIgMTQwQzE4MiAxMTYgMTY2IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'">
                <div class="rating-badge">
                    <i data-lucide="star" class="icon"></i>
                    <span>${item.rating}</span>
                </div>
                <button style="position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.95); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;" onclick="event.stopPropagation(); removeFavorite(${item.id}, this)">
                    <i data-lucide="x" style="height: 16px; width: 16px; color: #ef4444;"></i>
                </button>
            </div>
            <div class="place-content">
                <div class="place-name">${item.name}</div>
                <div class="place-location">
                    <i data-lucide="map-pin" class="icon"></i>
                    <span>${item.distance}</span>
                </div>
                ${item.type ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${item.type}</div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

// Funcionalidad de reservas sin registro
function showReservationModal(item) {
    // Crear modal de reserva
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reservar: ${item.name}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x" class="icon"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="reservationForm">
                    <div class="form-group">
                        <label for="reservationName">Nombre completo</label>
                        <input type="text" id="reservationName" required placeholder="Ingresa tu nombre completo">
                    </div>
                    <div class="form-group">
                        <label for="reservationEmail">Correo electrónico</label>
                        <input type="email" id="reservationEmail" required placeholder="Ingresa tu correo electrónico">
                    </div>
                    <div class="form-group">
                        <label for="reservationPhone">Teléfono</label>
                        <input type="tel" id="reservationPhone" required placeholder="Ingresa tu teléfono">
                    </div>
                    <div class="form-group">
                        <label for="reservationDate">Fecha de reserva</label>
                        <input type="date" id="reservationDate" required>
                    </div>
                    <div class="form-group">
                        <label for="reservationTime">Hora</label>
                        <input type="time" id="reservationTime" required>
                    </div>
                    <div class="form-group">
                        <label for="reservationGuests">Número de personas</label>
                        <input type="number" id="reservationGuests" min="1" max="20" value="1" required>
                    </div>
                    <div class="form-group">
                        <label for="reservationNotes">Notas adicionales (opcional)</label>
                        <textarea id="reservationNotes" placeholder="Comentarios o requerimientos especiales"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-button outline" onclick="closeModal()">Cancelar</button>
                <button class="action-button primary" onclick="submitReservation(${item.id})">Confirmar Reserva</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Establecer fecha mínima como hoy
    const dateInput = document.getElementById('reservationDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    lucide.createIcons();
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function submitReservation(itemId) {
    const form = document.getElementById('reservationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const item = findItemById(itemId);
    if (!item) return;
    
    const reservationData = {
        id: Date.now(),
        itemId: itemId,
        service: item.name,
        date: document.getElementById('reservationDate').value,
        time: document.getElementById('reservationTime').value,
        guests: document.getElementById('reservationGuests').value,
        customerName: document.getElementById('reservationName').value,
        customerEmail: document.getElementById('reservationEmail').value,
        customerPhone: document.getElementById('reservationPhone').value,
        notes: document.getElementById('reservationNotes').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Agregar a las reservas
    sampleData.reservations.push(reservationData);
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Cerrar modal
    closeModal();
    
    // Mostrar confirmación
    showToast('¡Reserva realizada con éxito!', 'success');
    
    // Actualizar contador en perfil
    updateReservationsCount();
    
    // Si estamos en la vista de reservas, actualizar
    if (navigation.getState().activeTab === 'orders') {
        renderReservations();
    }
}

// Mostrar detalle del elemento con botón de reserva
function showItemDetail(item) {
    navigation.setState({ selectedItem: item });
    const detailView = document.getElementById('detailView');
    detailView.className = 'detail-view active';
    
    let additionalInfo = '';
    
    if (item.price) {
        additionalInfo += `
            <div class="detail-info-item">
                <div class="detail-info-icon">
                    <i data-lucide="dollar-sign" class="icon"></i>
                </div>
                <div class="detail-info-content">
                    <div class="detail-info-label">Precio</div>
                    <div class="detail-info-value">${item.price}</div>
                </div>
            </div>
        `;
    }
    
    if (item.bestTime) {
        additionalInfo += `
            <div class="detail-info-item">
                <div class="detail-info-icon">
                    <i data-lucide="sun" class="icon"></i>
                </div>
                <div class="detail-info-content">
                    <div class="detail-info-label">Mejor época para visitar</div>
                    <div class="detail-info-value">${item.bestTime}</div>
                </div>
            </div>
        `;
    }
    
    if (item.tips) {
        additionalInfo += `
            <div class="detail-info-item">
                <div class="detail-info-icon">
                    <i data-lucide="lightbulb" class="icon"></i>
                </div>
                <div class="detail-info-content">
                    <div class="detail-info-label">Consejos</div>
                    <div class="detail-info-value">${item.tips}</div>
                </div>
            </div>
        `;
    }
    
    detailView.innerHTML = `
        <div class="detail-header">
            <div id="detailMap" class="detail-map"></div>
            <button class="detail-back-button" onclick="navigation.handleBackFromDetail()">
                <i data-lucide="arrow-left" class="icon"></i>
            </button>
            <button class="detail-favorite-button" onclick="toggleFavorite(${item.id})">
                <i data-lucide="heart" style="${isFavorite(item.id) ? 'color: #ef4444; fill: #ef4444;' : 'color: #6b7280;'}"></i>
            </button>
        </div>
        <div class="detail-content">
            <div class="detail-title-section">
                <h1 class="detail-title">${item.name}</h1>
                <div class="detail-rating">
                    <i data-lucide="star" class="icon"></i>
                    <span>${item.rating}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                <span class="preference-tag">${item.type}</span>
                <span class="preference-tag" style="background: #e0f2fe; color: #0369a1;">${item.distance}</span>
            </div>
            
            <p class="detail-description">${item.description}</p>
            
            <div class="detail-info-section">
                <div class="detail-info-item">
                    <div class="detail-info-icon">
                        <i data-lucide="map-pin" class="icon"></i>
                    </div>
                    <div class="detail-info-content">
                        <div class="detail-info-label">Ubicación</div>
                        <div class="detail-info-value">${item.address}</div>
                    </div>
                </div>
                
                <div class="detail-info-item">
                    <div class="detail-info-icon">
                        <i data-lucide="clock" class="icon"></i>
                    </div>
                    <div class="detail-info-content">
                        <div class="detail-info-label">Horario</div>
                        <div class="detail-info-value">${item.hours}</div>
                    </div>
                </div>

                <div class="detail-info-item">
                    <div class="detail-info-icon">
                        <i data-lucide="phone" class="icon"></i>
                    </div>
                    <div class="detail-info-content">
                        <div class="detail-info-label">Teléfono</div>
                        <div class="detail-info-value">${item.phone}</div>
                    </div>
                </div>
                
                ${additionalInfo}
            </div>
            
            <div class="detail-actions">
                <button class="action-button primary" onclick="openGoogleMaps(${item.coordinates.lat}, ${item.coordinates.lng})">
                    <i data-lucide="navigation" style="height: 18px; width: 18px; margin-right: 8px;"></i>
                    Cómo llegar
                </button>
                <button class="action-button outline" onclick="showReservationModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <i data-lucide="calendar" style="height: 16px; width: 16px; margin-right: 8px;"></i>
                    Reservar
                </button>
                <button class="action-button outline" onclick="shareItem(${item.id})">
                    <i data-lucide="share-2" style="height: 16px; width: 16px; margin-right: 8px;"></i>
                    Compartir
                </button>
            </div>
        </div>
    `;
    
    // Inicializar mapa con Leaflet
    initMap(item.coordinates.lat, item.coordinates.lng, item.name);
    
    // Ocultar otras vistas
    document.querySelectorAll('.view').forEach(view => {
        if (view.id !== 'detailView') {
            view.className = 'view';
        }
    });
    
    // Agregar al historial de navegación
    navigation.setActiveTab('detail', true);
    
    lucide.createIcons();
}

// Inicializar mapa con Leaflet (sin necesidad de API key)
function initMap(lat, lng, title) {
    const mapElement = document.getElementById('detailMap');
    if (!mapElement) return;
    
    // Limpiar el mapa si ya existe
    mapElement.innerHTML = '';
    
    // Crear el mapa
    const map = L.map(mapElement).setView([lat, lng], 15);
    
    // Añadir capa de tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Añadir marcador
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(title)
        .openPopup();
}

// Abrir Google Maps para navegación
function openGoogleMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
}

// Actualizar función renderReservations
function renderReservations() {
    const container = document.getElementById('reservationsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (sampleData.reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar" class="empty-icon"></i>
                <h3>No tienes reservas</h3>
                <p>Cuando hagas reservas, aparecerán aquí</p>
                <button class="action-button" onclick="navigation.setActiveTab('home')">Explorar servicios</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    // Ordenar reservas por fecha (más recientes primero)
    const sortedReservations = [...sampleData.reservations].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedReservations.forEach(reservation => {
        const item = findItemById(reservation.itemId);
        const card = document.createElement('div');
        card.className = 'reservation-card';
        card.innerHTML = `
            <div class="reservation-info">
                <h3>${reservation.service}</h3>
                <p><strong>Fecha:</strong> ${formatDate(reservation.date)} ${reservation.time}</p>
                <p><strong>Personas:</strong> ${reservation.guests}</p>
                <p><strong>Cliente:</strong> ${reservation.customerName}</p>
                ${reservation.notes ? `<p><strong>Notas:</strong> ${reservation.notes}</p>` : ''}
                <p class="reservation-date">Reservado el: ${formatDateTime(reservation.createdAt)}</p>
            </div>
            <div class="reservation-status status-${reservation.status}">
                ${reservation.status === 'confirmed' ? 'Confirmada' : 
                  reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
            </div>
        `;
        container.appendChild(card);
    });
}

// Funciones auxiliares para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString('es-ES', options);
}

// Actualizar contador de reservas en perfil
function updateReservationsCount() {
    const countElement = document.getElementById('reservationsCount');
    if (countElement) {
        countElement.textContent = sampleData.reservations.length;
    }
}

// Manejar búsqueda
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.length < 2) {
        renderHomeItems();
        return;
    }
    
    const container = document.getElementById('homeItems');
    const allItems = Object.values(sampleData.items).flat();
    const filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm) ||
        (item.type && item.type.toLowerCase().includes(searchTerm))
    );
    
    container.innerHTML = '';
    
    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <i data-lucide="search" style="height: 48px; width: 48px; margin-bottom: 16px;"></i>
                <p>No se encontraron resultados</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.onclick = () => showItemDetail(item);
        card.innerHTML = `
            <div class="place-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzNCAxMDAgMTE4IDExNiAxMTggMTQwQzExOCAxNjQgMTM0IDE4MCAxNTAgMTgwQzE2NiAxODAgMTgyIDE2NCAxODIgMTQwQzE4MiAxMTYgMTY2IDEwMCAxNTAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'">
                <div class="rating-badge">
                    <i data-lucide="star" class="icon"></i>
                    <span>${item.rating}</span>
                </div>
            </div>
            <div class="place-content">
                <div class="place-name">${item.name}</div>
                <div class="place-location">
                    <i data-lucide="map-pin" class="icon"></i>
                    <span>${item.distance}</span>
                </div>
                ${item.type ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${item.type}</div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

// Funcionalidad de favoritos
function isFavorite(itemId) {
    return sampleData.favorites.some(item => item.id === itemId);
}

function toggleFavorite(itemId) {
    const item = findItemById(itemId);
    if (!item) return;
    
    if (isFavorite(itemId)) {
        sampleData.favorites = sampleData.favorites.filter(fav => fav.id !== itemId);
        showToast('Removido de favoritos', 'info');
    } else {
        sampleData.favorites.push(item);
        showToast('Agregado a favoritos', 'success');
    }
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    const state = navigation.getState();
    if (state.activeTab === 'favorites') {
        renderFavoriteItems();
    }
    
    // Actualizar iconos de corazón
    document.querySelectorAll(`[onclick="toggleFavorite(${itemId})"] [data-lucide="heart"]`).forEach(icon => {
        const isFav = isFavorite(itemId);
        icon.style.color = isFav ? '#ef4444' : '#6b7280';
        icon.style.fill = isFav ? '#ef4444' : 'none';
    });
}

function removeFavorite(itemId, button) {
    const card = button.closest('.place-card');
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        sampleData.favorites = sampleData.favorites.filter(fav => fav.id !== itemId);
        renderFavoriteItems();
        showToast('Removido de favoritos', 'info');
        saveToLocalStorage();
    }, 300);
}

// Compartir elemento
function shareItem(itemId) {
    const item = findItemById(itemId);
    if (!item) return;
    
    if (navigator.share) {
        navigator.share({
            title: item.name,
            text: item.description,
            url: window.location.href,
        })
        .then(() => showToast('Compartido exitosamente', 'success'))
        .catch(() => showToast('Error al compartir', 'error'));
    } else {
        const text = `Mira este lugar: ${item.name} - ${item.description}`;
        navigator.clipboard.writeText(text)
            .then(() => showToast('Enlace copiado al portapapeles', 'success'))
            .catch(() => showToast('Error al copiar enlace', 'error'));
    }
}

// Notificaciones
function showNotifications() {
    showToast('No tienes notificaciones nuevas', 'info');
}

// Utilidades
function findItemById(itemId) {
    for (const category in sampleData.items) {
        const item = sampleData.items[category].find(item => item.id === itemId);
        if (item) return item;
    }
    return null;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Establecer categoría seleccionada
function setSelectedCategory(categoryName) {
    navigation.setState({ selectedCategory: categoryName });
    renderCategories();
    renderHomeItems();
}

// Actualizar la interfaz de usuario
function updateUI() {
    navigation.updateUI();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initApp);
// AGREGAR ESTAS FUNCIONES AL FINAL DE app.js SI NO EXISTEN:

// Función para cerrar modal (si no existe)
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Funciones para formatear fechas (si no existen)
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString('es-ES', options);
}

// Función para actualizar contador de reservas (si no existe)
function updateReservationsCount() {
    const countElement = document.getElementById('reservationsCount');
    if (countElement) {
        countElement.textContent = sampleData.reservations.length;
    }
}