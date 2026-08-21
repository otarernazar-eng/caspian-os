import type { DistanceTable } from '../types';

const MAX_ACCEPTABLE_DETOUR_KM = 60.0;
const TIME_WINDOW_TOLERANCE_HOURS = 6.0;
const VEHICLE_CONSUMPTION_L_PER_100KM = 30.0;
const DIESEL_PRICE_KZT_PER_L = 300.0; 

export interface RouteMetrics {
    distAb: number; 
    distAc: number; 
    distCd: number; 
    distDb: number; 
    detourKm: number;
    coveragePct: number;
}

export function computeRouteMetrics(
    vehicleOrigin: string,
    vehicleDestination: string,
    loadOrigin: string,
    loadDestination: string,
    table: DistanceTable
): RouteMetrics {
    const a = vehicleOrigin;
    const b = vehicleDestination;
    const c = loadOrigin;
    const d = loadDestination;

    const distAb = table.km(a, b);

    if (a === b) {
        const distAc = table.km(a, c);
        const distCd = table.km(c, d);
        const distDb = table.km(d, b);
        return {
            distAb: 0.0,
            distAc,
            distCd,
            distDb,
            detourKm: distAc + distCd + distDb,
            coveragePct: 0.0,
        };
    }

    const distAc = table.km(a, c);
    const distCd = table.km(c, d);
    const distDb = table.km(d, b);

    const detourKm = Math.max(0.0, distAc + distCd + distDb - distAb);
    const coveragePct = Math.max(0.0, Math.min(100.0, 100.0 * distCd / distAb));

    return {
        distAb,
        distAc,
        distCd,
        distDb,
        detourKm,
        coveragePct,
    };
}

export interface ScoreBreakdown {
    coverageScore: number;
    detourScore: number;
    compatibilityScore: number;
    timeWindowScore: number;
    economicScore: number;
    total: number;
}

export function scoreMatch(
    metrics: RouteMetrics,
    vehicleType: string,
    requiredVehicle: string,
    departureTimeHoursOffset: number,
    pickupTimeHoursOffset: number,
    emptyKmSaved: number
): ScoreBreakdown {
    const coverageScore = metrics.coveragePct;
    const detourScore = Math.max(0.0, 100.0 * (1 - metrics.detourKm / MAX_ACCEPTABLE_DETOUR_KM));
    const compatibilityScore = vehicleType === requiredVehicle ? 100.0 : 0.0;
    
    const hoursApart = Math.abs(departureTimeHoursOffset - pickupTimeHoursOffset);
    const timeWindowScore = Math.max(0.0, 100.0 * (1 - hoursApart / TIME_WINDOW_TOLERANCE_HOURS));

    const economicScore = metrics.distAb > 0 
        ? Math.max(0.0, Math.min(100.0, 100.0 * emptyKmSaved / metrics.distAb))
        : 0.0;

    const total = 
        0.40 * coverageScore +
        0.25 * detourScore +
        0.20 * compatibilityScore +
        0.10 * timeWindowScore +
        0.05 * economicScore;

    return {
        coverageScore,
        detourScore,
        compatibilityScore,
        timeWindowScore,
        economicScore,
        total: Math.round(total * 10) / 10,
    };
}

export interface EconomicsResult {
    emptyKmBefore: number;
    emptyKmAfter: number;
    emptyKmSaved: number;
    fuelSavedL: number;
    fuelSavedKzt: number;
}

export function computeEconomics(metrics: RouteMetrics): EconomicsResult {
    const emptyBefore = metrics.distAb;
    const emptyAfter = Math.max(0.0, metrics.distAc + metrics.distDb);
    const emptySaved = Math.max(0.0, emptyBefore - emptyAfter);

    const fuelSavedL = (emptySaved * VEHICLE_CONSUMPTION_L_PER_100KM) / 100.0;
    const fuelSavedKzt = fuelSavedL * DIESEL_PRICE_KZT_PER_L;

    return {
        emptyKmBefore: Math.round(emptyBefore * 10) / 10,
        emptyKmAfter: Math.round(emptyAfter * 10) / 10,
        emptyKmSaved: Math.round(emptySaved * 10) / 10,
        fuelSavedL: Math.round(fuelSavedL * 10) / 10,
        fuelSavedKzt: Math.round(fuelSavedKzt),
    };
}

const RETURN_TARIFF_RATE = 0.40;

export function suggestedReturnPriceKzt(forwardPriceKzt: number): number {
    return Math.round(forwardPriceKzt * RETURN_TARIFF_RATE);
}
