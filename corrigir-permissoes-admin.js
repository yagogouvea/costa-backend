#!/usr/bin/env node
/**
 * Script para corrigir permissões do usuário admin Costa
 * Execute: node corrigir-permissoes-admin.js
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

const corrigirPermissoesAdmin = async () => {
  try {
    console.log('🔧 Corrigindo permissões do usuário admin Costa...');
    
    // Permissões completas do usuário admin
    const permissions = [
      // Usuários (em português para compatibilidade com as rotas)
      'create:usuarios',
      'access:usuarios',
      'update:usuarios',
      'delete:usuarios',
      
      // Usuários (em inglês para compatibilidade)
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

    // Atualizar usuário com todas as permissões
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@costa.com.br' },
      data: {
        permissions: JSON.stringify(permissions),
        role: 'admin',
        active: true
      }
    });

    console.log('✅ Permissões atualizadas com sucesso!');
    console.log('📋 Detalhes do usuário:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Nome: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Ativo: ${updatedUser.active}`);
    console.log(`   Total de permissões: ${permissions.length}`);
    console.log('');

    console.log('👤 Permissões de Usuário:');
    const userPermissions = permissions.filter(p => p.includes('user'));
    userPermissions.forEach(perm => console.log(`   ✅ ${perm}`));
    console.log('');

    console.log('🔑 Credenciais de Login:');
    console.log(`   Email: admin@costa.com.br`);
    console.log(`   Senha: 123456`);
    console.log('');
    console.log('✅ Agora o usuário tem todas as permissões necessárias!');

  } catch (error) {
    console.error('❌ Erro ao corrigir permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Executar correção
corrigirPermissoesAdmin();
