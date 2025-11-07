#!/usr/bin/env node
/**
 * Script para testar criação de usuário com permissões específicas
 * Execute: node test-new-user-permissions.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.costaecamargo.seg.br';

async function testarCriacaoUsuarioComPermissoes() {
  console.log('🧪 Testando criação de usuário com permissões específicas...');
  console.log('URL Base:', API_BASE_URL);
  
  let token = '';
  
  try {
    // 1. Fazer login como admin
    console.log('\n1️⃣ Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@costa.com.br',
      password: '123456'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // 2. Criar usuário com permissões específicas (como o frontend enviaria)
    console.log('\n2️⃣ Criando usuário com permissões específicas...');
    const novoUsuario = {
      name: 'Usuário Teste Permissões',
      email: 'teste-permissoes@costa.com.br',
      password: '123456',
      role: 'usuario',
      permissions: [
        'access:dashboard',
        'access:ocorrencias',
        'access:usuarios',
        'create:usuarios',
        'update:usuarios',
        'delete:usuarios'
      ],
      active: true
    };
    
    console.log('📋 Dados do usuário:');
    console.log('   Nome:', novoUsuario.name);
    console.log('   Email:', novoUsuario.email);
    console.log('   Role:', novoUsuario.role);
    console.log('   Permissões:', novoUsuario.permissions);
    
    const createResponse = await axios.post(`${API_BASE_URL}/api/users`, novoUsuario, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('   ID:', createResponse.data.id);
    console.log('   Nome:', createResponse.data.name);
    console.log('   Email:', createResponse.data.email);
    console.log('   Role:', createResponse.data.role);
    console.log('   Permissões:', createResponse.data.permissions);
    
    const novoUsuarioId = createResponse.data.id;
    
    // 3. Verificar se o usuário pode fazer login
    console.log('\n3️⃣ Testando login do novo usuário...');
    try {
      const novoUsuarioLogin = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'teste-permissoes@costa.com.br',
        password: '123456'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      
      console.log('✅ Login do novo usuário funcionando!');
      const novoUsuarioToken = novoUsuarioLogin.data.token;
      
      // 4. Verificar permissões do novo usuário
      console.log('\n4️⃣ Verificando permissões do novo usuário...');
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${novoUsuarioToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      
      const user = userResponse.data;
      const permissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions);
      
      console.log('✅ Usuário:', user.name);
      console.log('✅ Role:', user.role);
      console.log('✅ Total de permissões:', permissions.length);
      console.log('✅ Permissões:', permissions);
      
      // 5. Testar se o novo usuário pode acessar a página de usuários
      console.log('\n5️⃣ Testando acesso à página de usuários...');
      try {
        const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${novoUsuarioToken}`,
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173'
          }
        });
        
        console.log('✅ Acesso à página de usuários: OK');
        console.log('   Usuários encontrados:', usersResponse.data.length);
        
      } catch (error) {
        console.log('❌ Acesso à página de usuários: ERRO');
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);
      }
      
    } catch (error) {
      console.log('❌ Login do novo usuário: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }
    
    // 6. Limpar - excluir usuário de teste
    console.log('\n6️⃣ Limpando - excluindo usuário de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Usuário de teste excluído com sucesso!');
    } catch (error) {
      console.log('❌ Erro ao excluir usuário de teste:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar teste
testarCriacaoUsuarioComPermissoes();


