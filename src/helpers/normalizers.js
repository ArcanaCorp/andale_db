import { ENDPOINT } from '../config.js';

export const NORMALIZERS = {
    ecommerce: (item, subBussines) => ({
        id: item.id_product,
        sub: item.sub_product,
        name: item.name_product,
        text: item.text_product,
        category: item.category_product,
        isbox: item.isbox_product,
        priceu: Number(item.priceu_product),
        priced: Number(item.priced_product),
        amount: Number(item.amount_product),
        stock: Number(item.stock_product),
        photo: `${ENDPOINT}/bussines/${subBussines}/product/${item.image_product}`,
    }),
    agency: (item, subBussines) => ({
        id: item.id_pack,
        sub: item.sub_pack,
        name: item.name_pack,
        text: item.text_pack,
        price: Number(item.price_pack),
        photo: `${ENDPOINT}/bussines/${subBussines}/product/${item.image_pack}`,
    }),
    restaurant: (item, subBussines) => ({
        id: item.id_dish,
        sub: item.sub_dish,
        category: item.category_dish,
        name: item.name_dish,
        text: item.text_dish,
        price: Number(item.price_dish),
        photo: `${ENDPOINT}/bussines/${subBussines}/product/${item.image_dish}`,
    }),
};

export const normalizePlace = (place, images = []) => {
    return {
        id: place.id_place,
        sub: place.sub_place,
        name: place.name_place,
        text: place.text_place,
        category: place.category_place,
        locationName: place.locationName_place,
        district: place.district_location_place,
        province: place.province_location_place,
        region: place.region_location_place,
        location: place.location_place,
        services: parseJSONtoArray(place.services_place),
        schedule: place.schedule_place,
        price: place.price_place,
        access: parseJSONtoArray(place.access_place),
        recommendedTime: place.recommended_time,
        activities: parseJSONtoArray(place.activities_place),
        liked: place.liked_place,
        shared: place.shared_place,
        created: place.created_place,
        images
    };
}

export const parseJSONtoArray = (value) => {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export const normalizeBussines = (bussines) => {
    const BASE = ENDPOINT.endsWith("/") ? ENDPOINT.slice(0, -1) : ENDPOINT;

    return {
        id: bussines.id_bussines,
        id_sub: bussines.sub_bussines,
        sub: bussines.short_bussines || bussines.sub_bussines,
        phone: bussines.phone_bussines,
        name: bussines.name_bussines,
        text: bussines.text_bussines,
        category: bussines.category_bussines,
        delivery: Number(bussines.delivery_bussines),
        address: {
            direction: bussines.direction_bussines,
            district: bussines.district_bussines,
            province: bussines.province_bussines,
            region: bussines.region_bussines,
        },
        photo: bussines.photo_bussines
            ? `${BASE}/socio/${bussines.sub_bussines}/bussines/photo/${bussines.photo_bussines}`
            : null,
        portada: bussines.portada_bussines
            ? `${BASE}/socio/${bussines.sub_bussines}/bussines/photo/${bussines.portada_bussines}`
            : null,
        created: bussines.created_bussines,
    };
};