import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    // CORS references
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await clientPromise;
        const db = client.db("empresas");

        // --- MÉTODOS DE CRIAÇÃO (POST) ---
        if (req.method === 'POST') {
            const empresa = req.body;

            // Garantir campos básicos
            const novaEmpresa = {
                ...empresa,
                slug: empresa.slug || empresa.nome?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                visualizacoes: 0,
                status: empresa.status || 'pendente',
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await db.collection("empresas").insertOne(novaEmpresa);
            return res.status(201).json({
                ...novaEmpresa,
                id: result.insertedId.toString(),
                _id: result.insertedId
            });
        }

        // --- MÉTODOS DE ATUALIZAÇÃO ---
        if (req.method === 'PATCH') {
            const { id, action } = req.query;
            if (!id) return res.status(400).json({ message: "ID é obrigatório para atualização" });

            if (action === 'increment_views') {
                const result = await db.collection("empresas").updateOne(
                    { _id: new ObjectId(id) },
                    { $inc: { visualizacoes: 1 } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "Empresa não encontrada" });
                }

                return res.status(200).json({ message: "Visualização incrementada" });
            }

            const updateData = req.body;
            delete updateData.id;
            delete updateData._id;

            const result = await db.collection("empresas").updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...updateData, updated_at: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Empresa não encontrada" });
            }

            return res.status(200).json({ message: "Atualizado com sucesso" });
        }

        // --- MÉTODOS DE BUSCA (GET) ---
        const { categoria, bairro, busca, destaque, limit, slug, responsavel_telefone, id, admin } = req.query;

        // Busca por ID (Prioridade Máxima)
        if (id) {
            const empresa = await db.collection("empresas").findOne({ _id: new ObjectId(id as string) });
            if (!empresa) return res.status(404).json({ message: "Empresa não encontrada" });
            return res.status(200).json({ ...empresa, id: empresa._id.toString(), _id: undefined });
        }

        let query: any = {};

        // Se NÃO for admin, mostrar apenas aprovados
        if (admin !== 'true') {
            query.status = 'aprovado';
        }

        if (responsavel_telefone) {
            query = { responsavel_telefone };
        }

        if (slug) {
            query.slug = slug;
            const empresa = await db.collection("empresas").findOne(query);
            if (!empresa) return res.status(404).json({ message: "Empresa não encontrada" });
            return res.status(200).json({ ...empresa, id: empresa._id.toString(), _id: undefined });
        }

        if (categoria) {
            if (categoria === 'destaque') {
                // Se for filtro especial de destaque
                query.destaque = true;
            } else {
                // Busca na categoria principal e também verificaria subcategorias se necessário,
                // mas por enquanto vamos filtrar pelo ID/Nome da categoria
                // O frontend envia o nome ou ID. No seed usamos IDs tipo "alimentacao-bebidas"
                // Vamos usar regex para ser flexível ou match exato
                query.categoria_id = categoria;
            }
        }

        if (bairro) {
            query.bairro = bairro;
        }

        if (destaque === 'true') {
            query.destaque = true;
        }

        if (busca) {
            // Busca textual em nome e descricao
            query.$or = [
                { nome: { $regex: busca, $options: 'i' } },
                { descricao: { $regex: busca, $options: 'i' } },
                { tags: { $regex: busca, $options: 'i' } } // Caso tenhamos tags futuro
            ];
        }

        const limite = limit ? parseInt(limit as string) : 50;

        console.log('🔎 Query MongoDB:', JSON.stringify(query));
        console.log('📊 Limite:', limite);

        const empresas = await db
            .collection("empresas")
            .find(query)
            .limit(limite)
            .toArray();

        console.log(`✅ ${empresas.length} empresas encontradas`);

        // Normalizar _id para id (string)
        const empresasFormatadas = empresas.map(emp => ({
            ...emp,
            id: emp._id.toString(),
            _id: undefined
        }));

        res.status(200).json(empresasFormatadas);
    } catch (error: any) {
        console.error('❌ Erro ao buscar empresas:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
