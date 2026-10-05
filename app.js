// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://fsejpvwoprqvgcugfeux.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sAargPAYPTevoLduP2GySA_KGXNEtF4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Arreglos en memoria cargados desde Supabase
let cachedStands = [];
let cachedCities = [];
let cachedCategories = [];

// Variables de Selección de Filtros
let currentSelectedCity = 'all';
let currentSelectedFood = 'all';

// Helper para extraer nombre o label sea string u objeto
function getItemName(item) {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
        return item.label || item.value || item.name || '';
    }
    return '';
}

// Cargar puestos, ciudades y categorías desde Supabase
async function fetchDataFromSupabase() {
    try {
        // Cargar puestos
        const { data: standsData, error: standsError } = await supabaseClient.from('food_stands').select('*');
        if (standsError) {
            console.error('Error al cargar puestos de Supabase:', standsError.message);
            cachedStands = [];
        } else {
            cachedStands = standsData || [];
        }

        // Cargar ciudades desde Supabase
        const { data: citiesData, error: citiesError } = await supabaseClient.from('cities').select('*');
        if (citiesError) {
            console.error('Error al cargar ciudades:', citiesError.message);
            cachedCities = [];
        } else {
            cachedCities = citiesData || [];
        }

        // Cargar categorías desde Supabase
        const { data: catsData, error: catsError } = await supabaseClient.from('categories').select('*');
        if (catsError) {
            console.error('Error al cargar categorías:', catsError.message);
            cachedCategories = [];
        } else {
            cachedCategories = catsData || [];
        }

    } catch (err) {
        console.error('Excepción al conectar con Supabase:', err);
    }

    populateDropdowns();
    applyFilters();
}

function getStands() {
    return cachedStands.filter(item => !item.disabled);
}

// Generar Dropdowns dinámicamente con opción "Todas / Todos" usando datos de Supabase
function populateDropdowns() {
    const cityDropdownMenu = document.getElementById('cityDropdownMenu');
    if (cityDropdownMenu) {
        const filteredCities = cachedCities.filter(c => {
            const name = getItemName(c);
            return name && name.toLowerCase() !== 'all' && name !== 'Elige tu ciudad';
        });

        const citiesList = [
            { value: 'all', label: 'Todas las ciudades' },
            ...filteredCities.map(c => {
                const name = getItemName(c);
                return { value: name, label: name };
            })
        ];

        cityDropdownMenu.innerHTML = citiesList.map(item => `
            <div class="city-option flex items-center justify-between px-3.5 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/15 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors rounded-xl mx-1 ${item.value === currentSelectedCity ? 'font-semibold text-orange-500' : ''}" data-value="${item.value}">
                <span>${item.label}</span>
                <i class="fa-solid fa-check text-orange-500 text-xs ${item.value === currentSelectedCity ? '' : 'hidden'}"></i>
            </div>
        `).join('');
    }

    const foodDropdownMenu = document.getElementById('foodDropdownMenu');
    if (foodDropdownMenu) {
        const filteredCategories = cachedCategories.filter(c => {
            const name = getItemName(c);
            return name && name.toLowerCase() !== 'all' && name !== 'Elige la comida';
        });

        const categoriesList = [
            { value: 'all', label: 'Todas las comidas' },
            ...filteredCategories.map(c => {
                const name = getItemName(c);
                return { value: name, label: name };
            })
        ];

        foodDropdownMenu.innerHTML = categoriesList.map(item => `
            <div class="food-option flex items-center justify-between px-3.5 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/15 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors rounded-xl mx-1 ${item.value === currentSelectedFood ? 'font-semibold text-orange-500' : ''}" data-value="${item.value}">
                <span>${item.label}</span>
                <i class="fa-solid fa-check text-orange-500 text-xs ${item.value === currentSelectedFood ? '' : 'hidden'}"></i>
            </div>
        `).join('');
    }

    attachDropdownEvents();
}

function attachDropdownEvents() {
    document.querySelectorAll('.city-option').forEach(option => {
        option.onclick = (e) => {
            e.stopPropagation();
            const val = option.dataset.value;
            const label = option.querySelector('span').textContent;

            currentSelectedCity = val;
            const selectedCityText = document.getElementById('selectedCityText');
            if (selectedCityText) selectedCityText.textContent = label;

            toggleCityDropdown(false);
            applyFilters();
            populateDropdowns();
        };
    });

    document.querySelectorAll('.food-option').forEach(option => {
        option.onclick = (e) => {
            e.stopPropagation();
            const val = option.dataset.value;
            const label = option.querySelector('span').textContent;

            currentSelectedFood = val;
            const selectedFoodText = document.getElementById('selectedFoodText');
            if (selectedFoodText) selectedFoodText.textContent = label;

            toggleFoodDropdown(false);
            applyFilters();
            populateDropdowns();
        };
    });
}

function toggleCityDropdown(open) {
    const cityDropdownMenu = document.getElementById('cityDropdownMenu');
    const cityDropdownArrow = document.getElementById('cityDropdownArrow');
    if (!cityDropdownMenu) return;

    const isOpening = open !== undefined ? open : cityDropdownMenu.classList.contains('hidden-dropdown');
    if (isOpening) {
        toggleFoodDropdown(false);
        cityDropdownMenu.classList.remove('hidden-dropdown');
        cityDropdownMenu.classList.add('visible-dropdown');
        if (cityDropdownArrow) cityDropdownArrow.classList.add('rotate-180');
    } else {
        cityDropdownMenu.classList.remove('visible-dropdown');
        cityDropdownMenu.classList.add('hidden-dropdown');
        if (cityDropdownArrow) cityDropdownArrow.classList.remove('rotate-180');
    }
}

function toggleFoodDropdown(open) {
    const foodDropdownMenu = document.getElementById('foodDropdownMenu');
    const foodDropdownArrow = document.getElementById('foodDropdownArrow');
    if (!foodDropdownMenu) return;

    const isOpening = open !== undefined ? open : foodDropdownMenu.classList.contains('hidden-dropdown');
    if (isOpening) {
        toggleCityDropdown(false);
        foodDropdownMenu.classList.remove('hidden-dropdown');
        foodDropdownMenu.classList.add('visible-dropdown');
        if (foodDropdownArrow) foodDropdownArrow.classList.add('rotate-180');
    } else {
        foodDropdownMenu.classList.remove('visible-dropdown');
        foodDropdownMenu.classList.add('hidden-dropdown');
        if (foodDropdownArrow) foodDropdownArrow.classList.remove('rotate-180');
    }
}

function generateStarsHtml(rating) {
    let html = '';
    const numRating = parseFloat(rating) || 0;
    for (let i = 1; i <= 5; i++) {
        if (numRating >= i) {
            html += '<i class="fa-solid fa-star"></i>';
        } else if (numRating >= i - 0.5) {
            html += '<i class="fa-solid fa-star text-transparent bg-clip-text" style="background-image: linear-gradient(90deg, #facc15 50%, #475569 50%);"></i>';
        } else {
            html += '<i class="fa-regular fa-star text-slate-600"></i>';
        }
    }
    return html;
}

function renderCards(data) {
    const cardsListContainer = document.getElementById('cardsListContainer');
    const emptyState = document.getElementById('emptyState');
    if (!cardsListContainer) return;
    cardsListContainer.innerHTML = '';

    if (!data || data.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    const sortedData = [...data].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));

    sortedData.forEach(item => {
        const isFeatured = item.isFeatured || item.featured;
        const cardEl = document.createElement('div');
        cardEl.className = "bg-white dark:bg-slate-800/90 rounded-2xl p-3 flex gap-3 border border-gray-100 dark:border-slate-700/80 shadow-sm hover:shadow-md dark:hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden";
        
        cardEl.innerHTML = `
            ${isFeatured ? '<div class="ribbon-tag"></div>' : ''}
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0 relative">
                <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.title}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div class="flex items-start justify-between gap-1">
                        <h3 class="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug truncate">${item.title}</h3>
                        <div class="flex text-amber-400 text-[10px] gap-0.5 pt-0.5">
                            ${generateStarsHtml(item.rating)}
                        </div>
                    </div>
                    <p class="text-[11px] text-gray-400 dark:text-slate-400 mb-1">${item.category}</p>
                    <p class="text-[11px] text-gray-500 dark:text-slate-300 line-clamp-2 leading-tight">${item.description || ''}</p>
                </div>
                <div class="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-slate-700/60 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                    <span class="flex items-center gap-1"><i class="fa-solid fa-phone text-emerald-500 text-[10px]"></i> Contacto</span>
                    <span class="flex items-center gap-1"><i class="fa-solid fa-map-location-dot text-orange-500 text-[10px]"></i> Ubicación</span>
                </div>
            </div>
        `;

        cardEl.onclick = () => openModal(item);
        cardsListContainer.appendChild(cardEl);
    });
}

function openModal(item) {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCard = document.getElementById('modalCard');
    if (!modalBackdrop) return;
    
    document.getElementById('modalImg').src = item.image || 'img/placeholder.jpg';
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalCategory').textContent = item.category;
    document.getElementById('modalStars').innerHTML = generateStarsHtml(item.rating);
    document.getElementById('modalDescription').textContent = item.description || '';
    document.getElementById('modalPhone').textContent = item.phone || 'No disponible';
    document.getElementById('modalAddress').textContent = item.address || 'Ubicación no especificada';
    document.getElementById('modalMapsBtn').href = item.mapsUrl || '#';
    document.getElementById('modalInstagram').href = item.instagram || '#';
    document.getElementById('modalTiktok').href = item.tiktok || item.Tiktok || '#';

    modalBackdrop.classList.remove('hidden');
    setTimeout(() => {
        modalBackdrop.classList.add('opacity-100');
        modalCard.classList.remove('scale-95', 'opacity-0');
        modalCard.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModal() {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCard = document.getElementById('modalCard');
    if (!modalBackdrop) return;
    modalCard.classList.remove('scale-100', 'opacity-100');
    modalCard.classList.add('scale-95', 'opacity-0');
    modalBackdrop.classList.remove('opacity-100');
    setTimeout(() => {
        modalBackdrop.classList.add('hidden');
    }, 200);
}

function openSidebar() {
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarDrawer = document.getElementById('sidebarDrawer');
    if (!sidebarBackdrop) return;
    sidebarBackdrop.classList.remove('hidden');
    setTimeout(() => {
        sidebarDrawer.classList.remove('-translate-x-full');
    }, 10);
}

function closeSidebar() {
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarDrawer = document.getElementById('sidebarDrawer');
    if (!sidebarBackdrop) return;
    sidebarDrawer.classList.add('-translate-x-full');
    setTimeout(() => {
        sidebarBackdrop.classList.add('hidden');
    }, 300);
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = getStands().filter(item => {
        const matchesCity = (currentSelectedCity === 'all' || (item.city && item.city.toLowerCase() === currentSelectedCity.toLowerCase()));
        const matchesFood = (currentSelectedFood === 'all' || (item.category && item.category.toLowerCase() === currentSelectedFood.toLowerCase()));
        const matchesSearch = item.title.toLowerCase().includes(searchVal) || 
                              (item.description && item.description.toLowerCase().includes(searchVal));

        return matchesCity && matchesFood && matchesSearch;
    });

    renderCards(filtered);
}

async function checkPromoAlert() {
    const { data: promo, error } = await supabaseClient.from('promo_alert').select('*').limit(1).single();
    if (error || !promo || !promo.active) return;

    const promoBackdrop = document.getElementById('promoAlertBackdrop');
    const promoTitle = document.getElementById('promoTitle');
    const promoMessage = document.getElementById('promoMessage');
    const promoImage = document.getElementById('promoImage');
    const promoImageContainer = document.getElementById('promoImageContainer');

    if (!promoBackdrop) return;

    if (promoTitle) promoTitle.textContent = promo.title || '';
    if (promoMessage) promoMessage.textContent = promo.message || '';

    if (promo.image && promoImage && promoImageContainer) {
        promoImage.src = promo.image;
        promoImageContainer.classList.remove('hidden');
    } else if (promoImageContainer) {
        promoImageContainer.classList.add('hidden');
    }

    promoBackdrop.classList.remove('hidden');

    const closeBtn = document.getElementById('closePromoAlertBtn');
    const acceptBtn = document.getElementById('acceptPromoBtn');

    const closePromo = () => promoBackdrop.classList.add('hidden');
    if (closeBtn) closeBtn.onclick = closePromo;
    if (acceptBtn) acceptBtn.onclick = closePromo;
}

// Inicialización global de eventos garantizada
window.addEventListener('DOMContentLoaded', () => {
    // Tema inicial
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        if (themeIcon) themeIcon.className = "fa-solid fa-sun text-amber-500";
    } else {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.className = "fa-solid fa-moon text-amber-400";
    }

    // Botón Tema
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                if (themeIcon) themeIcon.className = "fa-solid fa-sun text-amber-500";
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                if (themeIcon) themeIcon.className = "fa-solid fa-moon text-amber-400";
                localStorage.setItem('theme', 'dark');
            }
        };
    }

    // Botones Menú y Buscador
    const openMenuBtn = document.getElementById('openMenuBtn');
    if (openMenuBtn) openMenuBtn.onclick = openSidebar;

    const closeMenuBtn = document.getElementById('closeMenuBtn');
    if (closeMenuBtn) closeMenuBtn.onclick = closeSidebar;

    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    if (sidebarBackdrop) sidebarBackdrop.onclick = closeSidebar;

    const openSearchBtn = document.getElementById('openSearchBtn');
    const searchBarContainer = document.getElementById('searchBarContainer');
    const searchInput = document.getElementById('searchInput');

    if (openSearchBtn) {
        openSearchBtn.onclick = () => {
            if (searchBarContainer) {
                searchBarContainer.classList.toggle('hidden');
                if (!searchBarContainer.classList.contains('hidden') && searchInput) {
                    searchInput.focus();
                }
            }
        };
    }

    if (searchInput) {
        searchInput.oninput = applyFilters;
    }

    // Dropdowns Ciudad y Comida
    const cityDropdownBtn = document.getElementById('cityDropdownBtn');
    if (cityDropdownBtn) {
        cityDropdownBtn.onclick = (e) => {
            e.stopPropagation();
            toggleCityDropdown();
        };
    }

    const foodDropdownBtn = document.getElementById('foodDropdownBtn');
    if (foodDropdownBtn) {
        foodDropdownBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFoodDropdown();
        };
    }

    document.onclick = () => {
        toggleCityDropdown(false);
        toggleFoodDropdown(false);
    };

    // Modal de Detalle
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) closeModalBtn.onclick = closeModal;

    const modalBackdrop = document.getElementById('modalBackdrop');
    if (modalBackdrop) {
        modalBackdrop.onclick = (e) => {
            if (e.target === modalBackdrop) closeModal();
        };
    }

    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.onclick = () => {
            currentSelectedCity = 'all';
            currentSelectedFood = 'all';
            const selectedCityText = document.getElementById('selectedCityText');
            const selectedFoodText = document.getElementById('selectedFoodText');
            if (selectedCityText) selectedCityText.textContent = 'Elige tu ciudad';
            if (selectedFoodText) selectedFoodText.textContent = 'Elige la comida';

            populateDropdowns();
            if (searchInput) searchInput.value = '';
            applyFilters();
        };
    }

    // Lógica del Botón de Instalación PWA (Integrada)
    let deferredPrompt;
    const installAppBtn = document.getElementById('installAppBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installAppBtn) {
            installAppBtn.classList.remove('hidden');
        }
    });

    if (installAppBtn) {
        installAppBtn.onclick = async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('El usuario aceptó instalar la PWA');
            }
            deferredPrompt = null;
            installAppBtn.classList.add('hidden');
        };
    }

    // Cargar Datos desde Supabase
    fetchDataFromSupabase();
    checkPromoAlert();
});

document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshIcon = document.getElementById('refreshIcon');

    if (refreshBtn && refreshIcon) {
        refreshBtn.addEventListener('click', async () => {
            // Añadir animación de rotación al ícono
            refreshIcon.classList.add('fa-spin');
            
            // Volver a cargar los datos desde Supabase y refrescar la vista actual
            if (typeof fetchDataFromSupabase === 'function') {
                await fetchDataFromSupabase();
            } else {
                window.location.reload(); // Fallback por si prefieres recargar la app completa
            }

            // Quitar la animación después de medio segundo
            setTimeout(() => {
                refreshIcon.classList.remove('fa-spin');
            }, 600);
        });
    }
});