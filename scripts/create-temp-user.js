#!/usr/bin/env node
/**
 * Script para criar usuário temporário para teste
 * Execute: node scripts/create-temp-user.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

const createTempUser = async () => {
  try {
    console.log('🔧 Criando usuário temporário...');
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@costa.com.br' }
    });

    if (existingUser) {
      console.log('⚠️ Usuário já existe, removendo...');
      await prisma.user.delete({
        where: { email: 'admin@costa.com.br' }
      });
      console.log('✅ Usuário removido');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Permissões completas do usuário
    const permissions = [
      // Usuários
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      
      // Clientes
      'create:client',
      'read:client',
      'update:client',
      'delete:client',
      
      // Ocorrências
      'create:ocorrencia',
      'read:ocorrencia',
      'update:ocorrencia',
      'delete:ocorrencia',
      
      // Prestadores
      'create:prestador',
      'read:prestador',
      'update:prestador',
      'delete:prestador',
      
      // Contratos
      'create:contrato',
      'read:contrato',
      'update:contrato',
      'delete:contrato',
      
      // Relatórios
      'create:relatorio',
      'read:relatorio',
      'update:relatorio',
      'delete:relatorio',
      
      // Dashboard
      'read:dashboard',
      
      // Fotos
      'create:foto',
      'read:foto',
      'update:foto',
      'delete:foto',
      'upload:foto',
      
      // Veículos
      'create:veiculo',
      'read:veiculo',
      'update:veiculo',
      'delete:veiculo',
      
      // Rastreamento
      'create:rastreamento',
      'read:rastreamento',
      'update:rastreamento',
      'delete:rastreamento',
      
      // Pagamentos
      'create:pagamento',
      'read:pagamento',
      'update:pagamento',
      'delete:pagamento',
      
      // Checklist
      'create:checklist',
      'read:checklist',
      'update:checklist',
      'delete:checklist',
      
      // Apoios Adicionais
      'create:apoio',
      'read:apoio',
      'update:apoio',
      'delete:apoio'
    ];

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: 'Admin Costa - Usuário Teste',
        email: 'admin@costa.com.br',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: JSON.stringify(permissions),
        active: true,
      },
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('📋 Detalhes do usuário:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Ativo: ${user.active}`);
    console.log('');
    console.log('🔑 Credenciais de Login:');
    console.log(`   Email: admin@costa.com.br`);
    console.log(`   Senha: 123456`);
    console.log('');
    console.log('⚠️ IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Executar o script
createTempUser();












