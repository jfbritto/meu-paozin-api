-- Script de inicialização de dados para o MeuPaoZin
-- Este script deve ser executado após a criação das tabelas

-- Inserir status padrão
INSERT INTO status_pedido (nome, descricao, cor, ativo) VALUES
('Pendente', 'Pedido recebido e aguardando preparo', '#FFA500', true),
('Em Preparo', 'Pedido sendo preparado', '#FFD700', true),
('Pronto', 'Pedido pronto para entrega', '#32CD32', true),
('Entregue', 'Pedido entregue ao cliente', '#008000', true),
('Cancelado', 'Pedido cancelado', '#FF0000', true)
ON CONFLICT (nome) DO NOTHING;

-- Inserir tipos de pão padrão
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

-- Inserir alguns clientes de exemplo
INSERT INTO clientes (nome, email, telefone, endereco) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-9999', 'Rua das Flores, 123 - Centro'),
('Maria Santos', 'maria.santos@email.com', '(11) 88888-8888', 'Av. Paulista, 456 - Bela Vista'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 77777-7777', 'Rua Augusta, 789 - Consolação'),
('Ana Costa', 'ana.costa@email.com', '(11) 66666-6666', 'Rua Oscar Freire, 321 - Jardins'),
('Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 55555-5555', 'Rua 13 de Maio, 654 - Bixiga')
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns pedidos de exemplo
INSERT INTO pedidos (cliente_id, tipo_pao_id, quantidade, preco_total, status_id, observacoes) VALUES
(1, 1, 5, 17.50, 1, 'Sem sal'),
(2, 2, 3, 13.50, 2, 'Bem assada'),
(3, 3, 10, 20.00, 3, 'Para café da manhã'),
(4, 4, 2, 6.00, 4, 'Integral fresco'),
(5, 5, 4, 20.00, 1, 'Para reunião')
ON CONFLICT DO NOTHING;

-- Comentários nas tabelas para documentação
COMMENT ON TABLE clientes IS 'Tabela de clientes do sistema';
COMMENT ON TABLE tipos_pao IS 'Tabela de tipos de pão disponíveis';
COMMENT ON TABLE status_pedido IS 'Tabela de status possíveis para pedidos';
COMMENT ON TABLE pedidos IS 'Tabela de pedidos com relacionamentos';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_pao_id ON pedidos(tipo_pao_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status_id ON pedidos(status_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_pedido ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_tipos_pao_ativo ON tipos_pao(ativo);
CREATE INDEX IF NOT EXISTS idx_status_pedido_ativo ON status_pedido(ativo); 