#!/usr/bin/env node
/**
 * Script para testar se as permissões do frontend estão corretas
 * Execute: node test-frontend-permissions.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.costaecamargo.seg.br';

async function testarPermissoesFrontend() {
  console.log('🧪 Testando permissões do frontend...');
  console.log('URL Base:', API_BASE_URL);
  
  let token = '';
  
  try {
    // 1. Fazer login
    console.log('\n1️⃣ Fazendo login...');
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
    
    // 2. Verificar permissões do usuário
    console.log('\n2️⃣ Verificando permissões do usuário...');
    const userResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    
    const user = userResponse.data;
    const permissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions);
    
    console.log('✅ Usuário:', user.name);
    console.log('✅ Role:', user.role);
    console.log('✅ Total de permissões:', permissions.length);
    
    // 3. Verificar permissões específicas necessárias para o frontend
    const requiredPermissions = [
      'access:usuarios',
      'create:usuarios', 
      'update:usuarios',
      'delete:usuarios'
    ];
    
    console.log('\n3️⃣ Verificando permissões necessárias para o frontend:');
    let allPermissionsPresent = true;
    
    requiredPermissions.forEach(perm => {
      if (permissions.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
        allPermissionsPresent = false;
      }
    });
    
    if (allPermissionsPresent) {
      console.log('\n🎉 Todas as permissões necessárias estão presentes!');
      console.log('✅ O frontend deve funcionar corretamente agora.');
    } else {
      console.log('\n❌ Algumas permissões estão faltando.');
      console.log('❌ O frontend não funcionará corretamente.');
    }
    
    // 4. Testar endpoints específicos
    console.log('\n4️⃣ Testando endpoints específicos...');
    
    // Testar listagem
    try {
      const listResponse = await axios.get(`${API_BASE_URL}/api/users`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Listagem de usuários: OK');
    } catch (error) {
      console.log('❌ Listagem de usuários: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }
    
    // Testar criação
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/users`, {
        name: 'Teste Frontend Permissions',
        email: 'teste-permissions@costa.com.br',
        password: '123456',
        role: 'usuario',
        permissions: ['read:ocorrencia', 'read:dashboard'],
        active: true
      }, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Criação de usuário: OK');
      
      // Excluir usuário de teste
      const userId = createResponse.data.id;
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Exclusão de usuário: OK');
      
    } catch (error) {
      console.log('❌ Criação/Exclusão de usuário: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
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
testarPermissoesFrontend();


