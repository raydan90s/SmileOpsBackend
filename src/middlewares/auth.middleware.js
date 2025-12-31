const { verifyToken } = require('@utils/jwt.util');
const Usuario = require('@models/usuario/usuario.model');


const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);

        const decoded = verifyToken(token);

        const usuario = await Usuario.findByUsuario(decoded.usuario.vUsuario);

        if (!usuario || !usuario.bactivo) {
            req.user = null;
            return next();
        }

        req.user = {
            iid: usuario.iid,
            vusuario: usuario.vusuario,
            vnombres: usuario.vnombres,
            vapellidos: usuario.vapellidos,
            iiddoctor: usuario.iiddoctor,
            permisos: decoded.permisos || {}
        };

        next();
    } catch (error) {
        console.error('Error verificando token:', error.message);
        req.user = null;
        next();
    }
};


const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido'
            });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        const usuario = await Usuario.findByUsuario(decoded.usuario.vUsuario);

        if (!usuario || !usuario.bactivo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inválido o inactivo'
            });
        }

        req.user = {
            iid: usuario.iid,
            vusuario: usuario.vusuario,
            vnombres: usuario.vnombres,
            vapellidos: usuario.vapellidos,
            iiddoctor: usuario.iiddoctor,
            permisos: decoded.permisos || {}
        };

        next();
    } catch (error) {
        console.error('Error en requireAuth:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = {
    authMiddleware,
    requireAuth
};