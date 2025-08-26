const axios = require('axios');

// CNPJ de teste (Google Brasil)
const cnpjTeste = '06.990.590/0001-23';

async function testarAPICosta() {
  console.log('🧪 Testando API de CNPJ Costa & Camargo...');
  console.log('CNPJ de teste:', cnpjTeste);
  
  try {
    const response = await axios.get(`http://localhost:8080/api/cnpj/${cnpjTeste}`, {
      timeout: 30000,
      headers: {
        'Authorization': 'Bearer SEU_TOKEN_AQUI', // Substitua por um token válido
        'User-Agent': 'Costa-Test/1.0'
      }
    });
    
    console.log('✅ Sucesso!');
    console.log('📋 Dados recebidos:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Verificar se os campos obrigatórios estão presentes
    const data = response.data;
    
    if (data.company?.name) {
      console.log('✅ Nome da empresa:', data.company.name);
    } else {
      console.log('❌ Nome da empresa não encontrado');
    }
    
    if (data.address?.street) {
      console.log('✅ Endereço:', data.address.street);
    } else {
      console.log('❌ Endereço não encontrado');
    }
    
    if (data.address?.city) {
      console.log('✅ Cidade:', data.address.city);
    } else {
      console.log('❌ Cidade não encontrada');
    }
    
    if (data.address?.state) {
      console.log('✅ Estado:', data.address.state);
    } else {
      console.log('❌ Estado não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:');
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


