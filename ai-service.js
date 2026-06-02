// ai-service.js
// Enterprise AI Service Layer

import { EventBus } from './event-system.js';

const AI_CONFIG = {

    TIMEOUT_MS: 15000,

    MAX_RETRIES: 2,

    CACHE_TTL: 1000 * 60 * 5,

    MODEL: 'gemini-1.5-flash'
};

class AIService {

    constructor() {

        this.cache = new Map();

        this.pendingRequests = new Map();

        this.abortControllers = new Map();
    }

    async generate({
        prompt,
        cacheKey = null,
        requestId = crypto.randomUUID(),
        temperature = 0.7
    }) {

        try {

            if (!navigator.onLine) {

                return {
                    success: false,
                    text: 'Sin conexión disponible.'
                };
            }

            if (
                cacheKey &&
                this.cache.has(cacheKey)
            ) {

                const cached =
                    this.cache.get(cacheKey);

                const isFresh =
                    Date.now() - cached.timestamp <
                    AI_CONFIG.CACHE_TTL;

                if (isFresh) {

                    return {
                        success: true,
                        text: cached.data,
                        cached: true
                    };
                }
            }

            if (
                this.pendingRequests.has(requestId)
            ) {

                return this.pendingRequests.get(
                    requestId
                );
            }

            const controller =
                new AbortController();

            this.abortControllers.set(
                requestId,
                controller
            );

            const promise =
                this.#executeRequest({
                    prompt,
                    temperature,
                    controller,
                    requestId
                });

            this.pendingRequests.set(
                requestId,
                promise
            );

            const result =
                await promise;

            if (
                result.success &&
                cacheKey
            ) {

                this.cache.set(
                    cacheKey,
                    {
                        data: result.text,
                        timestamp: Date.now()
                    }
                );
            }

            return result;

        } catch (err) {

            console.error(
                '[AI SERVICE ERROR]',
                err
            );

            return {
                success: false,
                text: 'No fue posible generar respuesta.'
            };

        } finally {

            this.pendingRequests.delete(
                requestId
            );

            this.abortControllers.delete(
                requestId
            );
        }
    }

    async #executeRequest({
        prompt,
        temperature,
        controller,
        requestId
    }) {

        const timeout =
            setTimeout(() => {

                controller.abort();

            }, AI_CONFIG.TIMEOUT_MS);

        try {

            const response =
                await fetch(
                    '/api/gemini',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            prompt,
                            temperature,
                            model:
                                AI_CONFIG.MODEL
                        }),

                        signal:
                            controller.signal
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `AI HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            const text =
                data?.text?.trim();

            if (!text) {

                throw new Error(
                    'Empty AI response'
                );
            }

            EventBus.emit(
                'ai:response',
                {
                    requestId,
                    text
                }
            );

            return {
                success: true,
                text
            };

        } finally {

            clearTimeout(timeout);
        }
    }

    abort(requestId) {

        const controller =
            this.abortControllers.get(
                requestId
            );

        if (controller) {

            controller.abort();
        }
    }

    clearCache() {

        this.cache.clear();
    }
}

export const AI =
    new AIService();