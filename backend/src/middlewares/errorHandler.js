export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.details || err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Não autorizado'
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Registro duplicado'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado'
    });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor'
  });
};
