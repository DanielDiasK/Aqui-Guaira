import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("empresas");

        const file = await db.collection("arquivos").findOne({
            _id: new ObjectId(id as string)
        });

        if (!file) {
            return res.status(404).json({ message: 'Arquivo não encontrado' });
        }

        // Converter base64 de volta para buffer
        const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
        const buffer = Buffer.from(base64Data, 'base64');

        // Configurar headers de cache e tipo de conteúdo
        res.setHeader('Content-Type', file.type || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        return res.status(200).send(buffer);

    } catch (error: any) {
        console.error('Erro ao buscar arquivo:', error);
        return res.status(500).json({ message: error.message });
    }
}
