#!/usr/bin/env node
/**
 * Script para testar a API do Costa & Camargo
 * Execute: node test-api-costa.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.costaecamargo.seg.br';

async function testarAPICosta() {
  console.log('🧪 Testando API Costa & Camargo...');
  console.log('URL Base:', API_BASE_URL);
  
  try {
    // 1. Testar endpoint de status
    console.log('\n1️⃣ Testando endpoint de status...');
    const statusResponse = await axios.get(`${API_BASE_URL}/api/status`, {
      timeout: 10000
    });
    console.log('✅ Status da API:', statusResponse.data);
    
    // 2. Testar endpoint de health
    console.log('\n2️⃣ Testando endpoint de health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health da API:', healthResponse.data);
    
    // 3. Testar login com usuário admin
    console.log('\n3️⃣ Testando login com usuário admin...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'admin@costa.com.br',
        password: '123456'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Login realizado com sucesso!');
      console.log('Token:', loginResponse.data.token ? 'Presente' : 'Ausente');
      console.log('User:', loginResponse.data.user ? 'Presente' : 'Ausente');
      
      // 4. Testar endpoint protegido com token
      if (loginResponse.data.token) {
        console.log('\n4️⃣ Testando endpoint protegido...');
        const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Endpoint protegido funcionando!');
        console.log('Usuários encontrados:', usersResponse.data.length || 0);
      }
      
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.response?.data || loginError.message);
      console.log('💡 Execute: node scripts/create-temp-user.js para criar o usuário admin');
    }
    
  } catch (error) {
    console.error('❌ Erro geral na API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar teste
testarAPICosta();

