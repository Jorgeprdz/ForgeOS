// cartera-events.js

export const CARTERA_EVENTS = {

    POLIZA_CREATED:
        'poliza-created',

    POLIZA_UPDATED:
        'poliza-updated',

    POLIZA_DELETED:
        'poliza-deleted',

    POLIZA_IMPORTED:
        'poliza-imported'
};

class CarteraEventBus {

    emit(event, payload = {}) {

        window.dispatchEvent(
            new CustomEvent(
                event,
                {
                    detail: payload
                }
            )
        );
    }

    on(event, callback) {

        window.addEventListener(
            event,
            callback
        );
    }

    off(event, callback) {

        window.removeEventListener(
            event,
            callback
        );
    }
}

export const carteraEvents =
    new CarteraEventBus();