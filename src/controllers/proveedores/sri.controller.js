const { consultarSRI } = require('@models/proveedores/sri.model');

const consultarSRIController = async (req, res) => {
    try {
        const { ruc } = req.body;

        if (!ruc) {
            return res.status(400).json({
                success: false,
                message: 'El RUC es requerido'
            });
        }

        if (ruc.length !== 13) {
            return res.status(400).json({
                success: false,
                message: 'El RUC debe tener 13 dígitos'
            });
        }

        const resultado = await consultarSRI(ruc);

        res.status(200).json({
            success: true,
            data: resultado
        });

    } catch (err) {
        console.error('Error en consultarSRIController:', err);

        const errorMessage = err.message || 'Error al consultar el SRI. Intente nuevamente.';

        if (errorMessage.includes('No se encontró')) {
            return res.status(404).json({
                success: false,
                message: errorMessage
            });
        }

        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};

module.exports = {
    consultarSRIController
};