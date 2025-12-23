// Módulo de navegación
const navigation = (function() {
    // Estado de la aplicación
    let state = {
        selectedCategory: 'Atractivos',
        activeTab: 'home',
        selectedItem: null,
        navigationHistory: ['home'] // Historial de navegación
    };

    // Manejar el botón de retroceso del navegador
    function handleBrowserBack() {
        if (state.navigationHistory.length > 1) {
            // Remover la vista actual del historial
            state.navigationHistory.pop();
            // Obtener la vista anterior
            const previousView = state.navigationHistory[state.navigationHistory.length - 1];
            // Navegar a la vista anterior
            setActiveTab(previousView, false);
        }
    }

    // Función para retroceder
    function goBack() {
        if (state.navigationHistory.length > 1) {
            // Remover la vista actual del historial
            state.navigationHistory.pop();
            // Obtener la vista anterior
            const previousView = state.navigationHistory[state.navigationHistory.length - 1];
            // Navegar a la vista anterior
            setActiveTab(previousView, false);
        } else {
            // Si no hay historial, ir a la vista principal
            setActiveTab('home', false);
        }
    }

    // Establecer pestaña activa
    function setActiveTab(tabName, addToHistory = true) {
        state.activeTab = tabName;
        
        // Agregar al historial si se solicita
        if (addToHistory && state.navigationHistory[state.navigationHistory.length - 1] !== tabName) {
            state.navigationHistory.push(tabName);
        }
        
        updateUI();
        
        // Cargar contenido específico de la vista
        loadViewContent(tabName);
    }

    // Cargar contenido específico de cada vista
    function loadViewContent(tabName) {
        switch(tabName) {
            case 'promotions':
                renderPromotions();
                break;
            case 'orders':
                renderReservations();
                break;
            case 'favorites':
                renderFavoriteItems();
                break;
        }
    }

    // Volver desde la vista de detalle
    function handleBackFromDetail() {
        state.selectedItem = null;
        const detailView = document.getElementById('detailView');
        detailView.className = 'view';
        
        // Remover la vista de detalle del historial
        state.navigationHistory.pop();
        
        // Volver a la vista anterior
        const previousView = state.navigationHistory[state.navigationHistory.length - 1];
        setActiveTab(previousView, false);
    }

    // Actualizar la interfaz de usuario
    function updateUI() {
        // Mostrar/ocultar vistas
        document.querySelectorAll('.view').forEach(view => {
            if (view.id === `${state.activeTab}View`) {
                view.className = 'view active';
            } else if (view.id === 'detailView') {
                // La vista de detalle se maneja por separado
            } else {
                view.className = 'view';
            }
        });
        
        // Actualizar botones de navegación
        document.querySelectorAll('.nav-item').forEach(button => {
            const tab = button.getAttribute('data-tab');
            
            if (tab === state.activeTab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        lucide.createIcons();
    }

    // Inicializar navegación
    function initNavigation() {
        // Configurar botón de retroceso del navegador
        window.addEventListener('popstate', handleBrowserBack);
    }

    // API pública
    return {
        initNavigation,
        setActiveTab,
        goBack,
        handleBackFromDetail,
        getState: () => ({ ...state }),
        setState: (newState) => { state = { ...state, ...newState }; },
        updateUI
    };
})();

// Funciones auxiliares para renderizar contenido
function renderPromotions() {
    const container = document.getElementById('promotionsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.promotions.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        card.innerHTML = `
            <div class="promotion-icon" style="background: linear-gradient(135deg, #fc0052, #ff6b9c);">
                <i data-lucide="tag" class="icon" style="color: white;"></i>
            </div>
            <div class="promotion-content">
                <h3>${promo.title}</h3>
                <p>${promo.description}</p>
                <div class="promotion-details">
                    <span class="discount-badge">${promo.discount} DESCUENTO</span>
                    <div class="price-container">
                        <span class="original-price">${promo.originalPrice}</span>
                        <span class="current-price">${promo.price}</span>
                    </div>
                    <div class="promotion-info">
                        <span class="agency">Por: ${promo.agency}</span>
                        <span class="valid-until">Válido hasta: ${promo.validUntil}</span>
                    </div>
                </div>
                <button class="action-button" style="margin-top: 12px; padding: 10px 20px;">Reservar Oferta</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

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
    
    sampleData.reservations.forEach(reservation => {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        card.innerHTML = `
            <div class="reservation-info">
                <h3>${reservation.service}</h3>
                <p>${reservation.date} - ${reservation.time}</p>
                <p>${reservation.location}</p>
            </div>
            <div class="reservation-status ${reservation.status}">
                ${reservation.status === 'confirmed' ? 'Confirmada' : 
                  reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
            </div>
        `;
        container.appendChild(card);
    });
}
// Funciones auxiliares para renderizar contenido
function renderPromotions() {
    const container = document.getElementById('promotionsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.promotions.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        card.innerHTML = `
            <div class="promotion-icon" style="background: linear-gradient(135deg, #fc0052, #ff6b9c);">
                <i data-lucide="tag" class="icon" style="color: white;"></i>
            </div>
            <div class="promotion-content">
                <h3>${promo.title}</h3>
                <p>${promo.description}</p>
                <div class="promotion-details">
                    <span class="discount-badge">${promo.discount} DESCUENTO</span>
                    <div class="price-container">
                        <span class="original-price">${promo.originalPrice}</span>
                        <span class="current-price">${promo.price}</span>
                    </div>
                    <div class="promotion-info">
                        <span class="agency">Por: ${promo.agency}</span>
                        <span class="valid-until">Válido hasta: ${promo.validUntil}</span>
                    </div>
                </div>
                <button class="action-button" style="margin-top: 12px; padding: 10px 20px;" onclick="showPromotionReservationModal(${promo.id})">
                    Reservar Oferta
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

// NUEVA FUNCIÓN: Modal de reserva para promociones
function showPromotionReservationModal(promoId) {
    const promo = sampleData.promotions.find(p => p.id === promoId);
    if (!promo) return;
    
    // Crear modal de reserva para promoción
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reservar: ${promo.title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x" class="icon"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="promo-summary" style="background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 8px; color: #1f2937;">Resumen de la oferta</h4>
                    <p style="color: #6b7280; margin-bottom: 4px;"><strong>Descuento:</strong> ${promo.discount}</p>
                    <p style="color: #6b7280; margin-bottom: 4px;"><strong>Precio final:</strong> ${promo.price}</p>
                    <p style="color: #6b7280; margin-bottom: 4px;"><strong>Agencia:</strong> ${promo.agency}</p>
                    <p style="color: #6b7280;"><strong>Válido hasta:</strong> ${promo.validUntil}</p>
                </div>
                <form id="promotionReservationForm">
                    <div class="form-group">
                        <label for="promoReservationName">Nombre completo *</label>
                        <input type="text" id="promoReservationName" required placeholder="Ingresa tu nombre completo" value="María del Pilar García Guillen">
                    </div>
                    <div class="form-group">
                        <label for="promoReservationEmail">Correo electrónico *</label>
                        <input type="email" id="promoReservationEmail" required placeholder="Ingresa tu correo electrónico" value="maria.garcia@email.com">
                    </div>
                    <div class="form-group">
                        <label for="promoReservationPhone">Teléfono *</label>
                        <input type="tel" id="promoReservationPhone" required placeholder="Ingresa tu teléfono" value="+51 987 654 321">
                    </div>
                    <div class="form-group">
                        <label for="promoReservationDate">Fecha de reserva *</label>
                        <input type="date" id="promoReservationDate" required>
                    </div>
                    <div class="form-group">
                        <label for="promoReservationParticipants">Número de participantes *</label>
                        <select id="promoReservationParticipants" required>
                            <option value="1">1 persona</option>
                            <option value="2" selected>2 personas</option>
                            <option value="3">3 personas</option>
                            <option value="4">4 personas</option>
                            <option value="5">5 personas</option>
                            <option value="6">6 personas</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="promoReservationNotes">Comentarios adicionales (opcional)</label>
                        <textarea id="promoReservationNotes" placeholder="Comentarios o requerimientos especiales para tu reserva"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-button outline" onclick="closeModal()">Cancelar</button>
                <button class="action-button primary" onclick="submitPromotionReservation(${promo.id})">Confirmar Reserva</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Establecer fecha mínima como hoy y valor por defecto como mañana
    const dateInput = document.getElementById('promoReservationDate');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
    
    lucide.createIcons();
}

// NUEVA FUNCIÓN: Enviar reserva de promoción
function submitPromotionReservation(promoId) {
    const form = document.getElementById('promotionReservationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const promo = sampleData.promotions.find(p => p.id === promoId);
    if (!promo) return;
    
    const reservationData = {
        id: Date.now(),
        promoId: promoId,
        service: promo.title,
        date: document.getElementById('promoReservationDate').value,
        participants: document.getElementById('promoReservationParticipants').value,
        customerName: document.getElementById('promoReservationName').value,
        customerEmail: document.getElementById('promoReservationEmail').value,
        customerPhone: document.getElementById('promoReservationPhone').value,
        notes: document.getElementById('promoReservationNotes').value,
        type: 'promotion',
        discount: promo.discount,
        price: promo.price,
        agency: promo.agency,
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
    showToast('¡Oferta reservada con éxito!', 'success');
    
    // Actualizar contador en perfil
    updateReservationsCount();
    
    // Si estamos en la vista de reservas, actualizar
    if (navigation.getState().activeTab === 'orders') {
        renderReservations();
    }
}

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
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        let reservationDetails = '';
        
        if (reservation.type === 'promotion') {
            // Para reservas de promociones
            reservationDetails = `
                <p><strong>Tipo:</strong> Oferta Especial</p>
                <p><strong>Descuento:</strong> ${reservation.discount}</p>
                <p><strong>Precio:</strong> ${reservation.price}</p>
                <p><strong>Agencia:</strong> ${reservation.agency}</p>
                <p><strong>Participantes:</strong> ${reservation.participants} persona(s)</p>
                <p><strong>Fecha:</strong> ${formatDate(reservation.date)}</p>
            `;
        } else {
            // Para reservas regulares de lugares
            const item = findItemById(reservation.itemId);
            reservationDetails = `
                <p><strong>Fecha:</strong> ${formatDate(reservation.date)} ${reservation.time}</p>
                <p><strong>Personas:</strong> ${reservation.guests}</p>
                ${item ? `<p><strong>Ubicación:</strong> ${item.address}</p>` : ''}
            `;
        }
        
        card.innerHTML = `
            <div class="reservation-info">
                <h3>${reservation.service}</h3>
                ${reservationDetails}
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