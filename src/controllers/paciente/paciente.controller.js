const {
  getPacienteByNombre,
  getAllPacientes,
  getPacienteById,
  getPacienteByCedula,
  getNextIidPaciente,
  createPaciente,
  updatePaciente,
  getPacienteCompletoById,
  deactivatePaciente,
  activatePaciente
} = require('@models/paciente/paciente.model');

const fetchAllPacientes = async (req, res) => {
  try {
    const pacientes = await getAllPacientes();
    res.status(200).json({
      success: true,
      data: pacientes,
    });
  } catch (err) {
    console.error('Error fetching pacientes:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
    });
  }
};

const getPacienteByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await getPacienteById(id);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: paciente
    });
  } catch (err) {
    console.error('Error fetching paciente by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente'
    });
  }
};

const obtenerPacientePorCedula = async (req, res) => {
  try {
    const { cedula } = req.params;
    const paciente = await getPacienteByCedula(cedula);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: paciente
    });
  } catch (error) {
    console.error('Error obteniendo paciente por cédula:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const obtenerSiguienteFicha = async (req, res) => {
  try {
    const nextFicha = await getNextIidPaciente();
    res.json({
      success: true,
      nextFicha
    });
  } catch (err) {
    console.error('Error obteniendo siguiente ficha:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const obtenerPacientePorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const pacientes = await getPacienteByNombre(nombre);

    if (!pacientes || pacientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron pacientes con ese nombre'
      });
    }

    res.json({
      success: true,
      data: pacientes
    });
  } catch (error) {
    console.error('Error obteniendo paciente por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const crearPacienteController = async (req, res) => {
  try {
    const pacienteData = req.body;

    const nuevoPaciente = await createPaciente(pacienteData, req);

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: nuevoPaciente
    });
  } catch (error) {
    console.error('Error al crear paciente:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarPacienteController = async (req, res) => {
  try {
    const { id } = req.params;
    const pacienteData = req.body;

    const pacienteActualizado = await updatePaciente(id, pacienteData, req);

    res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: pacienteActualizado
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);

    if (error.message === 'Paciente no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getPacienteCompletoController = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await getPacienteCompletoById(id);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: paciente
    });
  } catch (err) {
    console.error('Error fetching paciente completo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente completo'
    });
  }
};

const desactivarPacienteController = async (req, res) => {
  try {
    const { id } = req.params;

    const pacienteDesactivado = await deactivatePaciente(id, req);

    res.status(200).json({
      success: true,
      message: 'Paciente desactivado exitosamente',
      data: pacienteDesactivado
    });
  } catch (error) {
    console.error('Error al desactivar paciente:', error);

    if (error.message === 'Paciente no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al desactivar paciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const activarPacienteController = async (req, res) => {
  try {
    const { id } = req.params;

    const pacienteActivado = await activatePaciente(id, req);

    res.status(200).json({
      success: true,
      message: 'Paciente activado exitosamente',
      data: pacienteActivado
    });
  } catch (error) {
    console.error('Error al activar paciente:', error);

    if (error.message === 'Paciente no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al activar paciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllPacientes,
  getPacienteByIdController,
  obtenerPacientePorCedula,
  obtenerSiguienteFicha,
  obtenerPacientePorNombre,
  crearPacienteController,
  actualizarPacienteController,
  getPacienteCompletoController,
  desactivarPacienteController,
  activarPacienteController
};