/**
 * Middleware de Auditoría
 * Prepara metadata básica para auditoría
 */
const auditMiddleware = async (req, res, next) => {
    try {
        // Preparar metadata de auditoría
        req.auditMetadata = {
            ipAddress: req.ip ||
                req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                'unknown',
            userAgent: req.get('user-agent') || 'unknown'
        };
        next();
    } catch (error) {
        console.error('Error en middleware de auditoría:', error);
        next();
    }
};

/**
 * Función helper para ejecutar queries con contexto de auditoría
 * @param {Pool} pool - Pool de conexiones de PostgreSQL
 * @param {Object} req - Request object de Express (contiene req.user del authMiddleware)
 * @param {Function} queryCallback - Función que ejecuta las queries
 */
const executeWithAudit = async (pool, req, queryCallback) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ✅ AQUÍ obtenemos el usuario REAL desde req.user (ya establecido por authMiddleware)
        const userId = req.user && req.user.iid ? req.user.iid : 54;

        // Obtener metadata de auditoría
        const ipAddress = req.auditMetadata?.ipAddress ||
            req.ip ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            'unknown';

        const userAgent = req.auditMetadata?.userAgent ||
            req.get('user-agent') ||
            'unknown';

        // Log para debugging (opcional - puedes removerlo después)
        console.log('🔍 Auditoría - Usuario:', userId, '| IP:', ipAddress);

        // Configurar variables de sesión en PostgreSQL
        await client.query(
            `SELECT 
                set_config('app.current_user_id', $1, false),
                set_config('app.ip_origen', $2, false),
                set_config('app.user_agent', $3, false)`,
            [
                userId.toString(),
                ipAddress,
                userAgent
            ]
        );

        // Ejecutar la query del callback
        const result = await queryCallback(client);

        await client.query('COMMIT');

        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    auditMiddleware,
    executeWithAudit
};