import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

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

    try {
        const client = await clientPromise;
        const db = client.db("empresas");

        // --- MÉTODOS DE ATUALIZAÇÃO (PATCH) ---
        if (req.method === 'PATCH') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ message: "ID do usuário é obrigatório" });

            const updateData = req.body;
            delete updateData.id;
            delete updateData._id;
            delete updateData.senha; // Não permitir mudar senha por aqui

            const result = await db.collection("usuarios").updateOne(
                { _id: new ObjectId(id as string) },
                { $set: { ...updateData, updated_at: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }

            const updatedUser = await db.collection("usuarios").findOne({ _id: new ObjectId(id as string) });

            const userResponse = {
                id: updatedUser?._id.toString(),
                email: updatedUser?.email,
                nome: updatedUser?.nome,
                created_at: updatedUser?.created_at
            };

            return res.status(200).json(userResponse);
        }

        // --- MÉTODOS DE AUTENTICAÇÃO (POST) ---
        if (req.method === 'POST') {
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

                // Hash da senha
                const salt = await bcrypt.genSalt(10);
                const hashedSenha = await bcrypt.hash(senha, salt);

                const newUser = {
                    email,
                    nome,
                    senha: hashedSenha,
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
                const user = await db.collection("usuarios").findOne({ email });

                if (!user) {
                    return res.status(401).json({ message: "Email ou senha incorretos" });
                }

                // Comparar senha hasheada
                const isMatch = await bcrypt.compare(senha, user.senha);
                if (!isMatch) {
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

            if (action === 'admin_login') {
                const user = await db.collection("usuarios").findOne({ email });

                if (!user) {
                    return res.status(401).json({ message: "Email ou senha incorretos" });
                }

                // Comparar senha hasheada
                const isMatch = await bcrypt.compare(senha, user.senha);
                if (!isMatch) {
                    return res.status(401).json({ message: "Email ou senha incorretos" });
                }

                // Verificar se é admin
                if (!user.is_admin) {
                    return res.status(403).json({ message: "Acesso restrito a administradores" });
                }

                const userResponse = {
                    id: user._id.toString(),
                    email: user.email,
                    nome: user.nome,
                    is_admin: true,
                    created_at: user.created_at
                };

                return res.status(200).json(userResponse);
            }

            return res.status(400).json({ message: "Ação inválida" });
        }

        res.setHeader('Allow', ['POST', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error: any) {
        console.error('Erro na API de autenticação:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
