const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para criar um cliente
async function createCliente() {
  try {
    const clienteData = {
      nome: 'João Teste Kafka',
      email: 'joao.kafka@teste.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua do Teste, 123 - Kafka'
    };

    console.log('👤 Criando cliente...');
    const response = await axios.post(`${API_BASE_URL}/clientes`, clienteData);
    console.log('✅ Cliente criado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar um pedido
async function createPedido(clienteId, tipoPaoId) {
  try {
    const pedidoData = {
      clienteId,
      tipoPaoId,
      quantidade: 3,
      observacoes: 'Teste de integração Kafka'
    };

    console.log('📋 Criando pedido...');
    const response = await axios.post(`${API_BASE_URL}/pedidos`, pedidoData);
    console.log('✅ Pedido criado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error.response?.data || error.message);
    throw error;
  }
}

// Função para atualizar status do pedido
async function updatePedidoStatus(pedidoId, newStatusId) {
  try {
    console.log(`🔄 Atualizando status do pedido ${pedidoId} para ${newStatusId}...`);
    const response = await axios.patch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
      statusId: newStatusId
    });
    console.log('✅ Status atualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error.response?.data || error.message);
    throw error;
  }
}

// Função para atualizar tipo de pão
async function updateTipoPao(tipoPaoId) {
  try {
    console.log(`🥖 Atualizando tipo de pão ${tipoPaoId}...`);
    const response = await axios.patch(`${API_BASE_URL}/tipos-pao/${tipoPaoId}`, {
      precoBase: 4.50,
      descricao: 'Preço atualizado via Kafka'
    });
    console.log('✅ Tipo de pão atualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar tipo de pão:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal de teste
async function testKafkaEvents() {
  console.log('🚀 Iniciando testes de eventos Kafka...\n');

  try {
    // Aguardar um pouco para garantir que tudo está pronto
    await sleep(2000);

    // 1. Criar cliente
    const cliente = await createCliente();
    await sleep(1000);

    // 2. Criar pedido
    const pedido = await createPedido(cliente.id, 1); // tipo de pão 1
    await sleep(1000);

    // 3. Atualizar status do pedido
    await updatePedidoStatus(pedido.id, 2); // status "Em Preparo"
    await sleep(1000);

    // 4. Atualizar status novamente
    await updatePedidoStatus(pedido.id, 3); // status "Pronto"
    await sleep(1000);

    // 5. Atualizar tipo de pão
    await updateTipoPao(1);
    await sleep(1000);

    // 6. Cancelar pedido (remover)
    console.log(`❌ Removendo pedido ${pedido.id}...`);
    await axios.delete(`${API_BASE_URL}/pedidos/${pedido.id}`);
    console.log('✅ Pedido removido');

    console.log('\n🎉 Todos os testes de eventos Kafka foram executados com sucesso!');
    console.log('📊 Verifique o Kafka UI em: http://localhost:8080');
    console.log('📋 Verifique os logs da aplicação para ver os eventos sendo processados');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  testKafkaEvents();
}

module.exports = {
  testKafkaEvents,
  createCliente,
  createPedido,
  updatePedidoStatus,
  updateTipoPao
}; 