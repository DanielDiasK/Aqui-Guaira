import clientPromise from './_lib/mongodb';

export default async function handler(req: any, res: any) {
    // CORS references
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
        const db = client.db("aqui-guaira");

        const { categoria, bairro, busca, destaque, limit, slug } = req.query;

        const query: any = { status: 'aprovado' }; // Apenas aprovados por padrão

        if (slug) {
            query.slug = slug;
            const empresa = await db.collection("empresas").findOne(query);
            if (!empresa) {
                return res.status(404).json({ message: "Empresa não encontrada" });
            }
            return res.status(200).json(empresa);
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

        const empresas = await db
            .collection("empresas")
            .find(query)
            .limit(limite)
            .toArray();

        // Normalizar _id para id (string)
        const empresasFormatadas = empresas.map(emp => ({
            ...emp,
            id: emp._id.toString(),
            _id: undefined
        }));

        res.status(200).json(empresasFormatadas);
    } catch (error: any) {
        console.error('Erro ao buscar empresas:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
