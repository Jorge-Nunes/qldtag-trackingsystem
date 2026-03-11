/**
 * Utilitários para tratamento de datas em UTC
 */

/**
 * Formata uma data para exibição local do usuário, garantindo que a entrada 
 * seja tratada corretamente como UTC (especialmente vindo do SQLite/Prisma).
 * 
 * @param {string|Date} dateSource - Data/string ISO vinda do backend
 * @returns {string} Data formatada (DD/MM/YYYY HH:mm:ss) ou string vazia
 */
export const formatDisplayDate = (dateSource) => {
  if (!dateSource) return '';

  try {
    let date = dateSource;
    
    // Se for string, normalizar para garantir tratamento UTC
    if (typeof dateSource === 'string') {
      // Se não terminar com Z e contiver T, provavelmente é UTC sem o sufixo (comum no SQLite)
      if (!dateSource.endsWith('Z') && dateSource.includes('T')) {
        date = new Date(`${dateSource}Z`);
      } else {
        date = new Date(dateSource);
      }
    }

    if (isNaN(date.getTime())) return 'Data Inválida';

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro na data';
  }
};

/**
 * Converte qualquer fonte de data para String ISO garantindo o sufixo Z.
 * @param {string|Date} dateSource 
 * @returns {string}
 */
export const toIsoUtc = (dateSource) => {
  if (!dateSource) return null;
  const date = new Date(dateSource);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};
