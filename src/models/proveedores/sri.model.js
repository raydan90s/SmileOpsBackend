const SRI_CONTRIBUYENTE_URL = "https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?=&ruc=";
const SRI_ESTABLECIMIENTO_URL = "https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/Establecimiento/consultarPorNumeroRuc?numeroRuc=";

const fetchConReintento = async (url, intentos = 3) => {
    for (let i = 0; i < intentos; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Connection': 'keep-alive'
                }
            });

            return res;
        } catch (error) {
            if (i === intentos - 1) throw error;

            console.log(`Intento ${i + 1} fallido para SRI. Reintentando...`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
};

const consultarSRI = async (ruc) => {
    try {
        const urlContribuyente = SRI_CONTRIBUYENTE_URL + ruc;
        const resContribuyente = await fetchConReintento(urlContribuyente);

        if (!resContribuyente.ok) {
            if (resContribuyente.status === 404) {
                throw new Error("El RUC no existe en el SRI");
            }
            throw new Error(`Error al obtener contribuyente (Status: ${resContribuyente.status})`);
        }

        const contribuyenteArray = await resContribuyente.json();

        if (!contribuyenteArray || contribuyenteArray.length === 0) {
            throw new Error("No se encontró información del contribuyente");
        }

        const contribuyenteData = contribuyenteArray[0];

        const urlEstablecimiento = SRI_ESTABLECIMIENTO_URL + ruc;
        const resEstablecimiento = await fetchConReintento(urlEstablecimiento);

        if (!resEstablecimiento.ok) {
            throw new Error(`Error al obtener establecimientos (Status: ${resEstablecimiento.status})`);
        }

        const establecimientosArray = await resEstablecimiento.json();

        const finalData = {
            ...contribuyenteData,
            establecimientos: establecimientosArray || []
        };

        const result = {
            ruc: ruc,
            data: finalData
        };

        return result;

    } catch (error) {
        console.error('Error en consultarSRI model:', error.message);
        if (error.cause) console.error('Causa:', error.cause);
        throw error;
    }
};

module.exports = {
    consultarSRI
};