import type { Ref } from 'vue'

interface AuxItem {
    id: string
    user_id: string
    nome: string
    created_at?: string
}

export const useAuxiliares = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const loading = ref(false)

    const fetchItems = async (table: string) => {
        const { data, error } = await (supabase as any)
            .from(table)
            .select('*')
            .order('nome', { ascending: true })
        if (error) throw error
        return data as AuxItem[]
    }

    const addItem = async (table: string, nome: string) => {
        // Deixamos o Supabase preencher o user_id via DEFAULT auth.uid()
        const { data, error } = await (supabase as any)
            .from(table)
            .insert({ nome })
            .select()
            .single()

        if (error) {
            console.error(`Erro ao adicionar em ${table}:`, error)
            throw error
        }
        return data as AuxItem
    }

    const deleteItem = async (table: string, id: string) => {
        const { error } = await (supabase as any)
            .from(table)
            .delete()
            .eq('id', id)
        if (error) throw error
    }

    return {
        loading,
        fetchItems,
        addItem,
        deleteItem
    }
}
