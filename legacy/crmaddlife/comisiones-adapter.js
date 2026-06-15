// legacy/crmaddlife/comisiones-adapter.js
// Compatibility contract for the legacy CRMAddlife commissions route.

const createEmptyHistory = () =>
    Array(6).fill(null).map(() => ({
        ini: 0,
        ren: 0,
    }));

const createMonthLabels = (now) => {
    const baseDate = now instanceof Date && !Number.isNaN(now.getTime())
        ? now
        : new Date();

    const labels = [];
    for (let i = 5; i >= 0; i--) {
        labels.push(
            new Date(
                baseDate.getFullYear(),
                baseDate.getMonth() - i,
                1
            ).toLocaleString('es-MX', { month: 'short' }).toUpperCase()
        );
    }

    return labels;
};

const createEmptyTrainingBonus = () => ({
    tipo: 'training',
    mc: 1,
    meta: null,
    fCom: 0,
    fPtos: 0,
    cumple: false,
    base: 0,
    exc: 0,
    total: 0,
});

const createEmptyNuevoProfesionalBonus = () => ({
    tipo: 'np',
    grupo: null,
    pct: 0,
    montoBI: 0,
    limra: 0,
    igc: 0,
    grupoGMM: null,
    montoGMM: 0,
    total: 0,
});

const createEmptyLegacyOutput = ({ now, useTrainingBonus }) => ({
    factorD: 1,
    comInicialMes: 0,
    comRenovMes: 0,
    puntosMes: 0,
    primaMetaMes: 0,
    comInicialSem: 0,
    puntosSem: 0,
    primaMetaSem: 0,
    primaGMMtrim: 0,
    polsGMMtrim: 0,
    comMesPasado: 0,
    polsMesPasado: 0,
    comYTD: 0,
    comInicialYTD: 0,
    hist6: createEmptyHistory(),
    etiq6: createMonthLabels(now),
    detallesMes: [],
    bono: useTrainingBonus
        ? createEmptyTrainingBonus()
        : createEmptyNuevoProfesionalBonus(),
});

const isTrainingProfile = (perfil, now) => {
    const fechaConexion = perfil?.fecha_conexion || perfil?.fechaConexion;
    if (!fechaConexion) return true;

    const baseDate = now instanceof Date && !Number.isNaN(now.getTime())
        ? now
        : new Date();
    const connectedAt = new Date(fechaConexion + 'T12:00:00');

    if (Number.isNaN(connectedAt.getTime())) return true;

    const monthIndex = Math.max(
        1,
        Math.floor(
            (baseDate - connectedAt) /
            (1000 * 60 * 60 * 24 * 30.44)
        ) + 1
    );

    return monthIndex <= 12;
};

/*
Expected legacy output shape consumed by comisiones.js:

{
  factorD,
  comInicialMes,
  comRenovMes,
  puntosMes,
  primaMetaMes,
  comInicialSem,
  puntosSem,
  primaMetaSem,
  primaGMMtrim,
  polsGMMtrim,
  comMesPasado,
  polsMesPasado,
  comYTD,
  comInicialYTD,
  hist6,
  etiq6,
  detallesMes,
  bono
}

Training bono variant:
{ tipo:'training', mc, meta, fCom, fPtos, cumple, base, exc, total }

Nuevo Profesional bono variant:
{ tipo:'np', grupo, pct, montoBI, limra, igc, grupoGMM, montoGMM, total }

TODO:
- Repair SMNYL rule-pack contracts before live wiring.
- Add parity fixtures for cartera/perfil inputs.
- Compare this adapter output against legacy calcularMotor().
- Wire SMNYL rule-pack engines only after parity is proven.
*/
export function calcularComisionesLegacyCompatible({
    cartera = [],
    perfil = {},
    now = new Date(),
} = {}) {
    const safeCartera = Array.isArray(cartera) ? cartera : [];
    const safePerfil = perfil && typeof perfil === 'object' ? perfil : {};
    const safeNow = now instanceof Date ? now : new Date(now);

    void safeCartera;

    return createEmptyLegacyOutput({
        now: safeNow,
        useTrainingBonus: isTrainingProfile(safePerfil, safeNow),
    });
}
