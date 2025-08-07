const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pedidos_db',
});

async function seedData() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados');

    // Inserir status padrão
    console.log('📊 Inserindo status padrão...');
    await client.query(`
      INSERT INTO status_pedido (nome, descricao, cor, ativo) VALUES
      ('Pendente', 'Pedido recebido e aguardando preparo', '#FFA500', true),
      ('Em Preparo', 'Pedido sendo preparado', '#FFD700', true),
      ('Pronto', 'Pedido pronto para entrega', '#32CD32', true),
      ('Entregue', 'Pedido entregue ao cliente', '#008000', true),
      ('Cancelado', 'Pedido cancelado', '#FF0000', true)
      ON CONFLICT (nome) DO NOTHING;
    `);

    // Inserir tipos de pão padrão
    console.log('🥖 Inserindo tipos de pão padrão...');
    await client.query(`
      INSERT INTO tipos_pao (nome, descricao, preco_base, ativo) VALUES
      ('Pão de Queijo', 'Pão de queijo tradicional mineiro, feito com polvilho azedo', 3.50, true),
      ('Focaccia', 'Focaccia italiana com azeite e ervas', 4.50, true),
      ('Pão Francês', 'Pão francês tradicional', 2.00, true),
      ('Pão Integral', 'Pão integral com grãos', 3.00, true),
      ('Croissant', 'Croissant francês', 5.00, true),
      ('Baguette', 'Baguette francesa', 4.00, true),
      ('Pão de Batata', 'Pão de batata caseiro', 3.80, true),
      ('Pão de Milho', 'Pão de milho tradicional', 2.50, true)
      ON CONFLICT (nome) DO NOTHING;
    `);

    // Inserir clientes de exemplo
    console.log('👥 Inserindo clientes de exemplo...');
    await client.query(`
      INSERT INTO clientes (nome, email, telefone, endereco) VALUES
      ('João Silva', 'joao.silva@email.com', '(11) 99999-9999', 'Rua das Flores, 123 - Centro'),
      ('Maria Santos', 'maria.santos@email.com', '(11) 88888-8888', 'Av. Paulista, 456 - Bela Vista'),
      ('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 77777-7777', 'Rua Augusta, 789 - Consolação'),
      ('Ana Costa', 'ana.costa@email.com', '(11) 66666-6666', 'Rua Oscar Freire, 321 - Jardins'),
      ('Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 55555-5555', 'Rua 13 de Maio, 654 - Bixiga')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Inserir pedidos de exemplo
    console.log('📋 Inserindo pedidos de exemplo...');
    await client.query(`
      INSERT INTO pedidos (cliente_id, tipo_pao_id, quantidade, preco_total, status_id, observacoes) VALUES
      (1, 1, 5, 17.50, 1, 'Sem sal'),
      (2, 2, 3, 13.50, 2, 'Bem assada'),
      (3, 3, 10, 20.00, 3, 'Para café da manhã'),
      (4, 4, 2, 6.00, 4, 'Integral fresco'),
      (5, 5, 4, 20.00, 1, 'Para reunião')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Dados de exemplo inseridos com sucesso!');
    console.log('🎉 Sistema MeuPaoZin está pronto para uso!');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await client.end();
  }
}

seedData(); 