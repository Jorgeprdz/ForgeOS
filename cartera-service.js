// cartera-service.js

import { DB } from './db.js';

import {
    normalizePoliza
} from './cartera-normalizer.js';

import {
    validatePoliza
} from './cartera-validator.js';

import {
    carteraEvents,
    CARTERA_EVENTS
} from './cartera-events.js';

import {
    CarteraStore
} from './cartera-state.js';

class CarteraService {

    async obtenerTodas() {

        try {

            CarteraStore.setLoading(true);

            const data =
                await DB.obtenerTodos(
                    'cartera'
                );

            const normalized =
                data.map(
                    normalizePoliza
                );

            CarteraStore.setPolizas(
                normalized
            );

            return normalized;

        } catch (error) {

            console.error(
                '[CARTERA SERVICE]',
                error
            );

            return [];

        } finally {

            CarteraStore.setLoading(
                false
            );
        }
    }

    async obtenerPorId(id) {

        const all =
            await this.obtenerTodas();

        return all.find(
            p => p.id === id
        ) || null;
    }

    async existePoliza(
        numeroPoliza,
        excludeId = null
    ) {

        const polizas =
            await this.obtenerTodas();

        return polizas.some(p => {

            if (
                excludeId &&
                p.id === excludeId
            ) {
                return false;
            }

            return (
                p.poliza
                    .toLowerCase()
                    .trim() ===
                numeroPoliza
                    .toLowerCase()
                    .trim()
            );
        });
    }

    async crear(payload) {

        const normalized =
            normalizePoliza(
                payload
            );

        const validation =
            validatePoliza(
                normalized
            );

        if (!validation.valid) {

            throw new Error(
                validation.errors.join(
                    ', '
                )
            );
        }

        const duplicate =
            await this.existePoliza(
                normalized.poliza
            );

        if (duplicate) {

            throw new Error(
                'La póliza ya existe'
            );
        }

        await DB.guardar(
            'cartera',
            normalized
        );

        carteraEvents.emit(
            CARTERA_EVENTS
                .POLIZA_CREATED,
            normalized
        );

        await this.obtenerTodas();

        return normalized;
    }

    async actualizar(
        id,
        payload
    ) {

        const normalized =
            normalizePoliza({
                ...payload,
                id
            });

        const validation =
            validatePoliza(
                normalized
            );

        if (!validation.valid) {

            throw new Error(
                validation.errors.join(
                    ', '
                )
            );
        }

        const duplicate =
            await this.existePoliza(
                normalized.poliza,
                id
            );

        if (duplicate) {

            throw new Error(
                'Ya existe otra póliza con ese número'
            );
        }

        await DB.actualizar(
            'cartera',
            id,
            normalized
        );

        carteraEvents.emit(
            CARTERA_EVENTS
                .POLIZA_UPDATED,
            normalized
        );

        await this.obtenerTodas();

        return normalized;
    }

    async eliminar(id) {

        const poliza =
            await this.obtenerPorId(
                id
            );

        if (!poliza) {

            throw new Error(
                'Póliza no encontrada'
            );
        }

        await DB.eliminar(
            'cartera',
            id
        );

        carteraEvents.emit(
            CARTERA_EVENTS
                .POLIZA_DELETED,
            poliza
        );

        await this.obtenerTodas();

        return true;
    }

    async importarMasivo(
        polizas = []
    ) {

        if (
            !Array.isArray(polizas)
        ) {

            throw new Error(
                'Formato inválido'
            );
        }

        const inserted = [];
        const errors = [];

        const batchSize = 50;

        for (
            let i = 0;
            i < polizas.length;
            i += batchSize
        ) {

            const batch =
                polizas.slice(
                    i,
                    i + batchSize
                );

            const promises =
                batch.map(
                    async raw => {

                        try {

                            const created =
                                await this.crear(
                                    raw
                                );

                            inserted.push(