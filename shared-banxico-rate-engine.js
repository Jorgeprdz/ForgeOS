const https = require("https");

const BANXICO_SERIES = {
  UDI: "SP68257",
  USD_FIX: "SF43718"
};

function getToken() {
  const token = process.env.BANXICO_TOKEN;

  if (!token) {
    throw new Error("Missing BANXICO_TOKEN. Export it first: export BANXICO_TOKEN='your_token_here'");
  }

  return token;
}

function fetchBanxicoLatest(seriesId) {
  const token = getToken();

  const options = {
    hostname: "www.banxico.org.mx",
    path: `/SieAPIRest/service/v1/series/${seriesId}/datos/oportuno`,
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Bmx-Token": token
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const serie = parsed.bmx.series[0];
          const latest = serie.datos[0];

          resolve({
            seriesId,
            title: serie.titulo,
            date: latest.fecha,
            value: Number(String(latest.dato).replace(",", "")),
            source: "BANXICO_SIE_API",
            mode: "LATEST_VERIFIED"
          });
        } catch (error) {
          reject(new Error(`Banxico parse error: ${error.message}. Raw: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function getCurrentRates() {
  const [udi, usdFix] = await Promise.all([
    fetchBanxicoLatest(BANXICO_SERIES.UDI),
    fetchBanxicoLatest(BANXICO_SERIES.USD_FIX)
  ]);

  return {
    UDI_MXN: udi,
    USD_MXN_FIX: usdFix
  };
}

module.exports = {
  BANXICO_SERIES,
  fetchBanxicoLatest,
  getCurrentRates
};
