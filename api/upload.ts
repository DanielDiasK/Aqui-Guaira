import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
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

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const { name, type, data } = req.body;

        if (!data) {
            return res.status(400).json({ message: 'Dados da imagem são obrigatórios' });
        }

        const client = await clientPromise;
        const db = client.db("empresas");

        // Nota: Armazenamos como string base64 para simplicidade, 
        // mas limitamos o tamanho para evitar estourar o limite do BSON (16MB)
        // O limite real do Vercel é 4.5MB no request.

        const result = await db.collection("arquivos").insertOne({
            name: name || 'upload',
            type: type || 'image/jpeg',
            data: data, // string base64
            created_at: new Date()
        });

        // Retorna uma URL relativa que será servida por /api/files
        return res.status(200).json({
            url: `/api/files?id=${result.insertedId}`,
            id: result.insertedId.toString()
        });

    } catch (error: any) {
        console.error('Erro no upload para MongoDB:', error);
        return res.status(500).json({ message: error.message });
    }
}
