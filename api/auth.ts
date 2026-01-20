import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const client = await clientPromise;
        const db = client.db("empresas");
        const { action } = req.query;
        const { email, senha, nome } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios" });
        }

        if (action === 'register') {
            if (!nome) {
                return res.status(400).json({ message: "Nome é obrigatório para registro" });
            }

            // Verificar se usuário já existe
            const existingUser = await db.collection("usuarios").findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Este email já está cadastrado" });
            }

            const newUser = {
                email,
                nome,
                senha, // Em um app real, use bcrypt aqui!
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await db.collection("usuarios").insertOne(newUser);

            const userResponse = {
                id: result.insertedId.toString(),
                email,
                nome,
                created_at: newUser.created_at
            };

            return res.status(201).json(userResponse);
        }

        if (action === 'login') {
            const user = await db.collection("usuarios").findOne({ email, senha });

            if (!user) {
                return res.status(401).json({ message: "Email ou senha incorretos" });
            }

            const userResponse = {
                id: user._id.toString(),
                email: user.email,
                nome: user.nome,
                created_at: user.created_at
            };

            return res.status(200).json(userResponse);
        }

        return res.status(400).json({ message: "Ação inválida" });

    } catch (error: any) {
        console.error('Erro na API de autenticação:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
