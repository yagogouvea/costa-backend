#!/usr/bin/env node
/**
 * Script para testar CRUD de usuários simulando requisições do frontend
 * Execute: node test-frontend-crud.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.costaecamargo.seg.br';

async function testarFrontendCRUD() {
  console.log('🧪 Testando CRUD simulando frontend...');
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
        'Origin': 'http://localhost:5173' // Simular origem do frontend
      }
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    // 2. Testar criação com dados exatamente como o frontend enviaria
    console.log('\n2️⃣ Testando criação de usuário (formato frontend)...');
    const novoUsuario = {
      name: 'Usuário Frontend Test',
      email: 'frontend-test@costa.com.br',
      password: '123456',
      role: 'usuario',
      permissions: ['read:ocorrencia', 'read:dashboard'],
      active: true
    };
    
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/users`, novoUsuario, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Criação funcionando!');
      console.log('ID:', createResponse.data.id);
      console.log('Nome:', createResponse.data.name);
      
      const novoUsuarioId = createResponse.data.id;
      
      // 3. Testar edição
      console.log('\n3️⃣ Testando edição de usuário...');
      const dadosEdicao = {
        name: 'Usuário Frontend Test - Editado',
        email: 'frontend-test-editado@costa.com.br',
        role: 'usuario',
        permissions: ['read:ocorrencia', 'read:dashboard', 'create:ocorrencia'],
        active: true
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/api/users/${novoUsuarioId}`, dadosEdicao, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Edição funcionando!');
      console.log('Nome editado:', updateResponse.data.name);
      
      // 4. Testar exclusão
      console.log('\n4️⃣ Testando exclusão de usuário...');
      const deleteResponse = await axios.delete(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Exclusão funcionando!');
      console.log('Status:', deleteResponse.status);
      
    } catch (crudError) {
      console.log('❌ Erro no CRUD:');
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
testarFrontendCRUD();


