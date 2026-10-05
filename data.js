// ==========================================
// 1. CIUDADES
// ==========================================
const CITIES_DATA = [
    { value: 'all', label: 'Elige tu ciudad' },
    { value: 'El Tigre', label: 'El Tigre' },
    { value: 'El Tigrito', label: 'El Tigrito' }
];

// ==========================================
// 2. CATEGORÍAS DE COMIDA
// ==========================================
const CATEGORIES_DATA = [
    { value: 'all', label: 'Elige la comida' },
    { value: 'Perro Caliente', label: 'Perro Caliente' },
    { value: 'Hamburguesa', label: 'Hamburguesa' },
    { value: 'Arroz Chino', label: 'Arroz Chino' },
    { value: 'Sushi', label: 'Sushi' },
    { value: 'Pizza', label: 'Pizza' },
    { value: 'Shawarma', label: 'Shawarma' }
];

// ==========================================
// 3. DATOS DE PERFIL POR DEFECTO
// ==========================================
const DEFAULT_PROFILE_DATA = {
    name: "Eliseo Romero",
    role: "Creador de Contenido",
    image: "img/perfil1.jpeg",
    email: "eliseoejrm@gmail.com",
    phone: "0414-9809111",
    whatsappLink: "https://wa.me/584149809111?s=p",
    instagram: "https://instagram.com/Eliseo4k",
    tiktok: "https://tiktok.com/@Eliseo4k",
    handle: "@Eliseo4k"
};

// ==========================================
// 4. PUESTOS DE COMIDA
// ==========================================
const FOOD_STANDS_DATA = [
    {
        id: 1,
        title: "Perros Eliseo",
        tagline: "Los mejores perros calientes de la ciudad",
        description: "Descripción breve de lo que venden o tu opinión sobre el sitio.",
        rating: 3.5,
        city: "El Tigre",
        category: "Perro Caliente",
        phone: "0412-0000000",
        address: "Dirección completa del local o puesto de comida.",
        image: "https://ranchera.com.co/wp-content/uploads/2022/11/perro-colombiano-1.jpg",
        mapsUrl: "https://maps.app.goo.gl/tu-link-de-google-maps",
        instagram: "#",
        tiktok: "#",
        isFeatured: false
    },
    {
        id: 2,
        title: "Sushi Eliseo",
        tagline: "Los mejores sushis de la ciudad",
        description: "Descripción breve de lo que venden o tu opinión sobre el sitio.",
        rating: 5,
        city: "El Tigrito",
        category: "Sushi",
        phone: "0412-0000000",
        address: "Dirección completa del local o puesto de comida.",
        image: "https://www.divinacocina.es/wp-content/uploads/2011/11/sushi-variado-bandeja.jpg",
        mapsUrl: "https://maps.app.goo.gl/tu-link-de-google-maps",
        instagram: "#",
        tiktok: "#",
        isFeatured: false
    },
    {
        id: 3,
        title: "Pizza Eliseo",
        tagline: "Las mejores pizzas de la ciudad",
        description: "Descripción breve de lo que venden o tu opinión sobre el sitio.",
        rating: 2,
        city: "El Tigre",
        category: "Pizza",
        phone: "0412-0000000",
        address: "Dirección completa del local o puesto de comida.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLIjo3IERJ0wPPP_9M0W0WqtgktLfTc8aLLnn7EWvOg6K1eJxwt2Q69zk6&s=10",
        mapsUrl: "https://maps.app.goo.gl/tu-link-de-google-maps",
        instagram: "#",
        tiktok: "#",
        isFeatured: false
    },
    {
        id: 4,
        title: "Shawarma Eliseo",
        tagline: "Los mejores Shawarmas de la ciudad",
        description: "Descripción breve de lo que venden o tu opinión sobre el sitio.",
        rating: 3,
        city: "El Tigrito",
        category: "Shawarma",
        phone: "0412-0000000",
        address: "Dirección completa del local o puesto de comida.",
        image: "https://foxeslovelemons.com/wp-content/uploads/2023/06/Chicken-Shawarma-8.jpg",
        mapsUrl: "https://maps.app.goo.gl/tu-link-de-google-maps",
        instagram: "#",
        tiktok: "#",
        isFeatured: false
    }
];