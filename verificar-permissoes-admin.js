#!/usr/bin/env node
/**
 * Script para verificar permissões do usuário admin Costa
 * Execute: node verificar-permissoes-admin.js
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

const verificarPermissoesAdmin = async () => {
  try {
    console.log('🔍 Verificando permissões do usuário admin Costa...');
    
    // Buscar usuário admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@costa.com.br' }
    });

    if (!adminUser) {
      console.log('❌ Usuário admin@costa.com.br não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Nome: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Ativo: ${adminUser.active}`);
    console.log('');

    // Verificar permissões
    let permissions = [];
    try {
      permissions = JSON.parse(adminUser.permissions);
    } catch (error) {
      console.log('❌ Erro ao parsear permissões:', error.message);
      return;
    }

    console.log('📋 Permissões atuais:');
    console.log(`   Total de permissões: ${permissions.length}`);
    console.log('');

    // Verificar permissões específicas de usuário
    const userPermissions = permissions.filter(p => p.includes('user'));
    console.log('👤 Permissões de Usuário:');
    if (userPermissions.length > 0) {
      userPermissions.forEach(perm => console.log(`   ✅ ${perm}`));
    } else {
      console.log('   ❌ Nenhuma permissão de usuário encontrada!');
    }
    console.log('');

    // Verificar todas as permissões
    console.log('📝 Todas as permissões:');
    permissions.forEach(perm => console.log(`   ${perm}`));
    console.log('');

    // Verificar se tem permissões básicas de admin
    const requiredPermissions = [
      'create:user',
      'read:user', 
      'update:user',
      'delete:user',
      'create:client',
      'read:client',
      'update:client',
      'delete:client',
      'create:ocorrencia',
      'read:ocorrencia',
      'update:ocorrencia',
      'delete:ocorrencia'
    ];

    console.log('🔍 Verificando permissões obrigatórias:');
    const missingPermissions = [];
    
    requiredPermissions.forEach(required => {
      if (permissions.includes(required)) {
        console.log(`   ✅ ${required}`);
      } else {
        console.log(`   ❌ ${required} - FALTANDO`);
        missingPermissions.push(required);
      }
    });

    if (missingPermissions.length > 0) {
      console.log('');
      console.log('⚠️ Permissões faltando:', missingPermissions);
      console.log('💡 Execute: node corrigir-permissoes-admin.js para corrigir');
    } else {
      console.log('');
      console.log('✅ Todas as permissões obrigatórias estão presentes!');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Executar verificação
verificarPermissoesAdmin();


