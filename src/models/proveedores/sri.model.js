const SRI_CONTRIBUYENTE_URL = "https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?=&ruc=";
const SRI_ESTABLECIMIENTO_URL = "https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/Establecimiento/consultarPorNumeroRuc?numeroRuc=";

const consultarSRI = async (ruc) => {
    try {
        const urlContribuyente = SRI_CONTRIBUYENTE_URL + ruc;
        const resContribuyente = await fetch(urlContribuyente);

        if (!resContribuyente.ok) {
            throw new Error(`Error al obtener contribuyente (Status: ${resContribuyente.status})`);
        }

        const contribuyenteArray = await resContribuyente.json();

        if (!contribuyenteArray || contribuyenteArray.length === 0) {
            throw new Error("No se encontró información del contribuyente");
        }

        const contribuyenteData = contribuyenteArray[0];

        const urlEstablecimiento = SRI_ESTABLECIMIENTO_URL + ruc;
        const resEstablecimiento = await fetch(urlEstablecimiento);

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
        console.error('Error en consultarSRI model:', error);
        throw error;
    }
};

module.exports = {
    consultarSRI
};