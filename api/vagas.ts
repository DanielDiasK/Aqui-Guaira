import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,DELETE');
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
        const db = client.db("empresas"); // Usando o mesmo banco "empresas"

        // --- POST: Criar Vaga ---
        if (req.method === 'POST') {
            const vaga = req.body;
            const novaVaga = {
                ...vaga,
                quantidade: vaga.quantidade || 1,
                status: vaga.status || 'aberta',
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await db.collection("vagas").insertOne(novaVaga);
            return res.status(201).json({
                ...novaVaga,
                id: result.insertedId.toString(),
                _id: result.insertedId
            });
        }

        // --- PATCH: Editar Vaga ---
        if (req.method === 'PATCH') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ message: "ID é obrigatório" });

            const updateData = req.body;
            delete updateData.id;
            delete updateData._id;

            const result = await db.collection("vagas").updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...updateData, updated_at: new Date() } }
            );

            if (result.matchedCount === 0) return res.status(404).json({ message: "Vaga não encontrada" });

            return res.status(200).json({ message: "Vaga atualizada com sucesso" });
        }

        // --- DELETE: Excluir Vaga ---
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ message: "ID é obrigatório" });

            const result = await db.collection("vagas").deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) return res.status(404).json({ message: "Vaga não encontrada" });

            return res.status(200).json({ message: "Vaga excluída com sucesso" });
        }

        // --- GET: Listar Vagas ---
        const { id, empresa_id } = req.query;

        if (id) {
            const vaga = await db.collection("vagas").findOne({ _id: new ObjectId(id as string) });
            if (!vaga) return res.status(404).json({ message: "Vaga não encontrada" });
            return res.status(200).json({ ...vaga, id: vaga._id.toString(), _id: undefined });
        }

        let query: any = {};
        if (empresa_id) {
            query.empresa_id = empresa_id;
        } else {
            query.status = 'aberta'; // Por padrão só vagas abertas na listagem pública
        }

        const vagas = await db.collection("vagas").find(query).sort({ created_at: -1 }).toArray();
        const vagasFormatadas = vagas.map(v => ({
            ...v,
            id: v._id.toString(),
            _id: undefined
        }));

        return res.status(200).json(vagasFormatadas);

    } catch (error: any) {
        console.error('❌ Erro no endpoint de vagas:', error);
        res.status(500).json({ message: error.message });
    }
}
