// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://fsejpvwoprqvgcugfeux.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sAargPAYPTevoLduP2GySA_KGXNEtF4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Llaves de almacenamiento auxiliar local (Solo para Alerta y Perfil)
const STORAGE_KEYS = {
    PROMO: 'PROMO_ALERT_DATA',
    PROFILE: 'PROFILE_DATA'
};

// Arreglos en memoria para el admin
let adminStands = [];
let adminCategories = [];
let adminCities = [];

// Variables de estado para los Filtros del Admin Principal
let adminSelectedCity = 'all';
let adminSelectedCategory = 'all';
let adminSearchQuery = '';

// Variables de estado para los Filtros del Modal (Nuevo/Editar Puesto)
let modalSelectedCity = '';
let modalSelectedCategory = '';

// ==========================================
// 2. ELEMENTOS DEL DOM
// ==========================================
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Modal de Puestos
const standModalBackdrop = document.getElementById('standModalBackdrop');
const closeStandModalBtn = document.getElementById('closeStandModalBtn');
const standForm = document.getElementById('standForm');
const addStandBtn = document.getElementById('addStandBtn');

// Formularios de Categorías y Ciudades
const addCategoryForm = document.getElementById('addCategoryForm');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCityForm = document.getElementById('addCityForm');
const newCityInput = document.getElementById('newCityInput');

// ==========================================
// 3. CONTROL DE SESIÓN Y VISTAS
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initStorage();
    setupTabNavigation();
    setupModalEvents();
    setupCategoryAndCityEvents();
    setupAdminFilterEvents();
    setupModalFilterEvents();
    setupProfileEvents();
    setupStatusToggleListener();

    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
});

function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        htmlElement.classList.remove('dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-500';
    } else {
        htmlElement.classList.add('dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-amber-400';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-500';
            } else {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-amber-400';
            }
        });
    }
}

function showAdminPanel() {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanelSection = document.getElementById('adminPanelSection');

    if (loginContainer) loginContainer.classList.add('hidden');
    if (adminPanelSection) adminPanelSection.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');

    loadAllAdminData();
}

function showLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanelSection = document.getElementById('adminPanelSection');

    if (loginContainer) loginContainer.classList.remove('hidden');
    if (adminPanelSection) adminPanelSection.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginError) loginError.classList.add('hidden');

        const email = loginEmail ? loginEmail.value.trim() : '';
        const password = loginPassword ? loginPassword.value.trim() : '';

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Error de autenticación:', error.message);
            if (loginError) {
                loginError.textContent = 'Correo o contraseña incorrectos';
                loginError.classList.remove('hidden');
            }
        } else if (data.session) {
            showAdminPanel();
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
    });
}

// ==========================================
// 4. CONTROL DE PESTAÑAS (TABS)
// ==========================================
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            tabButtons.forEach(btn => {
                btn.classList.remove('border-b-2', 'border-orange-500', 'text-orange-500');
                btn.classList.add('text-gray-400');
            });

            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            button.classList.add('border-b-2', 'border-orange-500', 'text-orange-500');
            button.classList.remove('text-gray-400');

            const activeTabContent = document.getElementById(`tab-${targetTab}`);
            if (activeTabContent) {
                activeTabContent.classList.remove('hidden');
            }
        });
    });
}

// ==========================================
// 5. INICIALIZACIÓN DE DATOS Y SUPABASE
// ==========================================
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PROMO)) {
        localStorage.setItem(STORAGE_KEYS.PROMO, JSON.stringify({
            active: false,
            title: '',
            message: '',
            image: ''
        }));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        const initialProfile = (typeof DEFAULT_PROFILE_DATA !== 'undefined') ? DEFAULT_PROFILE_DATA : {
            name: "Eliseo Romero",
            role: "Creador de Contenido",
            image: "img/perfil1.jpeg",
            email: "eliseoejrm@gmail.com",
            phone: "0414-9809111",
            whatsappLink: "https://wa.me/584149809111",
            instagram: "https://instagram.com/Eliseo4k",
            tiktok: "https://tiktok.com/@Eliseo4k",
            handle: "@Eliseo4k"
        };
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile));
    }
}

async function loadAllAdminData() {
    await fetchAdminStandsFromSupabase();
    await fetchCategoriesFromSupabase();
    await fetchCitiesFromSupabase();
    loadPromoAlertAdmin();
    loadProfileAdmin();
}

async function fetchAdminStandsFromSupabase() {
    const { data, error } = await supabaseClient.from('food_stands').select('*');
    if (error) {
        console.error('Error cargando puestos:', error.message);
        adminStands = [];
    } else {
        adminStands = data || [];
    }
    populateAdminFilters();
    renderStandsAdmin();
}

async function fetchCategoriesFromSupabase() {
    const { data, error } = await supabaseClient.from('categories').select('*');
    if (error) {
        console.error('Error cargando categorías:', error.message);
        adminCategories = [];
    } else {
        adminCategories = data || [];
    }
    renderCategoriesAdmin();
    populateAdminFilters();
    populateModalSelects();
}

async function fetchCitiesFromSupabase() {
    const { data, error } = await supabaseClient.from('cities').select('*');
    if (error) {
        console.error('Error cargando ciudades:', error.message);
        adminCities = [];
    } else {
        adminCities = data || [];
    }
    renderCitiesAdmin();
    populateAdminFilters();
    populateModalSelects();
}

// ==========================================
// 6. FILTROS Y DROPDOWNS DESDE SUPABASE
// ==========================================
function populateAdminFilters() {
    const cityDropdown = document.getElementById('adminCityFilterDropdown');
    if (cityDropdown) {
        let cityHtml = `
            <div class="city-option flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white hover:bg-slate-800/80 cursor-pointer transition-colors" data-value="all">
                <span>Todas las ciudades</span>
                <i class="fa-solid fa-check text-orange-500 text-xs option-check ${adminSelectedCity === 'all' ? '' : 'hidden'}"></i>
            </div>
        `;

        adminCities.forEach(c => {
            const name = c.name;
            const isSelected = adminSelectedCity.toLowerCase() === name.toLowerCase();
            cityHtml += `
                <div class="city-option flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 cursor-pointer transition-colors" data-value="${name}">
                    <span>${name}</span>
                    <i class="fa-solid fa-check text-orange-500 text-xs option-check ${isSelected ? '' : 'hidden'}"></i>
                </div>
            `;
        });
        cityDropdown.innerHTML = cityHtml;
    }

    const categoryDropdown = document.getElementById('adminCategoryFilterDropdown');
    if (categoryDropdown) {
        let catHtml = `
            <div class="category-option flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white hover:bg-slate-800/80 cursor-pointer transition-colors" data-value="all">
                <span>Todas las comidas</span>
                <i class="fa-solid fa-check text-orange-500 text-xs option-check ${adminSelectedCategory === 'all' ? '' : 'hidden'}"></i>
            </div>
        `;

        adminCategories.forEach(c => {
            const name = c.name;
            const isSelected = adminSelectedCategory.toLowerCase() === name.toLowerCase();
            catHtml += `
                <div class="category-option flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 cursor-pointer transition-colors" data-value="${name}">
                    <span>${name}</span>
                    <i class="fa-solid fa-check text-orange-500 text-xs option-check ${isSelected ? '' : 'hidden'}"></i>
                </div>
            `;
        });
        categoryDropdown.innerHTML = catHtml;
    }
}

function setupAdminFilterEvents() {
    const adminSearchInput = document.getElementById('adminSearchInput');
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', (e) => {
            adminSearchQuery = e.target.value.toLowerCase().trim();
            renderStandsAdmin();
        });
    }

    const cityDropdown = document.getElementById('adminCityFilterDropdown');
    const cityLabel = document.getElementById('adminCityFilterLabel');
    if (cityDropdown) {
        cityDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.city-option');
            if (!option) return;

            adminSelectedCity = option.getAttribute('data-value');
            if (cityLabel) {
                cityLabel.textContent = adminSelectedCity === 'all' ? 'Todas las ciudades' : adminSelectedCity;
            }

            populateAdminFilters();
            renderStandsAdmin();
        });
    }

    const categoryDropdown = document.getElementById('adminCategoryFilterDropdown');
    const categoryLabel = document.getElementById('adminCategoryFilterLabel');
    if (categoryDropdown) {
        categoryDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.category-option');
            if (!option) return;

            adminSelectedCategory = option.getAttribute('data-value');
            if (categoryLabel) {
                categoryLabel.textContent = adminSelectedCategory === 'all' ? 'Todas las comidas' : adminSelectedCategory;
            }

            populateAdminFilters();
            renderStandsAdmin();
        });
    }
}

function populateModalSelects() {
    const cityDropdown = document.getElementById('modalCityDropdown');
    if (cityDropdown) {
        let cityHtml = '';
        adminCities.forEach(c => {
            const name = c.name;
            const isSelected = modalSelectedCity.toLowerCase() === name.toLowerCase();
            cityHtml += `
                <div class="modal-city-option flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 cursor-pointer transition-colors" data-value="${name}">
                    <span>${name}</span>
                    <i class="fa-solid fa-check text-orange-500 text-xs option-check ${isSelected ? '' : 'hidden'}"></i>
                </div>
            `;
        });
        cityDropdown.innerHTML = cityHtml || `<div class="px-3 py-2 text-xs text-gray-400">No hay ciudades</div>`;
    }

    const categoryDropdown = document.getElementById('modalCategoryDropdown');
    if (categoryDropdown) {
        let catHtml = '';
        adminCategories.forEach(c => {
            const name = c.name;
            const isSelected = modalSelectedCategory.toLowerCase() === name.toLowerCase();
            catHtml += `
                <div class="modal-category-option flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 cursor-pointer transition-colors" data-value="${name}">
                    <span>${name}</span>
                    <i class="fa-solid fa-check text-orange-500 text-xs option-check ${isSelected ? '' : 'hidden'}"></i>
                </div>
            `;
        });
        categoryDropdown.innerHTML = catHtml || `<div class="px-3 py-2 text-xs text-gray-400">No hay categorías</div>`;
    }
}

function setupModalFilterEvents() {
    const cityDropdown = document.getElementById('modalCityDropdown');
    const cityLabel = document.getElementById('modalCityLabel');
    const hiddenCityInput = document.getElementById('standCity');

    if (cityDropdown) {
        cityDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.modal-city-option');
            if (!option) return;

            modalSelectedCity = option.getAttribute('data-value');
            if (cityLabel) cityLabel.textContent = modalSelectedCity;
            if (hiddenCityInput) hiddenCityInput.value = modalSelectedCity;

            populateModalSelects();
        });
    }

    const categoryDropdown = document.getElementById('modalCategoryDropdown');
    const categoryLabel = document.getElementById('modalCategoryLabel');
    const hiddenCategoryInput = document.getElementById('standCategory');

    if (categoryDropdown) {
        categoryDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.modal-category-option');
            if (!option) return;

            modalSelectedCategory = option.getAttribute('data-value');
            if (categoryLabel) categoryLabel.textContent = modalSelectedCategory;
            if (hiddenCategoryInput) hiddenCategoryInput.value = modalSelectedCategory;

            populateModalSelects();
        });
    }
}

// ==========================================
// 7. RENDERIZAR PUESTOS, CATEGORÍAS Y CIUDADES
// ==========================================
function renderStandsAdmin() {
    const standsListContainer = document.getElementById('standsAdminList');
    if (!standsListContainer) return;

    const filteredStands = adminStands.filter(stand => {
        const matchesSearch = stand.title.toLowerCase().includes(adminSearchQuery) ||
                              (stand.description && stand.description.toLowerCase().includes(adminSearchQuery));
        const matchesCity = (adminSelectedCity === 'all') || (stand.city && stand.city.toLowerCase() === adminSelectedCity.toLowerCase());
        const matchesCategory = (adminSelectedCategory === 'all') || (stand.category && stand.category.toLowerCase() === adminSelectedCategory.toLowerCase());

        return matchesSearch && matchesCity && matchesCategory;
    });

    if (filteredStands.length === 0) {
        standsListContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">No se encontraron puestos con estos filtros.</p>`;
        return;
    }

    standsListContainer.innerHTML = filteredStands.map(stand => {
        const isDisabled = stand.disabled === true;
        return `
            <div class="p-3 bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700/80 rounded-2xl shadow-sm space-y-2.5">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <img src="${stand.image || 'img/placeholder.jpg'}" alt="${stand.title}" class="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-700">
                        <div>
                            <h4 class="font-bold text-xs text-gray-900 dark:text-white">${stand.title} ${stand.isFeatured || stand.featured ? '<span class="text-[9px] bg-red-500/20 text-red-500 font-semibold px-1.5 py-0.5 rounded-md ml-1">Destacado</span>' : ''}</h4>
                            <p class="text-[10px] text-gray-400">${stand.category} • ${stand.city} • ⭐ ${stand.rating}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="editStand(${stand.id})" class="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-xs" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteStand(${stand.id})" class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center text-xs" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60 text-[11px]">
                    <span class="text-gray-500 dark:text-slate-400 font-medium">Estado en la página principal:</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer toggle-status-btn" data-id="${stand.id}" ${!isDisabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 transition-colors duration-300 dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                        <span class="ml-2 font-bold transition-colors duration-300 ${!isDisabled ? 'text-emerald-500' : 'text-gray-400'} status-text">${!isDisabled ? 'ON' : 'OFF'}</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

function setupStatusToggleListener() {
    document.addEventListener('change', async (e) => {
        if (e.target.classList.contains('toggle-status-btn')) {
            const standId = parseInt(e.target.dataset.id);
            const isChecked = e.target.checked; 
            const newDisabledState = !isChecked;

            const labelContainer = e.target.closest('label');
            const statusText = labelContainer.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = isChecked ? 'ON' : 'OFF';
                statusText.className = `ml-2 font-bold transition-colors duration-300 ${isChecked ? 'text-emerald-500' : 'text-gray-400'} status-text`;
            }

            adminStands = adminStands.map(s => {
                if (s.id === standId) s.disabled = newDisabledState;
                return s;
            });

            await supabaseClient.from('food_stands').update({ disabled: newDisabledState }).eq('id', standId);
        }
    });
}

function setupCategoryAndCityEvents() {
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const catName = newCategoryInput ? newCategoryInput.value.trim() : '';
            if (!catName) return;

            const exists = adminCategories.some(c => c.name.toLowerCase() === catName.toLowerCase());
            if (exists) {
                alert('Esta categoría ya existe.');
                return;
            }

            const { error } = await supabaseClient.from('categories').insert([{ name: catName }]);
            if (error) {
                alert('Error al añadir categoría: ' + error.message);
                return;
            }

            newCategoryInput.value = '';
            await fetchCategoriesFromSupabase();
        });
    }

    if (addCityForm) {
        addCityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cityName = newCityInput ? newCityInput.value.trim() : '';
            if (!cityName) return;

            const exists = adminCities.some(c => c.name.toLowerCase() === cityName.toLowerCase());
            if (exists) {
                alert('Esta ciudad ya existe.');
                return;
            }

            const { error } = await supabaseClient.from('cities').insert([{ name: cityName }]);
            if (error) {
                alert('Error al añadir ciudad: ' + error.message);
                return;
            }

            newCityInput.value = '';
            await fetchCitiesFromSupabase();
        });
    }
}

function renderCategoriesAdmin() {
    const listContainer = document.getElementById('categoriesAdminList');
    if (!listContainer) return;

    if (adminCategories.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-2">No hay categorías registradas.</p>`;
        return;
    }

    listContainer.innerHTML = adminCategories.map(cat => {
        const name = cat.name;
        const safeName = name.replace(/'/g, "\\'");
        return `
            <div class="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700/80 rounded-xl shadow-sm">
                <span class="text-xs font-semibold text-gray-800 dark:text-slate-200">${name}</span>
                <button onclick="deleteCategory('${safeName}')" class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center text-xs">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function renderCitiesAdmin() {
    const listContainer = document.getElementById('citiesAdminList');
    if (!listContainer) return;

    if (adminCities.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-2">No hay ciudades registradas.</p>`;
        return;
    }

    listContainer.innerHTML = adminCities.map(city => {
        const name = city.name;
        const safeName = name.replace(/'/g, "\\'");
        return `
            <div class="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700/80 rounded-xl shadow-sm">
                <span class="text-xs font-semibold text-gray-800 dark:text-slate-200">${name}</span>
                <button onclick="deleteCity('${safeName}')" class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center text-xs">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

window.deleteCategory = async function(nameVal) {
    if (confirm(`¿Eliminar la categoría "${nameVal}"?`)) {
        const { error } = await supabaseClient.from('categories').delete().eq('name', nameVal);
        if (error) {
            alert('Error al eliminar: ' + error.message);
            return;
        }
        await fetchCategoriesFromSupabase();
    }
};

window.deleteCity = async function(nameVal) {
    if (confirm(`¿Eliminar la ciudad "${nameVal}"?`)) {
        const { error } = await supabaseClient.from('cities').delete().eq('name', nameVal);
        if (error) {
            alert('Error al eliminar: ' + error.message);
            return;
        }
        await fetchCitiesFromSupabase();
    }
};

// ==========================================
// 8. GESTIÓN DEL MODAL Y FORMULARIO DE PUESTOS
// ==========================================
function setupModalEvents() {
    if (addStandBtn) addStandBtn.addEventListener('click', () => openStandModal());
    if (closeStandModalBtn) closeStandModalBtn.addEventListener('click', () => closeStandModal());
    if (standForm) {
        standForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveStand();
        });
    }
}

function openStandModal(stand = null) {
    const defaultCity = adminCities.length > 0 ? adminCities[0].name : '';
    const defaultCat = adminCategories.length > 0 ? adminCategories[0].name : '';

    const modalTitle = document.getElementById('standModalTitle');
    const cityLabel = document.getElementById('modalCityLabel');
    const categoryLabel = document.getElementById('modalCategoryLabel');
    const imageFileInput = document.getElementById('standImageFile');

    if (imageFileInput) imageFileInput.value = '';

    const extractUser = (url, platform) => {
        if (!url) return '';
        if (platform === 'instagram') {
            return url.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/\/$/, '').replace(/^@/, '');
        } else if (platform === 'tiktok') {
            return url.replace(/^(https?:\/\/)?(www\.)?tiktok\.com\/@?/i, '').replace(/\/$/, '').replace(/^@/, '');
        }
        return url;
    };

    if (stand) {
        if (modalTitle) modalTitle.textContent = 'Editar Puesto';
        document.getElementById('standId').value = stand.id;
        document.getElementById('standTitle').value = stand.title;
        
        modalSelectedCity = stand.city || defaultCity;
        modalSelectedCategory = stand.category || defaultCat;

        document.getElementById('standCity').value = modalSelectedCity;
        document.getElementById('standCategory').value = modalSelectedCategory;

        if (cityLabel) cityLabel.textContent = modalSelectedCity;
        if (categoryLabel) categoryLabel.textContent = modalSelectedCategory;

        document.getElementById('standRating').value = stand.rating;
        document.getElementById('standDescription').value = stand.description || '';
        document.getElementById('standImage').value = stand.image || '';
        document.getElementById('standPhone').value = stand.phone || '';
        document.getElementById('standAddress').value = stand.address || '';
        document.getElementById('standMapsUrl').value = stand.mapsUrl || '';
        document.getElementById('standInstagram').value = extractUser(stand.instagram, 'instagram');
        document.getElementById('standTiktok').value = extractUser(stand.tiktok, 'tiktok');
        document.getElementById('standFeatured').checked = stand.isFeatured || stand.featured || false;
    } else {
        if (modalTitle) modalTitle.textContent = 'Nuevo Puesto';
        if (standForm) standForm.reset();
        document.getElementById('standId').value = '';
        document.getElementById('standImage').value = '';

        modalSelectedCity = defaultCity;
        modalSelectedCategory = defaultCat;

        document.getElementById('standCity').value = modalSelectedCity;
        document.getElementById('standCategory').value = modalSelectedCategory;

        if (cityLabel) cityLabel.textContent = modalSelectedCity || 'Seleccionar ciudad';
        if (categoryLabel) categoryLabel.textContent = modalSelectedCategory || 'Seleccionar categoría';
    }

    populateModalSelects();

    if (standModalBackdrop) standModalBackdrop.classList.remove('hidden');
}

function closeStandModal() {
    if (standModalBackdrop) standModalBackdrop.classList.add('hidden');
}

async function saveStand() {
    const idVal = document.getElementById('standId').value;
    const existingStand = idVal ? adminStands.find(s => s.id === parseInt(idVal)) : null;

    let imageUrl = document.getElementById('standImage').value.trim();
    const imageFileInput = document.getElementById('standImageFile');

    if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
        const file = imageFileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('food-images')
            .upload(filePath, file);

        if (uploadError) {
            alert('Error al subir la imagen: ' + uploadError.message);
            return;
        }

        const { data: publicURLData } = supabaseClient.storage
            .from('food-images')
            .getPublicUrl(filePath);

        imageUrl = publicURLData.publicUrl;
    }

    const igInput = document.getElementById('standInstagram').value.trim().replace(/^@/, '');
    const tkInput = document.getElementById('standTiktok').value.trim().replace(/^@/, '');

    const instagramFullUrl = igInput ? `https://instagram.com/${igInput}` : '';
    const tiktokFullUrl = tkInput ? `https://tiktok.com/@${tkInput}` : '';

    const standData = {
        title: document.getElementById('standTitle').value.trim(),
        city: document.getElementById('standCity').value,
        category: document.getElementById('standCategory').value,
        rating: parseFloat(document.getElementById('standRating').value),
        description: document.getElementById('standDescription').value.trim(),
        image: imageUrl,
        phone: document.getElementById('standPhone').value.trim(),
        address: document.getElementById('standAddress').value.trim(),
        mapsUrl: document.getElementById('standMapsUrl').value.trim(),
        instagram: instagramFullUrl,
        tiktok: tiktokFullUrl,
        isFeatured: document.getElementById('standFeatured').checked,
        disabled: existingStand ? (existingStand.disabled || false) : false
    };

    if (idVal) {
        const { error } = await supabaseClient.from('food_stands').update(standData).eq('id', parseInt(idVal));
        if (error) {
            alert('Error al actualizar: ' + error.message);
            return;
        }
    } else {
        const { error } = await supabaseClient.from('food_stands').insert([standData]);
        if (error) {
            alert('Error al crear: ' + error.message);
            return;
        }
    }

    closeStandModal();
    await fetchAdminStandsFromSupabase();
}

window.editStand = function(id) {
    const stand = adminStands.find(s => s.id === id);
    if (stand) openStandModal(stand);
};

window.deleteStand = async function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este puesto?')) {
        const { error } = await supabaseClient.from('food_stands').delete().eq('id', id);
        if (error) {
            alert('Error al eliminar: ' + error.message);
            return;
        }
        await fetchAdminStandsFromSupabase();
    }
};

// ==========================================
// 9. GESTIÓN DE ALERTA PROMO (CON SUPABASE)
// ==========================================
async function loadPromoAlertAdmin() {
    const { data: promo, error } = await supabaseClient.from('promo_alert').select('*').limit(1).single();
    
    if (error) {
        console.error('Error cargando la alerta promo:', error.message);
        return;
    }

    if (promo) {
        // Cargar estado del switch, título y mensaje
        if (document.getElementById('alertActive')) document.getElementById('alertActive').checked = promo.active || false;
        if (document.getElementById('alertTitle')) document.getElementById('alertTitle').value = promo.title || '';
        if (document.getElementById('alertMessage')) document.getElementById('alertMessage').value = promo.message || '';
        
        // Mantener la URL en el input oculto o de texto para que no se pierda al guardar
        const alertImageInput = document.getElementById('alertImage');
        if (alertImageInput) {
            alertImageInput.value = promo.image || '';
        }

        // MOSTRAR LA MINIATURA DE LA IMAGEN ACTUAL
        const previewContainer = document.getElementById('alertImagePreview'); // Ajusta este ID según tu HTML si es diferente
        if (previewContainer && promo.image) {
            previewContainer.src = promo.image;
            previewContainer.style.display = 'block'; // Asegurarse de que sea visible
        }
    }
}

const saveAlertBtn = document.getElementById('saveAlertBtn');
if (saveAlertBtn) {
    saveAlertBtn.addEventListener('click', async () => {
        const imageFileInput = document.getElementById('alertImageFile');
        let imageUrl = document.getElementById('alertImage')?.value.trim() || '';

        // Comprobación estricta de si hay un archivo NUEVO seleccionado
        const hasNewFile = imageFileInput && imageFileInput.files && imageFileInput.files.length > 0 && imageFileInput.files[0] instanceof File;

        if (hasNewFile) {
            const file = imageFileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `promo_${Date.now()}.${fileExt}`;
            
            console.log('Subiendo nueva imagen al Storage...');
            const { error: uploadError } = await supabaseClient.storage
                .from('food-images')
                .upload(fileName, file);

            if (uploadError) {
                alert('Error al subir la imagen de la alerta: ' + uploadError.message);
                return;
            }

            const { data: publicURLData } = supabaseClient.storage
                .from('food-images')
                .getPublicUrl(fileName);

            imageUrl = publicURLData.publicUrl;

            // Limpiamos el input file para que no vuelva a reutilizar este archivo en el próximo clic
            imageFileInput.value = ''; 
        } else {
            console.log('No se seleccionó archivo nuevo, usando la imagen existente.');
        }

        const alertData = {
            active: document.getElementById('alertActive')?.checked || false,
            title: document.getElementById('alertTitle')?.value || '',
            message: document.getElementById('alertMessage')?.value || '',
            image: imageUrl
        };

        const { error } = await supabaseClient
            .from('promo_alert')
            .update(alertData)
            .eq('id', 1);

        if (error) {
            alert('Error al guardar la alerta en Supabase: ' + error.message);
            return;
        }

        alert('¡Cambios guardados con éxito!');
        loadPromoAlertAdmin();
    });
}

// ==========================================
// 10. GESTIÓN DE PERFIL & REDES
// ==========================================
function loadProfileAdmin() {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const profile = savedProfile 
        ? JSON.parse(savedProfile) 
        : (typeof DEFAULT_PROFILE_DATA !== 'undefined' ? DEFAULT_PROFILE_DATA : {
            name: "Eliseo Romero",
            role: "Creador de Contenido",
            image: "img/perfil1.jpeg",
            email: "eliseoejrm@gmail.com",
            phone: "0414-9809111",
            whatsappLink: "https://wa.me/584149809111",
            instagram: "https://instagram.com/Eliseo4k",
            tiktok: "https://tiktok.com/@Eliseo4k",
            handle: "@Eliseo4k"
        });

    if (!savedProfile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }

    const extractUserSimple = (url, platform) => {
        if (!url) return '';
        if (platform === 'instagram') {
            return url.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/\/$/, '').replace(/^@/, '');
        } else if (platform === 'tiktok') {
            return url.replace(/^(https?:\/\/)?(www\.)?tiktok\.com\/@?/i, '').replace(/\/$/, '').replace(/^@/, '');
        }
        return url;
    };

    const fields = {
        'profName': profile.name || '',
        'profRole': profile.role || '',
        'profImg': profile.image || '',
        'profEmail': profile.email || '',
        'profPhone': profile.phone || '',
        'profInstagram': extractUserSimple(profile.instagram, 'instagram'),
        'profTiktok': extractUserSimple(profile.tiktok, 'tiktok')
    };

    for (const [id, value] of Object.entries(fields)) {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.value = value;
        }
    }
}

function setupProfileEvents() {
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    const handleSave = (e) => {
        if (e) e.preventDefault();

        const phoneVal = document.getElementById('profPhone')?.value.trim() || '';
        let digitsOnly = phoneVal.replace(/[^0-9]/g, '');

        if (digitsOnly.startsWith('0')) {
            digitsOnly = '58' + digitsOnly.slice(1);
        } else if (digitsOnly.length === 10 && digitsOnly.startsWith('4')) {
            digitsOnly = '58' + digitsOnly;
        }

        const whatsappLink = digitsOnly ? `https://wa.me/${digitsOnly}` : '#';

        const igInput = document.getElementById('profInstagram')?.value.trim().replace(/^@/, '') || '';
        const tkInput = document.getElementById('profTiktok')?.value.trim().replace(/^@/, '') || '';

        const profileData = {
            name: document.getElementById('profName')?.value.trim() || '',
            role: document.getElementById('profRole')?.value.trim() || '',
            image: document.getElementById('profImg')?.value.trim() || '',
            email: document.getElementById('profEmail')?.value.trim() || '',
            phone: phoneVal,
            whatsappLink: whatsappLink,
            instagram: igInput ? `https://instagram.com/${igInput}` : '#',
            tiktok: tkInput ? `https://tiktok.com/@${tkInput}` : '#',
            handle: igInput ? '@' + igInput : '@Eliseo4k'
        };

        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
        alert('¡Perfil guardado correctamente!');
    };

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleSave);
    }
}