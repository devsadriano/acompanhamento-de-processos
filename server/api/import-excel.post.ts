import * as XLSX from 'xlsx'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 1. Obter cliente Supabase do servidor
    const supabase = await serverSupabaseClient(event)

    // 2. Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Usuário não autenticado'
        })
    }

    // 3. Ler arquivo do formulário multipart
    const formData = await readMultipartFormData(event)
    const fileData = formData?.find(item => item.name === 'file')

    if (!fileData || !fileData.data) {
        throw createError({
            statusCode: 400,
            message: 'Nenhum arquivo enviado'
        })
    }

    try {
        // 4. Ler o arquivo Excel do buffer
        const workbook = XLSX.read(fileData.data, { type: 'buffer' })

        // Pegar a primeira planilha
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
            throw new Error('O arquivo Excel não contém nenhuma planilha válida.')
        }
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
            throw new Error('A planilha selecionada está vazia ou não existe.')
        }

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // 5. Mapear colunas do Excel para o Schema do Banco
        const processos = jsonData.map((row: any) => {
            const parseExcelDate = (serial: any) => {
                if (!serial) return null
                if (typeof serial === 'string') return serial // ISO string já pronta
                try {
                    const date = new Date(Math.round((serial - 25569) * 86400 * 1000))
                    return date.toISOString()
                } catch {
                    return null
                }
            }

            // Identificar colunas duplicadas (XLSX costuma renomear a segunda coluna igual como "Coluna_1")
            // No Excel do usuário temos: SITUAÇÃO (coluna 1) e SITUAÇÃO (coluna 2)
            const getAltName = (base: string, suffix: string) => {
                return row[base] || row[`${base}_${suffix}`] || row[`${base} ${suffix}`]
            }

            return {
                user_id: user.id,
                data_recebimento: parseExcelDate(row['DATA DE RECEBIMENTO']),
                sei_numero: String(row['SEI nº'] || row['SEI'] || ''),
                unidade: row['ORIGEM'] || row['Unidade'] || null,
                numero_processo: String(row['Nº PROCESSO'] || row['Processo'] || ''),
                interessado: row['NOME DO SERVIDOR'] || row['Interessado'] || null,
                assunto: row['ASSUNTO'] || row['Assunto'] || null,
                complemento_assunto: row['COMPLEMENTO DO ASSUNTO'] || row['Complemento'] || null,

                // Prazos
                prazo_1: parseExcelDate(row['PRAZO INTERNO']),
                acao_1: row['SITUAÇÃO'] || null,

                prazo_2: parseExcelDate(row['PRAZO FATAL']),
                acao_2: row['SITUAÇÃO_1'] || row['SITUAÇÃO 2'] || row['SITUAÇÃO_2'] || null,

                observacoes: row['OBSERVAÇÕES'] || null
            }
        })

        // 6. Inserir no Supabase (Batch insert)
        // Supabase limita o tamanho do request, então é bom fazer em lotes se for muito grande
        const { data, error } = await (supabase as any)
            .from('processos')
            .insert(processos)
            .select()

        if (error) {
            console.error('Erro Supabase:', error)
            throw new Error(error.message)
        }

        return {
            success: true,
            count: data?.length || 0,
            message: `${data?.length || 0} processos importados com sucesso!`
        }

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: `Erro ao processar arquivo: ${error.message}`
        })
    }
})
