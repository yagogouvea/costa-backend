import { Prisma } from '@prisma/client';

type Nullable<T> = T | null | undefined;

const removeDiacritics = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const normalize = (value?: string | null): string => removeDiacritics(value).toLowerCase();

const toDate = (value?: Nullable<string | Date>): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const differenceInHours = (start?: Nullable<string | Date>, end?: Nullable<string | Date>): number => {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return 0;
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs > 0 ? diffMs / 3_600_000 : 0;
};

const parseNumber = (value?: Nullable<string | number>): number => {
  if (value == null) return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseJsonArray = (value: unknown): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseFranquiaHoras = (valor?: Nullable<string>): number => {
  if (!valor) return 0;
  const match = valor.replace(',', '.').match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
};

export const formatarResultadoCompleto = (resultado?: string | null, subResultado?: string | null): string => {
  if (!resultado) return '-';

  switch (resultado) {
    case 'RECUPERADO':
      if (subResultado === 'COM_RASTREIO') {
        return 'Recuperado com rastreio';
      }
      if (subResultado === 'SEM_RASTREIO') {
        return 'Recuperado sem rastreio';
      }
      if (subResultado === 'SEM_RASTREIO_COM_CONSULTA_APOIO') {
        return 'Recuperado com consulta do apoio';
      }
      return 'Recuperado';

    case 'NAO_RECUPERADO':
      return 'Não recuperado';

    case 'CANCELADO':
      return 'Cancelado';

    case 'LOCALIZADO':
      return 'Localizado (simples verificação)';

    default:
      return resultado.replace(/_/g, ' ').toLowerCase();
  }
};

const CIDADES_GRANDE_SP = [
  'ARUJA',
  'BARUERI',
  'BIRITIBA-MIRIM',
  'CAIEIRAS',
  'CAJAMAR',
  'CARAPICUIBA',
  'COTIA',
  'DIADEMA',
  'EMBU-GUACU',
  'EMBU DAS ARTES',
  'FERRAZ DE VASCONCELOS',
  'FRANCISCO MORATO',
  'FRANCO DA ROCHA',
  'GUARULHOS',
  'GUAIANASES',
  'ITAPECERICA DA SERRA',
  'ITAPEVI',
  'ITAQUAQUECETUBA',
  'JANDIRA',
  'JUQUITIBA',
  'MAIRIPORA',
  'MAUA',
  'MOGI DAS CRUZES',
  'OSASCO',
  'POA',
  'RIBEIRAO PIRES',
  'RIO GRANDE DA SERRA',
  'SANTA ISABEL',
  'SANTANA DE PARNAIBA',
  'SANTO ANDRE',
  'SAO BERNARDO',
  'SAO CAETANO',
  'SUZANO',
  'TABOAO DA SERRA',
  'VARGEM GRANDE PAULISTA',
];

const normalizarEstado = (estado: string = ''): string => {
  const estadoNormalizado = removeDiacritics(estado).toUpperCase();
  const mapaEstados: Record<string, string> = {
    ACRE: 'AC',
    ALAGOAS: 'AL',
    AMAPA: 'AP',
    AMAZONAS: 'AM',
    BAHIA: 'BA',
    CEARA: 'CE',
    'DISTRITO FEDERAL': 'DF',
    'ESPIRITO SANTO': 'ES',
    GOIAS: 'GO',
    MARANHAO: 'MA',
    'MATO GROSSO': 'MT',
    'MATO GROSSO DO SUL': 'MS',
    'MINAS GERAIS': 'MG',
    PARA: 'PA',
    PARAIBA: 'PB',
    PARANA: 'PR',
    PERNAMBUCO: 'PE',
    PIAUI: 'PI',
    'RIO DE JANEIRO': 'RJ',
    'RIO GRANDE DO NORTE': 'RN',
    'RIO GRANDE DO SUL': 'RS',
    RONDONIA: 'RO',
    RORAIMA: 'RR',
    'SANTA CATARINA': 'SC',
    'SAO PAULO': 'SP',
    SERGIPE: 'SE',
    TOCANTINS: 'TO',
  };

  return mapaEstados[estadoNormalizado] || estadoNormalizado;
};

export const definirMacro = (estado?: string | null, cidade?: string | null): 'CAPITAL' | 'GRANDE SP' | 'INTERIOR' | 'OUTROS ESTADOS' => {
  const estadoUF = normalizarEstado(estado ?? '');
  const cidadeNome = removeDiacritics(cidade).toUpperCase();

  if (!estadoUF || estadoUF !== 'SP') return 'OUTROS ESTADOS';

  if (cidadeNome.includes('SAO PAULO')) return 'CAPITAL';

  if (CIDADES_GRANDE_SP.some((c) => cidadeNome.includes(c))) {
    return 'GRANDE SP';
  }

  return 'INTERIOR';
};

export interface PrestadorFinanceiroDefaults {
  valor_acionamento?: Nullable<number>;
  valor_hora_adc?: Nullable<number>;
  valor_km_adc?: Nullable<number>;
  franquia_horas?: Nullable<string>;
  franquia_km?: Nullable<number>;
}

export interface OcorrenciaFinanceiraInput {
  id?: number;
  tipo?: Nullable<string>;
  estado?: Nullable<string>;
  cidade?: Nullable<string>;
  resultado?: Nullable<string>;
  sub_resultado?: Nullable<string>;
  status?: Nullable<string>;
  criado_em?: Nullable<Date | string>;
  data_acionamento?: Nullable<Date | string>;
  inicio?: Nullable<Date | string>;
  chegada?: Nullable<Date | string>;
  termino?: Nullable<Date | string>;
  km?: Nullable<number>;
  km_inicial?: Nullable<number>;
  km_final?: Nullable<number>;
  despesas?: Nullable<number>;
  despesas_detalhadas?: Prisma.JsonValue | null;
  valor_acionamento?: Nullable<number>;
  valor_hora_adc?: Nullable<number>;
  valor_km_adc?: Nullable<number>;
}

export interface FinanceiroOcorrenciaResultado {
  macro: 'CAPITAL' | 'GRANDE SP' | 'INTERIOR' | 'OUTROS ESTADOS';
  resultadoFormatado: string;
  statusOriginal: string;
  statusNormalizado: string;
  cancelada: boolean;
  finalizada: boolean;
  dataVencimento: string | null;
  pago: boolean;
  kmTotal: number;
  horasTotais: number;
  horasExtras: number;
  kmExtras: number;
  franquiaHoras: number;
  franquiaKm: number;
  valorAcionamento: number;
  valorHoraExtra: number;
  valorKmExtra: number;
  despesas: number;
  totalReceber: number;
}

const calcularKmTotal = (km?: Nullable<number>, kmInicial?: Nullable<number>, kmFinal?: Nullable<number>): number => {
  const kmNumero = parseNumber(km);
  if (kmNumero > 0) return kmNumero;
  if (kmInicial != null && kmFinal != null) {
    const diff = parseNumber(kmFinal) - parseNumber(kmInicial);
    return diff > 0 ? diff : 0;
  }
  return 0;
};

export const calcularFinanceiroOcorrencia = (
  ocorrencia: OcorrenciaFinanceiraInput,
  prestadorDefaults: PrestadorFinanceiroDefaults,
): FinanceiroOcorrenciaResultado => {
  const calcularHojeISO = (): string => {
    const agora = new Date();
    const semOffset = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
    return semOffset.toISOString().slice(0, 10);
  };

  const detectarDataReferencia = (): Date | null => {
    const candidatas = [
      ocorrencia.termino,
      ocorrencia.chegada,
      ocorrencia.data_acionamento,
      ocorrencia.criado_em,
    ];

    for (const candidata of candidatas) {
      const data = toDate(candidata ?? undefined);
      if (data) {
        return data;
      }
    }

    return null;
  };

  const calcularVencimento = (): string | null => {
    const referencia = detectarDataReferencia();
    if (!referencia) {
      return null;
    }

    const vencimento = new Date(referencia.getTime());
    vencimento.setDate(vencimento.getDate() + 10);

    const diaSemana = vencimento.getDay();
    if (diaSemana === 6) {
      vencimento.setDate(vencimento.getDate() + 2);
    } else if (diaSemana === 0) {
      vencimento.setDate(vencimento.getDate() + 1);
    }

    return vencimento.toISOString().slice(0, 10);
  };

  const dataVencimento = calcularVencimento();
  const pago = dataVencimento ? calcularHojeISO() > dataVencimento : false;

  const macro = definirMacro(ocorrencia.estado, ocorrencia.cidade);
  const resultadoFormatado = formatarResultadoCompleto(ocorrencia.resultado, ocorrencia.sub_resultado);
  const resultadoNormalized = normalize(resultadoFormatado);
  const statusOriginal = ocorrencia.status ?? '';
  const statusNormalizado = normalize(statusOriginal);
  const cancelada = statusNormalizado.includes('cancelad');
  const finalizada = [
    'concluida',
    'finalizada',
    'encerrada',
    'recuperada',
    'recuperado',
    'nao_recuperado',
    'nao recuperado',
    'não recuperado',
    'cancelada',
  ].includes(statusNormalizado);

  const tipoNormalizado = normalize(ocorrencia.tipo);
  const isSaoPaulo = macro === 'CAPITAL' || macro === 'GRANDE SP';
  const isAntenista = tipoNormalizado.includes('antenista');
  const isRouboFurto = tipoNormalizado.includes('roubo') || tipoNormalizado.includes('furto');
  const isSuspeita = tipoNormalizado.includes('suspeita');
  const isPreservacao = tipoNormalizado.includes('preservacao') || tipoNormalizado.includes('preservação') || tipoNormalizado.includes('preserva');
  const isRecuperacaoJudicial =
    tipoNormalizado.includes('recuperacao judicial') || tipoNormalizado.includes('recuperação judicial') || tipoNormalizado.includes('recuperaçao judicial');
  const isApropriacao = tipoNormalizado.includes('apropriacao') || tipoNormalizado.includes('apropriação') || tipoNormalizado.includes('apropria');
  const isSimplesVerificacao =
    tipoNormalizado.includes('simples verificacao') || tipoNormalizado.includes('simples verificação') || tipoNormalizado.includes('simples verific');

  const horasTotais = (() => {
    const horasChegada = differenceInHours(ocorrencia.chegada, ocorrencia.termino);
    if (horasChegada > 0) return horasChegada;
    return differenceInHours(ocorrencia.inicio, ocorrencia.termino);
  })();
  const minutosTotais = horasTotais * 60;

  const kmTotal = calcularKmTotal(ocorrencia.km, ocorrencia.km_inicial, ocorrencia.km_final);
  const despesasDetalhadas = parseJsonArray(ocorrencia.despesas_detalhadas).reduce(
    (acc, item) => acc + parseNumber(item?.valor),
    0,
  );
  const despesasBase = parseNumber(ocorrencia.despesas);
  const despesas = cancelada ? 0 : despesasBase + despesasDetalhadas;

  const franquiaHoras = parseFranquiaHoras(prestadorDefaults.franquia_horas) || 0;
  const franquiaKm = parseNumber(prestadorDefaults.franquia_km);

  const valorAcionamentoPadrao =
    parseNumber(ocorrencia.valor_acionamento) || parseNumber(prestadorDefaults.valor_acionamento);
  const valorHoraPadrao = parseNumber(ocorrencia.valor_hora_adc) || parseNumber(prestadorDefaults.valor_hora_adc);
  const valorKmPadrao = parseNumber(ocorrencia.valor_km_adc) || parseNumber(prestadorDefaults.valor_km_adc);

  const aplicaFranquia = (franquiaMinutos: number, valorHora: number): [number, number] => {
    if (minutosTotais <= franquiaMinutos) {
      return [0, 0];
    }
    const minutosExtras = minutosTotais - franquiaMinutos;
    const horasExtras = minutosExtras / 60;
    return [horasExtras, horasExtras * valorHora];
  };

  const valorKmAdicional = (franquia: number, valorKm: number): [number, number] => {
    if (kmTotal <= franquia) {
      return [0, 0];
    }
    const kmExtras = kmTotal - franquia;
    return [kmExtras, kmExtras * valorKm];
  };

  if (cancelada) {
    return {
      macro,
      resultadoFormatado,
      statusOriginal,
      statusNormalizado,
      cancelada: true,
      finalizada,
      dataVencimento,
      pago,
      kmTotal,
      horasTotais,
      horasExtras: 0,
      kmExtras: 0,
      franquiaHoras,
      franquiaKm,
      valorAcionamento: 0,
      valorHoraExtra: 0,
      valorKmExtra: 0,
      despesas: 0,
      totalReceber: 0,
    };
  }

  const franquiaMinutosPadrao = 3 * 60;
  const franquiaKmPadrao = 50;

  const resultadoEspecial = (): FinanceiroOcorrenciaResultado | null => {
    if (isAntenista) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, isSaoPaulo ? 30 : 35);

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento: 250,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: 250 + valorHoraExtra + valorKmExtra + despesas,
      };
    }

    if (isRecuperacaoJudicial) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, isSaoPaulo ? 30 : 35);

      const ehRecuperado = resultadoNormalized.includes('recuperado');
      const ehNaoRecuperado =
        resultadoNormalized.includes('nao recuperado') || resultadoNormalized.includes('não recuperado');

      const valorAcionamento = ehRecuperado ? 250 : ehNaoRecuperado ? 100 : 100;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isRouboFurto && isSaoPaulo) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 30);
      const valorAcionamento = 150;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isSuspeita && isSaoPaulo) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 30);
      const valorAcionamento = 150;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isSuspeita && !isSaoPaulo) {
      const ehRecuperado = resultadoNormalized.includes('recuperado');
      const ehNaoRecuperado =
        resultadoNormalized.includes('nao recuperado') || resultadoNormalized.includes('não recuperado');

      if (ehRecuperado || ehNaoRecuperado) {
        const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
        const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 35);
        const valorAcionamento = 200;
        const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

        return {
          macro,
          resultadoFormatado,
          statusOriginal,
          statusNormalizado,
          cancelada: false,
          finalizada,
          dataVencimento,
          pago,
          kmTotal,
          horasTotais,
          horasExtras,
          kmExtras,
          franquiaHoras: 3,
          franquiaKm: 50,
          valorAcionamento,
          valorHoraExtra,
          valorKmExtra,
          despesas,
          totalReceber: total,
        };
      }
    }

    if (isPreservacao && isSaoPaulo) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 30);
      const valorAcionamento = 200;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isPreservacao && !isSaoPaulo) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 35);
      const valorAcionamento = 200;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isRouboFurto && !isSaoPaulo) {
      const ehRecuperado = resultadoNormalized.includes('recuperado');
      const ehNaoRecuperado =
        resultadoNormalized.includes('nao recuperado') || resultadoNormalized.includes('não recuperado');

      if (ehRecuperado || ehNaoRecuperado) {
        const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
        const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 35);
        const valorAcionamento = 200;
        const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

        return {
          macro,
          resultadoFormatado,
          statusOriginal,
          statusNormalizado,
          cancelada: false,
          finalizada,
          dataVencimento,
          pago,
          kmTotal,
          horasTotais,
          horasExtras,
          kmExtras,
          franquiaHoras: 3,
          franquiaKm: 50,
          valorAcionamento,
          valorHoraExtra,
          valorKmExtra,
          despesas,
          totalReceber: total,
        };
      }
    }

    if (isApropriacao && isSaoPaulo) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 30);

      const ehRecuperado = resultadoNormalized.includes('recuperado');
      const valorAcionamento = ehRecuperado ? 200 : 100;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isSimplesVerificacao) {
      const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
      const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, isSaoPaulo ? 30 : 35);
      const valorAcionamento = 100;
      const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

      return {
        macro,
        resultadoFormatado,
        statusOriginal,
        statusNormalizado,
        cancelada: false,
        finalizada,
        dataVencimento,
        pago,
        kmTotal,
        horasTotais,
        horasExtras,
        kmExtras,
        franquiaHoras: 3,
        franquiaKm: 50,
        valorAcionamento,
        valorHoraExtra,
        valorKmExtra,
        despesas,
        totalReceber: total,
      };
    }

    if (isApropriacao && !isSaoPaulo) {
      const ehRecuperada = resultadoNormalized.includes('recuperado');
      if (ehRecuperada) {
        const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
        const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, 35);
        const valorAcionamento = 250;
        const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

        return {
          macro,
          resultadoFormatado,
          statusOriginal,
          statusNormalizado,
          cancelada: false,
          finalizada,
          dataVencimento,
          pago,
          kmTotal,
          horasTotais,
          horasExtras,
          kmExtras,
          franquiaHoras: 3,
          franquiaKm: 50,
          valorAcionamento,
          valorHoraExtra,
          valorKmExtra,
          despesas,
          totalReceber: total,
        };
      }
    }

    if (isApropriacao) {
      const ehNaoRecuperada =
        resultadoNormalized.includes('nao recuperado') || resultadoNormalized.includes('não recuperado');
      const ehLocalizada = resultadoNormalized.includes('localizado');

      if (ehNaoRecuperada || ehLocalizada) {
        const [kmExtras, valorKmExtra] = valorKmAdicional(franquiaKmPadrao, 1);
        const [horasExtras, valorHoraExtra] = aplicaFranquia(franquiaMinutosPadrao, isSaoPaulo ? 30 : 35);
        const valorAcionamento = 100;
        const total = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

        return {
          macro,
          resultadoFormatado,
          statusOriginal,
          statusNormalizado,
          cancelada: false,
          finalizada,
          dataVencimento,
          pago,
          kmTotal,
          horasTotais,
          horasExtras,
          kmExtras,
          franquiaHoras: 3,
          franquiaKm: 50,
          valorAcionamento,
          valorHoraExtra,
          valorKmExtra,
          despesas,
          totalReceber: total,
        };
      }
    }

    return null;
  };

  const especial = resultadoEspecial();
  if (especial) {
    return especial;
  }

  const horasExtrasPadrao = Math.max(0, horasTotais - franquiaHoras);
  const kmExtrasPadrao = Math.max(0, kmTotal - franquiaKm);
  const valorHoraExtra = horasExtrasPadrao * valorHoraPadrao;
  const valorKmExtra = kmExtrasPadrao * valorKmPadrao;
  const valorAcionamento = valorAcionamentoPadrao;
  const totalReceber = valorAcionamento + valorHoraExtra + valorKmExtra + despesas;

  return {
    macro,
    resultadoFormatado,
    statusOriginal,
    statusNormalizado,
    cancelada: false,
    finalizada,
    dataVencimento,
    pago,
    kmTotal,
    horasTotais,
    horasExtras: horasExtrasPadrao,
    kmExtras: kmExtrasPadrao,
    franquiaHoras,
    franquiaKm,
    valorAcionamento,
    valorHoraExtra,
    valorKmExtra,
    despesas,
    totalReceber,
  };
};


