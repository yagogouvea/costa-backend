#!/usr/bin/env node
/**
 * Script para testar CRUD de usuários
 * Execute: node test-user-crud.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.costaecamargo.seg.br';

async function testarCRUDUsuarios() {
  console.log('🧪 Testando CRUD de usuários...');
  console.log('URL Base:', API_BASE_URL);
  
  let token = '';
  
  try {
    // 1. Fazer login para obter token
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@costa.com.br',
      password: '123456'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    // 2. Testar listagem de usuários
    console.log('\n2️⃣ Testando listagem de usuários...');
    const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Listagem funcionando!');
    console.log('Usuários encontrados:', usersResponse.data.length);
    
    // 3. Testar criação de usuário
    console.log('\n3️⃣ Testando criação de usuário...');
    const novoUsuario = {
      name: 'Usuário Teste CRUD',
      email: 'teste-crud@costa.com.br',
      password: '123456',
      role: 'usuario',
      permissions: JSON.stringify(['read:ocorrencia', 'read:dashboard']),
      active: true
    };
    
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/users`, novoUsuario, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Criação de usuário funcionando!');
      console.log('ID do novo usuário:', createResponse.data.id);
      
      const novoUsuarioId = createResponse.data.id;
      
      // 4. Testar edição de usuário
      console.log('\n4️⃣ Testando edição de usuário...');
      const dadosEdicao = {
        name: 'Usuário Teste CRUD - Editado',
        email: 'teste-crud-editado@costa.com.br',
        role: 'usuario',
        permissions: JSON.stringify(['read:ocorrencia', 'read:dashboard', 'create:ocorrencia']),
        active: true
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/api/users/${novoUsuarioId}`, dadosEdicao, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Edição de usuário funcionando!');
      console.log('Usuário editado:', updateResponse.data.name);
      
      // 5. Testar exclusão de usuário
      console.log('\n5️⃣ Testando exclusão de usuário...');
      const deleteResponse = await axios.delete(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Exclusão de usuário funcionando!');
      console.log('Status:', deleteResponse.status);
      
    } catch (crudError) {
      console.log('❌ Erro no CRUD de usuários:');
      if (crudError.response) {
        console.log('Status:', crudError.response.status);
        console.log('Dados:', crudError.response.data);
        console.log('Headers:', crudError.response.headers);
      } else {
        console.log('Erro:', crudError.message);
      }
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
testarCRUDUsuarios();
