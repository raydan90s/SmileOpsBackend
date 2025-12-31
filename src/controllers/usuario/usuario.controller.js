const Usuario = require('@models/usuario/usuario.model');
const { generateToken, verifyToken } = require('@utils/jwt.util');

const loginUsuario = async (req, res) => {
  try {
    const { vUsuario, vClave } = req.body;
    const user = await Usuario.validateLoginConPermisos(vUsuario, vClave);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o clave incorrectos o inactivo',
      });
    }
    const permisos = user.permisos.reduce((acc, p) => {
      acc[p.vcodigo] = {
        lectura: p.blectura,
        escritura: p.bescritura,
        eliminacion: p.beliminacion,
        administracion: p.badministracion,
      };
      return acc;
    }, {});

    const token = generateToken({
      usuario: {
        iid: user.iid,
        vUsuario: user.vusuario,
        vNombres: user.vnombres,
        vApellidos: user.vapellidos,
      },
      permisos,
    });

    res.status(200).json({
      success: true,
      usuario: {
        iid: user.iid,
        vUsuario: user.vusuario,
        vNombres: user.vnombres,
        vApellidos: user.vapellidos,
        bActivo: user.bactivo,
        IdDoctor: user.iiddoctor,
        vDireccionfoto: user.vdireccionfoto,
      },
      permisos,
      token,
    });
  } catch (error) {
    console.error('Error en loginUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

const tokenUsuario = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token proporcionado'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const data = verifyToken(token);
    const usuario = await Usuario.findByUsuario(data.usuario.vUsuario);

    if (!usuario || !usuario.bactivo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inválido o inactivo'
      });
    }

    res.json({
      success: true,
      usuario: {
        iid: usuario.iid,
        vUsuario: usuario.vusuario,
        vNombres: usuario.vnombres,
        vApellidos: usuario.vapellidos,
        IdDoctor: usuario.iiddoctor,
        vDireccionfoto: usuario.vdireccionfoto,
      },
      permisos: data.permisos,
    });
  } catch (err) {
    console.error('Error en tokenUsuario:', err);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = { loginUsuario, tokenUsuario };