import { Request, Response } from 'express';
import { ensurePrisma } from '../lib/prisma';
import { calcularFinanceiroOcorrencia } from '../utils/prestadorFinanceiro';

const FINAL_STATUS_SET = new Set([
  'concluida',
  'finalizada',
  'encerrada',
  'recuperada',
  'recuperado',
  'nao_recuperado',
  'nao recuperado',
  'não recuperado',
  'cancelada',
]);

const STATUS_PAGAVEIS_SET = new Set(['concluida', 'finalizada', 'recuperada', 'recuperado']);

export const getPrestadorDashboardResumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.tipo !== 'prestador') {
      res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
      return;
    }

    const db = await ensurePrisma();
    if (!db) {
      res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
      return;
    }

    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: parseInt(String(user.sub ?? user.id ?? 0), 10) },
    });

    if (!usuarioPrestador) {
      res.status(404).json({ message: 'Usuário prestador não encontrado' });
      return;
    }

    const prestador = await db.prestador.findUnique({
      where: { id: usuarioPrestador.prestador_id },
    });

    if (!prestador) {
      res.status(404).json({ message: 'Prestador não encontrado' });
      return;
    }

    const ocorrencias = await db.ocorrencia.findMany({
      where: {
        prestador: prestador.nome,
      },
      orderBy: {
        data_acionamento: 'desc',
      },
    });

    const resumo = {
      totalOcorrencias: ocorrencias.length,
      emAberto: 0,
      finalizadas: 0,
      totalAReceber: 0,
      totalPrevisto: 0,
      totalKm: 0,
      totalHoras: 0,
      totalDespesas: 0,
    totalReceber30NaoPago: 0,
    totalPago30: 0,
    ocorrenciasAtendidas30: 0,
    recuperadas30: 0,
    indiceRecuperacao30: 0,
      produtividade: {
        ultimos30Dias: 0,
        porMes: [] as Array<{ mes: string; total: number }>,
      },
    };

    const agora = new Date();
    const limite30Dias = new Date();
    limite30Dias.setDate(agora.getDate() - 30);

    const produtividadePorMes = new Map<string, number>();

    const ocorrenciasDetalhadas = ocorrencias.map((oc) => {
      const calculo = calcularFinanceiroOcorrencia(oc, prestador);

      if (calculo.finalizada) {
        resumo.finalizadas += 1;
      } else {
        resumo.emAberto += 1;
      }

      if (oc.criado_em >= limite30Dias) {
        resumo.produtividade.ultimos30Dias += 1;
      }

      const referenciaData = oc.data_acionamento ?? oc.criado_em;
      const referenciaMes = referenciaData.toISOString().slice(0, 7);
      produtividadePorMes.set(referenciaMes, (produtividadePorMes.get(referenciaMes) ?? 0) + 1);

      resumo.totalKm += calculo.kmTotal;
      resumo.totalHoras += calculo.horasTotais;
      resumo.totalDespesas += calculo.despesas;
      resumo.totalPrevisto += calculo.totalReceber;

      if (STATUS_PAGAVEIS_SET.has(calculo.statusNormalizado)) {
        resumo.totalAReceber += calculo.totalReceber;
      }

      if (referenciaData >= limite30Dias) {
        if (calculo.pago) {
          resumo.totalPago30 += calculo.totalReceber;
        } else {
          resumo.totalReceber30NaoPago += calculo.totalReceber;
        }

        if (!calculo.cancelada) {
          resumo.ocorrenciasAtendidas30 += 1;
          const resultadoLower = (calculo.resultadoFormatado || '').toLowerCase();
          if (resultadoLower.includes('recuperado')) {
            resumo.recuperadas30 += 1;
          }
        }
      }

      const dataAcionamentoFormatada = oc.data_acionamento
        ? oc.data_acionamento.toISOString().slice(0, 10)
        : null;

      return {
        id: oc.id,
        cliente: oc.cliente,
        tipo: oc.tipo,
        status: oc.status,
        placa: oc.placa1,
        dataAcionamento: dataAcionamentoFormatada,
        inicio: oc.inicio?.toISOString() ?? null,
        chegada: oc.chegada?.toISOString() ?? null,
        termino: oc.termino?.toISOString() ?? null,
        kmTotal: calculo.kmTotal,
        horasTotais: calculo.horasTotais,
        franquiaKm: calculo.franquiaKm,
        franquiaHoras: calculo.franquiaHoras,
        kmExtras: calculo.kmExtras,
        horasExtras: calculo.horasExtras,
        valorAcionamento: calculo.valorAcionamento,
        valorHoraExtra: calculo.valorHoraExtra,
        valorKmExtra: calculo.valorKmExtra,
        despesas: calculo.despesas,
        total: calculo.totalReceber,
        resultadoFormatado: calculo.resultadoFormatado,
        macro: calculo.macro,
        cancelada: calculo.cancelada,
        dataVencimento: calculo.dataVencimento,
        pago: calculo.pago,
        criado_em: oc.criado_em?.toISOString() ?? null,
      };
    });

    if (resumo.ocorrenciasAtendidas30 > 0) {
      resumo.indiceRecuperacao30 =
        (resumo.recuperadas30 / resumo.ocorrenciasAtendidas30) * 100;
    }

    resumo.produtividade.porMes = Array.from(produtividadePorMes.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([mes, total]) => ({ mes, total }));

    res.json({
      prestador: {
        id: prestador.id,
        nome: prestador.nome,
        email: usuarioPrestador.email,
        telefone: prestador.telefone,
        cidade: prestador.cidade,
        estado: prestador.estado,
      },
      resumo,
      ocorrencias: ocorrenciasDetalhadas,
    });
  } catch (error) {
    console.error('[PrestadorDashboardController] Erro ao montar dashboard do prestador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


