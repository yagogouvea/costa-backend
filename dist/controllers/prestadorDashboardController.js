"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrestadorDashboardResumo = void 0;
const prisma_1 = require("../lib/prisma");
const FINAL_STATUSES = [
    'concluida',
    'finalizada',
    'encerrada',
    'recuperada',
    'recuperado',
    'nao_recuperado',
    'não recuperado',
    'cancelada',
];
const STATUS_PAGAVEIS = ['concluida', 'finalizada', 'recuperada', 'recuperado'];
const parseFranquiaHoras = (valor) => {
    if (!valor)
        return 0;
    const match = valor.replace(',', '.').match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
};
const parseJsonArray = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (_a) {
            return [];
        }
    }
    return [];
};
const calcularDiferencaHoras = (inicio, termino) => {
    if (!inicio || !termino)
        return 0;
    const diffMs = termino.getTime() - inicio.getTime();
    return diffMs > 0 ? diffMs / 3600000 : 0;
};
const normalizarStatus = (status) => (status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const getPrestadorDashboardResumo = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        const user = req.user;
        if (!user || user.tipo !== 'prestador') {
            res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
            return;
        }
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
            return;
        }
        const usuarioPrestador = await db.usuarioPrestador.findUnique({
            where: { id: parseInt(String((_b = (_a = user.sub) !== null && _a !== void 0 ? _a : user.id) !== null && _b !== void 0 ? _b : 0), 10) },
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
        const franquiaHoras = parseFranquiaHoras(prestador.franquia_horas);
        const franquiaKm = (_c = prestador.franquia_km) !== null && _c !== void 0 ? _c : 0;
        const valorAcionamentoBase = (_d = prestador.valor_acionamento) !== null && _d !== void 0 ? _d : 0;
        const valorHoraAdc = (_e = prestador.valor_hora_adc) !== null && _e !== void 0 ? _e : 0;
        const valorKmAdc = (_f = prestador.valor_km_adc) !== null && _f !== void 0 ? _f : 0;
        const resumo = {
            totalOcorrencias: ocorrencias.length,
            emAberto: 0,
            finalizadas: 0,
            totalAReceber: 0,
            totalPrevisto: 0,
            totalKm: 0,
            totalHoras: 0,
            totalDespesas: 0,
            produtividade: {
                ultimos30Dias: 0,
                porMes: [],
            },
        };
        const agora = new Date();
        const limite30Dias = new Date();
        limite30Dias.setDate(agora.getDate() - 30);
        const produtividadePorMes = new Map();
        const ocorrenciasDetalhadas = ocorrencias.map((oc) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const statusNormalizado = normalizarStatus(oc.status);
            const cancelada = statusNormalizado.includes('cancelad');
            const finalizada = FINAL_STATUSES.includes(statusNormalizado);
            if (finalizada) {
                resumo.finalizadas += 1;
            }
            else {
                resumo.emAberto += 1;
            }
            if (oc.criado_em >= limite30Dias) {
                resumo.produtividade.ultimos30Dias += 1;
            }
            const mesReferencia = ((_a = oc.data_acionamento) !== null && _a !== void 0 ? _a : oc.criado_em).toISOString().slice(0, 7);
            produtividadePorMes.set(mesReferencia, ((_b = produtividadePorMes.get(mesReferencia)) !== null && _b !== void 0 ? _b : 0) + 1);
            const kmTotal = (_c = oc.km) !== null && _c !== void 0 ? _c : (oc.km_inicial != null && oc.km_final != null ? Math.max(0, oc.km_final - oc.km_inicial) : 0);
            const horasTotais = calcularDiferencaHoras(oc.inicio, oc.termino);
            const despesasDetalhadas = parseJsonArray(oc.despesas_detalhadas).reduce((acc, item) => { var _a; return acc + Number((_a = item === null || item === void 0 ? void 0 : item.valor) !== null && _a !== void 0 ? _a : 0); }, 0);
            const despesas = Number((_d = oc.despesas) !== null && _d !== void 0 ? _d : 0) + despesasDetalhadas;
            const horasExtras = Math.max(0, horasTotais - franquiaHoras);
            const kmExtras = Math.max(0, kmTotal - franquiaKm);
            const valorHoraExtra = cancelada ? 0 : horasExtras * valorHoraAdc;
            const valorKmExtra = cancelada ? 0 : kmExtras * valorKmAdc;
            const valorAcionamento = cancelada ? 0 : valorAcionamentoBase;
            const valorTotal = valorAcionamento + valorHoraExtra + valorKmExtra + (cancelada ? 0 : despesas);
            resumo.totalKm += kmTotal;
            resumo.totalHoras += horasTotais;
            resumo.totalDespesas += despesas;
            resumo.totalPrevisto += valorTotal;
            if (STATUS_PAGAVEIS.includes(statusNormalizado)) {
                resumo.totalAReceber += valorTotal;
            }
            return {
                id: oc.id,
                cliente: oc.cliente,
                tipo: oc.tipo,
                status: oc.status,
                placa: oc.placa1,
                dataAcionamento: (_f = (_e = oc.data_acionamento) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
                inicio: (_h = (_g = oc.inicio) === null || _g === void 0 ? void 0 : _g.toISOString()) !== null && _h !== void 0 ? _h : null,
                termino: (_k = (_j = oc.termino) === null || _j === void 0 ? void 0 : _j.toISOString()) !== null && _k !== void 0 ? _k : null,
                kmTotal,
                horasTotais,
                franquiaKm,
                franquiaHoras,
                kmExtras,
                horasExtras,
                valorAcionamento,
                valorHoraExtra,
                valorKmExtra,
                despesas: cancelada ? 0 : despesas,
                total: valorTotal,
                criado_em: (_m = (_l = oc.criado_em) === null || _l === void 0 ? void 0 : _l.toISOString()) !== null && _m !== void 0 ? _m : null,
            };
        });
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
    }
    catch (error) {
        console.error('[PrestadorDashboardController] Erro ao montar dashboard do prestador:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getPrestadorDashboardResumo = getPrestadorDashboardResumo;
