#!/usr/bin/env node
/**
 * Script para debugar exatamente o que o frontend faz ao criar usuário
 * Execute: node debug-frontend-user-creation.js
 */

const axios = require('axios');

const API_BASE_URL = 'https://api.costaecamargo.seg.br';

async function debugFrontendUserCreation() {
  console.log('🔍 Debugando criação de usuário como o frontend faz...');
  console.log('URL Base:', API_BASE_URL);
  
  let token = '';
  
  try {
    // 1. Simular login do frontend
    console.log('\n1️⃣ Simulando login do frontend...');
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
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    // 2. Simular dados que o UserForm enviaria
    console.log('\n2️⃣ Simulando dados do UserForm...');
    const formData = {
      name: 'Usuário Frontend Debug',
      email: 'frontend-debug@costa.com.br',
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
    
    console.log('📋 FormData que seria enviado:');
    console.log('   Nome:', formData.name);
    console.log('   Email:', formData.email);
    console.log('   Role:', formData.role);
    console.log('   Permissões:', formData.permissions);
    console.log('   Ativo:', formData.active);
    
    // 3. Simular exatamente o que o userService.createUser faz
    console.log('\n3️⃣ Simulando userService.createUser...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, formData, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      
      console.log('✅ Usuário criado com sucesso!');
      console.log('   Status:', response.status);
      console.log('   ID:', response.data.id);
      console.log('   Nome:', response.data.name);
      console.log('   Email:', response.data.email);
      console.log('   Role:', response.data.role);
      console.log('   Permissões:', response.data.permissions);
      console.log('   Ativo:', response.data.active);
      
      const novoUsuarioId = response.data.id;
      
      // 4. Verificar se as permissões foram salvas corretamente
      console.log('\n4️⃣ Verificando permissões salvas...');
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      
      const user = userResponse.data;
      const savedPermissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions);
      
      console.log('✅ Permissões salvas no banco:');
      console.log('   Total:', savedPermissions.length);
      console.log('   Lista:', savedPermissions);
      
      // 5. Verificar se as permissões estão corretas
      const expectedPermissions = [
        'access:dashboard',
        'access:ocorrencias',
        'access:usuarios',
        'create:usuarios',
        'update:usuarios',
        'delete:usuarios'
      ];
      
      console.log('\n5️⃣ Verificando se as permissões estão corretas...');
      let allCorrect = true;
      expectedPermissions.forEach(perm => {
        if (savedPermissions.includes(perm)) {
          console.log(`   ✅ ${perm}`);
        } else {
          console.log(`   ❌ ${perm} - FALTANDO!`);
          allCorrect = false;
        }
      });
      
      if (allCorrect) {
        console.log('\n🎉 Todas as permissões estão corretas!');
      } else {
        console.log('\n❌ Algumas permissões estão incorretas!');
      }
      
      // 6. Testar login do novo usuário
      console.log('\n6️⃣ Testando login do novo usuário...');
      try {
        const novoUsuarioLogin = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: 'frontend-debug@costa.com.br',
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
        
        // Verificar permissões no token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(novoUsuarioToken);
        console.log('✅ Permissões no token:', decoded.permissions);
        
      } catch (error) {
        console.log('❌ Login do novo usuário: ERRO');
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);
      }
      
      // 7. Limpar - excluir usuário de teste
      console.log('\n7️⃣ Limpando - excluindo usuário de teste...');
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
      console.log('❌ Erro na criação do usuário:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
        console.log('   Headers:', error.response.headers);
      } else {
        console.log('   Erro:', error.message);
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

// Executar debug
debugFrontendUserCreation();


