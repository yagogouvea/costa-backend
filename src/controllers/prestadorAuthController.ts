import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ensurePrisma } from '../lib/prisma';
import { JWT_EXPIRATION } from '../config/jwt.config';

export const prestadorLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      console.error('[PrestadorAuthController] JWT_SECRET não está definido');
      res.status(500).json({ message: 'Configuração de autenticação ausente' });
      return;
    }

    const db = await ensurePrisma();
    if (!db) {
      res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
      return;
    }

    const usuarioPrestador = await db.usuarioPrestador.findFirst({
      where: { email: email.trim(), ativo: true },
      include: {
        prestador: true,
      },
    });

    if (!usuarioPrestador || !usuarioPrestador.prestador) {
      res.status(401).json({ message: 'Usuário ou senha inválidos.' });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, usuarioPrestador.senha_hash);
    if (!senhaValida) {
      res.status(401).json({ message: 'Usuário ou senha inválidos.' });
      return;
    }

    const token = jwt.sign(
      {
        sub: String(usuarioPrestador.id),
        id: usuarioPrestador.prestador_id,
        tipo: 'prestador',
        prestadorId: usuarioPrestador.prestador_id,
        email: usuarioPrestador.email,
        nome: usuarioPrestador.prestador.nome,
      },
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRATION }
    );

    res.json({
      token,
      usuario: {
        id: usuarioPrestador.id,
        email: usuarioPrestador.email,
        primeiro_acesso: usuarioPrestador.primeiro_acesso,
      },
      prestador: {
        id: usuarioPrestador.prestador.id,
        nome: usuarioPrestador.prestador.nome,
        email: usuarioPrestador.email,
        telefone: usuarioPrestador.prestador.telefone,
        cidade: usuarioPrestador.prestador.cidade,
        estado: usuarioPrestador.prestador.estado,
      },
    });
  } catch (error) {
    console.error('[PrestadorAuthController] Erro no login do prestador:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


